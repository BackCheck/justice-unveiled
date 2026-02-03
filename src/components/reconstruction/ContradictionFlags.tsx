import { ContradictionFlag } from "@/types/reconstruction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, FileWarning, Users, Calendar, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContradictionFlagsProps {
  contradictions: ContradictionFlag[];
  onContradictionClick?: (contradiction: ContradictionFlag) => void;
}

const TYPE_LABELS: Record<string, string> = {
  testimony: "Testimony",
  timeline: "Timeline",
  evidence: "Evidence",
  procedural: "Procedural",
};

const TYPE_ICONS: Record<string, typeof AlertTriangle> = {
  testimony: Users,
  timeline: Calendar,
  evidence: FileWarning,
  procedural: Link2,
};

const SEVERITY_COLORS: Record<string, string> = {
  major: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  significant: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  minor: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
};

export const ContradictionFlags = ({ contradictions, onContradictionClick }: ContradictionFlagsProps) => {
  const sortedContradictions = [...contradictions].sort((a, b) => {
    const severityOrder = { major: 0, significant: 1, minor: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const stats = {
    total: contradictions.length,
    major: contradictions.filter(c => c.severity === "major").length,
    significant: contradictions.filter(c => c.severity === "significant").length,
    byType: {
      testimony: contradictions.filter(c => c.type === "testimony").length,
      evidence: contradictions.filter(c => c.type === "evidence").length,
      timeline: contradictions.filter(c => c.type === "timeline").length,
      procedural: contradictions.filter(c => c.type === "procedural").length,
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Contradiction Flags
        </CardTitle>
        <CardDescription>
          Inconsistencies detected across events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.major}</p>
            <p className="text-xs text-muted-foreground">Major</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-500/10">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.significant}</p>
            <p className="text-xs text-muted-foreground">Significant</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{stats.byType.evidence}</p>
            <p className="text-xs text-muted-foreground">Evidence</p>
          </div>
        </div>

        {/* Contradiction List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-4">
            {sortedContradictions.map(contradiction => {
              const Icon = TYPE_ICONS[contradiction.type] || AlertTriangle;
              
              return (
                <Card 
                  key={contradiction.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    contradiction.severity === "major" && "border-red-500/50 bg-red-500/5",
                    contradiction.severity === "significant" && "border-orange-500/50 bg-orange-500/5"
                  )}
                  onClick={() => onContradictionClick?.(contradiction)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        contradiction.severity === "major" && "bg-red-500/20",
                        contradiction.severity === "significant" && "bg-orange-500/20",
                        contradiction.severity === "minor" && "bg-yellow-500/20"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4",
                          contradiction.severity === "major" && "text-red-600",
                          contradiction.severity === "significant" && "text-orange-600",
                          contradiction.severity === "minor" && "text-yellow-600"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {TYPE_LABELS[contradiction.type]}
                          </Badge>
                          <Badge className={`${SEVERITY_COLORS[contradiction.severity]} text-xs border`}>
                            {contradiction.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1 font-medium">{contradiction.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{contradiction.details}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {contradictions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No contradictions detected</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
