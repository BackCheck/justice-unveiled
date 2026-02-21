import { useTranslation } from "react-i18next";
import { PlatformHeader } from "@/components/layout/PlatformHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, Shield, Network, FileText, BarChart3, Upload, Scale, Search,
  Brain, Eye, Clock, Users, Lock, Globe, Zap, Database, Code, AlertTriangle,
  CheckCircle, Target, Layers, MessageSquare, Printer, Share2, Map
} from "lucide-react";

const Section = ({ id, icon: Icon, title, children }: { id: string; icon: any; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-24">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    </div>
    <div className="space-y-4 text-foreground/80 leading-relaxed">{children}</div>
  </section>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="ml-2 mt-6">
    <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
    <div className="space-y-3 text-foreground/75">{children}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card className="bg-card/60 border-border/40 hover:border-primary/30 transition-colors">
    <CardContent className="p-5 flex gap-4">
      <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">{title}</p>
        <p className="text-sm text-foreground/65">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const tocItems = [
  { id: "overview", label: "Platform Overview" },
  { id: "architecture", label: "System Architecture" },
  { id: "cases", label: "Case Management" },
  { id: "timeline", label: "Timeline Engine" },
  { id: "dashboard", label: "Intel Dashboard" },
  { id: "network", label: "Entity Network" },
  { id: "evidence", label: "Evidence Management" },
  { id: "investigations", label: "Investigation Hub" },
  { id: "osint", label: "OSINT Toolkit" },
  { id: "legal", label: "Legal Intelligence" },
  { id: "compliance", label: "Compliance Auditing" },
  { id: "international", label: "International Rights" },
  { id: "harm", label: "Regulatory Harm" },
  { id: "documents", label: "Document Analysis" },
  { id: "sharing", label: "Sharing & Export" },
  { id: "feeds", label: "Data Feeds" },
  { id: "security", label: "Security & Access" },
  { id: "api", label: "API Reference" },
  { id: "faq", label: "FAQ" },
];

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      <PlatformHeader />

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Platform Documentation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            HRPM.org Documentation
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Complete guide to the Human Rights Protection Movement investigative intelligence platform — 
            from case management to AI-powered analysis.
          </p>
          <p className="text-sm text-foreground/40 mt-3">Version 2.0 · Last updated February 2026</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-10">
          {/* Sidebar TOC */}
          <nav className="hidden lg:block w-64 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">On this page</p>
            <div className="space-y-1">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-foreground/60 hover:text-primary py-1.5 px-3 rounded-md hover:bg-primary/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-16">

            {/* Overview */}
            <Section id="overview" icon={Globe} title="Platform Overview">
              <p>
                <strong>HRPM.org</strong> (Human Rights Protection Movement) is a non-profit, open-source investigative intelligence platform 
                designed to document institutional failures, map complex relationships between entities, and generate litigation-grade 
                intelligence for legal advocacy and human rights protection.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <FeatureCard icon={Brain} title="AI-Powered Analysis" description="Automatic document extraction, threat profiling, and pattern detection using advanced AI models." />
                <FeatureCard icon={Network} title="Entity Mapping" description="Interactive D3-powered network graphs revealing relationships between individuals, organizations, and institutions." />
                <FeatureCard icon={Scale} title="Legal Intelligence" description="Case law precedent library, statute browser, and appeal summary generator with source citations." />
                <FeatureCard icon={Shield} title="Evidence Management" description="Chain-of-custody tracking, multi-format uploads, and evidence-to-claim correlation matrices." />
              </div>
              <SubSection title="Core Mission">
                <p>
                  The platform is dedicated to transparency and accountability. It operates under the philosophy of 
                  <em>"Built in the Open"</em> — 100% open-source, no paywalls, and fully community-auditable. 
                  All data processed through HRPM is treated as public domain and open access.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Architecture */}
            <Section id="architecture" icon={Layers} title="System Architecture">
              <p>HRPM is a modern full-stack web application built with the following technology stack:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Frontend</CardTitle></CardHeader>
                  <CardContent className="text-sm text-foreground/65 space-y-1">
                    <p>React 18 + TypeScript</p>
                    <p>Vite build system</p>
                    <p>Tailwind CSS + shadcn/ui</p>
                    <p>D3.js for network visualizations</p>
                    <p>Recharts for analytics</p>
                    <p>Framer Motion for animations</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Backend</CardTitle></CardHeader>
                  <CardContent className="text-sm text-foreground/65 space-y-1">
                    <p>PostgreSQL database</p>
                    <p>Edge Functions (Deno)</p>
                    <p>Row-Level Security (RLS)</p>
                    <p>JWT authentication</p>
                    <p>Secure file storage</p>
                    <p>AI Gateway integration</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2"><CardTitle className="text-base">AI Services</CardTitle></CardHeader>
                  <CardContent className="text-sm text-foreground/65 space-y-1">
                    <p>Document analysis & extraction</p>
                    <p>Threat profiling</p>
                    <p>Pattern detection</p>
                    <p>Rights violation mapping</p>
                    <p>Report generation</p>
                    <p>Intel chat assistant</p>
                  </CardContent>
                </Card>
              </div>
              <SubSection title="Database Schema">
                <p>The platform manages 25+ interconnected tables organized into the following domains:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Case Management:</strong> cases, extracted_events, extracted_entities, extracted_discrepancies</li>
                  <li><strong>Evidence:</strong> evidence_uploads, claim_evidence_links, evidence_requirements</li>
                  <li><strong>Legal:</strong> legal_claims, legal_statutes, legal_doctrines, case_law_precedents</li>
                  <li><strong>Compliance:</strong> procedural_requirements, compliance_checks, compliance_violations</li>
                  <li><strong>Harm:</strong> regulatory_harm_incidents, financial_losses, financial_affidavits</li>
                  <li><strong>Content:</strong> blog_posts, news_articles, appeal_summaries</li>
                  <li><strong>OSINT:</strong> artifact_forensics, web_archives, osint_searches, dark_web_artifacts</li>
                  <li><strong>System:</strong> audit_logs, hidden_static_events, entity_aliases, entity_relationships</li>
                </ul>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Case Management */}
            <Section id="cases" icon={FileText} title="Case Management">
              <p>
                HRPM supports a multi-case architecture, enabling parallel investigations with full data isolation. 
                Each case acts as a container for events, entities, evidence, claims, and compliance data.
              </p>
              <SubSection title="Creating & Managing Cases">
                <p>
                  Navigate to <strong>/cases</strong> to view all active investigations. Each case includes a unique case number, 
                  severity level, status tracking (Active, Under Review, Closed), category classification, and geographic location.
                </p>
                <p>
                  Case profiles (<strong>/cases/:caseId</strong>) provide a comprehensive dashboard with tabbed sections for 
                  timeline reconstruction, entity networks, evidence correlation, compliance auditing, legal analysis, 
                  and regulatory harm assessment.
                </p>
              </SubSection>
              <SubSection title="Case Reports & Sharing">
                <p>
                  Each case supports professional PDF report generation with HRPM branding, including a cover page with 
                  security metadata, multi-section intelligence summaries, and compliance footers. Cases can also be shared 
                  on social media with branded banners containing key statistics.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Timeline */}
            <Section id="timeline" icon={Clock} title="Timeline Engine">
              <p>
                The chronological timeline is the backbone of every investigation. It renders events on an interactive, 
                scrollable interface with year markers, category filtering, and evidence linking.
              </p>
              <SubSection title="Features">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Filterable by category (Legal, Financial, Institutional, Personal, Political, Administrative)</li>
                  <li>Severity-based visual indicators</li>
                  <li>Direct evidence linking — each event can reference specific documents and exhibits</li>
                  <li>AI-extracted events marked with confidence scores</li>
                  <li>Year markers for temporal navigation</li>
                  <li>Search across event descriptions and individuals</li>
                  <li>Parallel timeline view for comparing official vs. actual sequences</li>
                </ul>
              </SubSection>
              <SubSection title="Event Details">
                <p>
                  Clicking any event opens a detailed view showing the full description, individuals involved, 
                  legal actions taken, outcomes, evidence discrepancies, and source references. Events can be 
                  approved/hidden by administrators.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Dashboard */}
            <Section id="dashboard" icon={BarChart3} title="Intel Dashboard">
              <p>
                The Intelligence Dashboard (<strong>/dashboard</strong>) provides a bird's-eye analytical view of the 
                current investigation with interactive charts, statistics, and quick navigation.
              </p>
              <SubSection title="Dashboard Widgets">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Stats Header:</strong> Key metrics — total events, entities, evidence items, and discrepancies</li>
                  <li><strong>Case Overview:</strong> Status indicators and severity assessment</li>
                  <li><strong>Key Findings Grid:</strong> Prioritized investigative insights</li>
                  <li><strong>Critical Alerts:</strong> High-priority items requiring attention</li>
                  <li><strong>Activity Feed:</strong> Recent changes and updates across the case</li>
                  <li><strong>Timeline Sparkline:</strong> Compact temporal distribution visualization</li>
                  <li><strong>Quick Navigation:</strong> One-click access to all investigation modules</li>
                </ul>
              </SubSection>
              <SubSection title="Entity Analytics">
                <p>
                  Advanced Recharts-based visualizations include entity type distribution (pie charts), 
                  role distribution analysis, connection radar charts, Sankey flow diagrams for influence mapping, 
                  and entity treemaps for proportional representation.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Network */}
            <Section id="network" icon={Network} title="Entity Network">
              <p>
                The Entity Relationship Network (<strong>/network</strong>) renders an interactive force-directed graph 
                using D3.js, visualizing connections between people, organizations, institutions, and other entities.
              </p>
              <SubSection title="Graph Features">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Force-directed layout with real-time physics simulation</li>
                  <li>Color-coded nodes by entity type (Person, Organization, Government, Legal, Financial)</li>
                  <li>Weighted edges showing relationship strength and influence direction</li>
                  <li>Entity search with highlight and focus</li>
                  <li>Zoom controls, minimap, and floating legend</li>
                  <li>Click-to-inspect node detail panels with alias management</li>
                  <li>Role tags and influence scoring</li>
                  <li>Context menus for quick entity actions</li>
                </ul>
              </SubSection>
              <SubSection title="Influence Analysis">
                <p>
                  The Influence Network Panel maps power structures and command hierarchies. It identifies 
                  high-influence nodes, bottlenecks, and isolated clusters that may indicate covert coordination.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Evidence */}
            <Section id="evidence" icon={Shield} title="Evidence Management">
              <p>
                The Evidence Matrix (<strong>/evidence</strong>) provides a structured repository for all case-related 
                documents, linking each piece of evidence to specific events, claims, and legal frameworks.
              </p>
              <SubSection title="Upload & Organization">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Multi-format support: PDF, DOCX, images, audio, and text files</li>
                  <li>Category classification (Court Filing, Correspondence, Financial Record, etc.)</li>
                  <li>Event linking — associate uploads with specific timeline events</li>
                  <li>File size tracking and storage path management</li>
                  <li>Secure cloud storage with access-controlled URLs</li>
                </ul>
              </SubSection>
              <SubSection title="Evidence Correlation">
                <p>
                  The Correlation module (<strong>/correlation</strong>) maps evidence items to legal claims through 
                  a hierarchical exhibit tree. Each claim can be linked to multiple evidence items with relevance 
                  scoring, exhibit numbering, and supporting notes. An unsupported claims alert highlights gaps 
                  in evidentiary support.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Investigations */}
            <Section id="investigations" icon={Target} title="Investigation Hub">
              <p>
                The Investigation Hub (<strong>/investigations</strong>) centralizes AI-powered investigative tools 
                in a three-column workspace with modular widgets.
              </p>
              <SubSection title="AI Tools">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FeatureCard icon={AlertTriangle} title="Threat Profiler" description="Analyze antagonist entities — motivations, resources, behavioral patterns, and vulnerability assessments." />
                  <FeatureCard icon={Search} title="Pattern Detector" description="Identify recurring patterns across temporal, financial, and network data using AI analysis." />
                  <FeatureCard icon={Eye} title="Risk Assessment" description="Generate risk matrices, probability scores, and mitigation recommendations for active threats." />
                  <FeatureCard icon={Network} title="Link Analysis" description="Discover hidden connections between entities through transitive relationship mapping." />
                  <FeatureCard icon={FileText} title="Report Generator" description="Synthesize investigative data into formatted, exportable markdown reports." />
                </div>
              </SubSection>
              <SubSection title="Workspace Widgets">
                <p>
                  The hub includes real-time stats grids, severity meters, category breakdowns, 
                  entity distribution charts, entity watchlists, recent extractions feeds, and 
                  quick action panels for streamlined workflow.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* OSINT Toolkit */}
            <Section id="osint" icon={Search} title="OSINT Intelligence Toolkit">
              <p>
                The OSINT Toolkit (<strong>/osint-toolkit</strong>) is a centralized hub for open-source intelligence 
                gathering, digital forensics, and investigative enrichment — enabling investigators to verify evidence 
                integrity, enrich entity profiles, and preserve critical web-based evidence.
              </p>
              <SubSection title="Modules">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FeatureCard icon={Shield} title="Forensics Lab" description="Client-side EXIF/metadata extraction, GPS coordinate parsing, SHA-256/MD5 file hashing for chain-of-custody verification." />
                  <FeatureCard icon={Users} title="Entity Enrichment" description="AI-powered intelligence dossiers, automated search pivot generation across Google, LinkedIn, court records, and corporate registries." />
                  <FeatureCard icon={Globe} title="Web Archiver" description="Preserve URLs via Firecrawl scraping and Wayback Machine integration with content hashing and tampering detection." />
                  <FeatureCard icon={AlertTriangle} title="Dark Web Analyzer" description="Process pre-collected artifacts to extract PII, cryptocurrency addresses, onion URLs, and threat intelligence using AI." />
                  <FeatureCard icon={MessageSquare} title="Comms Analyzer" description="Phone number validation with carrier identification and email header forensics for SPF/DKIM/DMARC spoofing detection." />
                </div>
              </SubSection>
              <SubSection title="Data Persistence">
                <p>
                  All OSINT findings are stored in dedicated database tables (<code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">artifact_forensics</code>, 
                  <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">web_archives</code>, <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">osint_searches</code>, 
                  <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">dark_web_artifacts</code>) and are integrated into the global search, entity network, and case profiles.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Legal Intelligence */}
            <Section id="legal" icon={Scale} title="Legal Intelligence">
              <p>
                The Legal Intelligence module (<strong>/legal-intelligence</strong>) provides a comprehensive 
                legal research toolkit integrated directly into each investigation.
              </p>
              <SubSection title="Components">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Case Law Panel:</strong> Searchable precedent library with citation tracking and landmark case flagging</li>
                  <li><strong>Statute Browser:</strong> Multi-framework legal reference (Pakistan Penal Code, Anti-Terrorism Act, UDHR, ICCPR)</li>
                  <li><strong>Doctrine Mapper:</strong> Map legal doctrines to case facts with supporting evidence links</li>
                  <li><strong>Legal Issues Panel:</strong> Track and resolve identified legal issues with severity classification</li>
                  <li><strong>Appeal Summary Generator:</strong> AI-powered generation of appeal briefs with source citations</li>
                  <li><strong>CiteCheck Indicators:</strong> Visual verification status for precedents (verified, unverified, disputed)</li>
                </ul>
              </SubSection>
              <SubSection title="Legal Research Portal">
                <p>
                  The standalone Legal Research page (<strong>/legal-research</strong>) offers a public-facing 
                  search interface for the full statute and precedent database, accessible without authentication.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Compliance */}
            <Section id="compliance" icon={CheckCircle} title="Compliance Auditing">
              <p>
                The Compliance module (<strong>/compliance</strong>) audits investigations against procedural 
                requirements defined by relevant legal frameworks.
              </p>
              <SubSection title="Features">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Procedural checklists mapped to legal section requirements</li>
                  <li>Status tracking: Compliant, Non-Compliant, Partial, Pending</li>
                  <li>AI-detected compliance flags with confidence scores</li>
                  <li>SOP comparison tables showing expected vs. actual actions</li>
                  <li>Violations panel with severity, legal consequences, and remediation status</li>
                  <li>Supporting evidence and event linking for each compliance check</li>
                </ul>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* International */}
            <Section id="international" icon={Globe} title="International Rights Analysis">
              <p>
                The International Rights module (<strong>/international</strong>) maps case events against 
                major international human rights instruments.
              </p>
              <SubSection title="Supported Frameworks">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Universal Declaration of Human Rights (UDHR)</li>
                  <li>International Covenant on Civil and Political Rights (ICCPR)</li>
                  <li>Convention Against Torture (CAT)</li>
                  <li>Convention on the Elimination of All Forms of Discrimination Against Women (CEDAW)</li>
                  <li>Local/national legal frameworks (Pakistan Penal Code, Anti-Terrorism Act, etc.)</li>
                </ul>
              </SubSection>
              <SubSection title="Analysis Features">
                <p>
                  The module provides incident-to-violation timelines, framework breakdown charts, 
                  severity statistics, and detailed violation tables cross-referencing specific 
                  articles and provisions.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Regulatory Harm */}
            <Section id="harm" icon={AlertTriangle} title="Regulatory Harm Assessment">
              <p>
                The Regulatory Harm module (<strong>/regulatory-harm</strong>) quantifies the impact of 
                institutional failures through structured incident tracking and financial loss documentation.
              </p>
              <SubSection title="Components">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Incident Tracking:</strong> Categorized harm incidents with severity, dates, institutions, and descriptions</li>
                  <li><strong>Financial Loss Registry:</strong> Itemized losses with categories, amounts, currencies, and documentation status</li>
                  <li><strong>Time Tracking:</strong> Hours spent on remediation activities with hourly rates and total cost calculations</li>
                  <li><strong>Affidavit Management:</strong> Upload and manage sworn financial affidavits linked to specific incidents</li>
                  <li><strong>Financial Summary:</strong> Aggregate dashboards showing total documented, estimated, and recurring losses</li>
                </ul>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Document Analysis */}
            <Section id="documents" icon={Brain} title="Document Analysis (AI)">
              <p>
                The Document Analyzer (<strong>/analyze</strong>) uses AI to automatically extract structured 
                intelligence from uploaded documents.
              </p>
              <SubSection title="Extraction Capabilities">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Timeline events with dates, descriptions, and involved individuals</li>
                  <li>Named entities with types, roles, and organizational affiliations</li>
                  <li>Evidence discrepancies and contradictions</li>
                  <li>Legal references and statutory citations</li>
                  <li>Harm incidents and financial impacts</li>
                </ul>
              </SubSection>
              <SubSection title="Batch Processing">
                <p>
                  The Batch Document Uploader supports multiple files simultaneously, with automatic 
                  content truncation (200K character limit) to prevent memory overflow. Supported formats 
                  include PDF, DOCX, TXT, and pasted text content.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Sharing & Export */}
            <Section id="sharing" icon={Share2} title="Sharing & Export">
              <p>
                HRPM provides multiple ways to share and export investigation data.
              </p>
              <SubSection title="Features">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>PDF Reports:</strong> Professional branded reports with cover pages, section summaries, and compliance footers</li>
                  <li><strong>Social Sharing:</strong> Share branded case cards on Twitter, LinkedIn, Facebook, and WhatsApp with key statistics</li>
                  <li><strong>Timeline Export:</strong> Print-optimized timeline layouts for legal submissions</li>
                  <li><strong>Page Sharing:</strong> Shareable links with Open Graph metadata for rich previews</li>
                </ul>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Data Feeds */}
            <Section id="feeds" icon={Globe} title="Data Feeds & Syndication">
              <p>
                HRPM provides machine-readable data feeds in multiple formats, enabling external systems, 
                researchers, and AI agents to subscribe to and consume investigation data automatically.
              </p>
              <SubSection title="Feed Formats">
                <p>All feeds are available in three formats by appending <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">format=rss</code>, <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">format=atom</code>, or <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs">format=json</code> to the feed URL:</p>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/30 text-left">
                        <th className="py-2 pr-4 font-semibold text-foreground">Format</th>
                        <th className="py-2 pr-4 font-semibold text-foreground">Content-Type</th>
                        <th className="py-2 font-semibold text-foreground">Spec</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/60">
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">rss</td><td className="py-2 pr-4 text-xs">application/rss+xml</td><td className="py-2 text-xs">RSS 2.0 with Dublin Core</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">atom</td><td className="py-2 pr-4 text-xs">application/atom+xml</td><td className="py-2 text-xs">Atom 1.0 (RFC 4287)</td></tr>
                      <tr><td className="py-2 pr-4 font-mono text-xs">json</td><td className="py-2 pr-4 text-xs">application/feed+json</td><td className="py-2 text-xs">JSON Feed 1.1</td></tr>
                    </tbody>
                  </table>
                </div>
              </SubSection>
              <SubSection title="Available Feed Types">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Master Feed</strong> (<code className="bg-muted/60 px-1 rounded text-xs">?type=all</code>) — All updates: cases, blog reports, and timeline events combined</li>
                  <li><strong>Cases Feed</strong> (<code className="bg-muted/60 px-1 rounded text-xs">?type=cases</code>) — Active investigation case files</li>
                  <li><strong>Blog Feed</strong> (<code className="bg-muted/60 px-1 rounded text-xs">?type=blog</code>) — AI-generated and editorial investigative reports</li>
                  <li><strong>Events Feed</strong> (<code className="bg-muted/60 px-1 rounded text-xs">?type=events</code>) — Extracted timeline events from investigations</li>
                  <li><strong>Case-Specific</strong> (<code className="bg-muted/60 px-1 rounded text-xs">?caseId=UUID</code>) — Events, entities, and evidence for a single case</li>
                </ul>
              </SubSection>
              <SubSection title="AI Agent Access">
                <p>
                  HRPM publishes <code className="bg-muted/60 px-1 rounded text-xs">llms.txt</code> and <code className="bg-muted/60 px-1 rounded text-xs">.well-known/ai-plugin.json</code> for 
                  AI agent discovery. All crawlers (GPTBot, Claude-Web, PerplexityBot, etc.) are explicitly allowed in <code className="bg-muted/60 px-1 rounded text-xs">robots.txt</code>. 
                  Feed autodiscovery <code className="bg-muted/60 px-1 rounded text-xs">&lt;link&gt;</code> tags are included in the HTML head for RSS, Atom, and JSON Feed formats.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* Security */}
            <Section id="security" icon={Lock} title="Security & Access Control">
              <p>
                HRPM implements multi-layered security to protect sensitive investigative data.
              </p>
              <SubSection title="Security Measures">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Row-Level Security (RLS):</strong> All database tables enforce RLS policies ensuring data isolation</li>
                  <li><strong>JWT Authentication:</strong> Stateless, token-based authentication for all API requests</li>
                  <li><strong>Role-Based Access:</strong> Three-tier system — Admin, Analyst, and Viewer roles</li>
                  <li><strong>Audit Logging:</strong> Complete audit trail of all data modifications with user identity, timestamps, and IP addresses</li>
                  <li><strong>Verified Precedents:</strong> Legal precedents require administrator verification before citation</li>
                  <li><strong>Secure Storage:</strong> Evidence files stored in access-controlled cloud buckets</li>
                </ul>
              </SubSection>
              <SubSection title="Public Access">
                <p>
                  All case data on HRPM is classified as public domain and open access. The platform is designed 
                  for transparency — authentication controls manage edit permissions, not viewing access.
                </p>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* API */}
            <Section id="api" icon={Code} title="API Reference">
              <p>
                HRPM exposes backend functionality through Edge Functions accessible via RESTful endpoints. 
                Visit the <a href="/api" className="text-primary hover:underline">API Developer Portal</a> for 
                interactive documentation.
              </p>
              <SubSection title="Available Endpoints">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-left">
                        <th className="py-2 pr-4 font-semibold text-foreground">Function</th>
                        <th className="py-2 pr-4 font-semibold text-foreground">Method</th>
                        <th className="py-2 font-semibold text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/65">
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">analyze-document</td><td className="py-2 pr-4">POST</td><td className="py-2">Extract intelligence from documents using AI</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">intel-chat</td><td className="py-2 pr-4">POST</td><td className="py-2">Conversational AI for investigation queries</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">threat-profiler</td><td className="py-2 pr-4">POST</td><td className="py-2">Generate threat profiles for entities</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">pattern-detector</td><td className="py-2 pr-4">POST</td><td className="py-2">Detect patterns across investigation data</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">generate-report</td><td className="py-2 pr-4">POST</td><td className="py-2">Generate formatted investigation reports</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">analyze-rights-violations</td><td className="py-2 pr-4">POST</td><td className="py-2">Map events to international rights frameworks</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">fetch-legal-precedents</td><td className="py-2 pr-4">POST</td><td className="py-2">Search external case law databases</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">generate-appeal-summary</td><td className="py-2 pr-4">POST</td><td className="py-2">Generate appeal briefs with citations</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">osint-enrich-entity</td><td className="py-2 pr-4">POST</td><td className="py-2">AI-powered entity enrichment and dossier generation</td></tr>
                      <tr className="border-b border-border/20"><td className="py-2 pr-4 font-mono text-xs">analyze-dark-web-artifact</td><td className="py-2 pr-4">POST</td><td className="py-2">Analyze dark web artifacts for threat intelligence</td></tr>
                      <tr><td className="py-2 pr-4 font-mono text-xs">fetch-news</td><td className="py-2 pr-4">POST</td><td className="py-2">Retrieve relevant news articles</td></tr>
                    </tbody>
                  </table>
                </div>
              </SubSection>
            </Section>

            <Separator className="border-border/30" />

            {/* FAQ */}
            <Section id="faq" icon={MessageSquare} title="Frequently Asked Questions">
              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-foreground mb-1">Is the platform free to use?</p>
                  <p className="text-sm">Yes. HRPM is 100% open-source and non-profit. There are no paywalls, subscriptions, or hidden costs. The entire codebase is available on GitHub.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Who can access investigation data?</p>
                  <p className="text-sm">All case data is public domain and open access. Authentication is used to manage editing permissions, not to restrict viewing. Anyone can browse investigations without an account.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">How does the AI document analysis work?</p>
                  <p className="text-sm">Upload documents (PDF, DOCX, TXT) and the system uses AI to extract timeline events, named entities, discrepancies, and legal references. Extracted data is stored in the database and appears across all investigation modules.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Can I contribute to the project?</p>
                  <p className="text-sm">Absolutely. Visit the <a href="https://github.com/BackCheck/justice-unveiled" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub repository</a> to review the codebase, submit issues, or contribute pull requests.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">What languages are supported?</p>
                  <p className="text-sm">The platform supports English, Arabic (العربية), Urdu (اردو), and Chinese (中文) through the language switcher in the header.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">How do I report a security issue?</p>
                  <p className="text-sm">Email <a href="mailto:info@hrpm.org" className="text-primary hover:underline">info@hrpm.org</a> with details. Security disclosures are handled under a responsible disclosure policy.</p>
                </div>
              </div>
            </Section>

            {/* Footer banner */}
            <Card className="bg-primary/5 border-primary/20 mt-12">
              <CardContent className="p-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">Need more help?</p>
                <p className="text-foreground/60 text-sm mb-4">
                  Visit the <a href="/api" className="text-primary hover:underline">API Portal</a>, 
                  read the <a href="/how-to-use" className="text-primary hover:underline">How to Use guide</a>, 
                  or <a href="/contact" className="text-primary hover:underline">contact us</a> directly.
                </p>
                <p className="text-xs text-foreground/40 italic">Documenting injustice. Demanding accountability.</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default Documentation;
