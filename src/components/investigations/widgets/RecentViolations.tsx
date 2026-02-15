import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, BookOpen, Clock } from "lucide-react";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export const RecentViolations = () => {
  const { data: discrepancies } = useExtractedDiscrepancies();
  const { t } = useTranslation();

  const recentViolations = (discrepancies || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 border-red-500/30 text-red-500";
      case "high": return "bg-orange-500/10 border-orange-500/30 text-orange-500";
      case "medium": return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500";
      default: return "bg-blue-500/10 border-blue-500/30 text-blue-500";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {t('widgets.recentViolations')}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {discrepancies?.length || 0} {t('widgets.total')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[220px]">
          {recentViolations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('widgets.noViolationsDetected')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentViolations.map((violation) => (
                <div key={violation.id} className={`p-3 rounded-lg border ${getSeverityStyle(violation.severity)}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] ${getSeverityStyle(violation.severity)}`}>
                      {violation.severity}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {format(new Date(violation.created_at), "MMM d")}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{violation.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{violation.description}</p>
                  {violation.legal_reference && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <BookOpen className="w-3 h-3" />
                      <span className="truncate">{violation.legal_reference}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};