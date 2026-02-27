import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { openReportWindow } from "@/lib/reportShell";
import { generateCourtDossier } from "@/lib/courtDossierGenerator";
import { generateDossierReport } from "@/lib/dossierGenerator";
import { getCourtsList, COURT_PROFILES, COURT_FILING_TEMPLATES } from "@/lib/courtProfiles";
import type { CourtId, CourtFilingTemplate } from "@/types/reports";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { validateCourtDossier, auditCitations, getReadinessLabel, type ValidationResult, type CitationAudit } from "@/lib/dossierValidation";
import { assertReportContext, type QAResult, type ReportQAContext } from "@/lib/reportQA";
import { QAResultsModal } from "./QAResultsModal";
import { buildLODAppendix, buildKeyIssuesAppendix } from "@/lib/reportBlocks";
import {
  FileText, Plus, Trash2, ChevronRight, ChevronLeft,
  Gavel, Search, Loader2, Sparkles, ArrowUp, ArrowDown,
  Wand2, MessageSquare, Scale, Building2, AlertTriangle,
  ShieldCheck, Shield, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

export interface DossierSection {
  id: string;
  title: string;
  content: string;
  type: "custom" | "auto";
  autoKey?: string;
}

export interface DossierAnnexure {
  id: string;
  label: string;
  source: "evidence" | "affidavit";
  fileName: string;
  fileUrl: string;
  selected: boolean;
  suggested: boolean;
}

type Template = "court" | "investigation";
type Step = 1 | 2 | 3 | 4;

const INVESTIGATION_SECTIONS: Omit<DossierSection, "id">[] = [
  { title: "Executive Summary", content: "", type: "custom" },
  { title: "Background & Context", content: "", type: "custom" },
  { title: "Key Findings", content: "", type: "custom" },
  { title: "Evidence Summary", content: "", type: "custom" },
  { title: "Recommendations", content: "", type: "custom" },
];

let idCounter = 0;
const nextId = () => `sec-${++idCounter}`;

export const DossierBuilder = () => {
  const { toast } = useToast();
  const { selectedCaseId } = useCaseFilter();

  const [step, setStep] = useState<Step>(1);
  const [template, setTemplate] = useState<Template>("court");
  const [dossierTitle, setDossierTitle] = useState("");
  const [dossierSubtitle, setDossierSubtitle] = useState("");
  const [sections, setSections] = useState<DossierSection[]>([]);
  const [annexures, setAnnexures] = useState<DossierAnnexure[]>([]);
  const [generating, setGenerating] = useState(false);
  const [qaResult, setQaResult] = useState<QAResult | null>(null);
  const [qaOpen, setQaOpen] = useState(false);
  const [qaBypassed, setQaBypassed] = useState(false);

  // Court-specific state
  const [selectedCourt, setSelectedCourt] = useState<CourtId>("IHC");
  const [selectedFiling, setSelectedFiling] = useState<CourtFilingTemplate>("writ_petition");
  const [petitionerName, setPetitionerName] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [includeWatermark, setIncludeWatermark] = useState(true);

  // AI prompt state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPopulating, setAiPopulating] = useState(false);
  const [strictFactualMode, setStrictFactualMode] = useState(true);

  const courtProfile = COURT_PROFILES[selectedCourt];
  const filingTemplate = COURT_FILING_TEMPLATES[selectedFiling];
  const courtsList = getCourtsList();

  // Fetch case
  const { data: caseData } = useQuery({
    queryKey: ["dossier-case", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("cases").select("title, case_number, description").limit(1);
      if (selectedCaseId) q = q.eq("id", selectedCaseId);
      else q = q.eq("is_featured", true);
      const { data } = await q.maybeSingle();
      return data;
    },
  });

  // Fetch evidence uploads
  const { data: evidenceFiles } = useQuery({
    queryKey: ["dossier-evidence", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("evidence_uploads").select("id, file_name, public_url, category, file_type");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q.order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Fetch affidavits
  const { data: affidavitFiles } = useQuery({
    queryKey: ["dossier-affidavits", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("financial_affidavits").select("id, file_name, public_url, title, document_type");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q.order("created_at", { ascending: false });
      return data || [];
    },
  });

  // ── Step 1: Template + Court selection ──
  const handleSelectTemplate = (t: Template) => {
    setTemplate(t);
    if (t === "investigation") {
      setSections(INVESTIGATION_SECTIONS.map(s => ({ ...s, id: nextId() })));
      setDossierTitle("Investigation Dossier");
      setDossierSubtitle("Intelligence Assessment");
    } else {
      // Court mode — derive sections from filing template
      applyFilingTemplate(selectedFiling);
    }
  };

  const applyFilingTemplate = (filing: CourtFilingTemplate) => {
    setSelectedFiling(filing);
    const tmpl = COURT_FILING_TEMPLATES[filing];
    const secs = tmpl.sections.map(s => ({
      id: nextId(),
      title: s.title,
      content: "",
      type: "custom" as const,
    }));
    setSections(secs);
    setDossierTitle(tmpl.label);
    setDossierSubtitle(`${courtProfile.name} — Article 199`);
  };

  // ── AI Auto-Populate ──
  const handleAiPopulate = async () => {
    setAiPopulating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-dossier", {
        body: {
          template,
          prompt: aiPrompt,
          caseTitle: caseData?.title || "Active Investigation",
          caseNumber: caseData?.case_number,
          courtName: template === "court" ? courtProfile.name : undefined,
          filingType: template === "court" ? filingTemplate.label : undefined,
          existingSections: sections.map(s => ({ title: s.title, content: s.content })),
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return;
      }

      if (data?.title) setDossierTitle(data.title);
      if (data?.subtitle) setDossierSubtitle(data.subtitle);

      if (data?.sections?.length) {
        const newSections: DossierSection[] = data.sections.map((s: any) => ({
          id: nextId(),
          title: s.title,
          content: s.content,
          type: "auto" as const,
        }));
        setSections(newSections);
        toast({
          title: "Sections Populated",
          description: `AI generated ${newSections.length} sections for ${template === "court" ? courtProfile.name : "investigation"}.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "AI Generation Failed",
        description: err?.message || "Could not auto-populate sections.",
        variant: "destructive",
      });
    } finally {
      setAiPopulating(false);
    }
  };

  // ── Section management ──
  const addSection = () => {
    setSections(prev => [...prev, { id: nextId(), title: "New Section", content: "", type: "custom" }]);
  };

  const removeSection = (id: string) => setSections(prev => prev.filter(s => s.id !== id));

  const updateSection = (id: string, field: "title" | "content", value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    setSections(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // ── Annexures ──
  const buildAnnexures = useMemo(() => {
    const items: DossierAnnexure[] = [];
    (evidenceFiles || []).forEach(f => {
      items.push({
        id: f.id,
        label: f.file_name,
        source: "evidence",
        fileName: f.file_name,
        fileUrl: f.public_url,
        selected: false,
        suggested: (f.category === "legal_document" || f.file_type?.includes("pdf")),
      });
    });
    (affidavitFiles || []).forEach(f => {
      items.push({
        id: f.id,
        label: f.title || f.file_name,
        source: "affidavit",
        fileName: f.file_name,
        fileUrl: f.public_url,
        selected: true,
        suggested: true,
      });
    });
    return items;
  }, [evidenceFiles, affidavitFiles]);

  const initAnnexures = () => {
    if (annexures.length === 0) setAnnexures(buildAnnexures);
  };

  const toggleAnnexure = (id: string) => {
    setAnnexures(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  const selectAllSuggested = () => {
    setAnnexures(prev => prev.map(a => ({ ...a, selected: a.suggested ? true : a.selected })));
  };

  // Fetch events for appendices
  const { data: caseEvents } = useQuery({
    queryKey: ["dossier-events", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("extracted_events").select("*");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q.eq("is_hidden", false).eq("is_approved", true).order("date");
      return data || [];
    },
  });

  const { data: caseViolations } = useQuery({
    queryKey: ["dossier-violations", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("compliance_violations").select("*");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: caseDiscrepancies } = useQuery({
    queryKey: ["dossier-discrepancies", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("extracted_discrepancies").select("*");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: caseEntities } = useQuery({
    queryKey: ["dossier-entities", selectedCaseId],
    queryFn: async () => {
      let q = supabase.from("extracted_entities").select("name, category, role");
      if (selectedCaseId) q = q.eq("case_id", selectedCaseId);
      const { data } = await q;
      return data || [];
    },
  });

  // ── Generate ──
  const handleGenerate = async () => {
    // Block generation if critical validation errors in court mode
    if (template === "court" && validation && validation.issues.filter(i => i.type === 'error').length > 0) {
      toast({
        title: "Court Filing Incomplete",
        description: `${validation.issues.filter(i => i.type === 'error').length} critical issues must be resolved before generating.`,
        variant: "destructive",
      });
      return;
    }

    // Strict factual mode citation warning
    if (strictFactualMode && citationAudit && citationAudit.unverifiedCount > 0) {
      toast({
        title: "Unverified Citations Detected",
        description: `${citationAudit.unverifiedCount} case law citation(s) not found in database. Review before filing.`,
        variant: "destructive",
      });
    }

    // Run QA preflight
    const qaContext: ReportQAContext = {
      reportType: template === "court" ? "Court Dossier" : "Investigation Dossier",
      courtMode: template === "court",
      entities: { total: (caseEntities || []).length, hostile: (caseEntities || []).filter(e => e.category === 'antagonist').length },
      events: (caseEvents || []).map(e => ({ date: e.date, category: e.category })),
      evidence: (evidenceFiles || []).map(u => ({ id: u.id })),
      discrepancies: caseDiscrepancies || [],
      violations: caseViolations || [],
      sections: sections.map(s => ({ title: s.title, content: s.content })),
      annexures: annexures.map(a => ({ label: a.label, selected: a.selected })),
    };
    const result = assertReportContext(qaContext);

    if (!result.ok || result.warnings.length > 0) {
      setQaResult(result);
      setQaOpen(true);
      return;
    }

    await executeGeneration();
  };

  const executeGeneration = async (bypassed?: boolean) => {
    setGenerating(true);
    setQaOpen(false);
    setQaBypassed(!!bypassed);
    try {
      const selectedAnnexures = annexures.filter(a => a.selected);
      let html: string;

      // Build court-mode appendices automatically
      let appendicesHTML = '';
      if (template === "court") {
        appendicesHTML += buildLODAppendix(caseEvents || []);
        appendicesHTML += buildKeyIssuesAppendix(
          caseViolations || [],
          caseDiscrepancies || [],
          caseEntities || [],
          (caseEvents || []).map(e => ({ date: e.date, category: e.category, description: e.description })),
          (evidenceFiles || []).map(f => ({ id: f.id, fileName: f.file_name, category: f.category || undefined })),
        );
      }

      if (template === "court") {
        html = generateCourtDossier({
          courtId: selectedCourt,
          filingTemplate: selectedFiling,
          title: dossierTitle || filingTemplate.label,
          subtitle: dossierSubtitle || `${courtProfile.name}`,
          caseTitle: caseData?.title || "Active Investigation",
          caseNumber: caseData?.case_number,
          petitionerName,
          respondentName,
          sections,
          annexures: selectedAnnexures,
          includeWatermark,
        });
        // Inject appendices before closing </body>
        if (appendicesHTML) {
          html = html.replace('</body>', appendicesHTML + '</body>');
        }
      } else {
        html = generateDossierReport({
          template,
          title: dossierTitle || "Investigation Dossier",
          subtitle: dossierSubtitle || "Intelligence Assessment",
          caseTitle: caseData?.title || "Active Investigation",
          caseNumber: caseData?.case_number,
          sections,
          annexures: selectedAnnexures,
        });
      }

      await openReportWindow(html);
      // Log dossier generation for audit trail
      await logDossierGeneration(bypassed);
      toast({ title: "Dossier Generated", description: `${sections.length} sections, ${selectedAnnexures.length} annexures` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to generate dossier", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return sections.length > 0;
    return true;
  };

  const selectedAnnexCount = annexures.filter(a => a.selected).length;
  const filledSections = sections.filter(s => s.content.trim()).length;

  // ── Court Readiness Validation ──
  const validation: ValidationResult | null = useMemo(() => {
    if (template !== "court") return null;
    return validateCourtDossier(sections, annexures, selectedCourt, selectedFiling, petitionerName, respondentName);
  }, [template, sections, annexures, selectedCourt, selectedFiling, petitionerName, respondentName]);

  const citationAudit: CitationAudit | null = useMemo(() => {
    if (template !== "court" || sections.length === 0) return null;
    return auditCitations(sections, strictFactualMode);
  }, [template, sections, strictFactualMode]);

  const readiness = validation ? getReadinessLabel(validation.score) : null;

  const logDossierGeneration = async (bypassed?: boolean) => {
    try {
      await supabase.from("generated_reports").insert({
        case_id: selectedCaseId || null,
        title: dossierTitle || filingTemplate.label,
        report_type: "court_dossier",
        template: selectedFiling,
        sections_count: sections.length,
        annexures_count: selectedAnnexCount,
        description: `${courtProfile.name} — ${filingTemplate.label}`,
        metadata: JSON.parse(JSON.stringify({
          courtId: selectedCourt,
          filingType: selectedFiling,
          petitionerName,
          respondentName,
          includeWatermark,
          strictFactualMode,
          readinessScore: validation?.score || null,
          sectionTitles: sections.map(s => s.title),
          annexureLabels: annexures.filter(a => a.selected).map(a => a.label),
          generatedAt: new Date().toISOString(),
          qa_result: qaResult ? { ok: qaResult.ok, warnings: qaResult.warnings.map(w => ({ code: w.code, severity: w.severity, message: w.message })), errors: qaResult.errors.map(e => ({ code: e.code, severity: e.severity, message: e.message })), bypassed: !!bypassed } : { ok: true, warnings: [], errors: [], bypassed: false },
        })),
      } as any);
    } catch (err) {
      console.error("Failed to log dossier generation:", err);
    }
  };

  return (
    <>
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Court Dossier & Legal Filing Builder</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <CardDescription className="text-xs">
          {step === 1 && "Select court, filing type, and describe what you need"}
          {step === 2 && "Review, edit, or add sections — AI-generated content is fully editable"}
          {step === 3 && "Select source documents to annex"}
          {step === 4 && "Review and generate your jurisdiction-aware court filing"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ─── STEP 1: Template + Court + AI Prompt ─── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Template selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectTemplate("court")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${template === "court" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <Scale className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-sm">Court Filing / Petition</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Jurisdiction-aware filing with proper court heading, verification, and annexure labeling
                </p>
              </button>
              <button
                onClick={() => handleSelectTemplate("investigation")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${template === "investigation" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <Search className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-sm">Investigation Dossier</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Executive Summary, Evidence Matrix, Timeline, Findings, Recommendations
                </p>
              </button>
            </div>

            {/* Court-specific options */}
            {template === "court" && (
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold">Jurisdiction & Filing Type</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Court</label>
                    <Select value={selectedCourt} onValueChange={(v) => { setSelectedCourt(v as CourtId); }}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courtsList.map(c => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Filing Type</label>
                    <Select value={selectedFiling} onValueChange={(v) => applyFilingTemplate(v as CourtFilingTemplate)}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(COURT_FILING_TEMPLATES).map(t => (
                          <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Petitioner Name</label>
                    <Input
                      placeholder="e.g., Danish Thanvi"
                      value={petitionerName}
                      onChange={e => setPetitionerName(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Respondent(s)</label>
                    <Input
                      placeholder="e.g., Federation of Pakistan & Others"
                      value={respondentName}
                      onChange={e => setRespondentName(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={includeWatermark}
                    onCheckedChange={(v) => setIncludeWatermark(v === true)}
                    id="watermark"
                  />
                  <label htmlFor="watermark" className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                    Include "DRAFT — REQUIRES LEGAL REVIEW" watermark
                  </label>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-accent/30 border border-accent">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-semibold">Strict Factual Mode</p>
                      <p className="text-[10px] text-muted-foreground">AI cannot invent statutes or case law — only database-backed citations allowed</p>
                    </div>
                  </div>
                  <Switch checked={strictFactualMode} onCheckedChange={setStrictFactualMode} />
                </div>

                {/* Court info badge */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px]">{courtProfile.name}</Badge>
                  <Badge variant="outline" className="text-[10px]">Annexure: {courtProfile.filingStyle.annexLabel}</Badge>
                  <Badge variant="outline" className="text-[10px]">{courtProfile.filingStyle.affidavitStyle === 'affidavit' ? 'Affidavit' : 'Verification'} mode</Badge>
                  <Badge variant="outline" className="text-[10px]">Seat: {courtProfile.seatCities[0]}</Badge>
                </div>
              </div>
            )}

            {/* Title/Subtitle */}
            <div className="space-y-2">
              <Input
                placeholder="Dossier title"
                value={dossierTitle}
                onChange={e => setDossierTitle(e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Subtitle / Filing type (e.g., Writ Petition u/Art 199)"
                value={dossierSubtitle}
                onChange={e => setDossierSubtitle(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* AI Prompt Box */}
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">AI Auto-Populate</h4>
                <Badge variant="secondary" className="text-[9px]">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Powered by AI
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Describe what you need and AI will generate all sections with {template === "court" ? `${courtProfile.name}-aware legal content` : "investigative content"}.
              </p>
              <Textarea
                placeholder={template === "court"
                  ? `e.g., Draft a ${filingTemplate.label.toLowerCase()} for ${courtProfile.name} challenging PECA §33 violations during FIA raid, illegal seizure of devices without warrant, and forged recovery memos. Include constitutional grounds under Articles 4, 10A, and 14.`
                  : "e.g., Create an investigation dossier covering systematic persecution including false FIRs, evidence fabrication, regulatory weaponization, and military intelligence abuse."
                }
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="text-xs min-h-[80px] bg-background"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleAiPopulate}
                  disabled={aiPopulating || sections.length === 0}
                  className="gap-1.5"
                >
                  {aiPopulating ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="w-3.5 h-3.5" /> Auto-Populate Sections</>
                  )}
                </Button>
                <span className="text-[10px] text-muted-foreground">
                  {aiPrompt ? "Custom prompt will guide AI output" : "Leave empty for default template content"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Sections ─── */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
              <MessageSquare className="w-4 h-4 text-primary shrink-0" />
              <Input
                placeholder="Ask AI to add a section, e.g., 'Add a section on chain of custody failures'"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="text-xs h-8 flex-1"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAiPopulate}
                disabled={aiPopulating || !aiPrompt.trim()}
                className="text-xs h-8 gap-1 shrink-0"
              >
                {aiPopulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Generate
              </Button>
            </div>

            <ScrollArea className="h-[320px] pr-2">
              <div className="space-y-2">
                {sections.map((sec, idx) => (
                  <div key={sec.id} className="border rounded-lg p-3 space-y-2 bg-card">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">§{idx + 1}</Badge>
                      {sec.type === "auto" && (
                        <Badge variant="secondary" className="text-[9px] shrink-0 gap-0.5">
                          <Sparkles className="w-2 h-2" /> AI
                        </Badge>
                      )}
                      <Input
                        value={sec.title}
                        onChange={e => updateSection(sec.id, "title", e.target.value)}
                        className="text-sm h-8 flex-1"
                      />
                      <button onClick={() => removeSection(sec.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Textarea
                      placeholder="Write your narrative for this section..."
                      value={sec.content}
                      onChange={e => updateSection(sec.id, "content", e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button variant="outline" size="sm" onClick={addSection} className="w-full">
              <Plus className="w-4 h-4 mr-1" /> Add Section Manually
            </Button>
          </div>
        )}

        {/* ─── STEP 3: Annexures ─── */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                AI-suggested documents are pre-selected
                {template === "court" && (
                  <span className="ml-1">• Labels: <strong>{courtProfile.filingStyle.annexLabel}</strong> style</span>
                )}
              </p>
              <Button variant="ghost" size="sm" onClick={selectAllSuggested} className="text-xs h-7">
                Select Suggested
              </Button>
            </div>
            <ScrollArea className="h-[300px] pr-2">
              <div className="space-y-1.5">
                {annexures.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No documents found for this case.</p>
                )}
                {annexures.map((ann, idx) => {
                  const annexLabel = template === "court"
                    ? `${courtProfile.filingStyle.annexLabel.replace(/[A-Z0-9]$/, '')}${String.fromCharCode(65 + idx)}`
                    : `Annex-${String.fromCharCode(65 + idx)}`;
                  return (
                    <div
                      key={ann.id}
                      className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${ann.selected ? "border-primary/30 bg-primary/5" : "border-border"}`}
                    >
                      <Checkbox
                        checked={ann.selected}
                        onCheckedChange={() => toggleAnnexure(ann.id)}
                      />
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ann.label}</p>
                        <p className="text-[10px] text-muted-foreground">{ann.source === "affidavit" ? "Affidavit" : "Evidence"}</p>
                      </div>
                      {ann.suggested && (
                        <Badge variant="secondary" className="text-[9px] shrink-0">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Suggested
                        </Badge>
                      )}
                      {ann.selected && (
                        <Badge variant="outline" className="text-[9px] shrink-0">
                          {annexLabel}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ─── STEP 4: Review ─── */}
        {step === 4 && (
          <div className="space-y-3">
            {/* Court Readiness Score */}
            {template === "court" && validation && readiness && (
              <div className="border rounded-lg p-4 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Court Readiness Assessment</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${readiness.color}`}>{validation.score}%</span>
                    <Badge variant={validation.score >= 70 ? "default" : "destructive"} className="text-[10px]">
                      {readiness.label}
                    </Badge>
                  </div>
                </div>
                <Progress value={validation.score} className="h-2" />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { label: 'Required Sections', score: validation.breakdown.requiredSections.score, detail: `${validation.breakdown.requiredSections.present}/${validation.breakdown.requiredSections.total}` },
                    { label: 'Content Density', score: validation.breakdown.contentDensity.score, detail: `${validation.breakdown.contentDensity.filledSections}/${validation.breakdown.contentDensity.totalSections} filled` },
                    { label: 'Annexure Integrity', score: validation.breakdown.annexureIntegrity.score, detail: `${validation.breakdown.annexureIntegrity.issues.length} issues` },
                    { label: 'Party Details', score: validation.breakdown.partyDetails.score, detail: validation.breakdown.partyDetails.hasPetitioner && validation.breakdown.partyDetails.hasRespondent ? 'Complete' : 'Incomplete' },
                    { label: 'Verification', score: validation.breakdown.verificationPresent.score, detail: validation.breakdown.verificationPresent.present ? 'Included' : 'Missing' },
                  ].map(item => (
                    <div key={item.label} className="text-center p-2 rounded-md bg-muted/50 border border-border">
                      <div className={`text-sm font-bold ${item.score >= 80 ? 'text-green-600' : item.score >= 50 ? 'text-amber-600' : 'text-destructive'}`}>{item.score}%</div>
                      <div className="text-[9px] text-muted-foreground font-medium">{item.label}</div>
                      <div className="text-[9px] text-muted-foreground">{item.detail}</div>
                    </div>
                  ))}
                </div>

                {/* Validation Issues */}
                {validation.issues.length > 0 && (
                  <div className="space-y-1 max-h-[120px] overflow-y-auto">
                    {validation.issues.slice(0, 8).map((issue, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[10px]">
                        {issue.type === 'error' ? <XCircle className="w-3 h-3 text-destructive shrink-0 mt-0.5" /> :
                         issue.type === 'warning' ? <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" /> :
                         <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />}
                        <span className="text-muted-foreground">{issue.message}</span>
                      </div>
                    ))}
                    {validation.issues.length > 8 && (
                      <p className="text-[10px] text-muted-foreground">+ {validation.issues.length - 8} more issues</p>
                    )}
                  </div>
                )}

                {/* Citation Audit */}
                {citationAudit && citationAudit.totalCitations > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-semibold">Citation Audit</span>
                      {strictFactualMode && <Badge variant="outline" className="text-[8px] h-4">Strict Mode</Badge>}
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>{citationAudit.statutoryRefs.length} statutory refs</span>
                      <span>{citationAudit.caseLawRefs.length} case law refs</span>
                      {citationAudit.unverifiedCount > 0 && (
                        <span className="text-destructive font-semibold">{citationAudit.unverifiedCount} unverified</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border rounded-lg p-4 bg-card space-y-2">
              <h4 className="font-semibold text-sm">{dossierTitle || "Untitled Dossier"}</h4>
              <p className="text-xs text-muted-foreground">{dossierSubtitle}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Template:</span> {template === "court" ? filingTemplate.label : "Investigation"}</div>
                <div><span className="text-muted-foreground">Case:</span> {caseData?.title || "N/A"}</div>
                {template === "court" && (
                  <>
                    <div><span className="text-muted-foreground">Court:</span> {courtProfile.name}</div>
                    <div><span className="text-muted-foreground">Seat:</span> {courtProfile.seatCities[0]}</div>
                    {petitionerName && <div><span className="text-muted-foreground">Petitioner:</span> {petitionerName}</div>}
                    {respondentName && <div><span className="text-muted-foreground">Respondent:</span> {respondentName}</div>}
                  </>
                )}
                <div><span className="text-muted-foreground">Sections:</span> {sections.length} ({filledSections} filled)</div>
                <div><span className="text-muted-foreground">Annexures:</span> {selectedAnnexCount}</div>
                {strictFactualMode && template === "court" && (
                  <div className="col-span-2 flex items-center gap-1 text-primary">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] font-semibold">Strict Factual Mode Active</span>
                  </div>
                )}
              </div>
              {includeWatermark && template === "court" && (
                <div className="flex items-center gap-1.5 text-[10px] text-destructive bg-destructive/5 rounded px-2 py-1">
                  <AlertTriangle className="w-3 h-3" />
                  Draft watermark enabled — will show "DRAFT — REQUIRES LEGAL REVIEW"
                </div>
              )}
              <Separator />
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Table of Contents</p>
                {sections.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground flex-1">{i + 1}. {s.title}</p>
                    {s.type === "auto" && (
                      <Badge variant="secondary" className="text-[8px] h-4 gap-0.5">
                        <Sparkles className="w-2 h-2" /> AI
                      </Badge>
                    )}
                    {s.content ? (
                      <Badge variant="outline" className="text-[8px] h-4 text-green-600">Filled</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[8px] h-4 text-amber-600">Empty</Badge>
                    )}
                  </div>
                ))}
                {selectedAnnexCount > 0 && (
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    + {selectedAnnexCount} Annexed Documents ({courtProfile.filingStyle.annexLabel} style)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Navigation ─── */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            disabled={step === 1}
            onClick={() => setStep(prev => (prev - 1) as Step)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < 4 ? (
            <Button
              size="sm"
              disabled={!canProceed()}
              onClick={() => {
                if (step === 2) initAnnexures();
                setStep(prev => (prev + 1) as Step);
              }}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Gavel className="w-4 h-4 mr-1" />}
              Generate {template === "court" ? "Court Filing" : "Dossier"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

    {qaResult && (
      <QAResultsModal
        open={qaOpen}
        onOpenChange={setQaOpen}
        qaResult={qaResult}
        onProceedAnyway={() => executeGeneration(true)}
        onCancel={() => { setQaOpen(false); setQaResult(null); }}
      />
    )}
    </>
  );
};
