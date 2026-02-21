import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Code, Key, Zap, Shield, FileText, Network, Brain, BookOpen, Copy,
  ExternalLink, Terminal, Lock, Globe, Database, Search, AlertTriangle,
  Scale, BarChart3, ChevronRight, ArrowRight, CheckCircle, Rss
} from "lucide-react";
import { toast } from "sonner";
import hrpmLogo from "@/assets/human-rights-logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

const BASE_URL = "https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/public-api";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

const CodeBlock = ({ code, language = "" }: { code: string; language?: string }) => (
  <div className="relative group">
    <pre className="bg-muted/60 rounded-lg p-4 overflow-x-auto text-sm font-mono border border-border/30">
      <code>{code}</code>
    </pre>
    <Button
      size="sm"
      variant="ghost"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => copyToClipboard(code)}
    >
      <Copy className="w-3.5 h-3.5" />
    </Button>
  </div>
);

const EndpointCard = ({
  method, resource, description, params, responseExample, icon: Icon
}: {
  method: string; resource: string; description: string;
  params: { name: string; type: string; desc: string; required?: boolean }[];
  responseExample: string; icon: any;
}) => (
  <Card className="bg-card/60 border-border/40" id={`endpoint-${resource}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono text-xs px-2.5">
          {method}
        </Badge>
        <code className="text-sm font-mono bg-muted/50 px-3 py-1 rounded-md">
          ?resource={resource}
        </code>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Icon className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg capitalize">{resource.replace("-", " ")}</CardTitle>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Parameters */}
      <div>
        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Query Parameters</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 text-left">
                <th className="py-1.5 pr-4 font-medium text-foreground/70">Parameter</th>
                <th className="py-1.5 pr-4 font-medium text-foreground/70">Type</th>
                <th className="py-1.5 font-medium text-foreground/70">Description</th>
              </tr>
            </thead>
            <tbody className="text-foreground/60">
              {params.map((p) => (
                <tr key={p.name} className="border-b border-border/10">
                  <td className="py-1.5 pr-4 font-mono text-xs">
                    {p.name}
                    {p.required && <span className="text-destructive ml-1">*</span>}
                  </td>
                  <td className="py-1.5 pr-4 text-xs">{p.type}</td>
                  <td className="py-1.5 text-xs">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response */}
      <div>
        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Example Response</p>
        <CodeBlock code={responseExample} language="json" />
      </div>
    </CardContent>
  </Card>
);

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quick Start" },
  { id: "auth", label: "Authentication" },
  { id: "pagination", label: "Pagination" },
  { id: "endpoint-cases", label: "Cases" },
  { id: "endpoint-events", label: "Events" },
  { id: "endpoint-entities", label: "Entities" },
  { id: "endpoint-relationships", label: "Relationships" },
  { id: "endpoint-violations", label: "Violations" },
  { id: "endpoint-claims", label: "Legal Claims" },
  { id: "endpoint-statutes", label: "Statutes" },
  { id: "endpoint-precedents", label: "Precedents" },
  { id: "endpoint-discrepancies", label: "Discrepancies" },
  { id: "endpoint-harm-incidents", label: "Harm Incidents" },
  { id: "endpoint-blog", label: "Blog Posts" },
  { id: "endpoint-stats", label: "Platform Stats" },
  { id: "data-feeds", label: "Data Feeds" },
  { id: "ai-endpoints", label: "AI Endpoints" },
  { id: "errors", label: "Error Handling" },
  { id: "rate-limits", label: "Rate Limits" },
  { id: "sdks", label: "SDKs & Examples" },
];

const Api = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={hrpmLogo} alt="HRPM Logo" className="w-9 h-9 transition-all duration-300 group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground tracking-tight leading-none">HRPM</span>
              <span className="text-[10px] text-foreground/50 leading-tight">API Reference</span>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/docs" className="text-sm text-foreground/60 hover:text-primary transition-colors hidden sm:flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Docs
            </Link>
            <a href="https://github.com/BackCheck/justice-unveiled" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/60 hover:text-primary transition-colors hidden sm:flex items-center gap-1">
              <Code className="w-4 h-4" /> GitHub
            </a>
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/30 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/30">
              <Zap className="w-3 h-3 mr-1" /> Public REST API v1.0
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              HRPM <span className="text-primary">API</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Open-access REST API for human rights investigation data. Query cases, events, entities, 
              legal claims, and violations — no authentication required for read endpoints.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="text-xs"><Globe className="w-3 h-3 mr-1" /> Public Access</Badge>
              <Badge variant="secondary" className="text-xs"><Database className="w-3 h-3 mr-1" /> JSON Responses</Badge>
              <Badge variant="secondary" className="text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Paginated</Badge>
              <Badge variant="secondary" className="text-xs"><Search className="w-3 h-3 mr-1" /> Full-Text Search</Badge>
            </div>
            <div className="mt-6">
              <p className="text-xs text-foreground/40 font-mono">Base URL:</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono bg-muted/60 px-3 py-2 rounded-lg border border-border/30 flex-1 overflow-x-auto">
                  {BASE_URL}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(BASE_URL)}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-10">
          {/* Sidebar TOC */}
          <nav className="hidden lg:block w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">API Reference</p>
            <div className="space-y-0.5">
              {tocItems.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="block text-sm text-foreground/55 hover:text-primary py-1.5 px-3 rounded-md hover:bg-primary/5 transition-colors">
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-12">

            {/* Overview */}
            <section id="overview">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" /> Overview
              </h2>
              <p className="text-foreground/70 leading-relaxed mb-4">
                The HRPM Public API provides read-only access to all investigation data stored on the platform. 
                All data is classified as <strong>public domain</strong> and available as open access. The API 
                returns JSON responses with built-in pagination, full-text search, and filtering capabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/60 border-border/40">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">No Auth Required</p>
                      <p className="text-xs text-foreground/55">All read endpoints are publicly accessible</p>
                    </div>
                  </CardContent>
                </Card>
              <Card className="bg-card/60 border-border/40">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Database className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">14 Resources</p>
                      <p className="text-xs text-foreground/55">Cases, events, entities, OSINT, claims, and more</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/60 border-border/40">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">AI Endpoints</p>
                      <p className="text-xs text-foreground/55">Authenticated AI analysis endpoints</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator className="border-border/20" />

            {/* Quick Start */}
            <section id="quickstart">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Terminal className="w-6 h-6 text-primary" /> Quick Start
              </h2>
              <p className="text-foreground/70 mb-4">Make your first API call in seconds — no setup required:</p>
              <CodeBlock code={`# List all cases
curl "${BASE_URL}?resource=cases"

# Search events by keyword
curl "${BASE_URL}?resource=events&search=arrest&limit=10"

# Get a single case by ID
curl "${BASE_URL}?resource=cases&id=YOUR_CASE_UUID"

# Get platform statistics
curl "${BASE_URL}?resource=stats"`} />
            </section>

            <Separator className="border-border/20" />

            {/* Authentication */}
            <section id="auth">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" /> Authentication
              </h2>
              <div className="space-y-4 text-foreground/70">
                <p>
                  <strong>Public endpoints</strong> (data queries) require <strong>no authentication</strong>. 
                  Simply call the API with the <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">resource</code> query parameter.
                </p>
                <p>
                  <strong>AI-powered endpoints</strong> (document analysis, threat profiling, etc.) require a valid 
                  JWT bearer token. Sign up at <Link to="/auth" className="text-primary hover:underline">/auth</Link> to 
                  obtain your access token.
                </p>
                <CodeBlock code={`# Authenticated request (AI endpoints only)
curl -X POST '${BASE_URL.replace('public-api', 'analyze-document')}' \\
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{"documentText": "...", "documentType": "legal"}'`} />
              </div>
            </section>

            <Separator className="border-border/20" />

            {/* Pagination */}
            <section id="pagination">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" /> Pagination & Filtering
              </h2>
              <div className="space-y-4 text-foreground/70">
                <p>All list endpoints return paginated results with metadata:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/30 text-left">
                        <th className="py-2 pr-4 font-semibold text-foreground">Parameter</th>
                        <th className="py-2 pr-4 font-semibold text-foreground">Default</th>
                        <th className="py-2 font-semibold text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/60">
                      <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono text-xs">page</td><td className="py-2 pr-4">1</td><td className="py-2">Page number</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono text-xs">limit</td><td className="py-2 pr-4">25</td><td className="py-2">Items per page (max: 100)</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono text-xs">search</td><td className="py-2 pr-4">—</td><td className="py-2">Full-text search across relevant fields</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono text-xs">case_id</td><td className="py-2 pr-4">—</td><td className="py-2">Filter by case UUID</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono text-xs">category</td><td className="py-2 pr-4">—</td><td className="py-2">Filter by category/type</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono text-xs">severity</td><td className="py-2 pr-4">—</td><td className="py-2">Filter by severity level</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono text-xs">sort_by</td><td className="py-2 pr-4">varies</td><td className="py-2">Sort field</td></tr>
                      <tr><td className="py-2 pr-4 font-mono text-xs">sort_order</td><td className="py-2 pr-4">desc</td><td className="py-2">asc or desc</td></tr>
                    </tbody>
                  </table>
                </div>
                <CodeBlock code={`// Pagination response format
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "total_pages": 6
  }
}`} />
              </div>
            </section>

            <Separator className="border-border/20" />

            {/* Data Endpoints */}
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 pt-4">
              <Database className="w-6 h-6 text-primary" /> Data Endpoints
            </h2>
            <p className="text-foreground/60 text-sm -mt-8">All public, read-only, no authentication required.</p>

            <div className="space-y-6 mt-6">
              <EndpointCard
                method="GET" resource="cases" icon={FileText}
                description="Retrieve investigation cases. Each case contains metadata, status, severity, and aggregate counts for associated events, entities, and sources."
                params={[
                  { name: "id", type: "uuid", desc: "Get single case by ID" },
                  { name: "search", type: "string", desc: "Search title, description, case number" },
                  { name: "category", type: "string", desc: "Filter by category" },
                  { name: "severity", type: "string", desc: "Filter: critical, high, medium, low" },
                  { name: "sort_by", type: "string", desc: "title, case_number, status, severity, created_at, updated_at" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "case_number": "CF-001",
      "title": "FIA Investigation Irregularities",
      "status": "Active",
      "severity": "critical",
      "category": "Institutional Failure",
      "location": "Karachi, Pakistan",
      "total_events": 47,
      "total_entities": 23,
      "created_at": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 25, "total": 4, "total_pages": 1 }
}`}
              />

              <EndpointCard
                method="GET" resource="events" icon={BarChart3}
                description="Retrieve timeline events extracted from case documents. Events include dates, categories, involved individuals, legal actions, and evidence discrepancies."
                params={[
                  { name: "id", type: "uuid", desc: "Get single event by ID" },
                  { name: "case_id", type: "uuid", desc: "Filter by case" },
                  { name: "category", type: "string", desc: "Business Interference, Harassment, Legal Proceeding, Criminal Allegation" },
                  { name: "search", type: "string", desc: "Search description, individuals" },
                  { name: "sort_by", type: "string", desc: "date, category, created_at" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "date": "2019-06-15",
      "category": "Legal Proceeding",
      "description": "FIR lodged under PECA 2016",
      "individuals": "IO Ahmad, Complainant X",
      "legal_action": "Criminal complaint filed",
      "outcome": "Investigation initiated",
      "evidence_discrepancy": "No CNIC verification performed",
      "confidence_score": 0.92
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="entities" icon={Network}
                description="Retrieve named entities (people, organizations, institutions) extracted from case documents with their roles, types, and influence scores."
                params={[
                  { name: "id", type: "uuid", desc: "Get single entity by ID" },
                  { name: "case_id", type: "uuid", desc: "Filter by case" },
                  { name: "category", type: "string", desc: "Person, Organization, Official Body, Legal Entity" },
                  { name: "search", type: "string", desc: "Search name, description" },
                  { name: "sort_by", type: "string", desc: "name, entity_type, influence_score, created_at" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "name": "Federal Investigation Agency",
      "entity_type": "Official Body",
      "role": "Investigating Authority",
      "influence_score": 85,
      "organization_affiliation": "Ministry of Interior"
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="relationships" icon={Network}
                description="Retrieve relationships between entities including influence weights, directions, and evidence sources."
                params={[
                  { name: "case_id", type: "uuid", desc: "Filter by case" },
                  { name: "category", type: "string", desc: "Filter by relationship type" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "source_entity_id": "uuid",
      "target_entity_id": "uuid",
      "relationship_type": "reports_to",
      "influence_weight": 8,
      "influence_direction": "upstream"
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="violations" icon={AlertTriangle}
                description="Retrieve compliance violations flagged during investigation audits with severity and remediation status."
                params={[
                  { name: "case_id", type: "uuid", desc: "Filter by case" },
                  { name: "severity", type: "string", desc: "critical, high, medium, low" },
                  { name: "search", type: "string", desc: "Search title, description" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "title": "Missing Chain of Custody Documentation",
      "violation_type": "Documentation Gap",
      "severity": "critical",
      "legal_consequence": "Evidence inadmissible under QSO 1984",
      "resolved": false
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="claims" icon={Scale}
                description="Retrieve legal claims and allegations extracted from case documents with framework references."
                params={[
                  { name: "case_id", type: "uuid", desc: "Filter by case" },
                  { name: "category", type: "string", desc: "criminal, regulatory, civil" },
                  { name: "search", type: "string", desc: "Search allegation text" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "allegation_text": "Unauthorized account freeze without court order",
      "claim_type": "regulatory",
      "legal_framework": "pakistani",
      "legal_section": "Banking Companies Ordinance 1962",
      "alleged_against": "State Bank of Pakistan"
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="statutes" icon={BookOpen}
                description="Browse legal statutes across multiple frameworks including Pakistani law and international conventions."
                params={[
                  { name: "category", type: "string", desc: "Filter by framework (e.g. PPC, UDHR, ICCPR)" },
                  { name: "search", type: "string", desc: "Search statute name, title, summary" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "statute_code": "PECA-20",
      "statute_name": "PECA 2016",
      "title": "Offences against dignity of a natural person",
      "framework": "Pakistani",
      "section": "Section 20",
      "summary": "Criminalizes online harassment..."
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="precedents" icon={Scale}
                description="Search case law precedents with citations, courts, jurisdictions, and verification status."
                params={[
                  { name: "id", type: "uuid", desc: "Get single precedent by ID" },
                  { name: "category", type: "string", desc: "Filter by jurisdiction" },
                  { name: "search", type: "string", desc: "Search case name, citation, summary" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "case_name": "Muhammad Azhar Siddique v. Federation of Pakistan",
      "citation": "2012 SCMR 1818",
      "court": "Supreme Court of Pakistan",
      "year": 2012,
      "jurisdiction": "Pakistan",
      "verified": true,
      "is_landmark": true
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="discrepancies" icon={AlertTriangle}
                description="Retrieve evidence discrepancies and procedural failures identified during analysis."
                params={[
                  { name: "case_id", type: "uuid", desc: "Filter by case" },
                  { name: "severity", type: "string", desc: "critical, high, medium, low" },
                  { name: "search", type: "string", desc: "Search title, description" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "title": "Timeline Inconsistency in FIR Filing",
      "discrepancy_type": "Timeline Inconsistency",
      "severity": "high",
      "legal_reference": "CrPC Section 154"
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="harm-incidents" icon={AlertTriangle}
                description="Retrieve documented regulatory harm incidents including financial impacts and institutional actions."
                params={[
                  { name: "case_id", type: "uuid", desc: "Filter by case" },
                  { name: "severity", type: "string", desc: "Filter by severity" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "title": "Bank Account Freeze",
      "incident_type": "account_freeze",
      "severity": "critical",
      "incident_date": "2020-03-15",
      "estimated_loss": 5000000,
      "currency": "PKR"
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="blog" icon={BookOpen}
                description="Retrieve published blog posts. Use id parameter with the post slug for single post lookup."
                params={[
                  { name: "id", type: "string", desc: "Get single post by slug" },
                  { name: "category", type: "string", desc: "Filter by category" },
                  { name: "search", type: "string", desc: "Search title, excerpt" },
                ]}
                responseExample={`{
  "data": [
    {
      "id": "uuid",
      "title": "Understanding PECA 2016 Amendments",
      "slug": "understanding-peca-2016",
      "excerpt": "An analysis of recent amendments...",
      "category": "Legal Analysis",
      "published_at": "2026-01-20T10:00:00Z"
    }
  ],
  "pagination": { ... }
}`}
              />

              <EndpointCard
                method="GET" resource="stats" icon={BarChart3}
                description="Get aggregate platform statistics — total cases, events, entities, violations, claims, and precedents."
                params={[]}
                responseExample={`{
  "data": {
    "total_cases": 4,
    "total_events": 187,
    "total_entities": 94,
    "total_violations": 23,
    "total_claims": 31,
    "total_precedents": 15
  }
}`}
              />
            </div>

            <Separator className="border-border/20" />

            {/* Data Feeds */}
            <section id="data-feeds">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Rss className="w-6 h-6 text-primary" /> Data Feeds
              </h2>
              <p className="text-foreground/70 mb-4">
                Subscribe to HRPM data in RSS 2.0, Atom 1.0, or JSON Feed 1.1 format. No authentication required.
              </p>
              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Feed Base URL</p>
                <CodeBlock code={`${BASE_URL.replace('public-api', 'case-rss-feed')}`} />
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 text-left">
                      <th className="py-2 pr-4 font-semibold text-foreground">Feed Type</th>
                      <th className="py-2 pr-4 font-semibold text-foreground">Parameter</th>
                      <th className="py-2 font-semibold text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground/60">
                    <tr className="border-b border-border/10"><td className="py-2 pr-4">Master Feed</td><td className="py-2 pr-4 font-mono text-xs">?type=all</td><td className="py-2">Cases + blog + events combined (default)</td></tr>
                    <tr className="border-b border-border/10"><td className="py-2 pr-4">Cases</td><td className="py-2 pr-4 font-mono text-xs">?type=cases</td><td className="py-2">Investigation case files</td></tr>
                    <tr className="border-b border-border/10"><td className="py-2 pr-4">Blog Reports</td><td className="py-2 pr-4 font-mono text-xs">?type=blog</td><td className="py-2">AI-generated & editorial reports</td></tr>
                    <tr className="border-b border-border/10"><td className="py-2 pr-4">Timeline Events</td><td className="py-2 pr-4 font-mono text-xs">?type=events</td><td className="py-2">Extracted investigation events</td></tr>
                    <tr><td className="py-2 pr-4">Case-Specific</td><td className="py-2 pr-4 font-mono text-xs">?caseId=UUID</td><td className="py-2">Events, entities & evidence for one case</td></tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Format Parameter</p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 text-left">
                      <th className="py-2 pr-4 font-semibold text-foreground">Format</th>
                      <th className="py-2 pr-4 font-semibold text-foreground">Value</th>
                      <th className="py-2 font-semibold text-foreground">Content-Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground/60">
                    <tr className="border-b border-border/10"><td className="py-2 pr-4">RSS 2.0</td><td className="py-2 pr-4 font-mono text-xs">format=rss</td><td className="py-2 text-xs">application/rss+xml</td></tr>
                    <tr className="border-b border-border/10"><td className="py-2 pr-4">Atom 1.0</td><td className="py-2 pr-4 font-mono text-xs">format=atom</td><td className="py-2 text-xs">application/atom+xml</td></tr>
                    <tr><td className="py-2 pr-4">JSON Feed 1.1</td><td className="py-2 pr-4 font-mono text-xs">format=json</td><td className="py-2 text-xs">application/feed+json</td></tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Examples</p>
              <CodeBlock code={`# RSS feed of all updates
curl "${BASE_URL.replace('public-api', 'case-rss-feed')}?format=rss"

# JSON Feed of blog reports only
curl "${BASE_URL.replace('public-api', 'case-rss-feed')}?type=blog&format=json"

# Atom feed for a specific case
curl "${BASE_URL.replace('public-api', 'case-rss-feed')}?caseId=YOUR_CASE_UUID&format=atom"

# Case-specific JSON Feed
curl "${BASE_URL.replace('public-api', 'case-rss-feed')}?caseId=YOUR_CASE_UUID&format=json"`} />

              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground/70">
                  <strong>AI Agent Discovery:</strong> HRPM publishes <code className="bg-muted/60 px-1 rounded text-xs">llms.txt</code>,{" "}
                  <code className="bg-muted/60 px-1 rounded text-xs">.well-known/ai-plugin.json</code>, and feed autodiscovery{" "}
                  <code className="bg-muted/60 px-1 rounded text-xs">&lt;link&gt;</code> tags. All AI crawlers are allowed in{" "}
                  <code className="bg-muted/60 px-1 rounded text-xs">robots.txt</code>.
                </p>
              </div>
            </section>

            <Separator className="border-border/20" />

            {/* AI Endpoints */}
            <section id="ai-endpoints">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" /> AI-Powered Endpoints
              </h2>
              <p className="text-foreground/70 mb-4">
                These endpoints require <Badge variant="outline" className="text-xs mx-1"><Lock className="w-3 h-3 mr-1" />Authentication</Badge> 
                and use AI credits. Pass a valid JWT in the <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">Authorization</code> header.
              </p>
              <div className="space-y-3">
                {[
                  { name: "analyze-document", method: "POST", desc: "Extract events, entities, discrepancies, claims, and financial harm from documents using AI", body: '{ "uploadId": "uuid", "documentContent": "text", "fileName": "doc.pdf", "documentType": "legal", "caseId": "uuid" }' },
                  { name: "intel-chat", method: "POST", desc: "Conversational AI for investigation queries with case context", body: '{ "message": "What patterns exist?", "conversationHistory": [], "caseId": "uuid" }' },
                  { name: "threat-profiler", method: "POST", desc: "Generate threat profiles for adversarial entities", body: '{ "entityId": "uuid", "caseId": "uuid" }' },
                  { name: "pattern-detector", method: "POST", desc: "Detect behavioral, temporal, and network patterns across case data", body: '{ "caseId": "uuid", "analysisType": "behavioral" | "temporal" | "network" }' },
                  { name: "generate-report", method: "POST", desc: "Generate formatted investigation reports", body: '{ "caseId": "uuid", "reportType": "executive" | "detailed", "format": "markdown" }' },
                  { name: "analyze-rights-violations", method: "POST", desc: "Map text against UDHR, ICCPR, and other international frameworks", body: '{ "text": "...", "frameworks": ["UDHR", "ICCPR"] }' },
                  { name: "fetch-legal-precedents", method: "POST", desc: "Search external case law databases (CourtListener)", body: '{ "query": "due process", "jurisdiction": "Pakistan" }' },
                  { name: "generate-appeal-summary", method: "POST", desc: "Generate appeal briefs with AI source citations", body: '{ "caseId": "uuid", "summaryType": "comprehensive" }' },
                  { name: "osint-enrich-entity", method: "POST", desc: "Generate AI intelligence dossiers and search pivots for entities", body: '{ "entityId": "uuid", "caseId": "uuid" }' },
                  { name: "analyze-dark-web-artifact", method: "POST", desc: "Analyze pre-collected dark web artifacts for PII, crypto addresses, and threat intel", body: '{ "content": "artifact text...", "artifactType": "paste_dump", "caseId": "uuid" }' },
                ].map((ep) => (
                  <Card key={ep.name} className="bg-card/60 border-border/40">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-mono text-xs">{ep.method}</Badge>
                        <code className="text-sm font-mono bg-muted/50 px-2 py-0.5 rounded">/functions/v1/{ep.name}</code>
                        <Badge variant="outline" className="text-xs"><Lock className="w-3 h-3 mr-1" />Auth</Badge>
                      </div>
                      <p className="text-sm text-foreground/65 mb-2">{ep.desc}</p>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-primary hover:underline">View request body</summary>
                        <pre className="bg-muted/50 rounded p-2 mt-2 overflow-x-auto font-mono">{ep.body}</pre>
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="border-border/20" />

            {/* Error Handling */}
            <section id="errors">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-primary" /> Error Handling
              </h2>
              <p className="text-foreground/70 mb-4">All errors return a consistent JSON structure:</p>
              <CodeBlock code={`{
  "error": {
    "code": "NOT_FOUND",
    "message": "Case not found",
    "status": 404
  }
}`} />
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 text-left">
                      <th className="py-2 pr-4 font-semibold text-foreground">Status</th>
                      <th className="py-2 pr-4 font-semibold text-foreground">Code</th>
                      <th className="py-2 font-semibold text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground/60">
                    <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono">200</td><td className="py-2 pr-4">—</td><td className="py-2">Success</td></tr>
                    <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono">401</td><td className="py-2 pr-4">UNAUTHORIZED</td><td className="py-2">Missing or invalid auth token (AI endpoints only)</td></tr>
                    <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono">404</td><td className="py-2 pr-4">NOT_FOUND</td><td className="py-2">Resource not found</td></tr>
                    <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono">405</td><td className="py-2 pr-4">METHOD_NOT_ALLOWED</td><td className="py-2">Only GET supported for public API</td></tr>
                    <tr className="border-b border-border/10"><td className="py-2 pr-4 font-mono">429</td><td className="py-2 pr-4">RATE_LIMITED</td><td className="py-2">Too many requests</td></tr>
                    <tr><td className="py-2 pr-4 font-mono">500</td><td className="py-2 pr-4">INTERNAL_ERROR</td><td className="py-2">Server error</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <Separator className="border-border/20" />

            {/* Rate Limits */}
            <section id="rate-limits">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" /> Rate Limits
              </h2>
              <div className="text-foreground/70 space-y-3">
                <p>The public API has the following rate limits:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Public read endpoints:</strong> 100 requests per minute per IP</li>
                  <li><strong>AI endpoints:</strong> 10 requests per minute per authenticated user</li>
                  <li><strong>Maximum page size:</strong> 100 items per request</li>
                </ul>
                <p className="text-sm">
                  If you need higher limits for research purposes, 
                  <Link to="/contact" className="text-primary hover:underline ml-1">contact us</Link>.
                </p>
              </div>
            </section>

            <Separator className="border-border/20" />

            {/* SDKs & Examples */}
            <section id="sdks">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-primary" /> SDKs & Code Examples
              </h2>

              <Tabs defaultValue="javascript" className="mt-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <CodeBlock code={`const API_BASE = "${BASE_URL}";

// Fetch all cases
async function getCases({ page = 1, limit = 25, search = "" } = {}) {
  const params = new URLSearchParams({ resource: "cases", page, limit });
  if (search) params.set("search", search);
  const res = await fetch(\`\${API_BASE}?\${params}\`);
  return res.json();
}

// Get single case
async function getCase(id) {
  const res = await fetch(\`\${API_BASE}?resource=cases&id=\${id}\`);
  return res.json();
}

// Search events across a case
async function searchEvents(caseId, query) {
  const params = new URLSearchParams({
    resource: "events",
    case_id: caseId,
    search: query,
    sort_by: "date",
    sort_order: "asc"
  });
  const res = await fetch(\`\${API_BASE}?\${params}\`);
  return res.json();
}

// Get platform stats
async function getStats() {
  const res = await fetch(\`\${API_BASE}?resource=stats\`);
  return res.json();
}

// Usage
const { data, pagination } = await getCases({ search: "FIA" });
console.log(\`Found \${pagination.total} cases\`);`} />
                </TabsContent>

                <TabsContent value="python">
                  <CodeBlock code={`import requests

API_BASE = "${BASE_URL}"

def get_cases(page=1, limit=25, search=""):
    params = {"resource": "cases", "page": page, "limit": limit}
    if search:
        params["search"] = search
    return requests.get(API_BASE, params=params).json()

def get_events(case_id, category=None):
    params = {"resource": "events", "case_id": case_id}
    if category:
        params["category"] = category
    return requests.get(API_BASE, params=params).json()

def get_entities(case_id, search=""):
    params = {"resource": "entities", "case_id": case_id}
    if search:
        params["search"] = search
    return requests.get(API_BASE, params=params).json()

def get_stats():
    return requests.get(API_BASE, params={"resource": "stats"}).json()

# Usage
result = get_cases(search="FIA")
print(f"Found {result['pagination']['total']} cases")

for case in result["data"]:
    events = get_events(case["id"])
    print(f"  {case['title']}: {events['pagination']['total']} events")`} />
                </TabsContent>

                <TabsContent value="curl">
                  <CodeBlock code={`# List all cases
curl "${BASE_URL}?resource=cases"

# Search cases
curl "${BASE_URL}?resource=cases&search=FIA&severity=critical"

# Get case events sorted by date
curl "${BASE_URL}?resource=events&case_id=UUID&sort_by=date&sort_order=asc"

# Search entities
curl "${BASE_URL}?resource=entities&search=Federal&category=Official+Body"

# Get legal precedents from Pakistan
curl "${BASE_URL}?resource=precedents&category=Pakistan"

# Get all violations for a case
curl "${BASE_URL}?resource=violations&case_id=UUID&severity=critical"

# Platform stats
curl "${BASE_URL}?resource=stats"

# Paginate through events (page 3, 50 per page)
curl "${BASE_URL}?resource=events&page=3&limit=50"`} />
                </TabsContent>
              </Tabs>
            </section>

            {/* OpenCTI / STIX2 Integration */}
            <section id="stix2">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" /> OpenCTI / STIX 2.1 Integration
              </h2>
              <p className="text-foreground/70 text-sm mb-4">
                HRPM provides a dedicated STIX 2.1 export endpoint so threat intelligence platforms like <strong>OpenCTI</strong>, <strong>MISP</strong>, or any STIX-compatible tool can ingest HRPM investigations as structured threat intelligence.
              </p>

              <Card className="bg-card/60 border-border/40 mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono text-xs px-2.5">GET</Badge>
                    <code className="text-sm font-mono text-foreground/80">/functions/v1/stix2-export</code>
                  </div>
                  <CardDescription>Returns a full STIX 2.1 Bundle with threat actors, identities, incidents, relationships, reports, and notes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Query Parameters</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex gap-2"><code className="text-primary">case_id</code> <span className="text-foreground/60">— Filter to a specific case UUID</span></div>
                      <div className="flex gap-2"><code className="text-primary">include</code> <span className="text-foreground/60">— Comma-separated: <code>entities</code>, <code>events</code>, <code>relationships</code>, <code>violations</code>, <code>discrepancies</code>, <code>cases</code>, or <code>all</code> (default)</span></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">STIX Object Mapping</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/40"><Badge variant="outline" className="text-[10px]">threat-actor</Badge> Antagonist entities</div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/40"><Badge variant="outline" className="text-[10px]">identity</Badge> Protagonists, neutrals, officials</div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/40"><Badge variant="outline" className="text-[10px]">incident</Badge> Extracted timeline events</div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/40"><Badge variant="outline" className="text-[10px]">relationship</Badge> Entity connections</div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/40"><Badge variant="outline" className="text-[10px]">report</Badge> Case investigations</div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/40"><Badge variant="outline" className="text-[10px]">note</Badge> Violations &amp; discrepancies</div>
                    </div>
                  </div>
                  <CodeBlock code={`# Full STIX2 bundle (all cases)
curl "https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/stix2-export"

# Single case bundle
curl "https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/stix2-export?case_id=<UUID>"

# Only threat actors and relationships
curl "https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/stix2-export?include=entities,relationships"

# Import into OpenCTI via the Import API:
curl -X POST "https://your-opencti/graphql" \\
  -H "Authorization: Bearer YOUR_OPENCTI_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"query":"mutation { stixBundleImport(input: { bundle: \\"$(curl -s https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/stix2-export)\\"}) { id }}"}'`} />
                </CardContent>
              </Card>

              <Card className="bg-muted/30 border-border/30">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">OpenCTI Connector Setup</p>
                  <ol className="text-xs text-foreground/70 space-y-1 list-decimal list-inside">
                    <li>In OpenCTI, go to <strong>Data → Connectors → External Import</strong></li>
                    <li>Create a new connector using the <code>External Import - STIX Bundles</code> type</li>
                    <li>Set the import URL to the STIX2 endpoint above</li>
                    <li>Configure polling interval (e.g., every 6 hours)</li>
                    <li>All HRPM entities, incidents, and relationships will appear in your OpenCTI instance</li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Footer CTA */}
            <Card className="bg-primary/5 border-primary/20 mt-8">
              <CardContent className="p-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">Open-Source & Free Forever</p>
                <p className="text-foreground/60 text-sm mb-4">
                  This API is part of the HRPM open-source project. All data is public domain.
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://github.com/BackCheck/justice-unveiled" target="_blank" rel="noopener noreferrer">
                      <Code className="w-4 h-4 mr-2" /> View Source
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs"><BookOpen className="w-4 h-4 mr-2" /> Full Documentation</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/contact"><ArrowRight className="w-4 h-4 mr-2" /> Contact</Link>
                  </Button>
                </div>
                <p className="text-xs text-foreground/40 italic mt-4">Documenting injustice. Demanding accountability.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Api;
