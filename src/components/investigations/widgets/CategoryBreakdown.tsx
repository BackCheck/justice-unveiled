import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Scale, Gavel, AlertCircle, Briefcase } from "lucide-react";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { useTranslation } from "react-i18next";

const categoryConfig = {
  "Legal Proceeding": { icon: Gavel, color: "text-blue-500", bg: "bg-blue-500" },
  "Harassment": { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500" },
  "Criminal Allegation": { icon: Scale, color: "text-orange-500", bg: "bg-orange-500" },
  "Business Interference": { icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500" },
};

export const CategoryBreakdown = () => {
  const { stats } = useCombinedTimeline();
  const { t } = useTranslation();
  const total = stats.total;

  const categories = Object.entries(stats.byCategory)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      ...categoryConfig[name as keyof typeof categoryConfig],
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          {t('widgets.eventCategories')}
          <Badge variant="secondary" className="ml-auto text-xs">{total} {t('widgets.total')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((cat) => {
          const Icon = cat.icon || BarChart3;
          return (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{cat.count}</span>
                  <span className="text-xs text-muted-foreground">({cat.percentage}%)</span>
                </div>
              </div>
              <Progress value={cat.percentage} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};