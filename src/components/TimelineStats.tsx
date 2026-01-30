import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, AlertOctagon, Scale, FileWarning } from "lucide-react";
import { timelineData, TimelineEvent } from "@/data/timelineData";

export const TimelineStats = () => {
  const getCategoryCount = (category: TimelineEvent["category"]) => 
    timelineData.filter(e => e.category === category).length;

  const stats = [
    {
      label: "Business Interference",
      count: getCategoryCount("Business Interference"),
      icon: Briefcase,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10"
    },
    {
      label: "Harassment",
      count: getCategoryCount("Harassment"),
      icon: AlertOctagon,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10"
    },
    {
      label: "Legal Proceedings",
      count: getCategoryCount("Legal Proceeding"),
      icon: Scale,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10"
    },
    {
      label: "Criminal Allegations",
      count: getCategoryCount("Criminal Allegation"),
      icon: FileWarning,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden glass-card hover:shadow-professional-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
