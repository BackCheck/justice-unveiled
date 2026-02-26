import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateDossierReport } from "@/lib/dossierGenerator";
import { openReportWindow } from "@/lib/reportShell";
import {
  FileText, Plus, Trash2, GripVertical, ChevronRight, ChevronLeft,
  Gavel, Search, BookOpen, Loader2, Sparkles, ArrowUp, ArrowDown,
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

const COURT_SECTIONS: Omit<DossierSection, "id">[] = [
  { title: "Statement of Facts", content: "", type: "custom" },
  { title: "Issues for Determination", content: "", type: "custom" },
  { title: "Arguments on Law", content: "", type: "custom" },
  { title: "Application of Law to Facts", content: "", type: "custom" },
  { title: "Prayer for Relief", content: "", type: "custom" },
];

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

  // ── Step 1: Template selection ──
  const handleSelectTemplate = (t: Template) => {
    setTemplate(t);
    const base = t === "court" ? COURT_SECTIONS : INVESTIGATION_SECTIONS;
    setSections(base.map(s => ({ ...s, id: nextId() })));
    setDossierTitle(t === "court" ? "Court Filing Dossier" : "Investigation Dossier");
    setDossierSubtitle(t === "court" ? "Petition / Application" : "Intelligence Assessment");
  };

  // ── Step 2: Section management ──
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

  // ── Step 3: Annexures ──
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

  // ── Step 4: Generate ──
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const selectedAnnexures = annexures.filter(a => a.selected);
      const html = generateDossierReport({
        template,
        title: dossierTitle || "Court Dossier",
        subtitle: dossierSubtitle || "Legal Submission",
        caseTitle: caseData?.title || "Active Investigation",
        caseNumber: caseData?.case_number,
        sections,
        annexures: selectedAnnexures,
      });
      await openReportWindow(html);
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
    if (step === 3) return true;
    return true;
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Custom Court Dossier Builder</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <CardDescription className="text-xs">
          {step === 1 && "Choose a template to start building your dossier"}
          {step === 2 && "Add and edit sections for your dossier"}
          {step === 3 && "Select source documents to annex"}
          {step === 4 && "Review and generate your court-ready dossier"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ─── STEP 1: Template ─── */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectTemplate("court")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${template === "court" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <Gavel className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-sm">Court Filing Format</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Cover, Index, Statement of Facts, Issues, Arguments, Prayer, Annexures
                </p>
              </button>
              <button
                onClick={() => handleSelectTemplate("investigation")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${template === "investigation" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <Search className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-sm">Investigation Dossier</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Executive Summary, Evidence Matrix, Timeline, Entity Analysis, Recommendations
                </p>
              </button>
            </div>
            <div className="space-y-2 mt-4">
              <Input
                placeholder="Dossier title"
                value={dossierTitle}
                onChange={e => setDossierTitle(e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Subtitle / Filing type"
                value={dossierSubtitle}
                onChange={e => setDossierSubtitle(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        )}

        {/* ─── STEP 2: Sections ─── */}
        {step === 2 && (
          <div className="space-y-3">
            <ScrollArea className="h-[340px] pr-2">
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
                      placeholder="Write your narrative for this section... Leave empty to auto-fill with a placeholder."
                      value={sec.content}
                      onChange={e => updateSection(sec.id, "content", e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button variant="outline" size="sm" onClick={addSection} className="w-full">
              <Plus className="w-4 h-4 mr-1" /> Add Section
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
                {annexures.map((ann, idx) => (
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
                        Annex-{String.fromCharCode(65 + idx)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ─── STEP 4: Review ─── */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="border rounded-lg p-4 bg-card space-y-2">
              <h4 className="font-semibold text-sm">{dossierTitle || "Untitled Dossier"}</h4>
              <p className="text-xs text-muted-foreground">{dossierSubtitle}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Template:</span> {template === "court" ? "Court Filing" : "Investigation"}</div>
                <div><span className="text-muted-foreground">Case:</span> {caseData?.title || "N/A"}</div>
                <div><span className="text-muted-foreground">Sections:</span> {sections.length}</div>
                <div><span className="text-muted-foreground">Annexures:</span> {annexures.filter(a => a.selected).length}</div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Table of Contents</p>
                {sections.map((s, i) => (
                  <p key={s.id} className="text-xs text-muted-foreground">{i + 1}. {s.title}</p>
                ))}
                {annexures.filter(a => a.selected).length > 0 && (
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    + {annexures.filter(a => a.selected).length} Annexed Documents
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
              Generate Dossier
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
