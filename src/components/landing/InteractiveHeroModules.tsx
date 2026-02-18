import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Network, 
  Scale, 
  Clock, 
  Shield, 
  FileText, 
  Globe, 
  Target, 
  ArrowRight,
  Sparkles,
  BarChart3,
  Eye,
  Gavel,
  GitBranch,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import { cn } from "@/lib/utils";
import { usePlatformStats } from "@/hooks/usePlatformStats";

interface Module {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  link: string;
  badge: string;
  color: string;
  preview: string[];
}

const modules: Module[] = [
  {
    id: "timeline",
    icon: Clock,
    title: "Interactive Timeline",
    description: "Navigate chronological events with filters, evidence links, and year-by-year reconstruction of documented incidents.",
    link: "/timeline",
    badge: "Core",
    color: "primary",
    preview: ["Chronological event mapping", "Category & source filtering", "Evidence-linked entries", "Year markers with summaries"],
  },
  {
    id: "network",
    icon: Network,
    title: "Entity Network",
    description: "Force-directed graph visualization with community detection, centrality analysis, and shortest-path finding between entities.",
    link: "/network",
    badge: "Interactive",
    color: "chart-4",
    preview: ["Community detection", "Centrality scoring", "Path analysis (BFS)", "Timeline-filtered graph"],
  },
  {
    id: "ai",
    icon: Brain,
    title: "AI Document Analyzer",
    description: "Upload raw documents and let AI extract events, entities, and discrepancies automatically with confidence scoring.",
    link: "/analyze",
    badge: "AI-Powered",
    color: "chart-2",
    preview: ["Batch document upload", "Event extraction", "Entity recognition", "Discrepancy detection"],
  },
  {
    id: "legal",
    icon: Gavel,
    title: "Legal Intelligence",
    description: "Case law precedents, statute browser, doctrine mapper, and AI-generated appeal summaries with cite-check verification.",
    link: "/legal-intelligence",
    badge: "Court-Ready",
    color: "chart-3",
    preview: ["Verified precedents", "Statute browser", "Doctrine mapping", "Appeal summaries"],
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Compliance Checker",
    description: "Automated verification of procedural requirements against legal frameworks with violation flagging and SOP comparison.",
    link: "/compliance",
    badge: "Automated",
    color: "primary",
    preview: ["SOP comparison table", "Violation alerts", "AI detection", "Compliance scoring"],
  },
  {
    id: "correlation",
    icon: Scale,
    title: "Evidence Correlation",
    description: "Link claims to evidence with hierarchical exhibit trees, relevance scoring, and unsupported claims alerting.",
    link: "/correlation",
    badge: "Analytical",
    color: "chart-4",
    preview: ["Claim-evidence linking", "Exhibit tree view", "Support scoring", "Gap analysis"],
  },
  {
    id: "reconstruction",
    icon: GitBranch,
    title: "Case Reconstruction",
    description: "Parallel timelines comparing official vs actual accounts with contradiction flags and delay alerts.",
    link: "/reconstruction",
    badge: "Forensic",
    color: "chart-2",
    preview: ["Parallel timelines", "Contradiction flags", "Delay alerts", "Source comparison"],
  },
  {
    id: "international",
    icon: Globe,
    title: "International Rights Audit",
    description: "Map violations against UDHR, ICCPR, CAT, ECHR and other global human rights frameworks.",
    link: "/international",
    badge: "6 Frameworks",
    color: "chart-3",
    preview: ["UN UDHR mapping", "ICCPR analysis", "CAT compliance", "Cross-framework view"],
  },
];

const colorStyles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    glow: "shadow-[0_0_40px_hsl(var(--primary)/0.15)]",
  },
  "chart-2": {
    bg: "bg-chart-2/10",
    text: "text-chart-2",
    border: "border-chart-2/20",
    glow: "shadow-[0_0_40px_hsl(var(--chart-2)/0.15)]",
  },
  "chart-3": {
    bg: "bg-chart-3/10",
    text: "text-chart-3",
    border: "border-chart-3/20",
    glow: "shadow-[0_0_40px_hsl(var(--chart-3)/0.15)]",
  },
  "chart-4": {
    bg: "bg-chart-4/10",
    text: "text-chart-4",
    border: "border-chart-4/20",
    glow: "shadow-[0_0_40px_hsl(var(--chart-4)/0.15)]",
  },
};

const InteractiveHeroModules = () => {
  const [activeModule, setActiveModule] = useState<string>("timeline");
  const { stats } = usePlatformStats();
  const active = modules.find((m) => m.id === activeModule)!;
  const styles = colorStyles[active.color];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 bg-primary/5 border-primary/20">
              <Sparkles className="w-3 h-3 mr-1.5" />
              EXPLORE THE PLATFORM
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Investigation-Grade <GradientText>Tools at Your Fingertips</GradientText>
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Click any module below to preview its capabilities — then dive straight in.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Module selector - left column */}
          <div className="lg:col-span-5 space-y-2">
            {modules.map((mod, idx) => {
              const ms = colorStyles[mod.color];
              const isActive = mod.id === activeModule;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300",
                    "border hover:scale-[1.02] active:scale-[0.99]",
                    isActive
                      ? cn("border-primary/30 bg-primary/5", ms.glow)
                      : "border-transparent hover:border-border/50 hover:bg-card/50"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-lg shrink-0 transition-all duration-300",
                      isActive ? cn(ms.bg, "scale-110") : "bg-muted/50"
                    )}
                  >
                    <mod.icon className={cn("w-5 h-5 transition-colors", isActive ? ms.text : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-semibold text-sm truncate transition-colors", isActive ? "text-foreground" : "text-foreground/70")}>
                        {mod.title}
                      </span>
                      {isActive && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 animate-scale-in">
                          {mod.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-300",
                      isActive ? cn(ms.text, "translate-x-0 opacity-100") : "opacity-0 -translate-x-2"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Preview panel - right column */}
          <div className="lg:col-span-7">
            <Card
              key={active.id}
              className={cn(
                "border-border/50 bg-card/80 backdrop-blur overflow-hidden animate-fade-in",
                "transition-shadow duration-500",
                styles.glow
              )}
            >
              {/* Top gradient bar */}
              <div className={cn("h-1 bg-gradient-to-r", `from-${active.color} via-primary to-${active.color}`)} 
                   style={{ background: `linear-gradient(90deg, hsl(var(--${active.color})), hsl(var(--primary)), hsl(var(--${active.color})))` }}
              />
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className={cn("p-3 rounded-xl border transition-all", styles.bg, styles.border)}>
                    <active.icon className={cn("w-7 h-7", styles.text)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{active.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{active.description}</p>
                  </div>
                </div>

                {/* Capability preview */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {active.preview.map((item, idx) => (
                    <div
                      key={item}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30",
                        "animate-fade-in"
                      )}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className={cn("w-2 h-2 rounded-full shrink-0", styles.bg.replace("/10", "/60"))} 
                           style={{ backgroundColor: `hsl(var(--${active.color}) / 0.6)` }}
                      />
                      <span className="text-sm text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Live stats mini-bar */}
                <div className="flex items-center gap-4 mb-6 p-3 rounded-lg bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{stats.totalEvents}</strong> events
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{stats.totalEntities}</strong> entities
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{stats.totalSources}</strong> sources
                    </span>
                  </div>
                </div>

                <Button className="w-full group" asChild>
                  <Link to={active.link}>
                    Open {active.title}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveHeroModules;
