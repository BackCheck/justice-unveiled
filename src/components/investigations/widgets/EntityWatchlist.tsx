import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, ChevronRight, Target, Shield, User } from "lucide-react";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const EntityWatchlist = () => {
  const { entities } = useCombinedEntities();
  const { t } = useTranslation();

  const antagonists = entities.filter(e => e.category === "antagonist");
  const officials = entities.filter(e => e.category === "official").slice(0, 3);
  const protagonists = entities.filter(e => e.category === "protagonist").slice(0, 3);

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "antagonist": return { icon: Target, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
      case "official": return { icon: Shield, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" };
      case "protagonist": return { icon: User, color: "text-chart-2", bg: "bg-chart-2/10", border: "border-chart-2/30" };
      default: return { icon: Users, color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border" };
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-destructive" />
            {t('widgets.entityWatchlist')}
          </CardTitle>
          <Link to="/network">
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
              {t('widgets.viewAllEntities')} <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            <div className="mb-3">
              <Badge variant="destructive" className="text-[10px] mb-2">
                {t('widgets.antagonistsLabel')} ({antagonists.length})
              </Badge>
              <div className="space-y-1.5">
                {antagonists.slice(0, 5).map((entity) => {
                  const style = getCategoryStyle(entity.category);
                  return (
                    <div key={entity.id} className={`flex items-center gap-2 p-2 rounded-lg ${style.bg} border ${style.border}`}>
                      <div className={`w-7 h-7 rounded-full ${style.bg} flex items-center justify-center`}>
                        <span className={`text-xs font-bold ${style.color}`}>{entity.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entity.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{entity.role || entity.type}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {officials.length > 0 && (
              <div className="mb-3">
                <Badge variant="secondary" className="text-[10px] mb-2">{t('widgets.keyOfficials')}</Badge>
                <div className="flex flex-wrap gap-1.5">
                  {officials.map((entity) => (
                    <Badge key={entity.id} variant="outline" className="text-xs">{entity.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {protagonists.length > 0 && (
              <div>
                <Badge variant="secondary" className="text-[10px] mb-2 bg-primary/10 text-primary">{t('widgets.protectedPersons')}</Badge>
                <div className="flex flex-wrap gap-1.5">
                  {protagonists.map((entity) => (
                    <Badge key={entity.id} variant="outline" className="text-xs border-primary/30">{entity.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};