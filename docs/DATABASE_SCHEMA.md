# HRPM.org Database Schema

## PostgreSQL Database Structure

---

## Overview

The HRPM platform uses PostgreSQL with Row Level Security (RLS) for data protection. This document describes all tables, relationships, and access policies.

---

## Core Tables

### 1. Cases

Central table for managing investigations.

```sql
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR NOT NULL UNIQUE,      -- e.g., "CF-001"
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'active',           -- active, under_review, closed
  severity VARCHAR,                          -- critical, high, medium, low
  category VARCHAR,                          -- persecution, regulatory_abuse, etc.
  location VARCHAR,
  date_opened DATE,
  date_closed DATE,
  lead_investigator VARCHAR,
  cover_image_url VARCHAR,
  total_sources INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_entities INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Relationships:**
- One-to-Many: `extracted_events`, `extracted_entities`, `extracted_discrepancies`
- One-to-Many: `evidence_uploads`, `legal_claims`, `compliance_checks`
- One-to-Many: `appeal_summaries`, `legal_issues`

---

### 2. Extracted Events

Timeline events extracted from documents or manually added.

```sql
CREATE TABLE public.extracted_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_upload_id UUID REFERENCES evidence_uploads(id),
  case_id UUID REFERENCES cases(id),
  date DATE NOT NULL,
  category VARCHAR NOT NULL,                  -- Business Interference, Harassment, Legal Proceeding, Criminal Allegation
  description TEXT NOT NULL,
  individuals TEXT NOT NULL,
  legal_action TEXT NOT NULL,
  outcome TEXT NOT NULL,
  evidence_discrepancy TEXT NOT NULL,
  sources TEXT NOT NULL,
  confidence_score DECIMAL(3,2),             -- 0.00-1.00
  is_approved BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  extraction_method VARCHAR,                  -- ai, manual
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `date` - For timeline sorting
- `case_id` - For case filtering
- `category` - For category filtering

---

### 3. Extracted Entities

People, organizations, and bodies mentioned in case documents.

```sql
CREATE TABLE public.extracted_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_upload_id UUID REFERENCES evidence_uploads(id),
  case_id UUID REFERENCES cases(id),
  name VARCHAR NOT NULL,
  entity_type VARCHAR NOT NULL,               -- Person, Organization, Official Body, Legal Entity
  role VARCHAR,
  description TEXT,
  category VARCHAR,                           -- protagonist, antagonist, neutral, official
  related_event_ids UUID[],
  role_tags VARCHAR[],
  aliases JSONB,                              -- {cnic: [], emails: [], phones: []}
  organization_affiliation VARCHAR,
  position_title VARCHAR,
  profile_image_url VARCHAR,
  influence_score DECIMAL(3,2),
  first_seen_date DATE,
  last_seen_date DATE,
  contact_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 4. Entity Relationships

Connections between entities.

```sql
CREATE TABLE public.entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_entity_id UUID NOT NULL,
  target_entity_id UUID NOT NULL,
  case_id UUID REFERENCES cases(id),
  relationship_type VARCHAR NOT NULL,         -- family, professional, adversarial, financial, legal, chain_of_command
  description TEXT,
  influence_weight DECIMAL(3,2),
  influence_direction VARCHAR,                -- source_to_target, target_to_source, bidirectional
  relationship_start_date DATE,
  relationship_end_date DATE,
  evidence_sources VARCHAR[],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 5. Entity Aliases

Alternative identifiers for entities.

```sql
CREATE TABLE public.entity_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  alias_type VARCHAR NOT NULL,                -- name, cnic, email, phone, designation
  alias_value VARCHAR NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  source VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 6. Extracted Discrepancies

Procedural failures and evidence issues.

```sql
CREATE TABLE public.extracted_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_upload_id UUID REFERENCES evidence_uploads(id),
  case_id UUID REFERENCES cases(id),
  discrepancy_type VARCHAR NOT NULL,          -- Procedural Failure, Chain of Custody, Testimony Contradiction, Document Forgery, Timeline Inconsistency, Other
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR NOT NULL,                  -- critical, high, medium, low
  legal_reference VARCHAR,
  related_dates VARCHAR[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Evidence Management

### 7. Evidence Uploads

Uploaded documents and files.

```sql
CREATE TABLE public.evidence_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  file_name VARCHAR NOT NULL,
  file_type VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path VARCHAR NOT NULL,
  public_url VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,                           -- legal_document, correspondence, media, etc.
  related_event_ids INTEGER[],
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 8. Document Analysis Jobs

Tracking AI document analysis.

```sql
CREATE TABLE public.document_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES evidence_uploads(id),
  status VARCHAR DEFAULT 'pending',           -- pending, processing, completed, failed
  events_extracted INTEGER,
  entities_extracted INTEGER,
  discrepancies_extracted INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Legal Intelligence

### 9. Legal Claims

Allegations and charges from case documents.

```sql
CREATE TABLE public.legal_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  source_upload_id UUID REFERENCES evidence_uploads(id),
  allegation_text TEXT NOT NULL,
  claim_type VARCHAR NOT NULL,                -- criminal, regulatory, civil
  legal_framework VARCHAR NOT NULL,           -- pakistani, international
  legal_section VARCHAR NOT NULL,             -- e.g., "PECA 2016 Section 20"
  alleged_by VARCHAR,
  alleged_against VARCHAR,
  date_alleged DATE,
  source_document VARCHAR,
  status VARCHAR DEFAULT 'pending',           -- pending, investigated, dismissed, proven
  support_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 10. Claim Evidence Links

Mapping claims to supporting evidence.

```sql
CREATE TABLE public.claim_evidence_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES legal_claims(id),
  evidence_upload_id UUID REFERENCES evidence_uploads(id),
  extracted_event_id UUID REFERENCES extracted_events(id),
  link_type VARCHAR NOT NULL,                 -- supports, contradicts, context
  exhibit_number VARCHAR,                     -- e.g., "Exhibit A"
  relevance_score DECIMAL(3,2),
  notes TEXT,
  linked_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 11. Legal Statutes

Statutory provisions database.

```sql
CREATE TABLE public.legal_statutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statute_code VARCHAR NOT NULL,              -- e.g., "PECA-2016"
  statute_name VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  section VARCHAR,
  framework VARCHAR NOT NULL,                 -- pakistani, international, regulatory
  summary TEXT,
  full_text TEXT,
  keywords VARCHAR[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 12. Case Law Precedents

Legal precedents from court decisions.

```sql
CREATE TABLE public.case_law_precedents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citation VARCHAR NOT NULL,                  -- Official citation
  case_name VARCHAR NOT NULL,
  court VARCHAR NOT NULL,
  jurisdiction VARCHAR NOT NULL,
  year INTEGER,
  summary TEXT,
  key_principles VARCHAR[],
  related_statutes VARCHAR[],
  is_landmark BOOLEAN DEFAULT false,
  source_url VARCHAR,
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Protection Trigger:**
```sql
-- Verified precedents can only be modified by admins
CREATE TRIGGER protect_verified_precedent
BEFORE UPDATE ON case_law_precedents
FOR EACH ROW
EXECUTE FUNCTION protect_verified_precedent();
```

---

### 13. Legal Doctrines

Legal principles and doctrines.

```sql
CREATE TABLE public.legal_doctrines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctrine_name VARCHAR NOT NULL,
  latin_name VARCHAR,
  description TEXT NOT NULL,
  application_context TEXT,
  example_cases VARCHAR[],
  related_statutes VARCHAR[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 14. Legal Issues

Case-specific legal issues.

```sql
CREATE TABLE public.legal_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  issue_title VARCHAR NOT NULL,
  issue_type VARCHAR NOT NULL,                -- constitutional, procedural, evidentiary, substantive
  issue_description TEXT,
  severity VARCHAR,                           -- critical, high, medium, low
  is_resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  ai_generated BOOLEAN DEFAULT false,
  related_statute_ids UUID[],
  related_precedent_ids UUID[],
  related_doctrine_ids UUID[],
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 15. Appeal Summaries

AI-generated and finalized appeal documents.

```sql
CREATE TABLE public.appeal_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  title VARCHAR NOT NULL,
  summary_type VARCHAR NOT NULL,              -- habeas_corpus, criminal_appeal, constitutional_petition, application_for_leave
  content TEXT NOT NULL,
  sources_json JSONB,                         -- Audit trail of cited sources
  ai_generated BOOLEAN DEFAULT true,
  is_finalized BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  reviewed_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Compliance & Violations

### 16. Procedural Requirements

Standard operating procedures.

```sql
CREATE TABLE public.procedural_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_name VARCHAR NOT NULL,
  requirement_description TEXT,
  legal_framework VARCHAR NOT NULL,           -- CrPC, PECA, Evidence Act, etc.
  legal_section VARCHAR NOT NULL,
  evidence_type VARCHAR,
  is_mandatory BOOLEAN DEFAULT true,
  statutory_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 17. Compliance Checks

Tracking procedural compliance.

```sql
CREATE TABLE public.compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES procedural_requirements(id),
  case_id UUID REFERENCES cases(id),
  status VARCHAR DEFAULT 'pending',           -- compliant, violation, pending, not_applicable
  expected_action TEXT,
  actual_action TEXT,
  violation_details TEXT,
  supporting_event_id UUID REFERENCES extracted_events(id),
  supporting_evidence_id UUID REFERENCES evidence_uploads(id),
  ai_detected BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),
  manual_override BOOLEAN DEFAULT false,
  notes TEXT,
  checked_by UUID,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 18. Compliance Violations

Documented violations.

```sql
CREATE TABLE public.compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  compliance_check_id UUID REFERENCES compliance_checks(id),
  violation_type VARCHAR NOT NULL,            -- Procedural Failure, Documentation Gap, Chain of Custody, Constitutional Violation, Due Process Violation
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR DEFAULT 'medium',          -- critical, high, medium, low
  legal_consequence TEXT,
  remediation_possible BOOLEAN,
  resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  flagged_by UUID,
  flagged_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Financial Harm Tracking

### 19. Regulatory Harm Incidents

Economic harm events.

```sql
CREATE TABLE public.regulatory_harm_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  incident_type VARCHAR NOT NULL,             -- account_freeze, license_revocation, regulatory_notice, contract_termination, asset_seizure, other
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE NOT NULL,
  perpetrator_agency VARCHAR,
  is_documented BOOLEAN DEFAULT false,
  documentation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 20. Financial Losses

Itemized financial damages.

```sql
CREATE TABLE public.financial_losses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES regulatory_harm_incidents(id),
  case_id UUID REFERENCES cases(id),
  loss_category VARCHAR NOT NULL,             -- direct_financial, lost_income, legal_costs, opportunity_cost, reputational, time_cost
  loss_subcategory VARCHAR,
  amount DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR DEFAULT 'PKR',
  description TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR,                -- daily, weekly, monthly, yearly
  is_documented BOOLEAN DEFAULT false,
  is_estimated BOOLEAN DEFAULT true,
  time_spent_hours DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 21. Financial Affidavits

Supporting documentation for financial claims.

```sql
CREATE TABLE public.financial_affidavits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  incident_id UUID REFERENCES regulatory_harm_incidents(id),
  loss_id UUID REFERENCES financial_losses(id),
  title VARCHAR NOT NULL,
  document_type VARCHAR NOT NULL,             -- sworn_statement, bank_statement, invoice, contract, etc.
  file_name VARCHAR NOT NULL,
  file_type VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path VARCHAR NOT NULL,
  public_url VARCHAR NOT NULL,
  description TEXT,
  affidavit_date DATE,
  sworn_before VARCHAR,
  notarized BOOLEAN DEFAULT false,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 22. Harm Time Tracking

Time spent on harm-related activities.

```sql
CREATE TABLE public.harm_time_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  incident_id UUID REFERENCES regulatory_harm_incidents(id),
  date DATE NOT NULL,
  hours_spent DECIMAL(5,2) DEFAULT 0,
  activity_type VARCHAR NOT NULL,             -- legal_meetings, court_appearances, documentation, investigation, etc.
  description TEXT,
  person_name VARCHAR,
  person_role VARCHAR,
  hourly_rate DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## User Management

### 23. Profiles

User profile information.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,               -- References auth.users
  display_name VARCHAR,
  avatar_url VARCHAR,
  role VARCHAR,                               -- Deprecated, use user_roles
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 24. User Roles

Role-based access control.

```sql
-- Custom enum type
CREATE TYPE app_role AS ENUM ('admin', 'analyst', 'viewer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,               -- References auth.users
  role app_role NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Helper Functions:**
```sql
-- Check if user has specific role
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user has any of specified roles
CREATE FUNCTION has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## Audit & Logging

### 25. Audit Logs

Comprehensive audit trail.

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email VARCHAR,
  action VARCHAR NOT NULL,                    -- INSERT, UPDATE, DELETE
  table_name VARCHAR NOT NULL,
  record_id VARCHAR,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR,
  user_agent VARCHAR,
  session_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Audit Trigger:**
```sql
CREATE FUNCTION audit_trigger_func()
RETURNS trigger AS $$
DECLARE
  audit_user_id uuid;
  audit_user_email text;
BEGIN
  audit_user_id := auth.uid();
  
  IF audit_user_id IS NOT NULL THEN
    SELECT email INTO audit_user_email FROM auth.users WHERE id = audit_user_id;
  END IF;

  INSERT INTO public.audit_logs (
    user_id, user_email, action, table_name, record_id, old_data, new_data
  ) VALUES (
    audit_user_id, audit_user_email, TG_OP, TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 26. Hidden Static Events

Tracking hidden static timeline events.

```sql
CREATE TABLE public.hidden_static_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key VARCHAR NOT NULL UNIQUE,
  reason TEXT,
  hidden_by UUID,
  hidden_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Content Management

### 27. Blog Posts

Platform blog and news.

```sql
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR NOT NULL UNIQUE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url VARCHAR,
  category VARCHAR,
  tags VARCHAR[],
  author_name VARCHAR,
  author_avatar_url VARCHAR,
  post_type VARCHAR DEFAULT 'blog',           -- blog, news, update
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  ai_scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 28. News Articles

External news aggregation.

```sql
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR,
  title VARCHAR NOT NULL,
  description TEXT,
  content TEXT,
  url VARCHAR,
  image_url VARCHAR,
  author VARCHAR,
  source VARCHAR,
  category VARCHAR,
  keywords VARCHAR[],
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  is_relevant BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 29. Site Settings

Platform configuration.

```sql
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 30. Tutorial Videos

Platform tutorial content.

```sql
CREATE TABLE public.tutorial_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  video_url VARCHAR NOT NULL,
  thumbnail_url VARCHAR,
  duration_seconds INTEGER,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 31. Watchlist Items

User-specific tracking.

```sql
CREATE TABLE public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type VARCHAR NOT NULL,                 -- event, entity, violation, case
  item_id UUID NOT NULL,
  priority VARCHAR DEFAULT 'normal',          -- high, normal, low
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);
```

---

## Storage Buckets

### Evidence Bucket
- **Name:** `evidence`
- **Public:** Yes
- **Purpose:** Case evidence files

### Affidavits Bucket
- **Name:** `affidavits`
- **Public:** Yes
- **Purpose:** Financial affidavit documents

### Tutorials Bucket
- **Name:** `tutorials`
- **Public:** Yes
- **Purpose:** Tutorial video files

---

## Row Level Security (RLS)

### Public Read Access

Most tables allow public read access for transparency:

```sql
CREATE POLICY "Public read access"
ON public.cases FOR SELECT
USING (true);
```

### Authenticated Write Access

Write operations require authentication:

```sql
CREATE POLICY "Authenticated users can insert"
ON public.evidence_uploads FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

### Admin-Only Operations

Critical operations restricted to admins:

```sql
CREATE POLICY "Only admins can delete"
ON public.cases FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
```

---

## Database Functions

### update_updated_at_column()
Updates `updated_at` timestamp on row modification.

### handle_new_user()
Creates profile record when new user registers.

### handle_new_user_role()
Assigns default 'analyst' role to new users.

### audit_trigger_func()
Generic audit logging for table changes.

### has_role() / has_any_role()
Role checking functions for RLS policies.

### protect_verified_precedent()
Prevents modification of verified precedents by non-admins.

### validate_case_law_verification()
Ensures required fields are present when verifying precedents.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    CASES                                             │
│                             (Central Investigation)                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        ▼                                ▼                                ▼
┌───────────────┐                ┌───────────────┐                ┌───────────────┐
│   EXTRACTED   │                │   EXTRACTED   │                │   EXTRACTED   │
│    EVENTS     │                │   ENTITIES    │                │ DISCREPANCIES │
└───────────────┘                └───────────────┘                └───────────────┘
        │                                │
        │                                ├───────────────────────────┐
        ▼                                ▼                           ▼
┌───────────────┐                ┌───────────────┐          ┌───────────────┐
│  CLAIM_EVID   │                │   ENTITY      │          │    ENTITY     │
│    _LINKS     │◄───────────────│ RELATIONSHIPS │          │   ALIASES     │
└───────────────┘                └───────────────┘          └───────────────┘
        │
        │
        ▼
┌───────────────┐                ┌───────────────┐          ┌───────────────┐
│    LEGAL      │◄───────────────│   EVIDENCE    │─────────►│   DOCUMENT    │
│    CLAIMS     │                │   UPLOADS     │          │   ANALYSIS    │
└───────────────┘                └───────────────┘          │     JOBS      │
                                                             └───────────────┘

┌───────────────┐                ┌───────────────┐          ┌───────────────┐
│  COMPLIANCE   │◄───────────────│  PROCEDURAL   │          │  COMPLIANCE   │
│    CHECKS     │                │ REQUIREMENTS  │─────────►│  VIOLATIONS   │
└───────────────┘                └───────────────┘          └───────────────┘

┌───────────────┐                ┌───────────────┐          ┌───────────────┐
│  REGULATORY   │◄───────────────│   FINANCIAL   │─────────►│   FINANCIAL   │
│    HARM       │                │    LOSSES     │          │  AFFIDAVITS   │
│  INCIDENTS    │                └───────────────┘          └───────────────┘
└───────────────┘

┌───────────────┐                ┌───────────────┐          ┌───────────────┐
│    LEGAL      │                │   CASE_LAW    │          │     LEGAL     │
│   STATUTES    │                │  PRECEDENTS   │          │   DOCTRINES   │
└───────────────┘                └───────────────┘          └───────────────┘
        │                                │                           │
        └────────────────────────────────┼───────────────────────────┘
                                         │
                                         ▼
                                 ┌───────────────┐
                                 │    LEGAL      │
                                 │    ISSUES     │
                                 └───────────────┘
                                         │
                                         ▼
                                 ┌───────────────┐
                                 │    APPEAL     │
                                 │  SUMMARIES    │
                                 └───────────────┘
```

---

*For database migrations and schema changes, use the Lovable Cloud migration tools.*
