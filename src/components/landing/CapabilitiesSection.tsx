import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Brain,
  Network, 
  Users, 
  GitBranch,
  Scale, 
  Globe, 
  Gavel,
  ChevronRight
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import { cn } from "@/lib/utils";

const CapabilitiesSection = () => {
  const { t } = useTranslation();

  const clusters = [
    {
      id: "evidence",
      titleKey: "landing.capabilities.evidence.title",
      descriptionKey: "landing.capabilities.evidence.description",
      color: "primary",
      tools: [
        {
          icon: Upload,
          titleKey: "landing.capabilities.evidence.tool1.title",
          descriptionKey: "landing.capabilities.evidence.tool1.description",
          link: "/uploads"
        },
        {
          icon: Brain,
          titleKey: "landing.capabilities.evidence.tool2.title",
          descriptionKey: "landing.capabilities.evidence.tool2.description",
          link: "/analyze"
        },
        {
          icon: FileText,
          titleKey: "landing.capabilities.evidence.tool3.title",
          descriptionKey: "landing.capabilities.evidence.tool3.description",
          link: "/evidence"
        }
      ]
    },
    {
      id: "networks",
      titleKey: "landing.capabilities.networks.title",
      descriptionKey: "landing.capabilities.networks.description",
      color: "chart-4",
      tools: [
        {
          icon: Network,
          titleKey: "landing.capabilities.networks.tool1.title",
          descriptionKey: "landing.capabilities.networks.tool1.description",
          link: "/network"
        },
        {
          icon: Users,
          titleKey: "landing.capabilities.networks.tool2.title",
          descriptionKey: "landing.capabilities.networks.tool2.description",
          link: "/network"
        },
        {
          icon: GitBranch,
          titleKey: "landing.capabilities.networks.tool3.title",
          descriptionKey: "landing.capabilities.networks.tool3.description",
          link: "/reconstruction"
        }
      ]
    },
    {
      id: "legal",
      titleKey: "landing.capabilities.legal.title",
      descriptionKey: "landing.capabilities.legal.description",
      color: "chart-2",
      tools: [
        {
          icon: Scale,
          titleKey: "landing.capabilities.legal.tool1.title",
          descriptionKey: "landing.capabilities.legal.tool1.description",
          link: "/correlation"
        },
        {
          icon: Globe,
          titleKey: "landing.capabilities.legal.tool2.title",
          descriptionKey: "landing.capabilities.legal.tool2.description",
          link: "/international"
        },
        {
          icon: Gavel,
          titleKey: "landing.capabilities.legal.tool3.title",
          descriptionKey: "landing.capabilities.legal.tool3.description",
          link: "/legal-intelligence"
        }
      ]
    }
  ];

  const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/30"
    },
    "chart-2": {
      bg: "bg-chart-2/10",
      text: "text-chart-2",
      border: "border-chart-2/30"
    },
    "chart-4": {
      bg: "bg-chart-4/10",
      text: "text-chart-4",
      border: "border-chart-4/30"
    }
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-background border-border/50">
              {t('landing.capabilities.badge', 'PLATFORM CAPABILITIES')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GradientText>{t('landing.capabilities.title', 'Tools for Investigative Research')}</GradientText>
            </h2>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {t('landing.capabilities.description', 'Purpose-built modules designed for journalists, researchers, and legal advocates to transform raw evidence into structured, verifiable intelligence.')}
            </p>
          </div>
        </ScrollReveal>

        {/* Capability Clusters */}
        <div className="grid lg:grid-cols-3 gap-8">
          {clusters.map((cluster, clusterIndex) => {
            const styles = colorStyles[cluster.color];
            return (
              <ScrollReveal key={cluster.id} delay={clusterIndex * 150} direction="up">
                <div className="h-full">
                  {/* Cluster Header */}
                  <div className={cn("p-4 rounded-t-xl border-t border-x", styles.border, styles.bg)}>
                    <h3 className={cn("text-lg font-bold", styles.text)}>
                      {t(cluster.titleKey)}
                    </h3>
                    <p className="text-sm text-foreground/70 mt-1">
                      {t(cluster.descriptionKey)}
                    </p>
                  </div>

                  {/* Tools */}
                  <div className="space-y-1 border-x border-b border-border/50 rounded-b-xl bg-card/50 backdrop-blur-sm">
                    {cluster.tools.map((tool, toolIndex) => (
                      <Link 
                        key={tool.titleKey} 
                        to={tool.link}
                        className={cn(
                          "flex items-start gap-4 p-4 group",
                          "hover:bg-accent/50 transition-colors duration-200",
                          toolIndex === cluster.tools.length - 1 && "rounded-b-xl"
                        )}
                      >
                        <div className={cn(
                          "p-2.5 rounded-lg shrink-0 transition-colors",
                          styles.bg, "group-hover:" + styles.bg.replace("/10", "/20")
                        )}>
                          <tool.icon className={cn("w-5 h-5", styles.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {t(tool.titleKey)}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                          </div>
                          <p className="text-sm text-foreground/60 mt-0.5 leading-relaxed">
                            {t(tool.descriptionKey)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
