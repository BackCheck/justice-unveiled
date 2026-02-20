import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, Calendar, Users, AlertTriangle, Sparkles, 
  Brain, FileText, Clock,
  Building2, User, Scale
} from "lucide-react";
import { 
  useExtractedEvents, 
  useExtractedEntities, 
  useExtractedDiscrepancies, 
  useAnalysisJobs 
} from "@/hooks/useExtractedEvents";
import { useSEO } from "@/hooks/useSEO";
import { SocialShareButtons } from "@/components/sharing";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const categoryColors: Record<string, string> = {
  "Business Interference": "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "Harassment": "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  "Legal Proceeding": "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  "Criminal Allegation": "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
};

const severityColors: Record<string, string> = {
  "critical": "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  "high": "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  "medium": "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  "low": "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
};

const AnalysisHistory = () => {
  useSEO({
    title: "AI Analysis History — Intelligence Archive",
    description: "Browse previously AI-analyzed intelligence data grouped by date. Events, entities, and discrepancies extracted from legal documents, testimonies, and evidence files.",
    keywords: ["AI analysis history", "intelligence archive", "extracted events", "entity analysis", "document intelligence", "human rights data"],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "AI Analysis History",
      description: "Archive of AI-analyzed intelligence data from human rights investigations.",
    },
  });

  const { data: events, isLoading: eventsLoading } = useExtractedEvents();
  const { data: entities, isLoading: entitiesLoading } = useExtractedEntities();
  const { data: discrepancies, isLoading: discrepanciesLoading } = useExtractedDiscrepancies();
  const { data: jobs, isLoading: jobsLoading } = useAnalysisJobs();

  const isLoading = eventsLoading || entitiesLoading || discrepanciesLoading || jobsLoading;

  // Group analysis jobs by date
  const groupedByDate = useMemo(() => {
    if (!jobs) return [];

    const groups: Record<string, {
      date: string;
      jobs: typeof jobs;
      events: typeof events;
      entities: typeof entities;
      discrepancies: typeof discrepancies;
    }> = {};

    // Group jobs by date
    jobs.forEach(job => {
      const dateKey = new Date(job.created_at).toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, jobs: [], events: [], entities: [], discrepancies: [] };
      }
      groups[dateKey].jobs.push(job);
    });

    // Also group extracted data by created_at date
    events?.forEach(event => {
      const dateKey = new Date(event.created_at).toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, jobs: [], events: [], entities: [], discrepancies: [] };
      }
      groups[dateKey].events!.push(event);
    });

    entities?.forEach(entity => {
      const dateKey = new Date(entity.created_at).toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, jobs: [], events: [], entities: [], discrepancies: [] };
      }
      groups[dateKey].entities!.push(entity);
    });

    discrepancies?.forEach(disc => {
      const dateKey = new Date(disc.created_at).toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, jobs: [], events: [], entities: [], discrepancies: [] };
      }
      groups[dateKey].discrepancies!.push(disc);
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [jobs, events, entities, discrepancies]);

  const totalStats = {
    totalJobs: jobs?.filter(j => j.status === "completed").length || 0,
    totalEvents: events?.length || 0,
    totalEntities: entities?.length || 0,
    totalDiscrepancies: discrepancies?.length || 0,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <PlatformLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <History className="w-8 h-8 text-primary" />
              AI Analysis History
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Intelligence Archive
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse all previously analyzed intelligence data, grouped by date of analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/analyze">
              <Button variant="default" size="sm" className="gap-2">
                <Brain className="w-4 h-4" />
                New Analysis
              </Button>
            </Link>
            <SocialShareButtons
              title="AI Analysis History - HRPM"
              description="Browse AI-analyzed intelligence from human rights investigations."
              hashtags={["AI", "IntelligenceArchive", "HRPM", "HumanRights"]}
              variant="compact"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalJobs}</p>
                <p className="text-xs text-muted-foreground">Analyses Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalEvents}</p>
                <p className="text-xs text-muted-foreground">Events Extracted</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalEntities}</p>
                <p className="text-xs text-muted-foreground">Entities Found</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalDiscrepancies}</p>
                <p className="text-xs text-muted-foreground">Discrepancies</p>
              </div>
            </div>
          </Card>
        </div>

        <Separator />

        {/* Date-grouped timeline */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
            <p>Loading analysis history...</p>
          </div>
        ) : groupedByDate.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">No Analysis History Yet</h3>
              <p className="text-sm max-w-md mx-auto mb-4">
                Start analyzing documents to build your intelligence archive.
              </p>
              <Link to="/analyze">
                <Button variant="default" className="gap-2">
                  <Brain className="w-4 h-4" />
                  Start Analyzing
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedByDate.map((group) => {
              const eventCount = group.events?.length || 0;
              const entityCount = group.entities?.length || 0;
              const discrepancyCount = group.discrepancies?.length || 0;
              const jobCount = group.jobs.filter(j => j.status === "completed").length;

              return (
                <Card key={group.date} className="overflow-hidden">
                  {/* Date Header */}
                  <CardHeader className="bg-accent/30 border-b border-border/50 pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        {formatDate(group.date)}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        {jobCount > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <FileText className="w-3 h-3" /> {jobCount} analysis{jobCount > 1 ? "es" : ""}
                          </Badge>
                        )}
                        {eventCount > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Calendar className="w-3 h-3" /> {eventCount} events
                          </Badge>
                        )}
                        {entityCount > 0 && (
                          <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            <Users className="w-3 h-3" /> {entityCount} entities
                          </Badge>
                        )}
                        {discrepancyCount > 0 && (
                          <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                            <AlertTriangle className="w-3 h-3" /> {discrepancyCount} discrepancies
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                      {/* Events for this date */}
                      {eventCount > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Calendar className="w-4 h-4" /> Events
                          </h4>
                          <ScrollArea className={cn(eventCount > 3 ? "h-[200px]" : "")}>
                            <div className="space-y-2">
                              {group.events?.map((event) => (
                                <div key={event.id} className="p-2.5 rounded-md border bg-card hover:bg-accent/30 transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[10px]">{event.date}</Badge>
                                    <Badge className={cn("text-[10px] border", categoryColors[event.category])}>
                                      {event.category}
                                    </Badge>
                                  </div>
                                  <p className="text-xs line-clamp-2">{event.description}</p>
                                  {event.confidence_score && (
                                    <div className="mt-1.5 flex items-center gap-2">
                                      <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${event.confidence_score * 100}%` }} />
                                      </div>
                                      <span className="text-[10px] text-muted-foreground">{Math.round(event.confidence_score * 100)}%</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}

                      {/* Entities for this date */}
                      {entityCount > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Users className="w-4 h-4" /> Entities
                          </h4>
                          <ScrollArea className={cn(entityCount > 3 ? "h-[200px]" : "")}>
                            <div className="space-y-2">
                              {group.entities?.map((entity) => (
                                <Link key={entity.id} to={`/entities/${entity.id}`} className="block">
                                  <div className="p-2.5 rounded-md border bg-card hover:bg-accent/30 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 rounded-full bg-emerald-500/10">
                                        {entity.entity_type === "Organization" ? (
                                          <Building2 className="w-3 h-3 text-emerald-500" />
                                        ) : entity.entity_type === "Official Body" || entity.entity_type === "Legal Entity" ? (
                                          <Scale className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                          <User className="w-3 h-3 text-emerald-500" />
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">{entity.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{entity.entity_type} {entity.role ? `· ${entity.role}` : ""}</p>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}

                      {/* Discrepancies for this date */}
                      {discrepancyCount > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4" /> Discrepancies
                          </h4>
                          <ScrollArea className={cn(discrepancyCount > 3 ? "h-[200px]" : "")}>
                            <div className="space-y-2">
                              {group.discrepancies?.map((disc) => (
                                <div key={disc.id} className="p-2.5 rounded-md border bg-card hover:bg-accent/30 transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={cn("text-[10px] border", severityColors[disc.severity])}>
                                      {disc.severity}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">{disc.discrepancy_type}</Badge>
                                  </div>
                                  <p className="text-xs font-medium">{disc.title}</p>
                                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{disc.description}</p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>

                    {/* Analysis jobs for this date */}
                    {group.jobs.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Analysis runs:
                          </span>
                          {group.jobs.map(job => (
                            <Badge key={job.id} variant={job.status === "completed" ? "default" : job.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">
                              {job.status} — {new Date(job.created_at).toLocaleTimeString()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PlatformLayout>
  );
};

export default AnalysisHistory;
