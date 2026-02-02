import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, AlertCircle, Info } from "lucide-react";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";

export const SeverityMeter = () => {
  const { data: discrepancies } = useExtractedDiscrepancies();

  const severityCounts = {
    critical: (discrepancies || []).filter(d => d.severity === "critical").length,
    high: (discrepancies || []).filter(d => d.severity === "high").length,
    medium: (discrepancies || []).filter(d => d.severity === "medium").length,
    low: (discrepancies || []).filter(d => d.severity === "low").length,
  };

  const total = Object.values(severityCounts).reduce((a, b) => a + b, 0);
  
  const severityConfig = [
    { 
      level: "critical", 
      label: "Critical", 
      count: severityCounts.critical, 
      icon: AlertTriangle,
      color: "bg-red-500 text-white",
      barColor: "bg-red-500",
    },
    { 
      level: "high", 
      label: "High", 
      count: severityCounts.high, 
      icon: AlertCircle,
      color: "bg-orange-500 text-white",
      barColor: "bg-orange-500",
    },
    { 
      level: "medium", 
      label: "Medium", 
      count: severityCounts.medium, 
      icon: Shield,
      color: "bg-yellow-500 text-white",
      barColor: "bg-yellow-500",
    },
    { 
      level: "low", 
      label: "Low", 
      count: severityCounts.low, 
      icon: Info,
      color: "bg-blue-500 text-white",
      barColor: "bg-blue-500",
    },
  ];

  // Calculate threat level
  const threatScore = severityCounts.critical * 4 + severityCounts.high * 3 + severityCounts.medium * 2 + severityCounts.low;
  const maxScore = total * 4;
  const threatLevel = maxScore > 0 ? Math.round((threatScore / maxScore) * 100) : 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Severity Analysis
          </CardTitle>
          <Badge 
            variant={threatLevel > 70 ? "destructive" : threatLevel > 40 ? "secondary" : "outline"}
            className="text-xs"
          >
            Threat Level: {threatLevel}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Severity Bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-4">
          {severityConfig.map((sev) => {
            const width = total > 0 ? (sev.count / total) * 100 : 0;
            return (
              <div
                key={sev.level}
                className={`${sev.barColor} transition-all`}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>

        {/* Severity Counts */}
        <div className="grid grid-cols-2 gap-2">
          {severityConfig.map((sev) => {
            const Icon = sev.icon;
            return (
              <div
                key={sev.level}
                className="flex items-center justify-between p-2 rounded-lg bg-accent/30"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${sev.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm">{sev.label}</span>
                </div>
                <span className="font-bold">{sev.count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
