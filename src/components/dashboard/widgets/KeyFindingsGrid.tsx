import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, ChevronRight, Lightbulb, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";

const severityColors: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-500 text-white",
  medium: "bg-blue-500 text-white",
};

const severityIcons: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  high: AlertCircle,
  medium: Info,
};

const categoryColors: Record<string, string> = {
  procedural: "bg-red-500/10 text-red-700 border-red-200",
  forensic: "bg-amber-500/10 text-amber-700 border-amber-200",
  timeline: "bg-blue-500/10 text-blue-700 border-blue-200",
  evidence: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  default: "bg-muted text-muted-foreground border-border",
};

export const KeyFindingsGrid = () => {
  const { selectedCaseId } = useCaseFilter();
  const { data: discrepancies } = useExtractedDiscrepancies(selectedCaseId);
  const { t } = useTranslation();

  const displayFindings = (discrepancies || []).slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t('dashboard.keyIntelFindings')}</h2>
        </div>
        <Link to="/evidence">
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
            {t('dashboard.viewAll')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      
      {displayFindings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No discrepancies found. Upload and analyze documents to generate findings.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayFindings.map((finding, index) => {
            const Icon = severityIcons[finding.severity] || Info;
            const catColor = categoryColors[finding.discrepancy_type] || categoryColors.default;
            const sevColor = severityColors[finding.severity] || severityColors.medium;
            return (
              <div 
                key={finding.id} 
                className="stat-card p-0 opacity-0 animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-2 rounded-xl ${catColor} transition-transform group-hover:scale-110`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge className={`${sevColor} text-[10px] font-medium`} variant="secondary">
                      {finding.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-medium mt-3 leading-snug line-clamp-2 text-foreground/90">
                    {finding.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-foreground/70 mb-3 line-clamp-3 leading-relaxed">{finding.description}</p>
                  {finding.legal_reference && (
                    <>
                      <div className="section-divider mb-3" />
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-medium">Ref:</span> {finding.legal_reference}
                      </p>
                    </>
                  )}
                </CardContent>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
