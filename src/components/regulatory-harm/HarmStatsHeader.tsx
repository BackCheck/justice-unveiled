import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  FileWarning,
  CheckCircle
} from "lucide-react";
import type { HarmStatistics } from "@/types/regulatory-harm";
import { cn } from "@/lib/utils";

interface HarmStatsHeaderProps {
  stats: HarmStatistics | null;
  loading?: boolean;
}

const formatCurrency = (amount: number, currency: string = 'PKR') => {
  if (amount >= 1000000) {
    return `${currency} ${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${currency} ${(amount / 1000).toFixed(1)}K`;
  }
  return `${currency} ${amount.toLocaleString()}`;
};

export const HarmStatsHeader = ({ stats, loading }: HarmStatsHeaderProps) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Financial Loss',
      value: formatCurrency(stats.totalFinancialLoss),
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      highlight: stats.totalFinancialLoss > 0
    },
    {
      label: 'Active Incidents',
      value: stats.activeIncidents,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      label: 'Total Incidents',
      value: stats.totalIncidents,
      icon: FileWarning,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Time Spent',
      value: `${stats.totalTimeSpent.toFixed(1)} hrs`,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Time Cost',
      value: formatCurrency(stats.totalTimeCost),
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Resolved',
      value: stats.byStatus.resolved || 0,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card 
            key={index} 
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              item.highlight && "border-destructive/50"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {item.label}
                </span>
                <div className={cn("p-1.5 rounded-full", item.bgColor)}>
                  <Icon className={cn("w-3.5 h-3.5", item.color)} />
                </div>
              </div>
              <div className={cn("text-2xl font-bold", item.color)}>
                {item.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
