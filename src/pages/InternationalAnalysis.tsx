import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { generateInternationalReport } from "@/lib/reportGenerators";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  FileText,
  Shield,
  Users,
  Building2,
  BookOpen,
  Gavel
} from "lucide-react";
import { timelineData } from "@/data/timelineData";
import { violationStats } from "@/data/violationsData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import {
  ViolationStatsHeader,
  LocalViolationsTable,
  InternationalViolationsTable,
  IncidentViolationTimeline,
  FrameworkBreakdown
} from "@/components/international";

interface ViolationFramework {
  framework: string;
  articles: string[];
  explanation: string;
}

interface Violation {
  title: string;
  category: string;
  severity: "Critical" | "Severe" | "Moderate";
  frameworks_violated: ViolationFramework[];
  evidence_from_case: string;
  date_range: string;
}

interface AnalysisResult {
  summary: string;
  total_violations_identified: number;
  violations: Violation[];
  patterns: string[];
  recommendations: string[];
}

const frameworkInfo = [
  {
    name: "United Nations",
    icon: Globe,
    instruments: ["UDHR (1948)", "ICCPR (1966)", "CAT (1984)"],
    description: "Universal human rights standards binding on all member states"
  },
  {
    name: "Organisation of Islamic Cooperation",
    icon: Building2,
    instruments: ["Cairo Declaration (1990)", "OIC Charter (2008)"],
    description: "Islamic perspective on human rights and dignity"
  },
  {
    name: "European Union / Council of Europe",
    icon: Shield,
    instruments: ["ECHR (1950)", "EU Charter (2000)"],
    description: "Regional human rights protection with enforcement mechanisms"
  },
  {
    name: "Other Regional Instruments",
    icon: Users,
    instruments: ["Banjul Charter (1981)", "Pact of San José (1969)"],
    description: "African and American regional human rights frameworks"
  }
];

const severityColors: Record<string, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  Severe: "bg-chart-1 text-primary-foreground",
  Moderate: "bg-chart-2 text-primary-foreground"
};

const categoryIcons: Record<string, typeof Scale> = {
  "Due Process": Scale,
  "Arbitrary Detention": Shield,
  "Fair Trial": FileText,
  "Privacy": Users,
  "Property": Building2,
  "Inhuman Treatment": AlertTriangle,
  "Effective Remedy": CheckCircle
};

const InternationalAnalysis = () => {
  useSEO({
    title: "International Rights Analysis",
    description: "AI-powered analysis of human rights violations against international frameworks including UDHR, ICCPR, ECHR, and local statutes.",
    url: "https://hrpm.org/international",
    keywords: ["international law", "UDHR violations", "ICCPR", "ECHR", "human rights frameworks", "rights analysis"],
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("documented");
  const { toast } = useToast();
  const { events: timelineEvents } = useCombinedTimeline(false);

  const totalViolations = violationStats.local.total + violationStats.international.total;
  const totalCritical = violationStats.local.critical + violationStats.international.critical;

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-rights-violations", {
        body: { events: timelineData, analysisType: "full_analysis" }
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
        setActiveTab("ai-analysis");
        toast({
          title: "Analysis Complete",
          description: `Identified ${data.analysis.total_violations_identified || 0} potential violations`,
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to complete analysis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PlatformLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Scale className="w-8 h-8 text-primary" />
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Human Rights Violations Registry
                  </h1>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  Comprehensive mapping of documented incidents against local Pakistani laws and 
                  international human rights frameworks (UN, OIC, EU, Regional).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ReportExportButton
                  label="Violations Report"
                  generateReport={() => generateInternationalReport(violationStats as any, timelineEvents, "Active Investigation")}
                  qaContext={{ reportType: "Rights Analysis", events: timelineEvents.map(e => ({ date: e.date, category: e.category })) }}
                />
                <div className="text-right">
                  <div className="text-3xl font-bold text-destructive">{totalViolations}</div>
                  <div className="text-xs text-muted-foreground">Total Violations</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-600">{totalCritical}</div>
                  <div className="text-xs text-muted-foreground">Critical Issues</div>
                </div>
              </div>
            </div>
            
            {/* Stats Header */}
            <ViolationStatsHeader />
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <TabsList>
                  <TabsTrigger value="documented" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Documented Violations
                  </TabsTrigger>
                  <TabsTrigger value="local" className="gap-2">
                    <Gavel className="w-4 h-4" />
                    Local Laws
                  </TabsTrigger>
                  <TabsTrigger value="international" className="gap-2">
                    <Globe className="w-4 h-4" />
                    International
                  </TabsTrigger>
                  <TabsTrigger value="ai-analysis" className="gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    AI Analysis
                  </TabsTrigger>
                </TabsList>
                
                <Button 
                  onClick={runAnalysis} 
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </div>

              {/* Documented Violations Tab */}
              <TabsContent value="documented" className="space-y-6">
                {/* Framework Reference */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {frameworkInfo.map((framework) => (
                    <Card key={framework.name} className="border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <framework.icon className="w-5 h-5 text-primary" />
                          <h3 className="font-medium text-foreground text-sm">{framework.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{framework.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {framework.instruments.map((inst) => (
                            <Badge key={inst} variant="secondary" className="text-xs">
                              {inst}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Framework Breakdown */}
                <FrameworkBreakdown />

                {/* Incident Timeline */}
                <IncidentViolationTimeline />
              </TabsContent>

              {/* Local Laws Tab */}
              <TabsContent value="local" className="space-y-6">
                <LocalViolationsTable />
              </TabsContent>

              {/* International Tab */}
              <TabsContent value="international" className="space-y-6">
                <InternationalViolationsTable />
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="ai-analysis">
                {analysis ? (
                  <div className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="border-border">
                        <CardContent className="pt-6">
                          <div className="text-3xl font-bold text-primary mb-1">
                            {analysis.total_violations_identified || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">AI-Identified Violations</p>
                        </CardContent>
                      </Card>
                      <Card className="border-border">
                        <CardContent className="pt-6">
                          <div className="text-3xl font-bold text-destructive mb-1">
                            {analysis.violations?.filter(v => v.severity === "Critical").length || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Critical Severity</p>
                        </CardContent>
                      </Card>
                      <Card className="border-border">
                        <CardContent className="pt-6">
                          <div className="text-3xl font-bold text-chart-2 mb-1">
                            {analysis.patterns?.length || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Patterns Detected</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Executive Summary */}
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Executive Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
                      </CardContent>
                    </Card>

                    {/* Violations List */}
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Identified Violations</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {analysis.violations?.map((violation, index) => {
                          const Icon = categoryIcons[violation.category] || AlertTriangle;
                          return (
                            <div key={index} className="border border-border rounded-lg p-4">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{violation.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {violation.category} • {violation.date_range}
                                    </p>
                                  </div>
                                </div>
                                <Badge className={severityColors[violation.severity]}>
                                  {violation.severity}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Evidence from Case</h5>
                                  <p className="text-sm text-muted-foreground">{violation.evidence_from_case}</p>
                                </div>
                                
                                <div>
                                  <h5 className="text-sm font-medium mb-2">Frameworks Violated</h5>
                                  <div className="space-y-2">
                                    {violation.frameworks_violated?.map((fw, fwIndex) => (
                                      <div key={fwIndex} className="bg-muted/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline" className="text-xs">{fw.framework}</Badge>
                                          <div className="flex gap-1 flex-wrap">
                                            {fw.articles?.map((art, artIndex) => (
                                              <span key={artIndex} className="text-xs text-primary font-medium">
                                                {art}{artIndex < fw.articles.length - 1 ? "," : ""}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{fw.explanation}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    {/* Patterns and Recommendations */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-chart-1" />
                            Patterns Identified
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {analysis.patterns?.map((pattern, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-chart-1 mt-2 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{pattern}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-chart-5" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {analysis.recommendations?.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-2 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Scale className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Run AI Analysis for Deep Insights
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Click "Run AI Analysis" to examine documented events against international 
                      human rights frameworks and identify additional violations and patterns.
                    </p>
                    <Button onClick={runAnalysis} disabled={isLoading} className="gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4" />
                          Run AI Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </PlatformLayout>
  );
};

export default InternationalAnalysis;
