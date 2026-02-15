# HRPM.org Security Best Practices

## Comprehensive Security Documentation

This document outlines security measures, best practices, and guidelines for the HRPM platform.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Input Validation](#input-validation)
6. [XSS Prevention](#xss-prevention)
7. [CSRF Protection](#csrf-protection)
8. [API Security](#api-security)
9. [Secrets Management](#secrets-management)
10. [Security Audit](#security-audit)
11. [Incident Response](#incident-response)

---

## Security Overview

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│            Application Security Layers                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │     Layer 1: Network & Transport Security       │    │
│  │     • HTTPS/TLS 1.3                            │    │
│  │     • WSS for WebSockets                       │    │
│  │     • CDN protection                           │    │
│  └────────────────────────────────────────────────┘    │
│                      │                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │     Layer 2: Authentication & Authorization     │    │
│  │     • JWT-based authentication                 │    │
│  │     • Role-based access control (RBAC)         │    │
│  │     • Session management                       │    │
│  └────────────────────────────────────────────────┘    │
│                      │                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │     Layer 3: Application Security              │    │
│  │     • Input validation                         │    │
│  │     • XSS prevention                           │    │
│  │     • CSRF protection                          │    │
│  │     • SQL injection prevention                 │    │
│  └────────────────────────────────────────────────┘    │
│                      │                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │     Layer 4: Data Security                     │    │
│  │     • Row Level Security (RLS)                 │    │
│  │     • Encryption at rest                       │    │
│  │     • Encryption in transit                    │    │
│  │     • Audit logging                            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### JWT Authentication

**Token Structure:**
```
Header.Payload.Signature
```

**Token Claims:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "analyst",
  "iat": 1640000000,
  "exp": 1640086400
}
```

**Implementation:**

```typescript
// Client-side authentication
import { supabase } from "@/integrations/supabase/client";

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "secure-password",
});

// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Sign out
await supabase.auth.signOut();
```

**Token Management:**
- Tokens stored in `localStorage` (Supabase handles this)
- Automatic token refresh
- Token expiration: 1 hour
- Refresh token expiration: 7 days

### Role-Based Access Control (RBAC)

**User Roles:**

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: Read, Write, Delete, User management |
| **Analyst** | Read, Write: Cases, Evidence, Analysis tools |
| **Viewer** | Read only: Cases, Public data |

**Database Implementation:**

```sql
-- User roles table
CREATE TYPE app_role AS ENUM ('admin', 'analyst', 'viewer');

CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,
  role app_role NOT NULL DEFAULT 'analyst'
);

-- Helper functions
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**Frontend Usage:**

```typescript
import { useUserRole } from "@/hooks/useUserRole";

function AdminPanel() {
  const { role, isAdmin, isAnalyst } = useUserRole();

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel</div>;
}
```

**Backend Enforcement (RLS):**

```sql
-- Admin-only delete policy
CREATE POLICY "Admin only can delete"
ON cases FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Analysts can insert
CREATE POLICY "Analysts can insert"
ON evidence_uploads FOR INSERT
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'analyst'::app_role])
);
```

---

## Data Protection

### Encryption

**At Rest:**
- Database: AES-256 encryption (Supabase default)
- Storage: Encrypted buckets
- Backups: Encrypted

**In Transit:**
- All API calls: HTTPS (TLS 1.3)
- WebSocket: WSS
- CDN: HTTPS enforced

### Sensitive Data Handling

**❌ Never Store:**
- Plain-text passwords
- API keys in frontend code
- Credit card numbers
- Social security numbers

**✅ Best Practices:**

```typescript
// ❌ Bad - Exposing sensitive data
const apiKey = "sk_live_1234567890";

// ✅ Good - Use environment variables
const apiKey = import.meta.env.VITE_API_KEY;

// ✅ Better - Store in backend only
// Access via Edge Functions
```

**Personal Data Protection:**

```typescript
// Anonymize user data in logs
console.log("User action", {
  userId: user.id.substring(0, 8) + "...",  // Partial ID only
  // Don't log email, name, etc.
});

// Redact sensitive fields in errors
try {
  await processPayment(cardDetails);
} catch (error) {
  // Don't log cardDetails in error
  console.error("Payment failed", { userId: user.id });
}
```

---

## Row Level Security (RLS)

### RLS Policies

**Public Read Access:**

```sql
CREATE POLICY "Public read access"
ON cases FOR SELECT
USING (true);
```

**Authenticated Write Access:**

```sql
CREATE POLICY "Authenticated users can insert"
ON evidence_uploads FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

**User-Specific Access:**

```sql
CREATE POLICY "Users can view their own data"
ON watchlist_items FOR SELECT
USING (user_id = auth.uid());
```

**Role-Based Access:**

```sql
CREATE POLICY "Admins can delete"
ON cases FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
```

### RLS Best Practices

1. **Enable RLS on all tables**
   ```sql
   ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
   ```

2. **Default deny**
   - No policies = no access
   - Explicitly grant permissions

3. **Test policies**
   ```sql
   -- Test as different roles
   SET ROLE authenticated;
   SELECT * FROM cases;  -- Should work

   SET ROLE anon;
   SELECT * FROM cases;  -- Should work (public read)
   ```

4. **Audit policies regularly**
   - Review quarterly
   - Update as requirements change

---

## Input Validation

### Frontend Validation

**React Hook Form + Zod:**

```typescript
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const caseSchema = z.object({
  caseNumber: z.string().min(1, "Case number is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["active", "closed", "under_review"]),
  email: z.string().email("Invalid email address"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

type CaseFormData = z.infer<typeof caseSchema>;

function CaseForm() {
  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      status: "active",
    },
  });

  const onSubmit = (data: CaseFormData) => {
    // Data is validated
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

**File Upload Validation:**

```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function validateFile(file: File): boolean {
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    toast.error("File too large (max 50MB)");
    return false;
  }

  // Check type
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error("Invalid file type");
    return false;
  }

  // Check filename (prevent path traversal)
  if (file.name.includes("..") || file.name.includes("/")) {
    toast.error("Invalid filename");
    return false;
  }

  return true;
}
```

### Backend Validation

**Edge Function Validation:**

```typescript
// supabase/functions/analyze-document/index.ts
export default async function handler(req: Request) {
  const body = await req.json();

  // Validate required fields
  if (!body.documentContent || typeof body.documentContent !== "string") {
    return new Response(
      JSON.stringify({ error: "Invalid document content" }),
      { status: 400 }
    );
  }

  // Validate document type
  const validTypes = ["legal_document", "court_filing", "police_report"];
  if (!validTypes.includes(body.documentType)) {
    return new Response(
      JSON.stringify({ error: "Invalid document type" }),
      { status: 400 }
    );
  }

  // Validate length
  if (body.documentContent.length > 1000000) {
    return new Response(
      JSON.stringify({ error: "Document too long" }),
      { status: 400 }
    );
  }

  // Process...
}
```

**Database Constraints:**

```sql
-- NOT NULL constraints
ALTER TABLE cases
ALTER COLUMN case_number SET NOT NULL,
ALTER COLUMN title SET NOT NULL;

-- CHECK constraints
ALTER TABLE extracted_events
ADD CONSTRAINT valid_confidence_score
CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- UNIQUE constraints
ALTER TABLE cases
ADD CONSTRAINT unique_case_number UNIQUE (case_number);
```

---

## XSS Prevention

### React's Built-in Protection

**Automatic Escaping:**

```tsx
// ✅ Safe - React escapes by default
function Component({ userInput }: { userInput: string }) {
  return <div>{userInput}</div>;
  // <script>alert('xss')</script> renders as text
}
```

**Dangerous Operations:**

```tsx
// ❌ Dangerous - Don't use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe - Use sanitization library
import DOMPurify from "dompurify";

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### Content Security Policy (CSP)

**Recommended CSP Headers:**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co;
  frame-ancestors 'none';
```

---

## CSRF Protection

### JWT-Based Protection

**No cookies = No CSRF risk**
- Tokens stored in localStorage
- Sent via Authorization header
- Not vulnerable to CSRF

**Best Practices:**

```typescript
// ✅ Good - Use Authorization header
const { data, error } = await supabase
  .from("cases")
  .select("*");
// Supabase automatically includes JWT

// ❌ Bad - Don't use cookies for auth
// (Not applicable to this project)
```

---

## API Security

### Rate Limiting

**Edge Functions:**

```typescript
// Implement rate limiting
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(userId: string, limit: number = 10): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  const userRequests = rateLimiter.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= limit) {
    return false;
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

### API Key Security

**✅ Secure Storage:**

```typescript
// Environment variables (backend only)
const API_KEY = Deno.env.get("EXTERNAL_API_KEY");

// Never expose in frontend
// ❌ const API_KEY = "sk_live_123...";
```

**Key Rotation:**

1. Generate new key
2. Update in Supabase Dashboard
3. Redeploy Edge Functions
4. Deactivate old key

---

## Secrets Management

### Environment Variables

**Frontend (.env):**
```env
# Public variables only (prefixed with VITE_)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

**Backend (Supabase Secrets):**
```
LOVABLE_AI_API_KEY=...
COURTLISTENER_API_KEY=...
NEWS_API_KEY=...
```

**Setting Secrets:**

Via Supabase Dashboard:
1. Navigate to: Settings → Edge Functions → Secrets
2. Add key-value pairs
3. Secrets available in Edge Functions via `Deno.env.get()`

### Secret Rotation Schedule

| Secret | Rotation Frequency |
|--------|-------------------|
| API Keys | Every 90 days |
| Database Password | Every 180 days |
| JWT Secret | Annually |
| Service Accounts | Every 90 days |

---

## Security Audit

### Regular Security Checks

**Monthly:**
- [ ] Review RLS policies
- [ ] Check audit logs for suspicious activity
- [ ] Review user roles and permissions
- [ ] Update dependencies

**Quarterly:**
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review and update CSP headers
- [ ] Rotate API keys

**Annually:**
- [ ] Third-party security audit
- [ ] Compliance review
- [ ] Disaster recovery test
- [ ] Update security documentation

### Security Checklist

**Authentication:**
- [ ] Passwords hashed (bcrypt/argon2)
- [ ] MFA available (future)
- [ ] Session timeout configured
- [ ] Account lockout after failed attempts

**Authorization:**
- [ ] RLS enabled on all tables
- [ ] Role-based access implemented
- [ ] Least privilege principle followed
- [ ] Regular permission audits

**Data Protection:**
- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Sensitive data masked in logs
- [ ] Regular backups

**Application Security:**
- [ ] Input validation on all forms
- [ ] XSS prevention measures
- [ ] CSRF protection
- [ ] SQL injection prevention (via Supabase)

---

## Incident Response

### Security Incident Response Plan

**1. Detection**
- Monitor audit logs
- Set up alerts
- User reports

**2. Assessment**
- Identify affected systems
- Determine severity
- Estimate impact

**3. Containment**
- Isolate affected systems
- Revoke compromised credentials
- Block malicious IPs

**4. Eradication**
- Remove malware
- Patch vulnerabilities
- Update security measures

**5. Recovery**
- Restore from backups
- Verify system integrity
- Resume operations

**6. Post-Incident**
- Document incident
- Update procedures
- Conduct post-mortem
- Notify affected users

### Contact Information

**Security Team:**
- Email: security@hrpm.org
- Emergency: [Emergency Contact]

**Reporting Security Issues:**
1. Email security@hrpm.org
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## Compliance

### Data Protection Regulations

**GDPR Compliance:**
- [ ] User consent for data collection
- [ ] Right to access personal data
- [ ] Right to delete personal data
- [ ] Data portability
- [ ] Breach notification (72 hours)

**Implementation:**

```typescript
// User data export
async function exportUserData(userId: string) {
  const data = await supabase
    .from("user_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data;
}

// User data deletion
async function deleteUserData(userId: string) {
  // Delete from all tables
  await supabase.from("watchlist_items").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("user_id", userId);
  await supabase.auth.admin.deleteUser(userId);
}
```

---

*For security concerns or to report vulnerabilities, contact the security team immediately.*
