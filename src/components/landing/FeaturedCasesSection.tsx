import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Clock, 
  FileText,
  Flame,
  Shield
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

const severityConfig: Record<string, { color: string; icon: typeof AlertTriangle; label: string }> = {
  critical: { color: "text-destructive", icon: Flame, label: "Critical" },
  high: { color: "text-chart-3", icon: AlertTriangle, label: "High Severity" },
  medium: { color: "text-chart-2", icon: Shield, label: "Medium" },
};

const FeaturedCasesSection = () => {
  const { data: cases } = useQuery({
    queryKey: ["landing-featured-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, case_number, title, description, status, severity, category, location, total_sources, total_events, total_entities, is_featured")
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(6);
      if (error) throw error;
      // Always put featured case first
      const sorted = (data || []).sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });
      return sorted;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (!cases || cases.length === 0) return null;

  const primaryCase = cases[0];
  const secondaryCases = cases.slice(1);

  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-destructive/5 border-destructive/20 text-destructive">
              <AlertTriangle className="w-3 h-3 mr-1.5" />
              ACTIVE INVESTIGATIONS
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Featured <GradientText>Case Files</GradientText>
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Ongoing investigations backed by verified evidence, AI analysis, and international legal frameworks.
            </p>
          </div>
        </ScrollReveal>

        {/* Primary featured case */}
        <ScrollReveal delay={100}>
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden group hover:border-primary/40 transition-all duration-500">
            <div className="h-1 bg-gradient-to-r from-destructive via-primary to-chart-2" />
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <Badge variant="secondary" className="font-mono text-xs">{primaryCase.case_number}</Badge>
                    {primaryCase.severity && (
                      <Badge variant="outline" className={cn(
                        "border-destructive/30",
                        severityConfig[primaryCase.severity]?.color || "text-foreground"
                      )}>
                        {severityConfig[primaryCase.severity]?.label || primaryCase.severity}
                      </Badge>
                    )}
                    {primaryCase.category && (
                      <Badge variant="outline" className="text-primary border-primary/30">{primaryCase.category}</Badge>
                    )}
                    <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">Active</Badge>
                    {primaryCase.is_featured && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse">⭐ Featured</Badge>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {primaryCase.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed mb-4 line-clamp-3">
                    {primaryCase.description}
                  </p>
                  {primaryCase.location && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
                      <MapPin className="w-3.5 h-3.5" />
                      {primaryCase.location}
                    </div>
                  )}
                  <Button className="group/btn" asChild>
                    <Link to={`/cases/${primaryCase.id}`}>
                      View Full Investigation
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                {/* Case stats */}
                <div className="grid grid-cols-3 gap-3 lg:w-72 lg:shrink-0">
                  {[
                    { value: primaryCase.total_events || 0, label: "Events", icon: Clock, color: "text-primary" },
                    { value: primaryCase.total_entities || 0, label: "Entities", icon: Users, color: "text-chart-4" },
                    { value: primaryCase.total_sources || 0, label: "Sources", icon: FileText, color: "text-chart-2" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
                      <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                      <p className="text-2xl font-bold text-foreground">
                        <AnimatedCounter end={stat.value} />
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Secondary cases grid */}
        {secondaryCases.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {secondaryCases.map((c, idx) => (
              <ScrollReveal key={c.id} delay={200 + idx * 100}>
                <Link to={`/cases/${c.id}`} className="block group">
                  <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="font-mono text-[10px]">{c.case_number}</Badge>
                        {c.severity && (
                          <Badge variant="outline" className={cn(
                            "text-[10px]",
                            severityConfig[c.severity]?.color || "text-foreground"
                          )}>
                            {severityConfig[c.severity]?.label || c.severity}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                        {c.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{c.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {c.total_events || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {c.total_entities || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {c.total_sources || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal delay={500}>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary hover:text-primary-foreground" asChild>
              <Link to="/cases">
                View All Investigations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FeaturedCasesSection;
