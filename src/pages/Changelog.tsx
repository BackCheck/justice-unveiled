import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useChangelog } from "@/hooks/useChangelog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Timeline } from "@/components/ui/timeline";
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

  const timelineData = (entries || []).map((entry) => {
    const config = categoryConfig[entry.category] || categoryConfig.improvement;

    return {
      title: `v${entry.version}`,
      content: (
        <div className="space-y-3 pb-8">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={config.color}>
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(parseISO(entry.release_date), "MMM d, yyyy")}
            </span>
          </div>

          {/* Title & description */}
          <div>
            <h4 className="text-lg font-semibold text-foreground">{entry.title}</h4>
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
        </div>
      ),
    };
  });

  return (
    <PlatformLayout>
      {isLoading ? (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Timeline data={timelineData} />
      )}
    </PlatformLayout>
  );
};

export default Changelog;
