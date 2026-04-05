import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Printer, RefreshCw, Loader2,
  AlertTriangle, Brain, Shield, Target, Scale, 
  TrendingUp, Users, FileText, Zap, CheckCircle2,
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
    .replace(/^### (.*$)/gm, '<h3 style="font-size:15px;font-weight:700;margin:20px 0 8px;color:#1e293b">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size:17px;font-weight:700;margin:28px 0 10px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;color:#0f172a">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-size:22px;font-weight:800;margin:32px 0 14px;color:#0f172a">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li style="margin-left:20px;margin-bottom:4px">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li style="margin-left:20px;margin-bottom:4px;list-style-type:decimal">$2</li>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return `<tr>${cells.map(c => `<td style="border:1px solid #e2e8f0;padding:8px 12px;font-size:12px">${c.trim()}</td>`).join('')}</tr>`;
    });
  return html;
}

function generatePrintHtml(markdown: string, data: CompiledReportData): string {
  const typeDef = reportTypes.find(r => r.id === data.reportType);
  const body = markdownToHtml(markdown);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  const riskColor = data.riskLevel === "critical" ? "#dc2626" : data.riskLevel === "high" ? "#ea580c" : "#2563eb";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>${data.caseTitle} — ${typeDef?.title || "Report"}</title>
<style>
@page { size: A4; margin: 18mm; }
body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 12.5px; line-height: 1.75; color: #1a1a1a; max-width: 780px; margin: 0 auto; }
h1 { font-size: 22px; } h2 { font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; } h3 { font-size: 14px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }

/* Cover Page */
.cover-page { page-break-after: always; text-align: center; padding: 40px 0; }
.cover-logo { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
.cover-brand { font-size: 28px; font-weight: 800; color: #0087C1; margin: 4px 0; }
.cover-divider { width: 80px; height: 3px; background: #0087C1; margin: 16px auto; border-radius: 2px; }
.cover-type { font-size: 20px; font-weight: 700; color: #1e293b; margin: 24px 0 8px; }
.cover-case { font-size: 16px; color: #475569; }
.cover-risk { display: inline-block; background: ${riskColor}; color: white; font-size: 11px; font-weight: 700; padding: 4px 16px; border-radius: 4px; margin: 20px 0; letter-spacing: 1px; }
.cover-meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px auto; max-width: 500px; font-size: 11px; color: #475569; text-align: left; }
.cover-meta-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
.cover-meta-row:last-child { border: none; }
.cover-meta-label { font-weight: 600; color: #334155; }
.cover-conf { text-align: center; margin-top: 20px; padding: 8px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 10px; color: #92400e; }

/* Intelligence Summary */
.intel-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px 20px; margin: 20px 0; page-break-inside: avoid; }
.intel-title { font-size: 13px; font-weight: 700; color: #0369a1; margin-bottom: 8px; }
.intel-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
.intel-stat { text-align: center; }
.intel-stat-value { font-size: 18px; font-weight: 800; color: #0f172a; }
.intel-stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
.kf-list { margin: 0; padding: 0; list-style: none; }
.kf-item { padding: 4px 0; font-size: 12px; border-bottom: 1px solid #e0f2fe; }
.kf-item:last-child { border: none; }

/* Risk actors table */
.actor-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
.actor-table th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
.actor-table td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }

/* Phases */
.phase-bar { display: flex; gap: 2px; margin: 16px 0; }
.phase-item { flex: 1; text-align: center; padding: 8px 4px; background: #f1f5f9; border-radius: 4px; font-size: 9px; }
.phase-num { font-weight: 800; font-size: 14px; color: #0087C1; }
.phase-label { font-weight: 600; color: #334155; margin-top: 2px; }
.phase-period { color: #94a3b8; }

.footer { margin-top: 40px; padding-top: 12px; border-top: 2px solid #dc2626; font-size: 10px; color: #dc2626; text-align: center; font-weight: 600; }
.confidential-banner { background: #1e293b; color: #f8fafc; text-align: center; padding: 6px; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; }
</style></head><body>

<!-- Cover Page -->
<div class="cover-page">
<div class="cover-logo">Human Rights Protection & Monitoring</div>
<div class="cover-brand">HRPM.org</div>
<div class="cover-divider"></div>
<div class="cover-type">${typeDef?.title || "Investigation Report"}</div>
<div class="cover-case">${data.caseTitle}</div>
<div class="cover-risk">${data.riskLevel.toUpperCase()} RISK</div>
<div class="cover-meta">
<div class="cover-meta-row"><span class="cover-meta-label">Generated</span><span>${dateStr} at ${timeStr}</span></div>
<div class="cover-meta-row"><span class="cover-meta-label">Timeline</span><span>${data.dateRange}</span></div>
<div class="cover-meta-row"><span class="cover-meta-label">Actors</span><span>${data.totalActors}</span></div>
<div class="cover-meta-row"><span class="cover-meta-label">Findings</span><span>${data.totalFindings}</span></div>
<div class="cover-meta-row"><span class="cover-meta-label">Evidence Files</span><span>${data.totalEvidence}</span></div>
<div class="cover-meta-row"><span class="cover-meta-label">Confidence</span><span>${data.confidenceScore.score}% (${data.confidenceScore.level})</span></div>
<div class="cover-meta-row"><span class="cover-meta-label">Case Strength</span><span>${data.caseHealth.label} (${data.caseHealth.pct}%)</span></div>
<div class="cover-meta-row"><span class="cover-meta-label">Legal Readiness</span><span>${data.legalReadiness.label}</span></div>
</div>
<div class="cover-conf">CONFIDENTIAL — For Internal Investigation & Advocacy Use Only</div>
</div>

<!-- Intelligence Summary Page -->
<div class="intel-box">
<div class="intel-title">⚡ Intelligence Summary</div>
<div class="intel-grid">
<div class="intel-stat"><div class="intel-stat-value">${data.totalActors}</div><div class="intel-stat-label">Actors</div></div>
<div class="intel-stat"><div class="intel-stat-value">${data.totalFindings}</div><div class="intel-stat-label">Findings</div></div>
<div class="intel-stat"><div class="intel-stat-value">${data.totalEvidence}</div><div class="intel-stat-label">Evidence</div></div>
<div class="intel-stat"><div class="intel-stat-value">${data.confidenceScore.score}%</div><div class="intel-stat-label">Confidence</div></div>
</div>
${data.keyFindings.length ? `<div class="intel-title" style="font-size:11px;margin-top:8px">Key Findings</div><ul class="kf-list">${data.keyFindings.map(f => `<li class="kf-item">• ${f}</li>`).join('')}</ul>` : ''}
</div>

<!-- Top Risk Actors Table -->
${data.actors.length ? `
<table class="actor-table">
<thead><tr><th>Actor</th><th>Role</th><th>Risk</th><th>Transactions</th></tr></thead>
<tbody>${data.actors.slice(0, 8).map(a => `<tr><td><strong>${a.name}</strong></td><td>${a.role}</td><td style="color:${a.riskScore >= 80 ? '#dc2626' : a.riskScore >= 60 ? '#ea580c' : '#2563eb'};font-weight:700">${a.riskScore}%</td><td>${a.transactionCount}</td></tr>`).join('')}</tbody>
</table>` : ''}

<!-- Investigation Phases -->
<div class="phase-bar">
${data.phases.map(p => `<div class="phase-item"><div class="phase-num">${p.phase}</div><div class="phase-label">${p.label}</div><div class="phase-period">${p.period}</div></div>`).join('')}
</div>

${body}

<div class="confidential-banner">Public Interest Intelligence Document · Not Classified · Advocacy Use · Monitoring Record</div>
<div class="footer">Strictly Confidential — Only for Advocacy Work · © ${now.getFullYear()} HRPM.org</div>
</body></html>`;
}

function ScoreBar({ label, score, icon: Icon, color }: { label: string; score: number; icon: typeof Shield; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Icon className={`w-3 h-3 ${color}`} /> {label}
        </span>
        <span className="text-[10px] font-bold">{score}%</span>
      </div>
      <Progress value={score} className="h-1.5" />
    </div>
  );
}

export const ReportPreview = ({ reportType, markdown, compiledData, onBack, onRegenerate, regenerating }: Props) => {
  const { toast } = useToast();
  const typeDef = reportTypes.find(r => r.id === reportType);
  const [exporting, setExporting] = useState(false);

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

  const riskColor = compiledData.riskLevel === "critical" ? "text-red-500" : compiledData.riskLevel === "high" ? "text-orange-500" : "text-primary";

  return (
    <div className="flex gap-5 min-h-0">
      {/* Main Preview */}
      <div className="flex-1 space-y-4">
        {/* Top Bar */}
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

        {/* Key Findings Banner */}
        {compiledData.keyFindings.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold">Key Findings</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {compiledData.keyFindings.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual Summary Bar */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Actors", value: compiledData.totalActors, icon: Users },
            { label: "Findings", value: compiledData.totalFindings, icon: Target },
            { label: "Evidence", value: compiledData.totalEvidence, icon: FileText },
            { label: "Confidence", value: `${compiledData.confidenceScore.score}%`, icon: Shield },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-2">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-bold">{s.value}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Risk Actors */}
        {compiledData.actors.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" /> Top Risk Actors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-2 pl-4 font-semibold">Actor</th>
                    <th className="text-left p-2 font-semibold">Role</th>
                    <th className="text-center p-2 font-semibold">Risk</th>
                    <th className="text-center p-2 pr-4 font-semibold">Txns</th>
                  </tr>
                </thead>
                <tbody>
                  {compiledData.actors.slice(0, 6).map((a, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-2 pl-4 font-medium">{a.name}</td>
                      <td className="p-2 text-muted-foreground">{a.role}</td>
                      <td className="p-2 text-center">
                        <Badge variant={a.riskScore >= 80 ? "destructive" : "outline"} className="text-[9px] px-1.5 py-0">
                          {a.riskScore}%
                        </Badge>
                      </td>
                      <td className="p-2 pr-4 text-center">{a.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Report Body */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center pb-5 mb-5 border-b border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[3px] mb-1">HRPM Investigation Intelligence</p>
              <h2 className="text-lg font-bold">{typeDef?.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{compiledData.caseTitle}</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <Badge variant="destructive" className="text-[10px]">{compiledData.riskLevel.toUpperCase()} RISK</Badge>
                <Badge variant="outline" className="text-[10px]">{compiledData.dateRange}</Badge>
                <Badge variant="outline" className="text-[10px]">Confidence: {compiledData.confidenceScore.score}%</Badge>
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              {markdown}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side Panel */}
      <aside className="w-64 shrink-0 space-y-3 hidden xl:block">
        {/* Intelligence Scores */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-primary" /> Intelligence Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScoreBar label="Confidence" score={compiledData.confidenceScore.score} icon={Shield} color="text-primary" />
            <ScoreBar label="Evidence Strength" score={compiledData.evidenceStrength.score} icon={FileText} color="text-emerald-500" />
            <ScoreBar label="Legal Readiness" score={compiledData.legalReadiness.score} icon={Scale} color="text-amber-500" />
            <ScoreBar label="Maturity" score={compiledData.investigationMaturity.score} icon={TrendingUp} color="text-blue-500" />
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Case Strength</span>
                <Badge variant="outline" className="text-[9px] py-0">{compiledData.caseHealth.label}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary" /> Report Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[11px]">
            <div>
              <p className="text-muted-foreground mb-1">Highest Risk Actor</p>
              <p className="font-medium">{compiledData.actors[0]?.name || "N/A"} <span className={riskColor}>({compiledData.actors[0]?.riskScore || 0}%)</span></p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Top Pattern</p>
              <p className="font-medium">{compiledData.patterns[0] || "No patterns detected"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Legal Status</p>
              <Badge variant="outline" className="text-[9px] py-0">{compiledData.legalReadiness.label}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Gaps & Recommendations */}
        {compiledData.recommendations.length > 0 && (
          <Card className="border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Gaps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {compiledData.recommendations.slice(0, 4).map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px]">
                  <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sections Nav */}
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
