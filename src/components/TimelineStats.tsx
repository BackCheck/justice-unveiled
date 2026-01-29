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
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20"
    },
    {
      label: "Harassment",
      count: getCategoryCount("Harassment"),
      icon: AlertOctagon,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-500/10 dark:bg-red-500/20"
    },
    {
      label: "Legal Proceedings",
      count: getCategoryCount("Legal Proceeding"),
      icon: Scale,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20"
    },
    {
      label: "Criminal Allegations",
      count: getCategoryCount("Criminal Allegation"),
      icon: FileWarning,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
