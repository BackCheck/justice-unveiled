import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Scale, 
  Gavel, 
  ShieldAlert,
  TrendingUp,
  BarChart3,
  Flame,
  FileWarning
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

const ViolationMetrics = () => {
  const { data: violationsBySeverity } = useQuery({
    queryKey: ["landing-violations-severity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_violations")
        .select("severity");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach(v => {
        counts[v.severity] = (counts[v.severity] || 0) + 1;
      });
      return counts;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: eventsByCategory } = useQuery({
    queryKey: ["landing-events-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_events")
        .select("category");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach(e => {
        counts[e.category] = (counts[e.category] || 0) + 1;
      });
      return counts;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: discrepancyCount } = useQuery({
    queryKey: ["landing-discrepancies-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("extracted_discrepancies")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 5,
  });

  const totalViolations = Object.values(violationsBySeverity || {}).reduce((a, b) => a + b, 0);
  const totalEvents = Object.values(eventsByCategory || {}).reduce((a, b) => a + b, 0);

  const severityBars = [
    { label: "Critical", count: violationsBySeverity?.critical || 0, color: "bg-destructive", textColor: "text-destructive" },
    { label: "High", count: violationsBySeverity?.high || 0, color: "bg-chart-3", textColor: "text-chart-3" },
    { label: "Medium", count: violationsBySeverity?.medium || 0, color: "bg-chart-2", textColor: "text-chart-2" },
    { label: "Low", count: violationsBySeverity?.low || 0, color: "bg-muted-foreground", textColor: "text-muted-foreground" },
  ];

  const categoryIcons: Record<string, typeof Gavel> = {
    "Legal Proceeding": Gavel,
    "Criminal Allegation": ShieldAlert,
    "Harassment": AlertTriangle,
    "Business Interference": FileWarning,
  };

  return (
    <section className="py-16 md:py-24 relative bg-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-chart-3/5 border-chart-3/20 text-chart-3">
              <BarChart3 className="w-3 h-3 mr-1.5" />
              DATA-DRIVEN INSIGHTS
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Violations <GradientText>By The Numbers</GradientText>
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Real-time metrics extracted from documented cases — every number represents a verified incident.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Severity breakdown */}
          <ScrollReveal delay={100}>
            <Card className="border-border/50 bg-card/80 backdrop-blur h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Flame className="w-5 h-5 text-destructive" />
                  <h3 className="font-bold text-foreground">Violation Severity</h3>
                </div>
                <p className="text-4xl font-bold text-foreground mb-6">
                  <AnimatedCounter end={totalViolations} />
                  <span className="text-sm font-normal text-muted-foreground ml-2">total violations</span>
                </p>
                <div className="space-y-4">
                  {severityBars.map((bar) => {
                    const pct = totalViolations > 0 ? (bar.count / totalViolations) * 100 : 0;
                    return (
                      <div key={bar.label}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={cn("text-sm font-medium", bar.textColor)}>{bar.label}</span>
                          <span className="text-sm font-bold text-foreground">{bar.count}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-1000", bar.color)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Event categories */}
          <ScrollReveal delay={200}>
            <Card className="border-border/50 bg-card/80 backdrop-blur h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Scale className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">Incident Categories</h3>
                </div>
                <p className="text-4xl font-bold text-foreground mb-6">
                  <AnimatedCounter end={totalEvents} />
                  <span className="text-sm font-normal text-muted-foreground ml-2">documented events</span>
                </p>
                <div className="space-y-3">
                  {Object.entries(eventsByCategory || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([cat, count]) => {
                      const Icon = categoryIcons[cat] || TrendingUp;
                      return (
                        <div key={cat} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm text-foreground/80 flex-1 truncate">{cat}</span>
                          <span className="text-sm font-bold text-foreground">{count}</span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Key findings */}
          <ScrollReveal delay={300}>
            <Card className="border-border/50 bg-card/80 backdrop-blur h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldAlert className="w-5 h-5 text-chart-2" />
                  <h3 className="font-bold text-foreground">Key Findings</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                    <p className="text-3xl font-bold text-destructive mb-1">
                      <AnimatedCounter end={severityBars[0].count} />
                    </p>
                    <p className="text-sm text-destructive/80">Critical violations requiring immediate attention</p>
                  </div>
                  <div className="p-4 rounded-xl bg-chart-3/5 border border-chart-3/20">
                    <p className="text-3xl font-bold text-chart-3 mb-1">
                      <AnimatedCounter end={discrepancyCount || 0} />
                    </p>
                    <p className="text-sm text-chart-3/80">Evidence discrepancies flagged by AI</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-3xl font-bold text-primary mb-1">
                      <AnimatedCounter end={eventsByCategory?.["Legal Proceeding"] || 0} />
                    </p>
                    <p className="text-sm text-primary/80">Legal proceedings documented & tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ViolationMetrics;
