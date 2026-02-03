import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  TrendingUp
} from "lucide-react";
import type { ComplianceStats } from "@/types/compliance";
import { cn } from "@/lib/utils";

interface ComplianceStatsHeaderProps {
  stats: ComplianceStats | null;
  loading?: boolean;
}

export const ComplianceStatsHeader = ({ stats, loading }: ComplianceStatsHeaderProps) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
      label: 'Compliance Rate',
      value: `${stats.overallComplianceRate}%`,
      icon: TrendingUp,
      color: stats.overallComplianceRate >= 70 ? 'text-emerald-500' : stats.overallComplianceRate >= 40 ? 'text-orange-500' : 'text-destructive',
      showProgress: true,
      progress: stats.overallComplianceRate
    },
    {
      label: 'Compliant',
      value: stats.compliant,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      label: 'Violated',
      value: stats.violated,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      label: 'Critical Issues',
      value: stats.criticalViolations,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      highlight: stats.criticalViolations > 0
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    },
    {
      label: 'Total Checks',
      value: stats.totalRequirements,
      icon: Shield,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card 
              key={index} 
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                item.highlight && "border-destructive/50 animate-pulse"
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
                {item.showProgress && (
                  <Progress 
                    value={item.progress} 
                    className="h-1.5 mt-2"
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Breakdown */}
      {stats.byCategory.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Compliance by Category</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {stats.byCategory.map((cat) => (
                <div 
                  key={cat.category} 
                  className="p-3 rounded-lg border bg-card/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium truncate">{cat.label}</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        cat.complianceRate >= 70 
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" 
                          : cat.complianceRate >= 40 
                            ? "bg-orange-500/20 text-orange-700 dark:text-orange-300"
                            : "bg-destructive/20 text-destructive"
                      )}
                    >
                      {cat.complianceRate}%
                    </Badge>
                  </div>
                  <Progress value={cat.complianceRate} className="h-1" />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{cat.compliant}/{cat.total}</span>
                    {cat.violated > 0 && (
                      <span className="text-destructive">{cat.violated} violated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
