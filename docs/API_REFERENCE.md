# HRPM.org API Reference

## Backend Edge Functions Documentation

---

## Overview

HRPM.org backend is powered by Lovable Cloud Edge Functions, providing serverless API endpoints for AI-powered analysis, data retrieval, and external integrations.

### Base URL

```
https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1
```

### Authentication

Most endpoints accept anonymous requests, but authentication provides better rate limits and data access.

```http
Authorization: Bearer <access_token>
```

### Common Headers

```http
Content-Type: application/json
apikey: <supabase_anon_key>
```

---

## Edge Functions

### 1. Analyze Document

**Endpoint:** `POST /analyze-document`

Analyzes uploaded documents using AI to extract timeline events, entities, discrepancies, legal claims, compliance violations, and financial harm incidents.

#### Request

```json
{
  "uploadId": "uuid",
  "documentContent": "string (document text)",
  "fileName": "example.pdf",
  "documentType": "legal_document | court_filing | police_report | news_article | regulatory_filing | correspondence",
  "caseId": "uuid (optional)"
}
```

#### Response

```json
{
  "eventsExtracted": 5,
  "entitiesExtracted": 12,
  "discrepanciesExtracted": 3,
  "claimsExtracted": 2,
  "complianceViolationsExtracted": 1,
  "financialHarmExtracted": 4
}
```

#### Extracted Event Schema

```typescript
interface ExtractedEvent {
  date: string;                    // YYYY-MM-DD format
  category: "Business Interference" | "Harassment" | "Legal Proceeding" | "Criminal Allegation";
  description: string;
  individuals: string;
  legalAction: string;
  outcome: string;
  evidenceDiscrepancy: string;
  sources: string;
  confidenceScore: number;         // 0-1
}
```

#### Extracted Entity Schema

```typescript
interface ExtractedEntity {
  name: string;
  entityType: "Person" | "Organization" | "Official Body" | "Legal Entity";
  role: string;
  description: string;
}
```

#### Extracted Discrepancy Schema

```typescript
interface ExtractedDiscrepancy {
  discrepancyType: "Procedural Failure" | "Chain of Custody" | "Testimony Contradiction" | "Document Forgery" | "Timeline Inconsistency" | "Other";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  legalReference: string;
  relatedDates: string[];
}
```

#### Extracted Claim Schema

```typescript
interface ExtractedClaim {
  allegationText: string;
  claimType: "criminal" | "regulatory" | "civil";
  legalFramework: "pakistani" | "international";
  legalSection: string;           // e.g., "PECA 2016 Section 20"
  allegedBy: string;
  allegedAgainst: string;
  dateAlleged: string;
  sourceDocument: string;
}
```

#### Compliance Violation Schema

```typescript
interface ComplianceViolation {
  violationType: "Procedural Failure" | "Documentation Gap" | "Chain of Custody" | "Constitutional Violation" | "Due Process Violation";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  legalConsequence: string;
  remediationPossible: boolean;
}
```

#### Financial Harm Schema

```typescript
interface FinancialHarmIncident {
  incidentType: "account_freeze" | "license_revocation" | "regulatory_notice" | "contract_termination" | "asset_seizure" | "other";
  title: string;
  description: string;
  date: string;
  estimatedLoss: number;
  currency: string;
  lossCategory: "direct_financial" | "lost_income" | "legal_costs" | "opportunity_cost" | "reputational" | "time_cost";
  perpetratorAgency: string;
  isDocumented: boolean;
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Missing required fields |
| 402 | AI credits exhausted |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

### 2. Intel Chat

**Endpoint:** `POST /intel-chat`

Streaming AI chat endpoint for conversational case analysis.

#### Request

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What were the main procedural violations in the FIA raid?"
    }
  ]
}
```

#### Response

Server-Sent Events (SSE) stream:

```
data: {"choices":[{"delta":{"content":"Based on the case file..."}}]}

data: {"choices":[{"delta":{"content":" the FIA raid..."}}]}

data: [DONE]
```

#### System Context

The chat is pre-configured with case context including:
- Key case facts
- Timeline of events
- Key entities (protagonists, antagonists)
- Legal violations (local and international)
- Agency involvement

---

### 3. Threat Profiler

**Endpoint:** `POST /threat-profiler`

Generates comprehensive threat profiles for adversarial entities.

#### Request

```json
{
  "entity": {
    "name": "Major (R) Mumtaz Hussain Shah",
    "type": "Person",
    "role": "Primary Complainant",
    "description": "Retired military officer who filed multiple FIRs"
  },
  "relatedEvents": [
    {
      "date": "2019-07-18",
      "category": "Legal Proceeding",
      "description": "Filed FIR #17/2019 at FIA Cyber Crime Wing"
    }
  ],
  "connections": [
    "Lt. Col. (R) Saqib Mumtaz",
    "SI Imran Saad",
    "FIA Cyber Crime Wing"
  ]
}
```

#### Response

```json
{
  "entityId": "uuid",
  "entityName": "Major (R) Mumtaz Hussain Shah",
  "threatLevel": "high",
  "summary": "High-threat adversarial actor with documented pattern of filing malicious complaints...",
  "motivations": [
    "Personal vendetta against target",
    "Financial gain through extortion",
    "Abuse of military connections"
  ],
  "tactics": [
    "Filing multiple FIRs with fabricated evidence",
    "Leveraging military network for agency access",
    "Coordinating with complicit officials"
  ],
  "connections": [
    "Direct chain of command influence over FIA officials",
    "Family connection to Lt. Col. Saqib Mumtaz"
  ],
  "timeline": [
    "2017: Initial contact and threats",
    "2019: Filed first FIR",
    "2020: Coordinated regulatory actions"
  ],
  "vulnerabilities": [
    "Contradictory statements in sworn affidavits",
    "Timeline inconsistencies in complaint narrative",
    "Documented evidence fabrication"
  ],
  "recommendations": [
    "File counter-complaint for perjury",
    "Request detailed forensic timeline analysis",
    "Document all procedural violations"
  ]
}
```

---

### 4. Pattern Detector

**Endpoint:** `POST /pattern-detector`

Analyzes investigative data to identify hidden patterns and anomalies.

#### Request

```json
{
  "events": [
    {
      "date": "2019-07-18",
      "category": "Legal Proceeding",
      "description": "FIR filed at FIA",
      "individuals": "Major Shah, SI Imran"
    }
  ],
  "entities": [
    {
      "name": "Major Mumtaz Shah",
      "type": "Person",
      "category": "antagonist",
      "role": "Complainant"
    }
  ],
  "connections": [],
  "discrepancies": [
    {
      "severity": "critical",
      "discrepancy_type": "Chain of Custody",
      "title": "Hash values generated off-site"
    }
  ]
}
```

#### Response

```json
{
  "patterns": [
    {
      "id": "pattern_1",
      "type": "temporal",
      "title": "Coordinated July 2019 Actions",
      "description": "Cluster of legal actions filed within 2-week period suggests coordinated effort",
      "confidence": 0.85,
      "severity": "high",
      "entities": ["Major Shah", "Lt. Col. Saqib", "SI Imran"],
      "events": ["event_1", "event_2", "event_3"],
      "evidence": ["Timeline clustering", "Shared complainant", "Common FIR format"]
    },
    {
      "id": "pattern_2",
      "type": "network",
      "title": "Military-FIA Connection Hub",
      "description": "Three retired military officers acting as coordinators between complainant and agency",
      "confidence": 0.78,
      "severity": "critical",
      "entities": ["Major Shah", "Lt. Col. Saqib", "Tariq Arbab"]
    },
    {
      "id": "pattern_3",
      "type": "behavioral",
      "title": "Evidence Fabrication Pattern",
      "description": "Repeated pattern of generating forensic reports without chain of custody",
      "confidence": 0.92,
      "severity": "critical"
    }
  ]
}
```

#### Pattern Types

| Type | Description |
|------|-------------|
| `temporal` | Clusters of events in specific time periods |
| `network` | Highly connected entities acting as coordinators |
| `behavioral` | Repeated tactics or systematic actions |
| `anomaly` | Unusual discrepancies or procedural failures |

---

### 5. Analyze Rights Violations

**Endpoint:** `POST /analyze-rights-violations`

Maps case events to international human rights frameworks.

#### Request

```json
{
  "events": [
    {
      "date": "2019-07-18",
      "category": "Legal Proceeding",
      "description": "FIA conducted raid without proper warrant"
    }
  ],
  "analysisType": "full_analysis | framework_comparison"
}
```

#### Response (Full Analysis)

```json
{
  "analysis": {
    "summary": "Documented evidence of systematic human rights violations across multiple international frameworks",
    "total_violations_identified": 12,
    "violations": [
      {
        "title": "Arbitrary Search Without Warrant",
        "category": "Due Process",
        "severity": "Critical",
        "frameworks_violated": [
          {
            "framework": "ICCPR",
            "articles": ["Article 17: Protection from arbitrary interference"],
            "explanation": "Search conducted without judicial authorization violates protection against arbitrary interference with privacy"
          },
          {
            "framework": "UDHR",
            "articles": ["Article 12: Freedom from arbitrary interference"],
            "explanation": "Raid without warrant constitutes arbitrary interference with home and privacy"
          }
        ],
        "evidence_from_case": "FIA raid on July 18, 2019 conducted without valid search warrant",
        "date_range": "2019-07-18"
      }
    ],
    "patterns": [
      "Systematic denial of due process rights",
      "Coordinated multi-agency harassment"
    ],
    "recommendations": [
      "File complaint with UN Human Rights Committee",
      "Document for Universal Periodic Review submission"
    ]
  }
}
```

#### Response (Framework Comparison)

```json
{
  "analysis": {
    "framework_perspectives": [
      {
        "framework": "United Nations",
        "key_violations": ["ICCPR Article 14", "UDHR Article 9"],
        "strongest_provisions": ["Right to fair trial", "Freedom from arbitrary detention"],
        "assessment": "Clear violations of core civil and political rights"
      },
      {
        "framework": "OIC",
        "key_violations": ["CDHRI Article 19", "CDHRI Article 20"],
        "strongest_provisions": ["Equality before law", "No arbitrary arrest"],
        "assessment": "Violations of Islamic human rights principles"
      }
    ],
    "convergence_points": [
      "All frameworks prohibit arbitrary detention",
      "Universal recognition of fair trial rights"
    ],
    "divergence_points": [
      "Different enforcement mechanisms",
      "Varying emphasis on property rights"
    ]
  }
}
```

---

### 6. Generate Report

**Endpoint:** `POST /generate-report`

Generates formal investigation reports in markdown format.

#### Request

```json
{
  "title": "Intelligence Report: FIA Proceedings Analysis",
  "sections": [
    "Executive Summary",
    "Timeline Analysis",
    "Entity Mapping",
    "Procedural Violations",
    "Recommendations"
  ],
  "additionalContext": "Focus on chain of custody issues",
  "data": {
    "stats": {
      "totalEvents": 45,
      "totalEntities": 28,
      "aiExtractedEvents": 32,
      "totalDiscrepancies": 15
    },
    "events": [],
    "entities": [],
    "discrepancies": []
  }
}
```

#### Response

```json
{
  "report": "# Intelligence Report: FIA Proceedings Analysis\n\n## Executive Summary\n\n..."
}
```

---

### 7. Generate Appeal Summary

**Endpoint:** `POST /generate-appeal-summary`

Generates litigation-grade appeal summaries with source citations.

#### Request

```json
{
  "caseId": "uuid",
  "summaryType": "habeas_corpus | criminal_appeal | constitutional_petition | application_for_leave",
  "events": [],
  "entities": [],
  "discrepancies": [],
  "claims": [],
  "statutes": [],
  "precedents": []
}
```

#### Response

```json
{
  "summary": {
    "title": "Habeas Corpus Petition",
    "content": "# IN THE HIGH COURT OF SINDH AT KARACHI\n\n## Constitutional Petition No. ___ of 2025\n\n...",
    "sources_json": {
      "events_cited": ["event_id_1", "event_id_2"],
      "precedents_cited": ["precedent_id_1"],
      "statutes_cited": ["statute_id_1", "statute_id_2"]
    }
  }
}
```

---

### 8. Fetch News

**Endpoint:** `POST /fetch-news`

Fetches news articles related to human rights topics.

#### Request

```json
{
  "query": "FIA cybercrime Pakistan",
  "page": 1,
  "pageSize": 10
}
```

#### Response

```json
{
  "articles": [
    {
      "title": "Article Title",
      "description": "Article description...",
      "url": "https://example.com/article",
      "publishedAt": "2025-01-15T10:00:00Z",
      "source": "Dawn News"
    }
  ],
  "totalResults": 150
}
```

---

### 9. Fetch Legal Precedents

**Endpoint:** `POST /fetch-legal-precedents`

Fetches case law precedents from CourtListener API.

#### Request

No body required (runs batch job)

#### Response

```json
{
  "success": true,
  "inserted": 25,
  "skipped": 10
}
```

#### Search Terms

The function searches for:
- Civil rights violation
- Excessive force
- Wrongful arrest
- Due process
- Fourth Amendment
- Eighth Amendment
- Qualified immunity

---

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| analyze-document | 10 req/minute |
| intel-chat | 30 req/minute |
| threat-profiler | 10 req/minute |
| pattern-detector | 10 req/minute |
| generate-report | 5 req/minute |
| All others | 60 req/minute |

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Missing or invalid parameters |
| 401 | Unauthorized - Invalid or missing auth token |
| 402 | Payment Required - AI credits exhausted |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Client Integration

### JavaScript/TypeScript

```typescript
import { supabase } from "@/integrations/supabase/client";

// Analyze document
const { data, error } = await supabase.functions.invoke("analyze-document", {
  body: {
    uploadId: "document-uuid",
    documentContent: "Document text content...",
    fileName: "evidence.pdf",
    documentType: "legal_document",
    caseId: "case-uuid"
  }
});

// Intel chat with streaming
const response = await supabase.functions.invoke("intel-chat", {
  body: { messages: [{ role: "user", content: "Analyze the timeline" }] }
});

// Read streaming response
const reader = response.data.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = new TextDecoder().decode(value);
  // Process SSE chunks
}
```

### cURL Examples

```bash
# Analyze document
curl -X POST \
  https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/analyze-document \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "uploadId": "uuid",
    "documentContent": "Document text...",
    "fileName": "file.pdf",
    "documentType": "legal_document"
  }'

# Threat profiler
curl -X POST \
  https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/threat-profiler \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "entity": {"name": "Entity Name", "type": "Person"},
    "relatedEvents": [],
    "connections": []
  }'
```

---

## Webhook Integration

For custom integrations, contact the platform administrators to set up webhook endpoints for:
- New document analysis completion
- Pattern detection alerts
- High-severity violation detection

---

## SDK Support

### React Hooks

The platform provides custom React hooks for API integration:

```typescript
// Document analysis
import { useAnalyzeDocument } from "@/hooks/useExtractedEvents";

const { mutate: analyzeDocument, isPending } = useAnalyzeDocument();
analyzeDocument({
  uploadId: "uuid",
  documentContent: "...",
  fileName: "file.pdf",
  documentType: "legal_document"
});

// Fetching events
import { useExtractedEvents } from "@/hooks/useExtractedEvents";

const { data: events, isLoading } = useExtractedEvents();
```

---

*For additional API support, contact the platform administrators.*
