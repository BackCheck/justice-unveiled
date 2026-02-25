import { useParams, Link } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FolderOpen,
  MapPin,
  Calendar,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  Shield,
  Network,
  Brain,
  Sparkles,
  Scale,
  TrendingUp,
  FileWarning,
  ChevronRight,
  Upload,
  GitBranch,
  ClipboardCheck,
  Rss,
  FileDown,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useCase, useCaseEvents, useCaseEntities, useCaseDiscrepancies, useCaseEvidence } from "@/hooks/useCases";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EvidenceRepositoryCard } from "@/components/evidence/EvidenceRepositoryCard";
import { CaseReconstructionTab } from "@/components/reconstruction/CaseReconstructionTab";
import { CaseCorrelationTab } from "@/components/correlation/CaseCorrelationTab";
import { CaseComplianceTab } from "@/components/compliance/CaseComplianceTab";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  low: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  closed: "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30",
  pending: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
};

const categoryColors: Record<string, string> = {
  "Business Interference": "text-amber-600 dark:text-amber-400",
  "Harassment": "text-red-600 dark:text-red-400",
  "Legal Proceeding": "text-blue-600 dark:text-blue-400",
  "Criminal Allegation": "text-purple-600 dark:text-purple-400",
};

const isEmptyValue = (val: string | null | undefined): boolean => {
  if (!val) return true;
  const normalized = val.trim().toLowerCase();
  return ["none", "n/a", "na", "none noted", "nil", "null", "undefined", "-", "—", ""].includes(normalized);
};

const CaseProfile = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: caseData, isLoading: caseLoading, error: caseError } = useCase(caseId);
  const { data: events, isLoading: eventsLoading } = useCaseEvents(caseId);
  const { data: entities, isLoading: entitiesLoading } = useCaseEntities(caseId);
  const { data: discrepancies, isLoading: discrepanciesLoading } = useCaseDiscrepancies(caseId);
  const { data: evidence, isLoading: evidenceLoading } = useCaseEvidence(caseId);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const handleExportPDF = async () => {
    if (!caseData) return;
    setIsExporting(true);

    // Build the full report HTML with the window.open() buffer strategy
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      setIsExporting(false);
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
    });

    // Build timeline HTML grouped by year
    const eventsByYearForPDF = (events || []).reduce((acc, event) => {
      const year = event.date?.split("-")[0] || "Unknown";
      if (!acc[year]) acc[year] = [];
      acc[year].push(event);
      return acc;
    }, {} as Record<string, any[]>);
    const sortedPDFYears = Object.keys(eventsByYearForPDF).sort();

    const timelineHTML = sortedPDFYears.map(year => {
      const yearEvents = eventsByYearForPDF[year];
      const eventsRows = yearEvents.map((e: any) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;white-space:nowrap;vertical-align:top;font-family:monospace;font-size:11px;">${e.date || "N/A"}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
            <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#f0f9ff;color:#0369a1;margin-bottom:4px;">${e.category}</span>
            <div style="font-size:12px;color:#1f2937;margin-top:2px;">${e.description}</div>
            ${!isEmptyValue(e.individuals) ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;">Individuals: ${e.individuals}</div>` : ""}
            ${!isEmptyValue(e.legal_action) ? `<div style="font-size:11px;color:#6b7280;">Legal Action: ${e.legal_action}</div>` : ""}
            ${!isEmptyValue(e.outcome) ? `<div style="font-size:11px;color:#6b7280;">Outcome: ${e.outcome}</div>` : ""}
            ${!isEmptyValue(e.evidence_discrepancy) ? `<div style="font-size:11px;color:#dc2626;margin-top:4px;">⚠ ${e.evidence_discrepancy}</div>` : ""}
          </td>
        </tr>
      `).join("");
      return `
        <h3 style="font-size:16px;color:#0087C1;margin:24px 0 8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${year} — ${yearEvents.length} events</h3>
        <table style="width:100%;border-collapse:collapse;">${eventsRows}</table>
      `;
    }).join("");

    // Build entities HTML
    const entitiesHTML = (entities || []).map(e => `
      <div style="display:inline-block;padding:6px 12px;margin:4px;border:1px solid #e5e7eb;border-radius:8px;font-size:11px;">
        <strong>${e.name}</strong>${e.role ? ` — ${e.role}` : ""}${e.entity_type ? ` <span style="color:#6b7280;">(${e.entity_type})</span>` : ""}
      </div>
    `).join("");

    // Build discrepancies HTML
    const discrepanciesHTML = (discrepancies || []).map(d => `
      <div style="padding:10px;margin:8px 0;border-left:3px solid ${d.severity === "critical" ? "#dc2626" : d.severity === "high" ? "#ea580c" : "#ca8a04"};background:#fef2f2;border-radius:0 8px 8px 0;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${d.severity === "critical" ? "#dc2626" : d.severity === "high" ? "#ea580c" : "#ca8a04"};">${d.severity}</div>
        <div style="font-size:13px;font-weight:600;margin:4px 0;">${d.title}</div>
        <div style="font-size:12px;color:#4b5563;">${d.description}</div>
        ${d.legal_reference ? `<div style="font-size:11px;color:#0087C1;margin-top:4px;">📜 ${d.legal_reference}</div>` : ""}
      </div>
    `).join("");

    const html = `<!DOCTYPE html>
<html><head><title>Case Report — ${caseData.case_number}</title>
<style>
  @media print { @page { margin: 1cm; size: A4; } .no-print { display: none; } .page-break { page-break-after: always; } }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #fff; }
</style></head><body>
<!-- COVER -->
<div style="min-height:95vh;display:flex;flex-direction:column;justify-content:space-between;padding:48px;">
  <div style="text-align:center;">
    <h1 style="font-size:36px;color:#0087C1;margin:0;">HRPM.org</h1>
    <p style="font-size:18px;color:#6b7280;">Human Rights Protection & Monitoring</p>
    <div style="width:120px;height:4px;background:#0087C1;margin:16px auto;border-radius:4px;"></div>
  </div>
  <div style="text-align:center;margin:48px 0;">
    <p style="font-size:12px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;">Official Case Intelligence Report</p>
    <h2 style="font-size:28px;margin:12px 0;">${caseData.title}</h2>
    <p style="font-family:monospace;color:#6b7280;font-size:16px;">${caseData.case_number}</p>
    <div style="margin-top:24px;display:inline-flex;gap:32px;padding:16px 32px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
      <div><span style="font-size:24px;font-weight:700;color:#0087C1;">${caseData.total_sources ?? 0}</span> <span style="color:#6b7280;">Sources</span></div>
      <div style="color:#d1d5db;">|</div>
      <div><span style="font-size:24px;font-weight:700;color:#0087C1;">${events?.length || 0}</span> <span style="color:#6b7280;">Events</span></div>
      <div style="color:#d1d5db;">|</div>
      <div><span style="font-size:24px;font-weight:700;color:#0087C1;">${entities?.length || 0}</span> <span style="color:#6b7280;">Entities</span></div>
    </div>
  </div>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
    <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;margin-bottom:12px;">Report Generation Details</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
      <div><span style="color:#9ca3af;">Generated On:</span> ${formattedDate}</div>
      <div><span style="color:#9ca3af;">Time:</span> ${formattedTime}</div>
      <div><span style="color:#9ca3af;">Status:</span> ${(caseData.status || "N/A").toUpperCase()}</div>
      <div><span style="color:#9ca3af;">Severity:</span> ${(caseData.severity || "N/A").toUpperCase()}</div>
      <div><span style="color:#9ca3af;">Location:</span> ${caseData.location || "N/A"}</div>
      <div><span style="color:#9ca3af;">Lead Investigator:</span> ${caseData.lead_investigator || "N/A"}</div>
    </div>
  </div>
  <div style="text-align:center;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#6b7280;">
    <p style="font-weight:600;color:#dc2626;">Strictly Confidential – Only for Advocacy Work</p>
    <p>© ${now.getFullYear()} Human Rights Protection & Monitoring. All rights reserved.</p>
  </div>
</div>

<div class="page-break"></div>

<!-- EXECUTIVE SUMMARY -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #0087C1;">
    <div style="width:36px;height:36px;background:#0087C1;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:700;">1</div>
    <h2 style="font-size:22px;margin:0;">Executive Summary</h2>
  </div>
  <p style="font-size:13px;line-height:1.7;color:#374151;">${caseData.description || "No description available."}</p>
</div>

<div class="page-break"></div>

<!-- FULL TIMELINE -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #0087C1;">
    <div style="width:36px;height:36px;background:#0087C1;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:700;">2</div>
    <h2 style="font-size:22px;margin:0;">Complete Case Timeline (${events?.length || 0} events)</h2>
  </div>
  ${(events?.length || 0) === 0 ? "<p style='color:#6b7280;'>No timeline events recorded.</p>" : timelineHTML}
</div>

<div class="page-break"></div>

<!-- ENTITIES -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #0087C1;">
    <div style="width:36px;height:36px;background:#0087C1;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:700;">3</div>
    <h2 style="font-size:22px;margin:0;">Entity Network (${entities?.length || 0} entities)</h2>
  </div>
  ${(entities?.length || 0) === 0 ? "<p style='color:#6b7280;'>No entities extracted.</p>" : entitiesHTML}
</div>

<div class="page-break"></div>

<!-- DISCREPANCIES -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #0087C1;">
    <div style="width:36px;height:36px;background:#0087C1;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:700;">4</div>
    <h2 style="font-size:22px;margin:0;">Discrepancies & Issues (${discrepancies?.length || 0})</h2>
  </div>
  ${(discrepancies?.length || 0) === 0 ? "<p style='color:#6b7280;'>No discrepancies identified.</p>" : discrepanciesHTML}
</div>

<div class="page-break"></div>

<!-- EVIDENCE SUMMARY -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #0087C1;">
    <div style="width:36px;height:36px;background:#0087C1;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:700;">5</div>
    <h2 style="font-size:22px;margin:0;">Evidence Repository (${evidence?.length || 0} files)</h2>
  </div>
  ${(evidence?.length || 0) === 0 ? "<p style='color:#6b7280;'>No evidence files uploaded.</p>" : `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">File Name</th>
        <th style="padding:8px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Type</th>
        <th style="padding:8px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Category</th>
      </tr></thead>
      <tbody>${(evidence || []).map(f => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${f.file_name}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${f.file_type}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${f.category || "general"}</td>
        </tr>
      `).join("")}</tbody>
    </table>
  `}
</div>

<!-- CLOSING -->
<div style="min-height:60vh;display:flex;align-items:center;justify-content:center;padding:48px;">
  <div style="text-align:center;max-width:480px;">
    <div style="width:60px;height:4px;background:#0087C1;margin:0 auto 24px;border-radius:4px;"></div>
    <h2 style="font-size:22px;">End of Report</h2>
    <p style="color:#6b7280;font-size:13px;margin:16px 0;">
      This report summarizes intelligence gathered from ${caseData.total_sources ?? 0} verified sources
      covering ${events?.length || 0} documented events and ${entities?.length || 0} mapped entities
      for case ${caseData.case_number}.
    </p>
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#6b7280;">
      <p style="font-weight:600;color:#dc2626;">Strictly Confidential – Only for Advocacy Work</p>
      <p>© ${now.getFullYear()} Human Rights Protection & Monitoring. All rights reserved.</p>
      <p style="color:#0087C1;">Documenting injustice. Demanding accountability.</p>
    </div>
  </div>
</div>

<script>window.onload=function(){window.print();}</script>
</body></html>`;

    reportWindow.document.write(html);
    reportWindow.document.close();

    // Increment download counter
    await supabase.rpc("increment_report_downloads", { _case_id: caseId });
    queryClient.invalidateQueries({ queryKey: ["case", caseId] });

    setIsExporting(false);
  };

  if (caseLoading) {
    return (
      <PlatformLayout>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PlatformLayout>
    );
  }

  if (caseError || !caseData) {
    return (
      <PlatformLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">Case not found</p>
              <p className="text-sm text-muted-foreground mt-1">
                The case you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild className="mt-4">
                <Link to="/cases">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cases
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PlatformLayout>
    );
  }

  // Group events by year
  const eventsByYear = events?.reduce((acc, event) => {
    const year = event.date?.split("-")[0] || "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  const sortedYears = Object.keys(eventsByYear || {}).sort();

  // Group entities by type
  const entitiesByType = entities?.reduce((acc, entity) => {
    const type = entity.entity_type || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(entity);
    return acc;
  }, {} as Record<string, typeof entities>);

  return (
    <PlatformLayout>
      {/* Hero Header */}
      <div className="bg-secondary/50 backdrop-blur-xl border-b border-border/30 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/cases" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Cases
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>{caseData.case_number}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="font-mono">
                  {caseData.case_number}
                </Badge>
                <Badge className={`${severityColors[caseData.severity || "medium"]} border`}>
                  {caseData.severity || "medium"} severity
                </Badge>
                <Badge className={`${statusColors[caseData.status]} border`}>
                  {caseData.status}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {caseData.title}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {caseData.description}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {caseData.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{caseData.location}</span>
                  </div>
                )}
                {caseData.date_opened && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Opened {format(new Date(caseData.date_opened), "MMM d, yyyy")}</span>
                  </div>
                )}
                {caseData.lead_investigator && (
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>{caseData.lead_investigator}</span>
                  </div>
                )}
              </div>

              {/* Actions: RSS + Export PDF */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/case-rss-feed?caseId=${caseId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <Rss className="w-4 h-4 text-orange-500" />
                          Subscribe to RSS
                        </Button>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Get updates for this case via RSS</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isExporting}
                  onClick={handleExportPDF}
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 text-primary" />
                  )}
                  Export Report PDF
                  {caseData && caseData.report_downloads > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                      {caseData.report_downloads}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 lg:min-w-[200px]">
              <Card className="glass-card text-center p-4">
                <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{caseData.total_sources}</p>
                <p className="text-xs text-muted-foreground">Sources</p>
              </Card>
              <Card className="glass-card text-center p-4">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{events?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </Card>
              <Card className="glass-card text-center p-4">
                <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{entities?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Entities</p>
              </Card>
              <Card className="glass-card text-center p-4">
                <FileWarning className="w-5 h-5 mx-auto mb-1 text-destructive" />
                <p className="text-2xl font-bold">{discrepancies?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Issues</p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="glass-card p-1 h-auto flex-wrap">
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="reconstruction" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Reconstruction
            </TabsTrigger>
            <TabsTrigger value="correlation" className="gap-2">
              <Scale className="w-4 h-4" />
              Claim Correlation
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="entities" className="gap-2">
              <Network className="w-4 h-4" />
              Entities
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Intelligence
            </TabsTrigger>
            <TabsTrigger value="evidence" className="gap-2">
              <FileText className="w-4 h-4" />
              Evidence
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Case Timeline
                </CardTitle>
                <CardDescription>
                  Chronological events extracted from case documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : events?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No events recorded for this case yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-8">
                      {sortedYears.map((year) => (
                        <div key={year}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{year.slice(-2)}</span>
                            </div>
                            <h3 className="text-lg font-semibold">{year}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {eventsByYear?.[year]?.length} events
                            </Badge>
                          </div>
                          <div className="ml-4 border-l-2 border-border/50 pl-6 space-y-4">
                            {eventsByYear?.[year]?.map((event, idx) => (
                              <Card key={event.id} className="glass-card hover-glow-primary">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className={`text-xs ${categoryColors[event.category] || ""}`}>
                                          {event.category}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{event.date}</span>
                                        {event.extraction_method === "ai_analysis" && (
                                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                                        )}
                                      </div>
                                      <p className="text-sm">{event.description}</p>
                                      {!isEmptyValue(event.individuals) && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          <Users className="w-3 h-3 inline mr-1" />
                                          {event.individuals}
                                        </p>
                                      )}
                                      {!isEmptyValue(event.evidence_discrepancy) && (
                                        <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                                          <p className="text-xs text-destructive">
                                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                                            {event.evidence_discrepancy}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reconstruction Tab */}
          <TabsContent value="reconstruction" className="space-y-6">
            {caseId && <CaseReconstructionTab caseId={caseId} />}
          </TabsContent>

          {/* Claim Correlation Tab */}
          <TabsContent value="correlation" className="space-y-6">
            {caseId && <CaseCorrelationTab caseId={caseId} />}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            {caseId && <CaseComplianceTab caseId={caseId} />}
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  Entity Network
                </CardTitle>
                <CardDescription>
                  People, organizations, and locations connected to this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entitiesLoading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : entities?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No entities extracted for this case yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(entitiesByType || {}).map(([type, typeEntities]) => (
                      <div key={type}>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {type}s ({typeEntities?.length})
                        </h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {typeEntities?.map((entity) => (
                            <Card key={entity.id} className="glass-card hover-glow-primary p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="text-sm font-semibold text-primary">
                                    {entity.name.charAt(0)}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{entity.name}</p>
                                  {entity.role && (
                                    <p className="text-xs text-muted-foreground">{entity.role}</p>
                                  )}
                                  {entity.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {entity.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Discrepancies */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Procedural Discrepancies
                  </CardTitle>
                  <CardDescription>
                    AI-identified inconsistencies and violations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {discrepanciesLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : discrepancies?.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Scale className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No discrepancies identified</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 pr-4">
                        {discrepancies?.map((disc) => (
                          <Card key={disc.id} className="bg-destructive/5 border-destructive/20">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    disc.severity === "critical"
                                      ? "bg-red-500/20 text-red-700 border-red-500/30"
                                      : disc.severity === "high"
                                      ? "bg-orange-500/20 text-orange-700 border-orange-500/30"
                                      : "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                                  }
                                >
                                  {disc.severity}
                                </Badge>
                                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              </div>
                              <h4 className="font-medium mt-2">{disc.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {disc.description}
                              </p>
                              {disc.legal_reference && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  <Scale className="w-3 h-3 mr-1" />
                                  {disc.legal_reference}
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* AI Insights Summary */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Intelligence Summary
                  </CardTitle>
                  <CardDescription>
                    AI-generated case analysis overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-medium">Case Strength</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((events?.length || 0) * 5, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Based on {events?.length || 0} documented events and {discrepancies?.length || 0} identified issues
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{events?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Events</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{entities?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Named Entities</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-destructive">{discrepancies?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Discrepancies</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{evidence?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Evidence Files</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-6">
            {/* Repository Header */}
            <Card className="glass-card bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
              <CardContent className="py-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Evidence Repository</h3>
                      <p className="text-sm text-muted-foreground">
                        {evidence?.length || 0} documents and files • Click to view or download with HRPM coverpage
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/uploads">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Evidence
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Files Grid */}
            {evidenceLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : evidence?.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <h4 className="font-medium text-lg mb-1">No Evidence Files Yet</h4>
                    <p className="text-sm max-w-md mx-auto">
                      Upload documents, audio files, or other evidence to link them to this case.
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/uploads">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload First File
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {evidence?.map((file) => (
                  <EvidenceRepositoryCard 
                    key={file.id} 
                    file={file}
                    caseNumber={caseData.case_number}
                    caseTitle={caseData.title}
                  />
                ))}
              </div>
            )}

            {/* Info Card */}
            {evidence && evidence.length > 0 && (
              <Card className="glass-card border-dashed">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Branded Downloads Available</p>
                      <p>
                        Click the document icon button on any file to generate a printable coverpage 
                        with HRPM branding and case reference information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </PlatformLayout>
  );
};

export default CaseProfile;
