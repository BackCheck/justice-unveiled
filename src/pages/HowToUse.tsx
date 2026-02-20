import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Network,
  FileText,
  BarChart3,
  Scale,
  Upload,
  Brain,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  FolderOpen,
  Shield,
  Clock,
  Users,
  Target,
  Layers,
  Globe,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Browse Existing Cases",
    description:
      "Start by exploring documented cases in our open-access Case Files directory. Each case contains a full investigative timeline, entity network, evidence matrix, and legal analysis that you can study as a reference.",
    icon: FolderOpen,
    link: "/cases",
    linkLabel: "View Case Files",
  },
  {
    number: "02",
    title: "Study the Timeline Pattern",
    description:
      "Examine how events are organized chronologically with categories like Business Interference, Harassment, Legal Proceedings, and Criminal Allegations. Notice how each event links to sources, individuals, and evidence discrepancies.",
    icon: Clock,
    link: "/timeline",
    linkLabel: "Explore Timeline",
  },
  {
    number: "03",
    title: "Map Your Entity Network",
    description:
      "Use the Entity Network tool to map relationships between people, organizations, and institutions involved in your case. Track who influenced whom, when, and through what channels—exposing hidden power structures.",
    icon: Network,
    link: "/network",
    linkLabel: "Open Network Graph",
  },
  {
    number: "04",
    title: "Upload & Analyze Evidence",
    description:
      "Upload your documents—legal filings, communications, financial records—and let the AI Document Analyzer extract events, entities, and procedural discrepancies automatically. All extracted intelligence feeds into your timeline and network.",
    icon: Upload,
    link: "/analyze",
    linkLabel: "AI Analyzer",
  },
  {
    number: "05",
    title: "Cross-Reference with Evidence Matrix",
    description:
      "Use the Evidence Matrix to map every claim against supporting documents. The system identifies gaps in documentation, unsupported allegations, and contradictions—strengthening your legal position.",
    icon: FileText,
    link: "/evidence",
    linkLabel: "Evidence Matrix",
  },
  {
    number: "06",
    title: "Run Legal & Compliance Audits",
    description:
      "Audit your case against local statutes and international human rights frameworks (UDHR, ICCPR, CAT). The platform flags procedural violations and maps incidents to specific legal breaches with severity ratings.",
    icon: Scale,
    link: "/international",
    linkLabel: "Rights Audit",
  },
  {
    number: "07",
    title: "Use the OSINT Intelligence Toolkit",
    description:
      "Leverage the OSINT toolkit for digital forensics — extract EXIF metadata from images, compute file hashes for chain-of-custody, enrich entity profiles with AI-powered dossiers, archive web evidence before it disappears, and analyze dark web artifacts for threat intelligence.",
    icon: Search,
    link: "/osint-toolkit",
    linkLabel: "OSINT Toolkit",
  },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Extraction",
    description:
      "Upload any document and the AI extracts events, entities, relationships, and discrepancies automatically—no manual data entry needed.",
  },
  {
    icon: Target,
    title: "Claim–Evidence Correlation",
    description:
      "Map every legal allegation against physical evidence to expose manufactured cases and identify documentation gaps.",
  },
  {
    icon: Users,
    title: "Power Network Mapping",
    description:
      "Visualize who influenced whom through directional influence scoring, alias tracking, and organizational affiliation mapping.",
  },
  {
    icon: Layers,
    title: "Multi-Framework Compliance",
    description:
      "Audit cases against both local laws (CrPC, PECA) and international frameworks (UN UDHR, ICCPR, CAT, ECHR) simultaneously.",
  },
  {
    icon: Shield,
    title: "Procedural Failure Detection",
    description:
      "Automatically identify statutory violations—missed deadlines, improper procedures, and legal nullities—with severity-coded alerts.",
  },
  {
    icon: Globe,
    title: "Open Source & Free",
    description:
      "Every tool is 100% open-source and free. No paywalls, no corporate influence. Built by the community, for the community.",
  },
];

const useCases = [
  "Documenting systemic harassment or abuse patterns",
  "Building evidence timelines for legal proceedings",
  "Mapping corruption networks and institutional failures",
  "Auditing law enforcement procedural compliance",
  "Preparing human rights complaints for international bodies",
  "Tracking financial harm from regulatory overreach",
  "Identifying contradictions across official records",
  "Supporting journalists investigating institutional abuse",
];

const HowToUse = () => {
  return (
    <PlatformLayout>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <BookOpen className="w-3.5 h-3.5" />
            Platform Guide
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            How to Use HRPM
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Learn how to leverage our <strong className="text-foreground">open-source, non-profit</strong> platform
            to document, analyze, and build your own human rights case using existing data and AI-powered tools.
          </p>
        </section>

        {/* Who is this for */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Who Is This For?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {useCases.map((uc) => (
              <div key={uc} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{uc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-step */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Step-by-Step Guide</h2>
            <p className="text-muted-foreground">Follow these steps to map out your own case using the platform.</p>
          </div>

          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="flex flex-col md:flex-row gap-6 p-6">
                    <div className="flex items-start gap-4 md:w-16 shrink-0">
                      <span className="text-3xl font-bold text-primary/30">{step.number}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      <Link to={step.link}>
                        <Button variant="outline" size="sm" className="gap-1.5 mt-1">
                          {step.linkLabel}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Platform capabilities */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Platform Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="border-border/50 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                      {f.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Tip */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex gap-4 p-6">
            <Lightbulb className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Pro Tip: Start with What You Have</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You don't need a complete case to begin. Upload even a single document—a court order, an FIR, a letter—and
                the AI will extract a starting point. Build your timeline incrementally as you gather more evidence. The
                platform is designed to grow with your investigation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <section className="text-center space-y-4 pb-8">
          <h2 className="text-2xl font-semibold text-foreground">Ready to Begin?</h2>
          <p className="text-muted-foreground">Explore existing cases or start documenting your own.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/cases">
              <Button size="lg" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Browse Cases
              </Button>
            </Link>
            <Link to="/analyze">
              <Button size="lg" variant="outline" className="gap-2">
                <Brain className="w-4 h-4" />
                Upload a Document
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PlatformLayout>
  );
};

export default HowToUse;
