import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend,
  Tooltip
} from "recharts";
import { TrendingDown, Clock, DollarSign } from "lucide-react";
import type { FinancialLoss, TimeTrackingEntry } from "@/types/regulatory-harm";
import { lossCategoryConfig } from "@/types/regulatory-harm";

interface FinancialSummaryCardProps {
  losses: FinancialLoss[];
  timeEntries: TimeTrackingEntry[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `PKR ${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `PKR ${(amount / 1000).toFixed(1)}K`;
  return `PKR ${amount.toLocaleString()}`;
};

export const FinancialSummaryCard = ({ losses, timeEntries }: FinancialSummaryCardProps) => {
  // Aggregate by category
  const categoryTotals = losses.reduce((acc, loss) => {
    const cat = loss.loss_category;
    acc[cat] = (acc[cat] || 0) + Number(loss.amount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: lossCategoryConfig[category as keyof typeof lossCategoryConfig]?.label || category,
    value: amount
  }));

  const totalLoss = losses.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalTimeHours = timeEntries.reduce((sum, t) => sum + Number(t.hours_spent), 0);
  const totalTimeCost = timeEntries.reduce((sum, t) => sum + Number(t.total_cost || 0), 0);
  const documentedLosses = losses.filter(l => l.is_documented).reduce((s, l) => s + Number(l.amount), 0);
  const estimatedLosses = losses.filter(l => l.is_estimated).reduce((s, l) => s + Number(l.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingDown className="w-5 h-5 text-destructive" />
          Financial Impact Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <DollarSign className="w-6 h-6 mx-auto text-destructive mb-1" />
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalLoss)}</div>
            <div className="text-xs text-muted-foreground">Total Financial Loss</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Clock className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{totalTimeHours.toFixed(1)} hrs</div>
            <div className="text-xs text-muted-foreground">Time Spent</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <DollarSign className="w-6 h-6 mx-auto text-purple-500 mb-1" />
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalTimeCost)}</div>
            <div className="text-xs text-muted-foreground">Time Cost</div>
          </div>
        </div>

        {/* Breakdown badges */}
        <div className="flex gap-3 flex-wrap">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            Documented: {formatCurrency(documentedLosses)}
          </Badge>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-300">
            Estimated: {formatCurrency(estimatedLosses)}
          </Badge>
          <Badge variant="secondary">
            {losses.length} loss entries
          </Badge>
        </div>

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category breakdown list */}
        <div className="space-y-2">
          {Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
              const config = lossCategoryConfig[category as keyof typeof lossCategoryConfig];
              const percentage = totalLoss > 0 ? ((amount / totalLoss) * 100).toFixed(1) : '0';
              return (
                <div key={category} className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className={config?.color || ''}>
                    {config?.label || category}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{percentage}%</span>
                    <span className="font-semibold">{formatCurrency(amount)}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
