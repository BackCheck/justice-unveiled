import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Database, 
  Users, 
  Calendar, 
  Link2, 
  Sparkles, 
  TrendingUp,
  FileSearch,
  AlertTriangle,
  Shield,
  Brain
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import AnimatedCounter from "./AnimatedCounter";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import { cn } from "@/lib/utils";

const LiveMetricsSection = () => {
  const { stats, isLoading } = usePlatformStats();

  const primaryMetrics = [
    {
      icon: Database,
      label: "Total Sources",
      value: stats.totalSources,
      subtext: `${stats.staticSources} verified + ${stats.aiExtractedSources} AI-processed`,
      color: "primary",
      trend: stats.aiExtractedSources > 0 ? `+${stats.aiExtractedSources} new` : undefined
    },
    {
      icon: Calendar,
      label: "Timeline Events",
      value: stats.totalEvents,
      subtext: `${stats.staticEvents} documented + ${stats.aiExtractedEvents} extracted`,
      color: "chart-2",
      trend: stats.aiExtractedEvents > 0 ? `+${stats.aiExtractedEvents} AI` : undefined
    },
    {
      icon: Users,
      label: "Entities Mapped",
      value: stats.totalEntities,
      subtext: `${stats.staticEntities} known + ${stats.aiExtractedEntities} discovered`,
      color: "chart-4",
      trend: stats.aiExtractedEntities > 0 ? `+${stats.aiExtractedEntities} new` : undefined
    },
    {
      icon: Link2,
      label: "Relationships",
      value: stats.totalConnections,
      subtext: `${stats.inferredConnections} AI-inferred connections`,
      color: "chart-3",
      trend: stats.inferredConnections > 0 ? `${stats.inferredConnections} inferred` : undefined
    }
  ];

  const secondaryMetrics = [
    {
      icon: FileSearch,
      label: "Documents Analyzed",
      value: stats.documentsAnalyzed,
      color: "amber"
    },
    {
      icon: AlertTriangle,
      label: "Discrepancies Found",
      value: stats.totalDiscrepancies,
      color: "destructive"
    },
    {
      icon: Shield,
      label: "Critical Issues",
      value: stats.criticalDiscrepancies,
      color: "red"
    },
    {
      icon: Brain,
      label: "Int'l Frameworks",
      value: stats.internationalFrameworks,
      color: "blue"
    }
  ];

  const colorMap: Record<string, string> = {
    primary: "text-primary bg-primary/10 border-primary/20",
    "chart-2": "text-chart-2 bg-chart-2/10 border-chart-2/20",
    "chart-3": "text-chart-3 bg-chart-3/10 border-chart-3/20",
    "chart-4": "text-chart-4 bg-chart-4/10 border-chart-4/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-40 mx-auto mb-4" />
            <Skeleton className="h-10 w-80 mx-auto mb-2" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
              LIVE PLATFORM METRICS
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Real-Time <GradientText>Intelligence Data</GradientText>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Live statistics from our investigative database, combining verified sources with AI-extracted intelligence.
            </p>
          </div>
        </ScrollReveal>

        {/* Primary Metrics - Large Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {primaryMetrics.map((metric, index) => (
            <ScrollReveal key={metric.label} delay={index * 100} direction="up">
              <Card className={cn(
                "relative overflow-hidden group hover:-translate-y-1 transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary/10"
              )}>
                {/* Top gradient bar */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1",
                  metric.color === "primary" && "bg-gradient-to-r from-primary to-primary/50",
                  metric.color === "chart-2" && "bg-gradient-to-r from-chart-2 to-chart-2/50",
                  metric.color === "chart-3" && "bg-gradient-to-r from-chart-3 to-chart-3/50",
                  metric.color === "chart-4" && "bg-gradient-to-r from-chart-4 to-chart-4/50"
                )} />
                
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "p-2.5 rounded-xl border transition-all duration-300",
                      "group-hover:scale-110",
                      colorMap[metric.color]
                    )}>
                      <metric.icon className="w-5 h-5" />
                    </div>
                    {metric.trend && (
                      <Badge variant="outline" className="text-xs bg-chart-2/10 text-chart-2 border-chart-2/30">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {metric.trend}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-3xl font-bold tracking-tight">
                      <AnimatedCounter end={metric.value} />
                    </p>
                    <p className="font-medium text-foreground">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">{metric.subtext}</p>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Secondary Metrics - Compact Row */}
        <ScrollReveal delay={400}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {secondaryMetrics.map((metric, index) => (
              <div 
                key={metric.label}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border bg-card/50 backdrop-blur",
                  "hover:bg-card/80 transition-all duration-300 group"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300 group-hover:scale-105",
                  colorMap[metric.color]
                )}>
                  <metric.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xl font-bold">
                    <AnimatedCounter end={metric.value} duration={1500} />
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Category Breakdown */}
        {Object.keys(stats.eventsByCategory).length > 0 && (
          <ScrollReveal delay={500}>
            <div className="mt-8 p-6 rounded-xl border bg-card/50 backdrop-blur">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                EVENTS BY CATEGORY
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.eventsByCategory).map(([category, count]) => (
                  <Badge 
                    key={category} 
                    variant="secondary" 
                    className="px-3 py-1.5 text-sm hover:bg-primary/20 transition-colors cursor-default"
                  >
                    {category}: <span className="font-bold ml-1">{count}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default LiveMetricsSection;
