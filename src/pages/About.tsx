import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Scale, 
  Shield, 
  Users, 
  FileText, 
  Heart,
  Globe,
  Target,
  CheckCircle,
  Github,
  Code2,
  Brain,
  Network,
  Search,
  Languages,
  BarChart3,
  Lock,
  Workflow,
  FileSearch,
  Mail,
  Phone,
  MapPin,
  Eye,
  BookOpen,
  Gavel,
  FileCheck,
  AlertTriangle,
  Lightbulb,
  ShieldCheck
} from "lucide-react";
import { SocialShareButtons } from "@/components/sharing";
import { useSEO } from "@/hooks/useSEO";
import { InteractiveGlobe } from "@/components/ui/interactive-globe";
import { Separator } from "@/components/ui/separator";

const About = () => {
  useSEO({
    title: "About HRPM",
    description: "Human Rights Protection & Monitoring - An independent public-interest documentation and monitoring platform dedicated to recording, analyzing, and tracking human rights violations.",
    type: "website",
  });

  const values = [
    {
      icon: Scale,
      title: "Justice",
      description: "We believe every person deserves fair treatment under the law, regardless of their resources or status."
    },
    {
      icon: Shield,
      title: "Protection",
      description: "Safeguarding fundamental human rights through documentation, advocacy, and public awareness."
    },
    {
      icon: FileText,
      title: "Transparency",
      description: "Building comprehensive evidence repositories that bring procedural failures to light."
    },
    {
      icon: Users,
      title: "Solidarity",
      description: "Standing with individuals and families facing institutional abuse and systemic injustice."
    }
  ];

  const platformFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Document Analysis",
      description: "Upload legal documents, police reports, court filings, and testimonies. Our AI extracts events, entities, discrepancies, and timelines automatically—turning unstructured documents into structured, searchable intelligence."
    },
    {
      icon: Network,
      title: "Entity Relationship Network",
      description: "Visualize how individuals, organizations, and institutions are connected across a case. Identify hidden influence patterns, power structures, and co-occurrence networks through interactive force-directed graphs."
    },
    {
      icon: Workflow,
      title: "Interactive Case Timelines",
      description: "Reconstruct the full sequence of events with parallel timelines, contradiction detection, and delay alerts. Filter by category, severity, and source to see exactly how a case unfolded over time."
    },
    {
      icon: FileSearch,
      title: "Evidence Matrix & Artifacts Scanner",
      description: "Cross-reference every piece of evidence with events and claims. Our OSINT toolkit automatically extracts phone numbers, email addresses, IP addresses, document hashes, and communication metadata from all uploaded files."
    },
    {
      icon: Scale,
      title: "Legal Intelligence & Case Law",
      description: "Map constitutional violations, statutory breaches, and procedural failures to verified legal precedents. Generate court-safe appeal summaries and legal memos with full citation trails."
    },
    {
      icon: BarChart3,
      title: "Compliance & Rights Auditing",
      description: "Audit cases against international human rights frameworks (ICCPR, ECHR, UDHR) and local procedural requirements. Track compliance status, identify violations, and generate regulatory harm assessments."
    },
    {
      icon: Search,
      title: "OSINT & Digital Forensics",
      description: "Phone number intelligence, communication analysis, entity enrichment, web archiving, and dark web artifact analysis. Every finding links back to its source document for complete chain-of-custody."
    },
    {
      icon: Lock,
      title: "Threat Profiling & Pattern Detection",
      description: "AI-driven behavioral analysis, risk assessment, and pattern detection across entities and events. Generate comprehensive threat profile reports with counter-strategies and evidence gap analysis."
    },
  ];

  const whatWeDoItems = [
    { icon: FileText, text: "Chronological event timelines" },
    { icon: BarChart3, text: "Evidence strength analysis" },
    { icon: ShieldCheck, text: "Compliance framework mapping" },
    { icon: Gavel, text: "Legal and procedural review" },
    { icon: Network, text: "Entity network relationships" },
    { icon: BookOpen, text: "Intelligence briefings" },
  ];

  const purposeItems = [
    "Document patterns of abuse",
    "Track procedural failures",
    "Analyze institutional conduct",
    "Map networks of responsibility",
    "Preserve evidentiary records",
  ];

  const sourceDocumentation = [
    "Court judgments and petitions",
    "Regulatory filings",
    "Official correspondence",
    "Public records",
    "Verified witness statements",
    "Open-source intelligence (OSINT)",
  ];

  const whoWeServe = [
    "Journalists",
    "Legal professionals",
    "Human rights advocates",
    "Researchers",
    "Policy analysts",
    "Compliance officers",
    "Concerned citizens",
  ];

  return (
    <PlatformLayout>
      <div className="min-h-screen">
        {/* Globe Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background to-muted/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left content */}
              <div className="space-y-6 z-10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Independent Documentation Platform
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                      About <span className="text-primary">HRPM</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium mt-2">
                      Human Rights Protection & Monitoring
                    </p>
                  </div>
                  <SocialShareButtons
                    title="About HRPM - Human Rights Protection & Monitoring"
                    description="An independent public-interest documentation and monitoring platform."
                    hashtags={["HumanRights", "HRPM", "Justice"]}
                    variant="compact"
                  />
                </div>

                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  <strong className="text-foreground">Documenting injustice. Demanding accountability.</strong>
                </p>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  HRPM is an independent public-interest documentation and monitoring platform dedicated to recording, analyzing, and tracking human rights violations, procedural irregularities, and institutional misconduct.
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {[
                    "Human rights documentation",
                    "Legal compliance monitoring",
                    "Open-source intelligence",
                    "Digital evidence analysis",
                    "Entity network mapping",
                  ].map((item) => (
                    <span key={item} className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                      {item}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground italic">
                  Our mission is to transform fragmented evidence into structured, accessible, and transparent intelligence for public accountability.
                </p>
              </div>

              {/* Right — Globe */}
              <div className="relative flex items-center justify-center">
                <InteractiveGlobe
                  size={500}
                  className="max-w-full h-auto"
                  markers={[
                    { lat: 1.35, lng: 103.82, label: "Singapore HQ" },
                    { lat: 24.86, lng: 67.01, label: "Karachi" },
                    { lat: 33.69, lng: 73.04, label: "Islamabad" },
                    { lat: 46.23, lng: 6.14, label: "Geneva" },
                    { lat: 40.71, lng: -74.01, label: "New York" },
                    { lat: 51.51, lng: -0.13, label: "London" },
                    { lat: 48.86, lng: 2.35, label: "Paris" },
                    { lat: 28.61, lng: 77.21, label: "Delhi" },
                  ]}
                  connections={[
                    { from: [1.35, 103.82], to: [24.86, 67.01] },
                    { from: [1.35, 103.82], to: [46.23, 6.14] },
                    { from: [1.35, 103.82], to: [40.71, -74.01] },
                    { from: [24.86, 67.01], to: [33.69, 73.04] },
                    { from: [46.23, 6.14], to: [51.51, -0.13] },
                    { from: [40.71, -74.01], to: [48.86, 2.35] },
                    { from: [51.51, -0.13], to: [28.61, 77.21] },
                    { from: [24.86, 67.01], to: [28.61, 77.21] },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Purpose */}
        <section className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">Our Purpose</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Why HRPM Exists
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Across jurisdictions, rights violations often remain hidden behind procedural opacity, regulatory complexity, or institutional power.
                </p>
                <div className="space-y-3 mb-6">
                  {purposeItems.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    We do not function as a political movement or advocacy campaign. We function as a <strong className="text-foreground">documentation and intelligence platform grounded in evidence.</strong>
                  </p>
                </div>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileCheck className="w-5 h-5 text-primary" />
                    What We Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {whatWeDoItems.map((item) => (
                    <div key={item.text} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{item.text}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2">
                    Each case profile consolidates court filings, witness statements, regulatory records, and open-source material into a coherent analytical framework.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Our Methodology</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                HRPM relies on multi-layered documentation standards to ensure accuracy and integrity.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Source-Based Documentation */}
              <Card className="border-border">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">1. Source-Based Documentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {sourceDocumentation.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Analytical Framework */}
              <Card className="border-border">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Gavel className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">2. Analytical Framework</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Cases are analyzed under:</p>
                  <div className="space-y-1">
                    <p>• Local statutory law</p>
                    <p>• Constitutional provisions</p>
                    <p>• International human rights instruments</p>
                    <p>• Regional rights frameworks</p>
                  </div>
                  <Separator className="my-3" />
                  <p className="text-xs">
                    We separate <strong className="text-foreground">established facts</strong>, <strong className="text-foreground">allegations</strong>, and <strong className="text-foreground">analytical conclusions</strong>. This distinction is critical to maintaining integrity.
                  </p>
                </CardContent>
              </Card>

              {/* AI-Assisted Review */}
              <Card className="border-border">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">3. AI-Assisted Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Where appropriate, AI tools are used to:</p>
                  <div className="space-y-1">
                    <p>• Structure large datasets</p>
                    <p>• Identify procedural inconsistencies</p>
                    <p>• Detect entity relationships</p>
                    <p>• Assist in drafting analytical summaries</p>
                  </div>
                  <Separator className="my-3" />
                  <p className="text-xs">
                    All AI-assisted outputs are <strong className="text-foreground">reviewed and validated</strong> before publication.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Platform Capabilities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                HRPM is a full-stack investigative intelligence platform built to transform raw evidence into litigation-grade case files.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {platformFeatures.map((feature) => (
                <Card key={feature.title} className="border-border hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Independence & Neutrality */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">Independence & Neutrality</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Our Only Mandate Is Evidence
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  HRPM operates independently of political parties, government institutions, and corporate sponsors. We do not accept instructions to suppress or manipulate findings.
                </p>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gavel className="w-5 h-5 text-primary" />
                    Legal Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>HRPM operates under principles of freedom of expression and public-interest reporting. We do not:</p>
                  <p>• Declare criminal guilt where courts have not</p>
                  <p>• Offer legal advice</p>
                  <p>• Replace judicial institutions</p>
                  <Separator className="my-3" />
                  <p className="text-xs">We document, analyze, and preserve evidence within lawful boundaries.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Corrections & Transparency */}
        <section className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">Corrections & Transparency</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Transparency Is Foundational
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We recognize that documentation is a dynamic process. If any party believes information published on HRPM is materially inaccurate, they may submit:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-foreground">Verifiable documentary evidence</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-foreground">Clarifying legal references</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-foreground">Formal written requests</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Corrections will be reviewed in good faith and updated where warranted.
                </p>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    Who We Serve
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {whoWeServe.map((item) => (
                    <div key={item} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2">
                    Our goal is to make structured intelligence accessible without compromising integrity.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Multilingual Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">Multilingual Access</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Justice Without Language Barriers
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Human rights violations do not respect borders or languages. HRPM is built from the ground up to serve a global audience with full multilingual support across the entire platform.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every navigation element, dashboard widget, investigative tool, and content page is fully translated and culturally adapted. RTL (Right-to-Left) layout rendering is natively supported for Arabic and Urdu.
                </p>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-primary" />
                    Supported Languages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium text-foreground">English</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">LTR</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium text-foreground font-arabic">اردو — Urdu</span>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">RTL</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium text-foreground font-arabic">العربية — Arabic</span>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">RTL</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium text-foreground">中文 — Chinese</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">LTR</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide our work and define our commitment to human rights.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <Card key={value.title} className="border-border hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="py-16 bg-primary/5 border-b border-border">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Our Vision</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              A World Where Accountability Is Data-Driven
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              {[
                "Institutional misconduct cannot hide behind procedural opacity",
                "Rights violations are systematically recorded",
                "Evidence is preserved before it disappears",
                "Accountability is data-driven, not anecdotal",
              ].map((item) => (
                <div key={item} className="p-4 rounded-lg bg-card border border-border text-sm text-foreground">
                  {item}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Technology should strengthen transparency — not weaken it. HRPM is built to do exactly that.
            </p>
          </div>
        </section>

        {/* Thanvi Investigation Section */}
        <section className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Case File #001: The Thanvi Investigation
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Our inaugural investigation documents a multi-year pattern of harassment, business 
                interference, and legal abuse targeting Danish Thanvi and his family in Pakistan. 
                Built from 123+ primary sources, this case file demonstrates how institutional failures 
                can devastate lives—and why transparency matters.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">How HRPM Is Helping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• <strong className="text-foreground">Reconstructing the timeline</strong> — AI-extracted events from court filings, police reports, and correspondence reveal a clear pattern of escalation and procedural failures spanning multiple years.</p>
                  <p>• <strong className="text-foreground">Mapping the network</strong> — Entity relationship analysis exposes how individuals, institutions, and legal actors are interconnected, revealing influence structures and conflicts of interest.</p>
                  <p>• <strong className="text-foreground">Auditing compliance</strong> — Every procedural step is checked against Pakistani legal requirements and international human rights standards (ECHR, ICCPR).</p>
                  <p>• <strong className="text-foreground">Preserving evidence</strong> — All documents are hashed, metadata-extracted, and stored with full chain-of-custody records.</p>
                  <p>• <strong className="text-foreground">Generating legal intelligence</strong> — The platform maps violations to relevant case law precedents and statutes, producing court-ready appeal summaries.</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Case at a Glance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span>Primary Sources</span>
                    <span className="font-semibold text-foreground">123+</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span>Location</span>
                    <span className="font-semibold text-foreground">Pakistan</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span>Categories</span>
                    <span className="font-semibold text-foreground">Harassment, Legal Abuse, Business Interference</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span>Status</span>
                    <span className="font-semibold text-foreground">Active Investigation</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span>Timespan</span>
                    <span className="font-semibold text-foreground">Multi-year</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Open Source Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">Open Source</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Built in the Open
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Transparency is not just a value we advocate for—it's how we build. Our entire platform is 
                  open-source, allowing anyone to inspect, audit, and contribute to the codebase.
                </p>
                <a 
                  href="https://github.com/BackCheck/justice-unveiled" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View Source on GitHub
                </a>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    Our Commitments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• 100% open-source codebase under public license</p>
                  <p>• No paywalls on public interest data</p>
                  <p>• Community-driven development and governance</p>
                  <p>• Independent from corporate or political influence</p>
                  <p>• Non-profit — all resources directed to the mission</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Contact</h2>
            </div>
            <Card className="border-border max-w-lg mx-auto">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center mb-4">
                  <p className="font-semibold text-foreground">Human Rights Protection & Monitoring (HRPM.org)</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">36 Robinson Road, #20-01 City House, Singapore 068877</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href="mailto:info@hrpm.org" className="text-sm text-primary hover:underline">info@hrpm.org</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href="tel:+6531290390" className="text-sm text-muted-foreground hover:text-primary">+65 31 290 390</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Privacy Policy Section */}
        <section id="privacy" className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Privacy Policy</h2>
            <div className="prose prose-sm text-muted-foreground max-w-none space-y-4">
              <p>HRPM is committed to protecting user privacy. We collect minimal data necessary to operate the platform.</p>
              <p><strong className="text-foreground">Data Collection:</strong> We do not track visitors with third-party analytics. Authentication data is stored securely and never shared. Evidence uploads are stored with encryption at rest.</p>
              <p><strong className="text-foreground">Cookies:</strong> We use only essential cookies for authentication and session management. No advertising or tracking cookies are used.</p>
              <p><strong className="text-foreground">Data Retention:</strong> Case data and evidence are retained as long as needed for the investigation. Users may request deletion of their account and personal data at any time by contacting us.</p>
              <p><strong className="text-foreground">Open Source:</strong> Our entire codebase is publicly auditable, so you can verify exactly how your data is handled.</p>
            </div>
          </div>
        </section>

        {/* Terms of Service Section */}
        <section id="terms" className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Terms of Service</h2>
            <div className="prose prose-sm text-muted-foreground max-w-none space-y-4">
              <p>By using HRPM, you agree to the following terms:</p>
              <p><strong className="text-foreground">Purpose:</strong> This platform is designed for documenting human rights cases, legal research, and public interest advocacy. It must not be used for harassment, doxxing, or any unlawful purpose.</p>
              <p><strong className="text-foreground">Accuracy:</strong> Users are responsible for the accuracy of information they upload. AI-generated analysis should be verified by qualified professionals before use in legal proceedings.</p>
              <p><strong className="text-foreground">No Legal Advice:</strong> HRPM does not provide legal advice. Content on this platform is for informational and research purposes only.</p>
              <p><strong className="text-foreground">Intellectual Property:</strong> The platform code is open-source. Case data contributed to public investigations is made available under open-access principles.</p>
              <p><strong className="text-foreground">Limitation of Liability:</strong> HRPM is provided "as is" without warranty. We are not liable for decisions made based on information presented on this platform.</p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="py-12 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              HRPM is an independent, open-source initiative. We do not provide legal advice. 
              All case documentation is based on primary sources and is presented for 
              public interest, research, and advocacy purposes.
            </p>
          </div>
        </section>
      </div>
    </PlatformLayout>
  );
};

export default About;
