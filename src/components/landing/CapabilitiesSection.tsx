import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
      title: t('landing.capabilities.evidence.title'),
      description: t('landing.capabilities.evidence.description'),
      color: "primary",
      tools: [
        {
          icon: Upload,
          title: t('landing.capabilities.evidence.docRepo'),
          description: t('landing.capabilities.evidence.docRepoDesc'),
          link: "/uploads"
        },
        {
          icon: Brain,
          title: t('landing.capabilities.evidence.aiExtraction'),
          description: t('landing.capabilities.evidence.aiExtractionDesc'),
          link: "/analyze"
        },
        {
          icon: FileText,
          title: t('landing.capabilities.evidence.evidenceMatrix'),
          description: t('landing.capabilities.evidence.evidenceMatrixDesc'),
          link: "/evidence"
        }
      ]
    },
    {
      id: "networks",
      title: t('landing.capabilities.networks.title'),
      description: t('landing.capabilities.networks.description'),
      color: "chart-4",
      tools: [
        {
          icon: Network,
          title: t('landing.capabilities.networks.entityNetwork'),
          description: t('landing.capabilities.networks.entityNetworkDesc'),
          link: "/network"
        },
        {
          icon: Users,
          title: t('landing.capabilities.networks.roleAnalysis'),
          description: t('landing.capabilities.networks.roleAnalysisDesc'),
          link: "/network"
        },
        {
          icon: GitBranch,
          title: t('landing.capabilities.networks.timelineReconstruction'),
          description: t('landing.capabilities.networks.timelineReconstructionDesc'),
          link: "/reconstruction"
        }
      ]
    },
    {
      id: "legal",
      title: t('landing.capabilities.legal.title'),
      description: t('landing.capabilities.legal.description'),
      color: "chart-2",
      tools: [
        {
          icon: Scale,
          title: t('landing.capabilities.legal.claimCorrelation'),
          description: t('landing.capabilities.legal.claimCorrelationDesc'),
          link: "/correlation"
        },
        {
          icon: Globe,
          title: t('landing.capabilities.legal.internationalRights'),
          description: t('landing.capabilities.legal.internationalRightsDesc'),
          link: "/international"
        },
        {
          icon: Gavel,
          title: t('landing.capabilities.legal.legalIntelligence'),
          description: t('landing.capabilities.legal.legalIntelligenceDesc'),
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
              {t('landing.capabilities.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.capabilities.title')} <GradientText>{t('landing.capabilities.titleHighlight')}</GradientText>
            </h2>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {t('landing.capabilities.description')}
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
                      {cluster.title}
                    </h3>
                    <p className="text-sm text-foreground/70 mt-1">
                      {cluster.description}
                    </p>
                  </div>

                  {/* Tools */}
                  <div className="space-y-1 border-x border-b border-border/50 rounded-b-xl bg-card/50 backdrop-blur-sm">
                    {cluster.tools.map((tool, toolIndex) => (
                      <Link 
                        key={tool.title} 
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
                              {tool.title}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                          </div>
                          <p className="text-sm text-foreground/60 mt-0.5 leading-relaxed">
                            {tool.description}
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