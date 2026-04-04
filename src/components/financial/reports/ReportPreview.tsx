import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Download, Printer, RefreshCw, Loader2,
  AlertTriangle, Users, FileText, Brain, Shield,
} from "lucide-react";
import { openReportWindow } from "@/lib/reportShell";
import { useToast } from "@/hooks/use-toast";
import type { CompiledReportData } from "./reportDataCompiler";
import { reportTypes, type ReportType } from "./ReportTypeSelector";

interface Props {
  reportType: ReportType;
  markdown: string;
  compiledData: CompiledReportData;
  onBack: () => void;
  onRegenerate: () => void;
  regenerating?: boolean;
}

function markdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.*$)/gm, '<h3 style="font-size:16px;font-weight:700;margin:20px 0 8px">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size:18px;font-weight:700;margin:24px 0 10px;border-bottom:1px solid #e5e7eb;padding-bottom:6px">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-size:22px;font-weight:800;margin:28px 0 12px">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li style="margin-left:20px;margin-bottom:4px">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li style="margin-left:20px;margin-bottom:4px;list-style-type:decimal">$2</li>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return `<tr>${cells.map(c => `<td style="border:1px solid #e5e7eb;padding:6px 10px;font-size:13px">${c.trim()}</td>`).join('')}</tr>`;
    });
  return html;
}

function generatePrintHtml(markdown: string, data: CompiledReportData): string {
  const typeDef = reportTypes.find(r => r.id === data.reportType);
  const body = markdownToHtml(markdown);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>${data.caseTitle} — ${typeDef?.title || "Report"}</title>
<style>
@page { size: A4; margin: 20mm; }
body { font-family: 'Georgia', serif; font-size: 13px; line-height: 1.7; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
h1 { font-size: 22px; } h2 { font-size: 17px; border-bottom: 1px solid #ccc; padding-bottom: 4px; } h3 { font-size: 15px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
.cover { text-align: center; padding: 60px 0 40px; border-bottom: 3px solid #2563eb; margin-bottom: 30px; }
.cover h1 { font-size: 26px; color: #1e293b; } .cover .meta { font-size: 12px; color: #64748b; margin-top: 12px; }
.badge { display: inline-block; background: #fee2e2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 4px; }
.footer { margin-top: 40px; padding-top: 12px; border-top: 2px solid #dc2626; font-size: 10px; color: #dc2626; text-align: center; font-weight: 600; }
</style></head><body>
<div class="cover">
<h1>HRPM Investigation Intelligence</h1>
<h2 style="border:none">${typeDef?.title || "Investigation Report"}</h2>
<p style="font-size:16px;font-weight:600">${data.caseTitle}</p>
<div class="meta">
<span class="badge">${data.riskLevel.toUpperCase()} RISK</span><br/>
Generated: ${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}<br/>
Timeline: ${data.dateRange} · Actors: ${data.totalActors} · Findings: ${data.totalFindings}<br/>
Case Strength: ${data.caseHealth.label} (${data.caseHealth.pct}%)
</div>
</div>
${body}
<div class="footer">Strictly Confidential — Only for Advocacy Work · HRPM Investigation Platform</div>
</body></html>`;
}

export const ReportPreview = ({ reportType, markdown, compiledData, onBack, onRegenerate, regenerating }: Props) => {
  const { toast } = useToast();
  const typeDef = reportTypes.find(r => r.id === reportType);
  const [exporting, setExporting] = useState(false);

  // Extract sections from markdown for navigation
  const sectionHeaders = markdown.match(/^#{1,3} .+$/gm) || [];

  const handleExport = async () => {
    setExporting(true);
    try {
      const html = generatePrintHtml(markdown, compiledData);
      await openReportWindow(html);
      toast({ title: "Report Generated", description: "Your report is ready for download." });
    } catch {
      toast({ title: "Error", description: "Failed to export report", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-6 min-h-0">
      {/* Main Preview */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />Back
            </Button>
            <div>
              <h3 className="text-sm font-semibold">{typeDef?.title}</h3>
              <p className="text-[10px] text-muted-foreground">{compiledData.caseTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating} className="gap-1.5 text-xs">
              {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Regenerate
            </Button>
            <Button size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5 text-xs">
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              Export PDF
            </Button>
          </div>
        </div>

        {/* Report Body */}
        <Card>
          <CardContent className="p-6">
            {/* Report Header */}
            <div className="text-center pb-5 mb-5 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">HRPM Investigation Intelligence</p>
              <h2 className="text-lg font-bold">{typeDef?.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{compiledData.caseTitle}</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <Badge variant="destructive" className="text-[10px]">{compiledData.riskLevel.toUpperCase()} RISK</Badge>
                <Badge variant="outline" className="text-[10px]">{compiledData.dateRange}</Badge>
                <Badge variant="outline" className="text-[10px]">{compiledData.totalActors} Actors</Badge>
                <Badge variant="outline" className="text-[10px]">{compiledData.totalFindings} Findings</Badge>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              {markdown}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side Insights Panel */}
      <aside className="w-64 shrink-0 space-y-3 hidden xl:block">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-primary" />Report Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[11px]">
            <div>
              <p className="text-muted-foreground mb-1">Strongest Evidence</p>
              <p className="font-medium">{compiledData.totalEvidence} files linked</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Highest Risk Actor</p>
              <p className="font-medium">{compiledData.actors[0]?.name || "N/A"} ({compiledData.actors[0]?.riskScore || 0}%)</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Most Important Pattern</p>
              <p className="font-medium">{compiledData.patterns[0] || "No patterns detected"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Case Strength</p>
              <p className="font-medium">{compiledData.caseHealth.label} ({compiledData.caseHealth.pct}%)</p>
            </div>
            {compiledData.recommendations.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1">Missing / Gaps</p>
                <ul className="space-y-1">
                  {compiledData.recommendations.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Navigation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {sectionHeaders.slice(0, 15).map((h, i) => (
              <p key={i} className="text-[10px] text-muted-foreground truncate">
                {h.replace(/^#+\s*/, "")}
              </p>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};
