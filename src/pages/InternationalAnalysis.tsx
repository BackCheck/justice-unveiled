import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
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
  BookOpen
} from "lucide-react";
import { timelineData } from "@/data/timelineData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-rights-violations", {
        body: { events: timelineData, analysisType: "full_analysis" }
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
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
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                International Human Rights Analysis
              </h1>
            </div>
            <p className="text-muted-foreground max-w-3xl mb-6">
              Analyzing documented facts against international human rights frameworks including 
              the United Nations, Organisation of Islamic Cooperation, European Union, and regional instruments.
            </p>
            <Button 
              onClick={runAnalysis} 
              disabled={isLoading}
              size="lg"
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
        </section>

        {/* Framework Reference */}
        <section className="py-8 border-b border-border">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              International Frameworks Referenced
            </h2>
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
          </div>
        </section>

        {/* Analysis Results */}
        {analysis && (
          <section className="py-8">
            <div className="max-w-6xl mx-auto px-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="violations">Violations ({analysis.violations?.length || 0})</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns & Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-border">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {analysis.total_violations_identified || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Violations Identified</p>
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

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="violations">
                  <div className="space-y-4">
                    {analysis.violations?.map((violation, index) => {
                      const Icon = categoryIcons[violation.category] || AlertTriangle;
                      return (
                        <Card key={index} className="border-border">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{violation.title}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {violation.category} • {violation.date_range}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge className={severityColors[violation.severity]}>
                                {violation.severity}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">Evidence from Case</h4>
                              <p className="text-sm text-muted-foreground">{violation.evidence_from_case}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">International Frameworks Violated</h4>
                              <div className="space-y-3">
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
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="patterns">
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
                </TabsContent>
              </Tabs>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!analysis && !isLoading && (
          <section className="py-16">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <Scale className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Ready for International Rights Analysis
              </h3>
              <p className="text-muted-foreground mb-6">
                Click "Run AI Analysis" to examine documented events against international 
                human rights frameworks and identify potential violations.
              </p>
            </div>
          </section>
        )}
      </div>
    </PlatformLayout>
  );
};

export default InternationalAnalysis;
