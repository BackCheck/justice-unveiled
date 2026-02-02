import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { useLandingStats } from "@/hooks/usePlatformStats";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

const HeroStats = () => {
  const { stats, fullStats, isLoading } = useLandingStats();

  if (isLoading) {
    return (
      <div className="mt-16 md:mt-20">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 md:mt-20">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className={cn(
              "relative p-5 md:p-6 rounded-2xl",
              "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm",
              "border border-border/50 hover:border-primary/30",
              "group cursor-default transition-all duration-500",
              "hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm md:text-base text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Enhancement Badge */}
      {fullStats.aiExtractedEvents > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Badge 
            variant="outline" 
            className="px-4 py-2 bg-gradient-to-r from-chart-5/10 to-primary/10 border-chart-5/30 text-foreground"
          >
            <Sparkles className="w-4 h-4 mr-2 text-chart-5" />
            <span>
              <span className="font-bold text-chart-5">{fullStats.aiExtractedEvents}</span> AI-extracted events
            </span>
          </Badge>
          
          <Badge 
            variant="outline" 
            className="px-4 py-2 bg-gradient-to-r from-chart-2/10 to-primary/10 border-chart-2/30 text-foreground"
          >
            <TrendingUp className="w-4 h-4 mr-2 text-chart-2" />
            <span>
              <span className="font-bold text-chart-2">{fullStats.documentsAnalyzed}</span> documents analyzed
            </span>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default HeroStats;
