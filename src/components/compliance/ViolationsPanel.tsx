import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  Scale, 
  Clock,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import type { ComplianceViolation } from "@/types/compliance";
import { severityConfig } from "@/types/compliance";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ViolationsPanelProps {
  violations: ComplianceViolation[];
  loading?: boolean;
}

export const ViolationsPanel = ({ violations, loading }: ViolationsPanelProps) => {
  const unresolvedViolations = violations.filter(v => !v.resolved);
  const criticalCount = unresolvedViolations.filter(v => v.severity === 'critical').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Flagged Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg border">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (violations.length === 0) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
          <h3 className="font-medium text-emerald-700 dark:text-emerald-300">No Violations Detected</h3>
          <p className="text-sm text-muted-foreground text-center mt-1">
            All checked procedures are compliant
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200",
      criticalCount > 0 && "border-destructive/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className={cn(
              "w-5 h-5",
              criticalCount > 0 ? "text-destructive" : "text-orange-500"
            )} />
            Flagged Violations
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Critical</Badge>
            )}
            <Badge variant="secondary">{unresolvedViolations.length} Unresolved</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {violations.map((violation) => {
              const severityCfg = severityConfig[violation.severity];
              
              return (
                <div 
                  key={violation.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    severityCfg.bgColor,
                    violation.resolved && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", severityCfg.bgColor, severityCfg.color)}
                      >
                        {severityCfg.label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {violation.violation_type}
                      </Badge>
                      {violation.resolved && (
                        <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-700">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(violation.flagged_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm mb-1">{violation.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{violation.description}</p>

                  {violation.legal_consequence && (
                    <div className="flex items-start gap-2 p-2 rounded bg-background/50 border">
                      <Scale className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Legal Consequence:</span>
                        <p className="text-xs text-foreground">{violation.legal_consequence}</p>
                      </div>
                    </div>
                  )}

                  {violation.flagged_by === 'ai_detection' && (
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      Flagged by AI auto-detection
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
