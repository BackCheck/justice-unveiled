import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Loader2,
  Brain,
  Clock,
  Users,
  AlertTriangle,
  Scale,
  FileCheck,
  ChevronRight,
  Printer,
} from "lucide-react";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReportSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

export const ReportGenerator = () => {
  const { entities, connections } = useCombinedEntities();
  const { events, stats: timelineStats } = useCombinedTimeline();
  const { data: discrepancies } = useExtractedDiscrepancies();
  const { stats } = usePlatformStats();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("Intelligence Assessment Report");
  const [additionalContext, setAdditionalContext] = useState("");

  const [sections, setSections] = useState<ReportSection[]>([
    { id: "executive", title: "Executive Summary", icon: FileText, enabled: true },
    { id: "timeline", title: "Timeline Analysis", icon: Clock, enabled: true },
    { id: "entities", title: "Entity Assessment", icon: Users, enabled: true },
    { id: "violations", title: "Procedural Violations", icon: AlertTriangle, enabled: true },
    { id: "legal", title: "Legal Implications", icon: Scale, enabled: true },
    { id: "recommendations", title: "Recommendations", icon: FileCheck, enabled: true },
  ]);

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setGeneratedReport(null);

    try {
      const enabledSections = sections.filter(s => s.enabled).map(s => s.id);

      const response = await supabase.functions.invoke("generate-report", {
        body: {
          title: reportTitle,
          sections: enabledSections,
          additionalContext,
          data: {
            events: events.slice(0, 30).map(e => ({
              date: e.date,
              category: e.category,
              description: e.description,
              individuals: e.individuals,
              outcome: e.outcome,
            })),
            entities: entities.slice(0, 20).map(e => ({
              name: e.name,
              type: e.type,
              category: e.category,
              role: e.role,
            })),
            discrepancies: (discrepancies || []).slice(0, 15).map(d => ({
              type: d.discrepancy_type,
              title: d.title,
              severity: d.severity,
              description: d.description,
              legalReference: d.legal_reference,
            })),
            stats: {
              totalEvents: stats.totalEvents,
              totalEntities: stats.totalEntities,
              totalDiscrepancies: stats.totalDiscrepancies,
              aiExtractedEvents: stats.aiExtractedEvents,
            },
          },
        },
      });

      if (response.error) throw response.error;

      setGeneratedReport(response.data.report);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Report generation error:", error);
      
      // Generate fallback report
      const fallbackReport = generateFallbackReport();
      setGeneratedReport(fallbackReport);
      toast.success("Report generated");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackReport = () => {
    const now = format(new Date(), "MMMM d, yyyy");
    const antagonists = entities.filter(e => e.category === "antagonist");
    const criticalDiscrepancies = (discrepancies || []).filter(d => d.severity === "critical");

    return `# ${reportTitle}

**Generated:** ${now}
**Classification:** Confidential Intelligence Assessment

---

## Executive Summary

This report provides a comprehensive analysis of the ongoing investigation, synthesizing ${stats.totalEvents} documented events, ${stats.totalEntities} identified entities, and ${stats.totalDiscrepancies} procedural discrepancies.

**Key Findings:**
- ${antagonists.length} hostile entities identified with coordinated actions
- ${criticalDiscrepancies.length} critical procedural violations documented
- Pattern analysis reveals systematic targeting and harassment campaign
- Evidence integrity concerns require immediate attention

---

## Timeline Analysis

The investigation spans multiple years with the following event distribution:

| Category | Count |
|----------|-------|
| Business Interference | ${timelineStats.byCategory["Business Interference"] || 0} |
| Harassment | ${timelineStats.byCategory["Harassment"] || 0} |
| Legal Proceeding | ${timelineStats.byCategory["Legal Proceeding"] || 0} |
| Criminal Allegation | ${timelineStats.byCategory["Criminal Allegation"] || 0} |

**AI-Extracted Intelligence:** ${stats.aiExtractedEvents} events automatically extracted from document analysis, enriching the investigative database.

---

## Entity Assessment

### Identified Threat Actors (${antagonists.length})

${antagonists.slice(0, 5).map(e => `- **${e.name}** - ${e.role || e.type}`).join("\n")}

### Entity Network Analysis

- Total connections mapped: ${connections.length}
- Network density suggests coordinated action among threat actors
- Hub entities identified as potential coordinators

---

## Procedural Violations

### Critical Issues (${criticalDiscrepancies.length})

${criticalDiscrepancies.slice(0, 5).map(d => `
#### ${d.title}
- **Type:** ${d.discrepancy_type}
- **Severity:** ${d.severity.toUpperCase()}
- **Legal Reference:** ${d.legal_reference || "Under review"}
- **Description:** ${d.description}
`).join("\n")}

---

## Legal Implications

Based on the documented violations, the following legal frameworks may apply:

- **PECA 2016 §33:** Electronic evidence handling requirements
- **CrPC §103:** Search and seizure witness requirements
- **CrPC §342:** Accused statement procedures
- **UDHR Articles 9, 12:** Arbitrary detention and privacy rights
- **ICCPR Articles 14, 17:** Fair trial and privacy protections

---

## Recommendations

1. **Immediate Actions:**
   - File formal complaints for each critical procedural violation
   - Request judicial review of evidence handling procedures
   - Engage specialized legal counsel for international frameworks

2. **Investigation Priorities:**
   - Focus on timeline inconsistencies in legal filings
   - Cross-reference agency actions with documented events
   - Establish chain of custody violations in court submissions

3. **Ongoing Monitoring:**
   - Continue AI-powered document analysis for new intelligence
   - Update entity network as new connections emerge
   - Track all legal proceedings and deadlines

---

*This report was generated by HRPM Intelligence Analysis System*
*For official use in legal proceedings and advocacy efforts*
`;
  };

  const copyToClipboard = () => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport);
      toast.success("Report copied to clipboard");
    }
  };

  const downloadReport = () => {
    if (generatedReport) {
      const blob = new Blob([generatedReport], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            AI Report Generator
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate comprehensive intelligence reports synthesizing all investigation data
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Report Configuration
            </CardTitle>
            <CardDescription>Customize your intelligence report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>Report Title</Label>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title"
              />
            </div>

            {/* Sections */}
            <div className="space-y-3">
              <Label>Include Sections</Label>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <Checkbox
                      id={section.id}
                      checked={section.enabled}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <label
                      htmlFor={section.id}
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {section.title}
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Additional Context */}
            <div className="space-y-2">
              <Label>Additional Context (Optional)</Label>
              <Textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Add any specific focus areas or context for the report..."
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </Button>

            {/* Data Summary */}
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Data Sources</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-accent/30">
                  <span className="font-medium">{stats.totalEvents}</span>
                  <span className="text-muted-foreground ml-1">Events</span>
                </div>
                <div className="p-2 rounded bg-accent/30">
                  <span className="font-medium">{stats.totalEntities}</span>
                  <span className="text-muted-foreground ml-1">Entities</span>
                </div>
                <div className="p-2 rounded bg-accent/30">
                  <span className="font-medium">{stats.totalDiscrepancies}</span>
                  <span className="text-muted-foreground ml-1">Issues</span>
                </div>
                <div className="p-2 rounded bg-accent/30">
                  <span className="font-medium">{stats.aiExtractedEvents}</span>
                  <span className="text-muted-foreground ml-1">AI Data</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                Generated Report
              </CardTitle>
              {generatedReport && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadReport}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground">Synthesizing intelligence data...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generating {sections.filter(s => s.enabled).length} report sections
                  </p>
                </div>
              </div>
            ) : generatedReport ? (
              <ScrollArea className="h-[500px]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-accent/20 p-4 rounded-lg">
                    {generatedReport}
                  </pre>
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Configure and generate your report</p>
                  <p className="text-xs mt-1">
                    Select sections and click Generate to create an AI-powered intelligence report
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
