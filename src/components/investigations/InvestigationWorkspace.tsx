import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  Search,
  Clock,
  Users,
  AlertTriangle,
  FileText,
  TrendingUp,
  Brain,
  Sparkles,
  ChevronRight,
  Calendar,
  Shield,
  Eye,
  Zap,
  Network,
  MapPin,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const InvestigationWorkspace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { stats } = usePlatformStats();
  const { events } = useCombinedTimeline();
  const { entities } = useCombinedEntities();
  const { data: discrepancies } = useExtractedDiscrepancies();

  // Get recent events
  const recentEvents = events
    .filter(e => e.isExtracted)
    .slice(-5)
    .reverse();

  // Get high-risk entities
  const highRiskEntities = entities.filter(e => e.category === "antagonist").slice(0, 6);

  // Get critical discrepancies
  const criticalDiscrepancies = (discrepancies || [])
    .filter(d => d.severity === "critical" || d.severity === "high")
    .slice(0, 4);

  // Quick action cards
  const quickActions = [
    {
      title: "Threat Analysis",
      description: "Generate AI threat profiles",
      icon: Shield,
      color: "text-red-500 bg-red-500/10",
      link: "#threats",
    },
    {
      title: "Pattern Search",
      description: "Find hidden connections",
      icon: Network,
      color: "text-purple-500 bg-purple-500/10",
      link: "#patterns",
    },
    {
      title: "Risk Matrix",
      description: "View threat assessment",
      icon: AlertTriangle,
      color: "text-orange-500 bg-orange-500/10",
      link: "#risk",
    },
    {
      title: "Generate Report",
      description: "Create intelligence brief",
      icon: FileText,
      color: "text-emerald-500 bg-emerald-500/10",
      link: "#reports",
    },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Workspace */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search & Quick Actions */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entities, events, evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Assist
            </Button>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.title}
                  className="glass-card hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Intelligence Dashboard Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI-Extracted Events */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI-Extracted Intelligence
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {stats.aiExtractedEvents} events
                  </Badge>
                </div>
                <CardDescription>Recently extracted from document analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {recentEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No AI-extracted events yet</p>
                      <Link to="/analyze">
                        <Button variant="link" size="sm" className="mt-2">
                          Analyze Documents →
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentEvents.map((event, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-accent/30 border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {event.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {event.date}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{event.description}</p>
                          {event.confidenceScore && (
                            <div className="mt-2 flex items-center gap-1">
                              <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${event.confidenceScore * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {Math.round(event.confidenceScore * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Critical Issues */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Critical Findings
                  </CardTitle>
                  <Badge variant="destructive" className="text-xs">
                    {criticalDiscrepancies.length} issues
                  </Badge>
                </div>
                <CardDescription>High-priority procedural violations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {criticalDiscrepancies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No critical issues detected</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {criticalDiscrepancies.map((disc) => (
                        <div
                          key={disc.id}
                          className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                disc.severity === "critical"
                                  ? "border-red-500/50 text-red-500"
                                  : "border-orange-500/50 text-orange-500"
                              }`}
                            >
                              {disc.severity}
                            </Badge>
                            <span className="text-xs font-medium">{disc.discrepancy_type}</span>
                          </div>
                          <p className="text-sm font-medium">{disc.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {disc.description}
                          </p>
                          {disc.legal_reference && (
                            <p className="text-[10px] text-muted-foreground mt-2">
                              📖 {disc.legal_reference}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Key Entities of Interest */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-chart-2" />
                  Key Entities of Interest
                </CardTitle>
                <Link to="/network">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View Network <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {highRiskEntities.map((entity) => (
                  <div
                    key={entity.id}
                    className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                      <span className="text-sm font-semibold text-red-500">
                        {entity.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{entity.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {entity.role || entity.type}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Activity Feed */}
      <div className="w-80 border-l border-border/50 bg-accent/20 p-4 hidden xl:block overflow-auto">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Investigation Activity
        </h3>
        
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-background/80 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
            <p className="text-sm">AI analysis complete</p>
            <p className="text-xs text-muted-foreground">3 new events extracted</p>
          </div>

          <div className="p-3 rounded-lg bg-background/80 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs text-muted-foreground">2 min ago</span>
            </div>
            <p className="text-sm">Pattern detected</p>
            <p className="text-xs text-muted-foreground">New entity cluster identified</p>
          </div>

          <div className="p-3 rounded-lg bg-background/80 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">5 min ago</span>
            </div>
            <p className="text-sm">Report generated</p>
            <p className="text-xs text-muted-foreground">Monthly intelligence brief</p>
          </div>

          <div className="p-3 rounded-lg bg-background/80 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-muted-foreground">10 min ago</span>
            </div>
            <p className="text-sm">Critical alert</p>
            <p className="text-xs text-muted-foreground">New procedural violation flagged</p>
          </div>
        </div>

        <Separator className="my-4" />

        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Intelligence Metrics
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Events Analyzed</span>
            <span className="font-semibold">{stats.totalEvents}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Entities Mapped</span>
            <span className="font-semibold">{stats.totalEntities}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AI Extractions</span>
            <span className="font-semibold text-primary">{stats.aiExtractedEvents}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Issues Found</span>
            <span className="font-semibold text-destructive">{stats.totalDiscrepancies}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
