import { useLandingStats } from "@/hooks/usePlatformStats";
import { Loader2, FileCheck, Calendar, Clock, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
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
      label: t('landing.stats.yearsDocumented'),
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
      label: t('landing.stats.internationalFrameworks'),
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
            "relative p-6 md:p-8 rounded-xl",
            "bg-card/60 backdrop-blur-sm border border-border/50",
            "hover:border-primary/30 transition-all duration-300",
            "group"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <metric.icon className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-primary mb-1 tracking-tight">
            <AnimatedCounter end={metric.value} suffix={metric.suffix} />
          </p>
          <p className="text-sm text-foreground/80 font-medium">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TrustMetrics;