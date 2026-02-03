import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle,
  FileWarning,
  TrendingUp
} from "lucide-react";
import type { CorrelationAnalysis } from "@/types/correlation";

interface CorrelationStatsProps {
  analysis: CorrelationAnalysis;
}

export const CorrelationStats = ({ analysis }: CorrelationStatsProps) => {
  const stats = [
    {
      label: "Total Claims",
      value: analysis.totalClaims,
      icon: Scale,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Supported",
      value: analysis.supportedClaims,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Unsupported",
      value: analysis.unsupportedClaims,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Partial",
      value: analysis.partiallySupported,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Unverified",
      value: analysis.unverifiedClaims,
      icon: HelpCircle,
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
    },
    {
      label: "Missing Evidence",
      value: analysis.missingMandatoryEvidence,
      icon: FileWarning,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Support Score Gauge */}
      <Card className="col-span-2 md:col-span-3 lg:col-span-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium">Average Support Score</span>
            </div>
            <div className="flex-1 max-w-md">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all"
                  style={{ width: `${analysis.averageSupportScore}%` }}
                />
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4">
              {analysis.averageSupportScore.toFixed(0)}%
            </Badge>
            
            {/* Claim type breakdown */}
            <div className="flex items-center gap-4 border-l pl-4">
              <div className="text-center">
                <Badge className="bg-red-600 text-white">{analysis.claimsByType.criminal}</Badge>
                <p className="text-xs text-muted-foreground mt-1">Criminal</p>
              </div>
              <div className="text-center">
                <Badge className="bg-blue-600 text-white">{analysis.claimsByType.regulatory}</Badge>
                <p className="text-xs text-muted-foreground mt-1">Regulatory</p>
              </div>
              <div className="text-center">
                <Badge className="bg-purple-600 text-white">{analysis.claimsByType.civil}</Badge>
                <p className="text-xs text-muted-foreground mt-1">Civil</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
