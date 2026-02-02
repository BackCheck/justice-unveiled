import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Network, 
  FileSearch, 
  Globe, 
  ChevronRight,
  Sparkles,
  Target,
  Scale,
  Workflow
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import { cn } from "@/lib/utils";

const FeatureShowcase = () => {
  const mainFeatures = [
    {
      icon: Brain,
      title: "AI Document Analyzer",
      description: "Extract events, entities, and violations from raw documents using advanced AI. Automatically identify patterns and discrepancies.",
      link: "/uploads",
      badge: "AI-Powered",
      color: "primary",
      stats: ["Events", "Entities", "Discrepancies"]
    },
    {
      icon: Network,
      title: "Entity Relationship Network",
      description: "Interactive force-directed graphs showing connections between individuals, organizations, and institutions with role analysis.",
      link: "/network",
      badge: "Interactive",
      color: "chart-2",
      stats: ["Force Graph", "Clustering", "Path Analysis"]
    },
    {
      icon: FileSearch,
      title: "Evidence Matrix",
      description: "Cross-reference sources and documents to timeline events with reliability tracking and verification status.",
      link: "/evidence",
      badge: "Verified",
      color: "chart-4",
      stats: ["Sources", "Documents", "Links"]
    },
    {
      icon: Globe,
      title: "International Rights Audit",
      description: "Map documented violations against UDHR, ICCPR, CAT, ECHR, and other global human rights frameworks.",
      link: "/international",
      badge: "6 Frameworks",
      color: "chart-3",
      stats: ["UN UDHR", "ICCPR", "CAT"]
    }
  ];

  const additionalFeatures = [
    {
      icon: Target,
      title: "Threat Profiler",
      description: "Generate adversary profiles and behavioral analysis",
      link: "/investigations"
    },
    {
      icon: Workflow,
      title: "Pattern Detection",
      description: "AI-powered pattern recognition across timeline events",
      link: "/investigations"
    },
    {
      icon: Scale,
      title: "Risk Assessment",
      description: "Comprehensive threat and procedural risk scoring",
      link: "/investigations"
    },
    {
      icon: Sparkles,
      title: "Intel Reports",
      description: "Auto-generated intelligence briefings and reports",
      link: "/intel-briefing"
    }
  ];

  const colorStyles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
      glow: "group-hover:shadow-[0_0_50px_hsl(var(--primary)/0.2)]"
    },
    "chart-2": {
      bg: "bg-chart-2/10",
      text: "text-chart-2",
      border: "border-chart-2/20",
      glow: "group-hover:shadow-[0_0_50px_hsl(var(--chart-2)/0.2)]"
    },
    "chart-3": {
      bg: "bg-chart-3/10",
      text: "text-chart-3",
      border: "border-chart-3/20",
      glow: "group-hover:shadow-[0_0_50px_hsl(var(--chart-3)/0.2)]"
    },
    "chart-4": {
      bg: "bg-chart-4/10",
      text: "text-chart-4",
      border: "border-chart-4/20",
      glow: "group-hover:shadow-[0_0_50px_hsl(var(--chart-4)/0.2)]"
    }
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-background border-primary/30">
              <Sparkles className="w-3 h-3 mr-1.5" />
              PLATFORM CAPABILITIES
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Intelligence-Grade <GradientText>Investigation Tools</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built modules to synthesize raw evidence into structured, actionable intelligence.
            </p>
          </div>
        </ScrollReveal>

        {/* Main Features - 2x2 Grid with larger cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {mainFeatures.map((feature, index) => {
            const styles = colorStyles[feature.color];
            return (
              <ScrollReveal key={feature.title} delay={index * 100} direction="up">
                <Link to={feature.link}>
                  <Card className={cn(
                    "h-full border-border/50 bg-card/80 backdrop-blur cursor-pointer group",
                    "transition-all duration-500 hover:-translate-y-2",
                    styles.glow
                  )}>
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={cn(
                          "p-4 rounded-2xl transition-all duration-300",
                          "group-hover:scale-110 group-hover:rotate-3",
                          styles.bg, styles.border, "border"
                        )}>
                          <feature.icon className={cn("w-8 h-8", styles.text)} />
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          styles.bg, styles.text, styles.border
                        )}>
                          {feature.badge}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Feature stats */}
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        {feature.stats.map((stat) => (
                          <Badge key={stat} variant="secondary" className="text-xs">
                            {stat}
                          </Badge>
                        ))}
                      </div>

                      <span className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        "opacity-0 group-hover:opacity-100 transition-all duration-300",
                        "translate-y-2 group-hover:translate-y-0",
                        styles.text
                      )}>
                        Explore Module <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Additional Features - Compact row */}
        <ScrollReveal delay={400}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalFeatures.map((feature, index) => (
              <Link key={feature.title} to={feature.link}>
                <div className={cn(
                  "p-5 rounded-xl border bg-card/50 backdrop-blur",
                  "hover:bg-card hover:border-primary/30 transition-all duration-300",
                  "group cursor-pointer hover:-translate-y-1"
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground pl-11">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FeatureShowcase;
