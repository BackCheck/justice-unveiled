import { Card, CardContent } from "@/components/ui/card";
import { violationStats } from "@/data/violationsData";
import { 
  AlertTriangle, 
  Scale, 
  Globe, 
  Building2,
  Shield,
  FileWarning
} from "lucide-react";

const stats = [
  {
    label: "Local Violations",
    value: violationStats.local.total,
    icon: Scale,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10"
  },
  {
    label: "International Violations",
    value: violationStats.international.total,
    icon: Globe,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10"
  },
  {
    label: "Critical Issues",
    value: violationStats.local.critical + violationStats.international.critical,
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10"
  },
  {
    label: "UN Frameworks",
    value: violationStats.frameworks.UN,
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    label: "EU Frameworks",
    value: violationStats.frameworks.EU,
    icon: Building2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10"
  },
  {
    label: "OIC Frameworks",
    value: violationStats.frameworks.OIC,
    icon: FileWarning,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10"
  }
];

export const ViolationStatsHeader = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
