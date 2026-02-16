import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, ChevronRight, Lightbulb } from "lucide-react";
import { keyFindings, severityColors, findingCategoryColors } from "@/data/keyFindingsData";
import { useTranslation } from "react-i18next";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

export const KeyFindingsGrid = () => {
  const { selectedCaseId } = useCaseFilter();
  // Static findings only shown for "All Cases"
  const displayFindings = selectedCaseId ? [] : keyFindings.slice(0, 6);
  const { t } = useTranslation();

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
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayFindings.map((finding, index) => {
          const Icon = finding.icon;
          return (
            <Card 
              key={finding.id} 
              className="glass-card card-hover opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2 rounded-lg ${findingCategoryColors[finding.category]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge className={`${severityColors[finding.severity]} text-[10px] font-medium`} variant="secondary">
                    {finding.severity.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium mt-3 leading-snug line-clamp-2 text-foreground/90">
                  {finding.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-foreground/70 mb-3 line-clamp-2 leading-relaxed">{finding.summary}</p>
                <ul className="space-y-1.5">
                  {finding.details.slice(0, 2).map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                      <span className="line-clamp-1">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};