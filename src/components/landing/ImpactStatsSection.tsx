import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { useLandingStats } from "@/hooks/usePlatformStats";
import { 
  FileText, 
  Users, 
  Calendar,
  Globe,
  Scale,
  AlertTriangle,
  Loader2
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

const ImpactStatsSection = () => {
  const { t } = useTranslation();
  const { fullStats, isLoading } = useLandingStats();

  const impactStats = [
    {
      value: fullStats.totalSources,
      suffix: "+",
      labelKey: "landing.impact.sources",
      icon: FileText,
      color: "primary"
    },
    {
      value: fullStats.totalEntities,
      suffix: "+",
      labelKey: "landing.impact.entities",
      icon: Users,
      color: "chart-4"
    },
    {
      value: fullStats.totalEvents,
      suffix: "+",
      labelKey: "landing.impact.events",
      icon: Calendar,
      color: "chart-2"
    },
    {
      value: 6,
      suffix: "",
      labelKey: "landing.impact.frameworks",
      icon: Globe,
      color: "chart-5"
    },
    {
      value: fullStats.verifiedPrecedents,
      suffix: "+",
      labelKey: "landing.impact.precedents",
      icon: Scale,
      color: "primary"
    },
    {
      value: 25,
      suffix: "+",
      labelKey: "landing.impact.violations",
      icon: AlertTriangle,
      color: "destructive"
    }
  ];

  const colorStyles: Record<string, { bg: string; text: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    "chart-2": { bg: "bg-chart-2/10", text: "text-chart-2" },
    "chart-4": { bg: "bg-chart-4/10", text: "text-chart-4" },
    "chart-5": { bg: "bg-chart-5/10", text: "text-chart-5" },
    destructive: { bg: "bg-destructive/10", text: "text-destructive" }
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-secondary/20">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-background border-border/50">
              {t('landing.impact.badge', 'PLATFORM IMPACT')}
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              {t('landing.impact.title', 'Real Data. Real Accountability.')}
            </h2>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {t('landing.impact.description', 'Every number represents documented evidence in our ongoing fight against injustice and institutional abuse.')}
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {impactStats.map((stat, index) => {
            const styles = colorStyles[stat.color];
            return (
              <ScrollReveal key={stat.labelKey} delay={index * 80} direction="scale">
                <div className={cn(
                  "relative p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50",
                  "hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 group text-center"
                )}>
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300",
                    styles.bg, "group-hover:scale-110"
                  )}>
                    <stat.icon className={cn("w-6 h-6", styles.text)} />
                  </div>

                  {/* Value */}
                  <p className={cn("text-3xl md:text-4xl font-bold mb-1 tracking-tight", styles.text)}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </p>

                  {/* Label */}
                  <p className="text-xs md:text-sm text-foreground/60 font-medium">
                    {t(stat.labelKey)}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ImpactStatsSection;
