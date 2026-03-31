import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FLOW_DATA = [
  { label: "Total Revenue Inflow", amount: "100%", color: "hsl(var(--chart-2))", width: "100%" },
  { label: "Legitimate Operations", amount: "~62%", color: "hsl(var(--muted-foreground))", width: "62%", indent: true },
  { label: "Imran → UK Wise Account", amount: "PKR 15.8M", color: "hsl(var(--destructive))", width: "38%", indent: true, leak: true },
  { label: "Dilawar → Cash Withdrawals", amount: "PKR 2.3M", color: "hsl(var(--destructive))", width: "18%", indent: true, leak: true },
  { label: "Zubair → UBL Visa Platinum", amount: "PKR 450K+", color: "hsl(var(--chart-4))", width: "8%", indent: true, leak: true },
  { label: "Ghost Payroll (Sumaiyyah et al.)", amount: "PKR 680K+", color: "hsl(var(--chart-4))", width: "10%", indent: true, leak: true },
  { label: "Unauthorized Increments (15-35%)", amount: "PKR 1.2M+", color: "hsl(var(--chart-1))", width: "12%", indent: true, leak: true },
];

export const FinancialSankeyWidget = () => {
  return (
    <Card className="glass-card border-destructive/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            Financial Hemorrhage — Fund Flow Analysis
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            CRITICAL
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <TooltipProvider>
          {FLOW_DATA.map((item, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className={`space-y-1 ${item.indent ? "pl-4" : ""}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${item.leak ? "text-destructive" : "text-foreground"}`}>
                      {item.leak && "⚠ "}{item.label}
                    </span>
                    <span className="font-mono text-muted-foreground">{item.amount}</span>
                  </div>
                  <div className="h-4 rounded bg-muted/30 relative overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-1000 ease-out"
                      style={{
                        width: item.width,
                        background: item.leak
                          ? `repeating-linear-gradient(45deg, ${item.color}, ${item.color} 4px, transparent 4px, transparent 8px)`
                          : item.color,
                        opacity: item.leak ? 0.8 : 0.6,
                      }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.amount}</p>
                {item.leak && <p className="text-xs text-destructive mt-1">Unauthorized fund diversion detected</p>}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Estimated Leakage</span>
            <span className="font-mono font-bold text-destructive">PKR 20.43M+</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">Leakage Channels</span>
            <span className="font-mono text-chart-4">5 vectors identified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
