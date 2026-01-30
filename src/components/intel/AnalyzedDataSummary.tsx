import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Users, 
  AlertTriangle, 
  Sparkles,
  Building2,
  User,
  Scale,
  FileWarning,
  Clock,
  TrendingUp
} from "lucide-react";
import { 
  useExtractedEvents, 
  useExtractedEntities, 
  useExtractedDiscrepancies,
  useAnalysisJobs
} from "@/hooks/useExtractedEvents";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  "Business Interference": "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "Harassment": "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  "Legal Proceeding": "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  "Criminal Allegation": "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
};

const entityTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Person": User,
  "Organization": Building2,
  "Official Body": Scale,
  "Legal Entity": Scale
};

const severityColors: Record<string, string> = {
  "critical": "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  "high": "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  "medium": "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  "low": "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
};

export const AnalyzedDataSummary = () => {
  const { data: events, isLoading: eventsLoading } = useExtractedEvents();
  const { data: entities, isLoading: entitiesLoading } = useExtractedEntities();
  const { data: discrepancies, isLoading: discrepanciesLoading } = useExtractedDiscrepancies();
  const { data: jobs, isLoading: jobsLoading } = useAnalysisJobs();

  const isLoading = eventsLoading || entitiesLoading || discrepanciesLoading || jobsLoading;

  const hasData = (events?.length || 0) + (entities?.length || 0) + (discrepancies?.length || 0) > 0;

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!hasData) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No Analyzed Data Yet</h3>
            <p className="text-sm max-w-md mx-auto">
              Use the AI Document Analyzer above to extract events, entities, and discrepancies from your case documents.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const completedJobs = jobs?.filter(j => j.status === "completed").length || 0;
  const totalEvents = events?.length || 0;
  const totalEntities = entities?.length || 0;
  const totalDiscrepancies = discrepancies?.length || 0;
  const criticalDiscrepancies = discrepancies?.filter(d => d.severity === "critical").length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          icon={FileWarning} 
          label="Documents Analyzed" 
          value={completedJobs} 
          color="primary"
        />
        <StatCard 
          icon={Calendar} 
          label="Events Extracted" 
          value={totalEvents} 
          color="blue"
        />
        <StatCard 
          icon={Users} 
          label="Entities Found" 
          value={totalEntities} 
          color="emerald"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Discrepancies" 
          value={totalDiscrepancies} 
          color="amber"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Critical Issues" 
          value={criticalDiscrepancies} 
          color="red"
        />
      </div>

      {/* Data Lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-primary" />
                Extracted Events
              </span>
              <Badge variant="secondary">{totalEvents}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {events?.length === 0 ? (
                <EmptyState message="No events extracted" />
              ) : (
                <div className="space-y-3">
                  {events?.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </Badge>
                        <Badge className={cn("text-xs border", categoryColors[event.category])}>
                          {event.category}
                        </Badge>
                      </div>
                      <p className="text-sm line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3" />
                        <span>{Math.round((event.confidence_score || 0.85) * 100)}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Entities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-emerald-500" />
                Extracted Entities
              </span>
              <Badge variant="secondary">{totalEntities}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {entities?.length === 0 ? (
                <EmptyState message="No entities extracted" />
              ) : (
                <div className="space-y-3">
                  {entities?.map((entity) => {
                    const Icon = entityTypeIcons[entity.entity_type] || User;
                    return (
                      <div 
                        key={entity.id} 
                        className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-emerald-500/10">
                            <Icon className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{entity.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {entity.entity_type}
                              </Badge>
                              {entity.role && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {entity.role}
                                </span>
                              )}
                            </div>
                            {entity.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {entity.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Discrepancies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Discrepancies
              </span>
              <Badge variant="secondary">{totalDiscrepancies}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {discrepancies?.length === 0 ? (
                <EmptyState message="No discrepancies found" />
              ) : (
                <div className="space-y-3">
                  {discrepancies?.map((discrepancy) => (
                    <div 
                      key={discrepancy.id} 
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn("text-xs border", severityColors[discrepancy.severity])}>
                          {discrepancy.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {discrepancy.discrepancy_type}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{discrepancy.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {discrepancy.description}
                      </p>
                      {discrepancy.legal_reference && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                          <Scale className="w-3 h-3" />
                          <span>{discrepancy.legal_reference}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analysis Jobs */}
      {jobs && jobs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Recent Analysis Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <div 
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={job.status === "completed" ? "default" : job.status === "failed" ? "destructive" : "secondary"}
                    >
                      {job.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {job.events_extracted !== null && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {job.events_extracted}
                      </span>
                    )}
                    {job.entities_extracted !== null && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {job.entities_extracted}
                      </span>
                    )}
                    {job.discrepancies_extracted !== null && (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {job.discrepancies_extracted}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: number;
  color: "primary" | "blue" | "emerald" | "amber" | "red";
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
    red: "bg-red-500/10 text-red-500"
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
    <Sparkles className="w-8 h-8 mb-2 opacity-20" />
    <p className="text-sm">{message}</p>
  </div>
);
