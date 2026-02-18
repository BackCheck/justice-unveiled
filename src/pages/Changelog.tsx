import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useChangelog } from "@/hooks/useChangelog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Rocket, 
  Sparkles, 
  Wrench, 
  Star, 
  CheckCircle2, 
  Calendar,
  Tag
} from "lucide-react";
import { format, parseISO } from "date-fns";

const categoryConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  major: { label: "Major Release", icon: Rocket, color: "bg-primary/10 text-primary border-primary/20" },
  feature: { label: "New Feature", icon: Sparkles, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  improvement: { label: "Improvement", icon: Wrench, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  fix: { label: "Bug Fix", icon: Star, color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

const Changelog = () => {
  const { data: entries, isLoading } = useChangelog();

  return (
    <PlatformLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Changelog</h1>
              <p className="text-sm text-muted-foreground">Feature releases, improvements, and platform updates</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border hidden md:block" />

            <div className="space-y-6">
              {entries?.map((entry) => {
                const config = categoryConfig[entry.category] || categoryConfig.improvement;
                const Icon = config.icon;

                return (
                  <div key={entry.id} className="relative flex gap-4 md:gap-6">
                    {/* Timeline dot */}
                    <div className="hidden md:flex flex-col items-center pt-1 shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Content card */}
                    <Card className="flex-1">
                      <CardContent className="p-5 space-y-3">
                        {/* Header row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            v{entry.version}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(entry.release_date), "MMM d, yyyy")}
                          </span>
                        </div>

                        {/* Title & description */}
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{entry.title}</h3>
                          {entry.description && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                          )}
                        </div>

                        {/* Changes list */}
                        {entry.changes.length > 0 && (
                          <ul className="space-y-1.5">
                            {entry.changes.map((change, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  );
};

export default Changelog;
