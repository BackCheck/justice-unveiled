import { useTranslation } from "react-i18next";
import { useLandingStats } from "@/hooks/usePlatformStats";
import { Loader2, FileCheck, Calendar, Clock, Globe } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

const TrustMetrics = () => {
  const { t } = useTranslation();
  const { fullStats, isLoading } = useLandingStats();

  const metrics = [
    { 
      value: fullStats.totalSources, 
      label: t('landing.stats.sources'),
      icon: FileCheck,
      suffix: "+"
    },
    { 
      value: 10, 
      label: t('landing.trustMetrics.yearsDocumented', 'Years Documented'),
      icon: Calendar,
      suffix: "+"
    },
    { 
      value: fullStats.totalEvents, 
      label: t('landing.stats.events'),
      icon: Clock,
      suffix: "+"
    },
    { 
      value: 6, 
      label: t('landing.trustMetrics.frameworks', 'International Frameworks'),
      icon: Globe,
      suffix: ""
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map((metric, index) => (
        <div 
          key={metric.label}
          className={cn(
            "relative p-6 md:p-8 rounded-xl overflow-hidden",
            "bg-card/60 backdrop-blur-sm border border-border/50",
            "hover:border-primary/40 transition-all duration-500",
            "hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_hsl(var(--primary)/0.2)]",
            "group cursor-default"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Hover glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "p-2 rounded-lg bg-primary/10 transition-all duration-500",
                "group-hover:bg-primary/20 group-hover:scale-110",
                "group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
              )}>
                <metric.icon className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-primary mb-1 tracking-tight">
              <AnimatedCounter end={metric.value} suffix={metric.suffix} />
            </p>
            <p className="text-sm text-foreground/80 font-medium group-hover:text-foreground transition-colors">
              {metric.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustMetrics;
