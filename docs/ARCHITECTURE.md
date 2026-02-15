# HRPM.org Architecture Documentation

## System Architecture Overview

This document provides an in-depth look at the architectural design, patterns, and technical decisions behind the Human Rights Protection Movement (HRPM) platform.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Performance Optimization](#performance-optimization)
7. [Scalability Considerations](#scalability-considerations)

---

## High-Level Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Web Browser │  │   Mobile     │  │   Future: Native    │  │
│  │  (React SPA) │  │ (Responsive) │  │   Mobile Apps       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               React Application (Vite)                    │  │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │  │
│  │  │  Pages/   │  │Component  │  │    State Mgmt       │  │  │
│  │  │  Routes   │  │ Library   │  │  (React Query)      │  │  │
│  │  └───────────┘  └───────────┘  └─────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase Client SDK                          │  │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │  │
│  │  │   Auth    │  │ Realtime  │  │  Edge Functions     │  │  │
│  │  │  Module   │  │Subscript. │  │     Invoker         │  │  │
│  │  └───────────┘  └───────────┘  └─────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND SERVICES LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Supabase / Lovable Cloud Backend               │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │              Edge Functions (Deno)                │  │  │
│  │  │  • analyze-document  • pattern-detector           │  │  │
│  │  │  • intel-chat       • threat-profiler             │  │  │
│  │  │  • generate-report  • analyze-rights-violations   │  │  │
│  │  │  • fetch-news       • generate-appeal-summary     │  │  │
│  │  │  • fetch-legal-precedents                         │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │           Authentication & Authorization          │  │  │
│  │  │  • JWT-based auth   • Row Level Security (RLS)   │  │  │
│  │  │  • Role-based access control (RBAC)              │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │  • 31 tables with relationships                          │  │
│  │  • Row Level Security (RLS) policies                     │  │
│  │  • Triggers & functions                                  │  │
│  │  • Audit logging                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                Storage Buckets                            │  │
│  │  • evidence     • affidavits    • tutorials              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Lovable AI  │  │ CourtListener│  │     News APIs       │  │
│  │   Gateway    │  │     API      │  │                     │  │
│  │  (Gemini)    │  │              │  │                     │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework with concurrent features |
| TypeScript | 5.8.3 | Type safety and developer experience |
| Vite | 5.4.19 | Fast build tool and dev server |
| React Router | 6.30.1 | Client-side routing (23+ routes) |
| TanStack Query | 5.83.0 | Server state management |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| shadcn/ui | Latest | Accessible component library |

### Application Structure

```
src/
├── main.tsx              # Entry point, renders App
├── App.tsx               # Root component, routing setup
├── pages/                # 23+ route components
├── components/           # 200+ organized components
├── hooks/                # 23 custom React hooks
├── contexts/             # React contexts (Auth)
├── lib/                  # Utility functions
├── types/                # TypeScript definitions
├── data/                 # Static/seed data
├── integrations/         # External service clients
└── i18n/                 # Internationalization
```

### Routing Architecture

**Router Configuration:**
- Uses React Router v6 with `<BrowserRouter>`
- 23 defined routes with lazy loading support
- Protected routes via `<AuthContext>`
- Nested routes for case profiles and admin sections

**Route Categories:**

1. **Public Routes**
   - `/` - Landing page
   - `/about` - About page
   - `/contact` - Contact form
   - `/docs` - Documentation portal
   - `/api` - API reference
   - `/how-to-use` - User tutorials
   - `/blog` & `/blog/:slug` - Blog posts

2. **Authenticated Routes**
   - `/dashboard` - Main dashboard
   - `/cases` - Case listing
   - `/cases/:caseId` - Case profile
   - `/timeline` - Timeline view
   - `/network` - Entity network
   - `/evidence` - Evidence repository
   - `/investigations` - Investigation tools
   - `/analyze` - Document analyzer
   - `/legal-intelligence` - Legal research
   - `/compliance` - Compliance tracking
   - `/correlation` - Evidence correlation
   - `/reconstruction` - Timeline reconstruction
   - `/regulatory-harm` - Financial harm
   - `/international` - Rights violations
   - `/watchlist` - User watchlist
   - `/legal-research` - Legal browser

3. **Admin Routes**
   - `/admin` - Admin dashboard

### Component Architecture

**Component Hierarchy:**

```
<App>
  <QueryClientProvider>
    <AuthContext.Provider>
      <BrowserRouter>
        <PlatformLayout>
          <Sidebar />
          <Header>
            <Breadcrumbs />
            <Notifications />
            <UserMenu />
          </Header>
          <main>
            <Routes>
              <Route /> {/* Page Components */}
            </Routes>
          </main>
        </PlatformLayout>
      </BrowserRouter>
    </AuthContext.Provider>
  </QueryClientProvider>
</App>
```

**Component Categories:**

1. **UI Primitives** (`components/ui/`)
   - 45+ shadcn/ui components
   - Buttons, modals, dialogs, cards, tables
   - Forms, inputs, selects, checkboxes
   - Toasts, tooltips, popovers

2. **Layout Components** (`components/layout/`)
   - `PlatformLayout` - Main app shell
   - `Sidebar` - Collapsible navigation
   - `Header` - Top bar with breadcrumbs
   - `Breadcrumbs` - Auto-generated navigation
   - `Notifications` - Toast notifications

3. **Feature Components** (organized by domain)
   - Dashboard - Analytics widgets
   - Network - D3 graph visualization
   - Timeline - Event visualization
   - Legal - Statute/precedent browsers
   - Evidence - File management
   - Admin - Content management
   - Intel - AI-powered tools

**Component Design Patterns:**

1. **Container/Presenter Pattern**
   ```tsx
   // Container: Data fetching and logic
   export function EntityNetworkContainer() {
     const { data, isLoading } = useGraphData();
     return <EntityNetworkPresenter data={data} loading={isLoading} />;
   }

   // Presenter: Pure UI rendering
   export function EntityNetworkPresenter({ data, loading }) {
     if (loading) return <Skeleton />;
     return <div>{/* render data */}</div>;
   }
   ```

2. **Compound Components**
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
       <CardDescription>Description</CardDescription>
     </CardHeader>
     <CardContent>{/* content */}</CardContent>
     <CardFooter>{/* actions */}</CardFooter>
   </Card>
   ```

3. **Custom Hooks Pattern**
   ```tsx
   // Encapsulate data fetching logic
   export function useExtractedEvents(caseId?: string) {
     return useQuery({
       queryKey: ["extracted-events", caseId],
       queryFn: () => fetchEvents(caseId),
       enabled: !!caseId,
     });
   }
   ```

### State Management Strategy

**Three-Tier State Architecture:**

1. **Server State** (React Query)
   - All backend data
   - Automatic caching
   - Background refetching
   - Optimistic updates
   - Request deduplication

2. **Global UI State** (React Context)
   - Authentication state
   - User profile
   - Theme preferences
   - Sidebar collapsed state

3. **Local Component State** (useState/useReducer)
   - Form inputs
   - UI toggles
   - Temporary selections
   - Modal visibility

**Data Fetching Patterns:**

```tsx
// Basic query
const { data, isLoading, error } = useQuery({
  queryKey: ["cases"],
  queryFn: fetchCases,
});

// Query with parameters
const { data } = useQuery({
  queryKey: ["case", caseId],
  queryFn: () => fetchCase(caseId),
  enabled: !!caseId,
});

// Mutation with optimistic update
const mutation = useMutation({
  mutationFn: updateCase,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(["case", id]);
    const previous = queryClient.getQueryData(["case", id]);
    queryClient.setQueryData(["case", id], newData);
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(["case", id], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(["case", id]);
  },
});
```

---

## Backend Architecture

### Supabase Stack

**Core Services:**

1. **PostgreSQL Database**
   - 31 tables with comprehensive schema
   - Foreign key relationships
   - Complex join queries
   - Full-text search capabilities
   - JSON/JSONB support for flexible data

2. **Authentication**
   - JWT-based authentication
   - Email/password authentication
   - Social auth support (future)
   - Session management
   - Password reset flows

3. **Row Level Security (RLS)**
   - Policy-based access control
   - User-specific data filtering
   - Role-based permissions
   - Audit trail protection

4. **Storage**
   - Three buckets: evidence, affidavits, tutorials
   - Public bucket access
   - File upload/download
   - URL generation

5. **Edge Functions (Serverless)**
   - Deno runtime
   - TypeScript support
   - Direct database access
   - AI gateway integration

### Edge Functions Architecture

**Function Deployment:**

```
supabase/functions/
├── analyze-document/       # Document analysis
│   ├── index.ts
│   └── _shared/           # Shared utilities
├── intel-chat/            # AI chat interface
├── threat-profiler/       # Entity threat analysis
├── pattern-detector/      # Pattern recognition
├── generate-report/       # Report generation
├── analyze-rights-violations/  # International rights
├── generate-appeal-summary/    # Legal summaries
├── fetch-news/            # News aggregation
└── fetch-legal-precedents/     # Case law fetching
```

**Function Invocation Pattern:**

```typescript
// Client-side invocation
const { data, error } = await supabase.functions.invoke("function-name", {
  body: { parameter: value },
});

// Streaming responses (intel-chat)
const response = await supabase.functions.invoke("intel-chat", {
  body: { messages },
});
const reader = response.data.getReader();
// Process stream...
```

**AI Integration:**

- All AI functions use Lovable AI Gateway
- Model: Google Gemini 1.5 Flash
- Structured JSON responses
- System prompt engineering
- Context window management
- Token optimization

### Database Schema Design

**Design Principles:**

1. **Normalization**: 3NF normalized schema
2. **Relationships**: Foreign keys with cascade rules
3. **Indexing**: Strategic indexes on query columns
4. **Constraints**: NOT NULL, UNIQUE, CHECK constraints
5. **Triggers**: Auto-update timestamps, audit logging

**Core Table Groups:**

1. **Case Management**
   - `cases` - Central investigation table
   - `extracted_events` - Timeline events
   - `extracted_entities` - People/organizations
   - `extracted_discrepancies` - Procedural issues

2. **Legal Intelligence**
   - `legal_claims` - Allegations and charges
   - `legal_statutes` - Statutory provisions
   - `case_law_precedents` - Court decisions
   - `legal_doctrines` - Legal principles
   - `legal_issues` - Case-specific issues
   - `appeal_summaries` - Generated summaries

3. **Evidence**
   - `evidence_uploads` - Document storage
   - `claim_evidence_links` - Evidence correlation
   - `document_analysis_jobs` - Analysis tracking

4. **Compliance**
   - `procedural_requirements` - Legal requirements
   - `compliance_checks` - Requirement verification
   - `compliance_violations` - Documented violations

5. **Financial Harm**
   - `regulatory_harm_incidents` - Harm events
   - `financial_losses` - Itemized losses
   - `financial_affidavits` - Supporting documents
   - `harm_time_tracking` - Time spent

6. **Entity Management**
   - `entity_relationships` - Connections
   - `entity_aliases` - Alternative identifiers

7. **User & Content**
   - `profiles` - User profiles
   - `user_roles` - RBAC
   - `audit_logs` - Activity tracking
   - `blog_posts` - Content management
   - `news_articles` - News aggregation
   - `watchlist_items` - User tracking

**Database Functions:**

```sql
-- Auto-update timestamps
CREATE TRIGGER update_updated_at_column
BEFORE UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Audit logging
CREATE TRIGGER audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON cases
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- Role checks
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## Data Flow

### Client-to-Server Flow

```
User Action
    │
    ▼
React Component
    │
    ▼
Event Handler
    │
    ▼
React Query Hook (useMutation)
    │
    ▼
Supabase Client
    │
    ▼
[Network Request]
    │
    ▼
Supabase API Gateway
    │
    ├─────────────────────┐
    │                     │
    ▼                     ▼
Database Query    Edge Function
    │                     │
    │                     ▼
    │              AI Processing
    │                     │
    │                     ▼
    │              Database Write
    │                     │
    └─────────┬───────────┘
              │
              ▼
        Response Data
              │
              ▼
      React Query Cache
              │
              ▼
      Component Re-render
```

### Document Analysis Flow

```
User uploads document
        │
        ▼
Upload to storage bucket
        │
        ▼
Create evidence_uploads record
        │
        ▼
Create document_analysis_jobs record
        │
        ▼
Invoke analyze-document function
        │
        ├─────────────────────────────────────┐
        │                                     │
        ▼                                     ▼
Extract text from file           Mark job as "processing"
        │                                     │
        ▼                                     │
Send to AI Gateway (Gemini)                  │
        │                                     │
        ▼                                     │
AI extracts structured data                  │
        │                                     │
        ├─────────────────────────────────────┘
        │
        ▼
Insert extracted_events
        │
        ▼
Insert extracted_entities
        │
        ▼
Insert extracted_discrepancies
        │
        ▼
Insert legal_claims
        │
        ▼
Insert compliance_violations
        │
        ▼
Insert financial harm data
        │
        ▼
Update job status to "completed"
        │
        ▼
Return extraction counts
        │
        ▼
Frontend shows success notification
```

### Real-Time Update Flow

```
User A makes change
        │
        ▼
Database UPDATE
        │
        ▼
PostgreSQL Trigger
        │
        ▼
Supabase Realtime
        │
        ▼
WebSocket broadcast
        │
        ├────────────┬────────────┐
        │            │            │
        ▼            ▼            ▼
    User B      User C      User D
        │            │            │
        ▼            ▼            ▼
  Subscription  Subscription  Subscription
   callback      callback      callback
        │            │            │
        ▼            ▼            ▼
Invalidate    Invalidate    Invalidate
React Query   React Query   React Query
    cache         cache         cache
        │            │            │
        ▼            ▼            ▼
   Refetch       Refetch       Refetch
     data          data          data
        │            │            │
        ▼            ▼            ▼
   Re-render     Re-render     Re-render
```

---

## Security Architecture

### Authentication & Authorization

**Authentication Flow:**

1. User submits credentials
2. Supabase Auth validates
3. JWT token generated
4. Token stored in localStorage
5. Token sent with all requests
6. Backend validates token

**Role-Based Access Control:**

```sql
-- User roles enum
CREATE TYPE app_role AS ENUM ('admin', 'analyst', 'viewer');

-- Role assignment
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,
  role app_role NOT NULL DEFAULT 'analyst'
);

-- Permission checks
CREATE POLICY admin_only ON cases
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role)
);
```

**Row Level Security (RLS):**

```sql
-- Public read access
CREATE POLICY public_read ON cases
FOR SELECT USING (true);

-- Authenticated write
CREATE POLICY auth_insert ON evidence_uploads
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Role-based operations
CREATE POLICY admin_delete ON audit_logs
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role)
);
```

### Data Protection

1. **Encryption at Rest**
   - Database: AES-256 encryption
   - Storage: Encrypted buckets

2. **Encryption in Transit**
   - All requests over HTTPS
   - WSS for WebSocket connections

3. **Input Validation**
   - Client-side: React Hook Form + Zod
   - Server-side: Edge function validation
   - Database: CHECK constraints

4. **XSS Prevention**
   - React's built-in escaping
   - Sanitization for rich text
   - CSP headers

5. **CSRF Prevention**
   - JWT tokens (not cookies)
   - SameSite cookie attributes (future)

### Audit Trail

```typescript
interface AuditLog {
  user_id: string;
  user_email: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  old_data: object;
  new_data: object;
  ip_address: string;
  user_agent: string;
  created_at: timestamp;
}
```

---

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   ```tsx
   const AdminPage = lazy(() => import("./pages/Admin"));
   ```

2. **React Query Caching**
   ```tsx
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         cacheTime: 10 * 60 * 1000, // 10 minutes
       },
     },
   });
   ```

3. **Memoization**
   ```tsx
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(data);
   }, [data]);
   ```

4. **Virtual Scrolling**
   - For long lists (timeline, entities)
   - React Virtual library

5. **Image Optimization**
   - WebP format
   - Lazy loading
   - Responsive images

### Backend Optimization

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_events_date ON extracted_events(date);
   CREATE INDEX idx_events_case ON extracted_events(case_id);
   CREATE INDEX idx_entities_name ON extracted_entities(name);
   ```

2. **Query Optimization**
   - Selective column fetching
   - JOIN optimization
   - Pagination for large datasets

3. **Caching Strategy**
   - React Query for client cache
   - Database query results
   - Static assets CDN

4. **Edge Function Performance**
   - Keep functions warm
   - Minimize cold starts
   - Optimize imports

---

## Scalability Considerations

### Horizontal Scaling

- **Frontend**: CDN distribution (Lovable Cloud)
- **Backend**: Supabase auto-scales
- **Database**: Read replicas (future)
- **Functions**: Concurrent execution

### Vertical Scaling

- **Database**: Instance upgrade path available
- **Storage**: Unlimited bucket capacity
- **Compute**: Function memory/timeout adjustable

### Future Enhancements

1. **Caching Layer**
   - Redis for session storage
   - API response caching

2. **Search Optimization**
   - Elasticsearch integration
   - Full-text search indexes

3. **File Processing**
   - Background job queue
   - Async document analysis

4. **Monitoring**
   - Application Performance Monitoring (APM)
   - Error tracking (Sentry)
   - Analytics dashboard

---

*This architecture is designed for maintainability, scalability, and security while delivering a powerful investigative intelligence platform.*
