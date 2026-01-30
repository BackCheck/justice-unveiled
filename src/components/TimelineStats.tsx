import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, AlertOctagon, Scale, FileWarning } from "lucide-react";
import { timelineData, TimelineEvent } from "@/data/timelineData";
import { cn } from "@/lib/utils";

export const TimelineStats = () => {
  const getCategoryCount = (category: TimelineEvent["category"]) => 
    timelineData.filter(e => e.category === category).length;

  const stats = [
    {
      label: "Business Interference",
      count: getCategoryCount("Business Interference"),
      icon: Briefcase,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      hoverBg: "group-hover:bg-chart-1/20"
    },
    {
      label: "Harassment",
      count: getCategoryCount("Harassment"),
      icon: AlertOctagon,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      hoverBg: "group-hover:bg-chart-4/20"
    },
    {
      label: "Legal Proceedings",
      count: getCategoryCount("Legal Proceeding"),
      icon: Scale,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      hoverBg: "group-hover:bg-chart-2/20"
    },
    {
      label: "Criminal Allegations",
      count: getCategoryCount("Criminal Allegation"),
      icon: FileWarning,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      hoverBg: "group-hover:bg-chart-3/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className={cn(
            "overflow-hidden glass-card stat-card group cursor-default",
            "opacity-0 animate-fade-in-up",
          )}
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-full transition-all duration-300",
                stat.bgColor,
                stat.hoverBg,
                "stat-icon"
              )}>
                <stat.icon className={cn("w-5 h-5 transition-transform duration-300", stat.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-primary stat-number">{stat.count}</p>
                  <span 
                    className={cn(
                      "pill-stat h-2 bg-current opacity-40 transition-all duration-500",
                      stat.color,
                      "group-hover:opacity-70"
                    )} 
                    style={{ width: `${Math.max(stat.count * 3, 12)}px` }} 
                  />
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {stat.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
