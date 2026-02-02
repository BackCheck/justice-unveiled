import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  Scale,
  Clock,
  FileText,
  Zap,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";

interface RiskFactor {
  id: string;
  category: string;
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  description: string;
  mitigations: string[];
}

interface RiskCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  score: number;
  factors: RiskFactor[];
}

export const RiskAssessment = () => {
  const { entities, connections } = useCombinedEntities();
  const { events } = useCombinedTimeline();
  const { data: discrepancies } = useExtractedDiscrepancies();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate risk scores
  const riskCategories = useMemo<RiskCategory[]>(() => {
    // Threat Actor Risk
    const antagonists = entities.filter(e => e.category === "antagonist");
    const threatScore = Math.min(100, antagonists.length * 15 + connections.length * 2);
    
    // Procedural Risk
    const criticalDiscrepancies = (discrepancies || []).filter(d => d.severity === "critical");
    const highDiscrepancies = (discrepancies || []).filter(d => d.severity === "high");
    const proceduralScore = Math.min(100, criticalDiscrepancies.length * 25 + highDiscrepancies.length * 15);

    // Legal Risk
    const legalEvents = events.filter(e => e.category === "Legal Proceeding");
    const criminalEvents = events.filter(e => e.category === "Criminal Allegation");
    const legalScore = Math.min(100, (criminalEvents.length * 20) + (legalEvents.length * 5));

    // Evidence Risk
    const evidenceIssues = (discrepancies || []).filter(d => 
      d.discrepancy_type === "Chain of Custody" || d.discrepancy_type === "Document Forgery"
    );
    const evidenceScore = Math.min(100, evidenceIssues.length * 30);

    return [
      {
        id: "threat",
        name: "Threat Actor Risk",
        icon: Shield,
        color: "text-red-500",
        score: threatScore,
        factors: [
          {
            id: "antagonist-count",
            category: "threat",
            name: "Identified Antagonists",
            score: antagonists.length * 15,
            trend: "stable",
            description: `${antagonists.length} hostile entities identified with coordinated actions`,
            mitigations: [
              "Document all interactions thoroughly",
              "Maintain communication records",
              "Establish witness corroboration",
            ],
          },
          {
            id: "network-density",
            category: "threat",
            name: "Network Coordination",
            score: Math.min(40, connections.length * 3),
            trend: "up",
            description: "High interconnection between threat actors suggests coordination",
            mitigations: [
              "Map all entity relationships",
              "Identify command structure",
              "Track communication patterns",
            ],
          },
        ],
      },
      {
        id: "procedural",
        name: "Procedural Violation Risk",
        icon: Scale,
        color: "text-orange-500",
        score: proceduralScore,
        factors: [
          {
            id: "critical-violations",
            category: "procedural",
            name: "Critical Violations",
            score: criticalDiscrepancies.length * 25,
            trend: criticalDiscrepancies.length > 2 ? "up" : "stable",
            description: `${criticalDiscrepancies.length} critical procedural failures documented`,
            mitigations: [
              "File formal complaints for each violation",
              "Request judicial review of procedures",
              "Document timeline of violations",
            ],
          },
          {
            id: "high-violations",
            category: "procedural",
            name: "High-Severity Issues",
            score: highDiscrepancies.length * 15,
            trend: "stable",
            description: `${highDiscrepancies.length} significant procedural issues identified`,
            mitigations: [
              "Compile evidence of each issue",
              "Cross-reference with legal requirements",
              "Prepare expert testimony requests",
            ],
          },
        ],
      },
      {
        id: "legal",
        name: "Legal Exposure Risk",
        icon: FileText,
        color: "text-purple-500",
        score: legalScore,
        factors: [
          {
            id: "criminal-allegations",
            category: "legal",
            name: "Criminal Allegations",
            score: criminalEvents.length * 20,
            trend: "down",
            description: `${criminalEvents.length} criminal allegations to address`,
            mitigations: [
              "Prepare comprehensive defense strategy",
              "Gather exculpatory evidence",
              "Engage specialized legal counsel",
            ],
          },
          {
            id: "legal-proceedings",
            category: "legal",
            name: "Active Proceedings",
            score: legalEvents.length * 5,
            trend: "stable",
            description: `${legalEvents.length} legal proceedings in timeline`,
            mitigations: [
              "Track all court dates and deadlines",
              "Maintain organized case files",
              "Coordinate between legal teams",
            ],
          },
        ],
      },
      {
        id: "evidence",
        name: "Evidence Integrity Risk",
        icon: Eye,
        color: "text-blue-500",
        score: evidenceScore,
        factors: [
          {
            id: "chain-custody",
            category: "evidence",
            name: "Chain of Custody Issues",
            score: evidenceIssues.filter(d => d.discrepancy_type === "Chain of Custody").length * 30,
            trend: "up",
            description: "Evidence handling procedures may have been compromised",
            mitigations: [
              "Request independent forensic review",
              "Challenge evidence admissibility",
              "Document all custody violations",
            ],
          },
          {
            id: "document-integrity",
            category: "evidence",
            name: "Document Authenticity",
            score: evidenceIssues.filter(d => d.discrepancy_type === "Document Forgery").length * 30,
            trend: "up",
            description: "Potential document manipulation or forgery detected",
            mitigations: [
              "Obtain forensic document analysis",
              "Compare with original sources",
              "Establish document provenance",
            ],
          },
        ],
      },
    ];
  }, [entities, connections, events, discrepancies]);

  const overallRisk = useMemo(() => {
    const avg = riskCategories.reduce((sum, cat) => sum + cat.score, 0) / riskCategories.length;
    return Math.round(avg);
  }, [riskCategories]);

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { label: "Critical", color: "text-red-500 bg-red-500/20" };
    if (score >= 50) return { label: "High", color: "text-orange-500 bg-orange-500/20" };
    if (score >= 25) return { label: "Medium", color: "text-yellow-500 bg-yellow-500/20" };
    return { label: "Low", color: "text-green-500 bg-green-500/20" };
  };

  const selectedCategoryData = riskCategories.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Risk Assessment Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automated threat scoring and mitigation recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Overall Risk Score</p>
            <p className={`text-2xl font-bold ${getRiskLevel(overallRisk).color.split(" ")[0]}`}>
              {overallRisk}%
            </p>
          </div>
          <div className={`p-3 rounded-lg ${getRiskLevel(overallRisk).color}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Risk Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {riskCategories.map((category) => {
          const Icon = category.icon;
          const level = getRiskLevel(category.score);
          return (
            <Card
              key={category.id}
              className={`glass-card cursor-pointer transition-all ${
                selectedCategory === category.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-primary/30"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${level.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className={`${level.color} border-0`}>
                    {level.label}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-2">{category.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className={`font-bold ${category.color}`}>{category.score}%</span>
                  </div>
                  <Progress value={category.score} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Risk Factor Analysis
            </CardTitle>
            <CardDescription>
              {selectedCategoryData
                ? `Showing factors for ${selectedCategoryData.name}`
                : "Select a category to view detailed factors"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {selectedCategoryData ? (
                <div className="space-y-4">
                  {selectedCategoryData.factors.map((factor) => (
                    <div
                      key={factor.id}
                      className="p-4 rounded-lg border border-border/50 bg-accent/20"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{factor.name}</p>
                            {factor.trend === "up" && (
                              <TrendingUp className="w-3 h-3 text-red-500" />
                            )}
                            {factor.trend === "down" && (
                              <TrendingDown className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{factor.description}</p>
                        </div>
                        <Badge variant="outline" className={`${getRiskLevel(factor.score).color} border-0`}>
                          {factor.score}
                        </Badge>
                      </div>
                      <Progress value={factor.score} className="h-1.5" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Click a risk category above</p>
                    <p className="text-xs mt-1">to view detailed factors</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mitigations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Recommended Mitigations
            </CardTitle>
            <CardDescription>
              Strategic actions to reduce identified risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {selectedCategoryData ? (
                <div className="space-y-4">
                  {selectedCategoryData.factors.map((factor) => (
                    <div key={factor.id} className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary" />
                        {factor.name}
                      </h4>
                      <ul className="space-y-2 ml-6">
                        {factor.mitigations.map((mitigation, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            {mitigation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a risk category</p>
                    <p className="text-xs mt-1">to view mitigation strategies</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Risk Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Quick Risk Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-500">
                {(discrepancies || []).filter(d => d.severity === "critical").length}
              </p>
              <p className="text-xs text-muted-foreground">Critical Issues</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20 text-center">
              <AlertTriangle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-500">
                {entities.filter(e => e.category === "antagonist").length}
              </p>
              <p className="text-xs text-muted-foreground">Threat Actors</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 text-center">
              <Scale className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-500">
                {events.filter(e => e.category === "Legal Proceeding").length}
              </p>
              <p className="text-xs text-muted-foreground">Legal Events</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-500">
                {riskCategories.reduce((sum, c) => sum + c.factors.flatMap(f => f.mitigations).length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Mitigations Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
