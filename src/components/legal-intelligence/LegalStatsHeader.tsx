import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Scale, Gavel, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import type { LegalIntelligenceStats } from "@/types/legal-intelligence";

interface LegalStatsHeaderProps {
  stats: LegalIntelligenceStats;
}

export const LegalStatsHeader = ({ stats }: LegalStatsHeaderProps) => {
  const statCards = [
    {
      label: "Linked Statutes",
      value: stats.linkedStatutes,
      total: stats.totalStatutes,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Case Precedents",
      value: stats.linkedPrecedents,
      icon: Gavel,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Doctrines Applied",
      value: stats.linkedDoctrines,
      icon: Scale,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Open Issues",
      value: stats.openIssues,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Draft Summaries",
      value: stats.draftSummaries,
      icon: FileText,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Finalized",
      value: stats.finalizedSummaries,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stat.value}
                  {stat.total && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /{stat.total}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
