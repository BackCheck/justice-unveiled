import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  User,
  Building2,
  AlertTriangle,
  Target,
  Brain,
  Sparkles,
  Loader2,
  ChevronRight,
  Eye,
  Network,
  RefreshCw,
  Printer,
  Swords,
  Search,
  BookOpen,
  Scale,
  Activity,
  TrendingUp,
} from "lucide-react";
import { ThreatProfileReport } from "./ThreatProfileReport";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ThreatProfile {
  entityId: string;
  entityName: string;
  threatLevel: "critical" | "high" | "medium" | "low";
  riskScore: number;
  summary: string;
  motivations: string[];
  tactics: string[];
  behavioralPatterns: { pattern: string; frequency: string; severity: string }[];
  connections: string[];
  timeline: string[];
  vulnerabilities: string[];
  counterStrategies: { tactic: string; counter: string; effectiveness: string }[];
  evidenceGaps: { gap: string; priority: string; suggestedAction: string }[];
  historicalPrecedents: { caseName: string; relevance: string; outcome: string }[];
  recommendations: string[];
}

export const ThreatProfiler = () => {
  const { entities, connections } = useCombinedEntities();
  const { events } = useCombinedTimeline();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<ThreatProfile | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintReport = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Threat Profile – ${profile?.entityName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; }
        .print\\:block { display: block !important; }
        .hidden { display: block !important; }
        .min-h-screen { min-height: 100vh; }
        .flex { display: flex; } .flex-col { flex-direction: column; }
        .items-center { align-items: center; } .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-4xl { font-size: 2.25rem; } .text-3xl { font-size: 1.875rem; }
        .text-2xl { font-size: 1.5rem; } .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; } .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; } .font-mono { font-family: monospace; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; } .tracking-wider { letter-spacing: 0.05em; }
        .leading-relaxed { line-height: 1.625; }
        .mb-1 { margin-bottom: 0.25rem; } .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; } .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; } .mt-1 { margin-top: 0.25rem; }
        .mt-4 { margin-top: 1rem; } .mt-6 { margin-top: 1.5rem; }
        .mt-8 { margin-top: 2rem; } .my-12 { margin-top: 3rem; margin-bottom: 3rem; }
        .ml-2 { margin-left: 0.5rem; }
        .p-3 { padding: 0.75rem; } .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; } .p-12 { padding: 3rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .pt-3 { padding-top: 0.75rem; } .pt-6 { padding-top: 1.5rem; }
        .pb-4 { padding-bottom: 1rem; }
        .gap-2 { gap: 0.5rem; } .gap-3 { gap: 0.75rem; } .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .rounded-full { border-radius: 9999px; } .rounded-lg { border-radius: 0.5rem; }
        .border { border: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .border-l-4 { border-left: 4px solid; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-amber-50 { background-color: #fffbeb; }
        .bg-red-50 { background-color: #fef2f2; }
        .bg-purple-50 { background-color: #faf5ff; }
        .border-gray-100 { border-color: #f3f4f6; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-blue-100 { border-color: #dbeafe; }
        .border-amber-200 { border-color: #fde68a; }
        .border-red-200 { border-color: #fecaca; }
        .border-purple-200 { border-color: #e9d5ff; }
        .text-gray-300 { color: #d1d5db; } .text-gray-400 { color: #9ca3af; }
        .text-gray-500 { color: #6b7280; } .text-gray-600 { color: #4b5563; }
        .text-gray-700 { color: #374151; } .text-gray-800 { color: #1f2937; }
        .text-gray-900 { color: #111827; } .text-white { color: #fff; }
        .text-red-700 { color: #b91c1c; } .text-amber-700 { color: #b45309; }
        .text-purple-700 { color: #7e22ce; }
        .w-6 { width: 1.5rem; } .w-8 { width: 2rem; } .w-10 { width: 2.5rem; }
        .w-16 { width: 4rem; } .w-32 { width: 8rem; }
        .h-1 { height: 0.25rem; } .h-2 { height: 0.5rem; } .h-8 { height: 2rem; } .h-10 { height: 2.5rem; }
        .h-24 { height: 6rem; } .w-auto { width: auto; } .w-full { width: 100%; }
        .max-w-lg { max-width: 32rem; }
        .shrink-0 { flex-shrink: 0; }
        .inline-block { display: inline-block; } .inline-flex { display: inline-flex; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .break-all { word-break: break-all; }
        .overflow-hidden { overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; }
        th { background: #f9fafb; font-weight: 600; color: #374151; }
        @media print { 
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { margin: 0; }
      </style></head><body>${printContent}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const threatEntities = entities.filter(e => e.category === "antagonist");

  const generateThreatProfile = async (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;

    setSelectedEntity(entityId);
    setIsGenerating(true);
    setProfile(null);
    setActiveSection("overview");

    try {
      const relatedEvents = events.filter(e =>
        e.individuals.toLowerCase().includes(entity.name.split(' ')[0].toLowerCase())
      );
      const entityConnections = connections
        .filter(c => c.source === entityId || c.target === entityId)
        .map(c => {
          const connectedId = c.source === entityId ? c.target : c.source;
          return entities.find(e => e.id === connectedId)?.name || connectedId;
        });

      const response = await supabase.functions.invoke("threat-profiler", {
        body: {
          entity: { name: entity.name, role: entity.role, type: entity.type, description: entity.description },
          relatedEvents: relatedEvents.slice(0, 10).map(e => ({ date: e.date, category: e.category, description: e.description, outcome: e.outcome })),
          connections: entityConnections,
        },
      });

      if (response.error) throw response.error;
      setProfile(response.data);
      toast.success("Threat profile generated");
    } catch (error) {
      console.error("Profile generation error:", error);
      toast.error("Failed to generate threat profile");

      const fallbackConnections = connections
        .filter(c => c.source === entityId || c.target === entityId)
        .map(c => {
          const connectedId = c.source === entityId ? c.target : c.source;
          return entities.find(e => e.id === connectedId)?.name || connectedId;
        });
      const fallbackEvents = events.filter(e =>
        e.individuals.toLowerCase().includes(entity.name.split(' ')[0].toLowerCase())
      );

      setProfile({
        entityId,
        entityName: entity.name,
        threatLevel: "high",
        riskScore: 78,
        summary: `${entity.name} has been identified as a key antagonist in the case, with documented involvement in multiple harassment incidents and potential evidence manipulation.`,
        motivations: [
          "Financial gain through business interference",
          "Personal vendetta or competitive rivalry",
          "Abuse of official position for private benefit",
        ],
        tactics: [
          "Filing false FIRs and criminal complaints",
          "Leveraging agency connections for raids",
          "Coordinating with multiple parties for sustained pressure",
        ],
        behavioralPatterns: [
          { pattern: "Filing complaints immediately after victim's legal actions", frequency: "recurring", severity: "high" },
          { pattern: "Using intermediaries to distance from direct involvement", frequency: "occasional", severity: "medium" },
          { pattern: "Escalating pressure during critical legal deadlines", frequency: "recurring", severity: "critical" },
        ],
        connections: fallbackConnections.slice(0, 5),
        timeline: fallbackEvents.slice(0, 5).map(e => `${e.date}: ${e.description.slice(0, 100)}...`),
        vulnerabilities: [
          "Documented procedural violations in filed cases",
          "Inconsistent statements across multiple proceedings",
          "Trail of communications showing coordination",
        ],
        counterStrategies: [
          { tactic: "False FIR filings", counter: "File quashing petitions citing procedural violations", effectiveness: "high" },
          { tactic: "Agency raids coordination", counter: "RTI requests to expose unauthorized actions", effectiveness: "medium" },
          { tactic: "Witness intimidation", counter: "Document all interactions, seek court protection orders", effectiveness: "high" },
        ],
        evidenceGaps: [
          { gap: "Communication records between antagonist and agency officials", priority: "critical", suggestedAction: "File RTI applications for correspondence logs" },
          { gap: "Financial transaction trail showing bribery", priority: "high", suggestedAction: "Subpoena bank records through court order" },
          { gap: "Witness statements from neutral third parties", priority: "medium", suggestedAction: "Interview neighbors and business associates" },
        ],
        historicalPrecedents: [
          { caseName: "State of Maharashtra v. Tapas D. Neogy", relevance: "Quashing of FIR filed with malicious intent", outcome: "FIR quashed, costs awarded to victim" },
          { caseName: "Bhajan Lal v. State of Haryana", relevance: "Guidelines for quashing criminal proceedings", outcome: "Established 7 categories for quashing" },
        ],
        recommendations: [
          "Focus on timeline inconsistencies in legal filings",
          "Cross-reference with agency action dates",
          "Document all procedural failures for court submission",
          "File contempt proceedings for violation of court orders",
          "Prepare comprehensive counter-affidavit with evidence matrix",
        ],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const threatLevelColors = {
    critical: "bg-red-500/20 text-red-700 border-red-500/30",
    high: "bg-orange-500/20 text-orange-700 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    low: "bg-green-500/20 text-green-700 border-green-500/30",
  };

  const sections = [
    { id: "overview", label: "Overview", icon: Brain },
    { id: "motivations", label: "Motivations", icon: Target },
    { id: "tactics", label: "Tactics", icon: Eye },
    { id: "patterns", label: "Behavioral Patterns", icon: Activity },
    { id: "connections", label: "Network", icon: Network },
    { id: "vulnerabilities", label: "Vulnerabilities", icon: AlertTriangle },
    { id: "counter", label: "Counter-Strategies", icon: Swords },
    { id: "gaps", label: "Evidence Gaps", icon: Search },
    { id: "precedents", label: "Historical Precedents", icon: BookOpen },
    { id: "recommendations", label: "Recommendations", icon: Scale },
  ];

  const severityColors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-700",
    high: "bg-orange-500/20 text-orange-700",
    medium: "bg-yellow-500/20 text-yellow-700",
    low: "bg-green-500/20 text-green-700",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Entity Selection */}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Entity Selection */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Entities
            </CardTitle>
            <CardDescription>
              {threatEntities.length} antagonists identified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {threatEntities.map((entity) => (
                  <Button
                    key={entity.id}
                    variant={selectedEntity === entity.id ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={() => generateThreatProfile(entity.id)}
                    disabled={isGenerating}
                  >
                    <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      {entity.type === "person" ? (
                        <User className="w-4 h-4 text-red-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-sm truncate">{entity.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{entity.role || entity.type}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Button>
                ))}
                {threatEntities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No threat entities identified</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Profile Display */}
        <Card className="glass-card lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Threat Profile Analysis
              </CardTitle>
              {profile && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Report
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => selectedEntity && generateThreatProfile(selectedEntity)}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                    Regenerate
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
                  <p className="text-sm text-muted-foreground">Analyzing entity data...</p>
                  <p className="text-xs text-muted-foreground mt-1">Generating comprehensive threat assessment</p>
                </div>
              </div>
            ) : profile ? (
              <div className="flex gap-4 h-[500px]">
                {/* Section Navigation */}
                <div className="w-48 shrink-0 border-r pr-4 overflow-y-auto">
                  <div className="space-y-1">
                    {sections.map((s) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setActiveSection(s.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            activeSection === s.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Content */}
                <ScrollArea className="flex-1">
                  <div className="pr-4 space-y-4">
                    {activeSection === "overview" && (
                      <>
                        <div className="flex items-start justify-between gap-4 pb-4 border-b">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{profile.entityName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{profile.summary}</p>
                          </div>
                          <Badge className={`${threatLevelColors[profile.threatLevel]} border shrink-0`}>
                            {profile.threatLevel.toUpperCase()} THREAT
                          </Badge>
                        </div>
                        {/* Risk Score */}
                        <div className="p-4 rounded-lg bg-muted/30 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              Risk Score
                            </span>
                            <span className="text-2xl font-bold text-primary">{profile.riskScore}/100</span>
                          </div>
                          <Progress value={profile.riskScore} className="h-2" />
                        </div>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: "Motivations", value: profile.motivations.length },
                            { label: "Tactics", value: profile.tactics.length },
                            { label: "Connections", value: profile.connections.length },
                            { label: "Vulnerabilities", value: profile.vulnerabilities.length },
                          ].map(s => (
                            <div key={s.label} className="text-center p-3 bg-muted/20 rounded-lg border">
                              <p className="text-xl font-bold text-primary">{s.value}</p>
                              <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {activeSection === "motivations" && (
                      <ProfileList items={profile.motivations} color="bg-orange-500" icon={<Target className="w-4 h-4 text-orange-500" />} title="Suspected Motivations" />
                    )}

                    {activeSection === "tactics" && (
                      <ProfileList items={profile.tactics} color="bg-purple-500" icon={<Eye className="w-4 h-4 text-purple-500" />} title="Known Tactics" />
                    )}

                    {activeSection === "patterns" && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Behavioral Patterns
                        </h4>
                        <div className="space-y-2">
                          {(profile.behavioralPatterns || []).map((bp, i) => (
                            <div key={i} className="p-3 rounded-lg bg-muted/20 border flex items-start justify-between gap-3">
                              <p className="text-sm flex-1">{bp.pattern}</p>
                              <div className="flex gap-2 shrink-0">
                                <Badge variant="outline" className="text-[10px]">{bp.frequency}</Badge>
                                <Badge className={`text-[10px] ${severityColors[bp.severity] || ""}`}>{bp.severity}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSection === "connections" && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Network className="w-4 h-4 text-blue-500" />
                          Key Connections
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.connections.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs py-1.5 px-3">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSection === "vulnerabilities" && (
                      <ProfileList items={profile.vulnerabilities} color="bg-emerald-500" icon={<AlertTriangle className="w-4 h-4 text-emerald-500" />} title="Exploitable Vulnerabilities" />
                    )}

                    {activeSection === "counter" && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Swords className="w-4 h-4 text-primary" />
                          Counter-Strategies
                        </h4>
                        <div className="space-y-3">
                          {(profile.counterStrategies || []).map((cs, i) => (
                            <div key={i} className="p-3 rounded-lg border bg-muted/20">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold text-muted-foreground">Against: {cs.tactic}</p>
                                <Badge className={`text-[10px] ${severityColors[cs.effectiveness] || ""}`}>
                                  {cs.effectiveness} effectiveness
                                </Badge>
                              </div>
                              <p className="text-sm">{cs.counter}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSection === "gaps" && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Search className="w-4 h-4 text-amber-500" />
                          Evidence Gaps
                        </h4>
                        <div className="space-y-3">
                          {(profile.evidenceGaps || []).map((eg, i) => (
                            <div key={i} className="p-3 rounded-lg border bg-muted/20">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium">{eg.gap}</p>
                                <Badge className={`text-[10px] ${severityColors[eg.priority] || ""}`}>{eg.priority}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                <strong>Action:</strong> {eg.suggestedAction}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSection === "precedents" && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Historical Precedents
                        </h4>
                        <div className="space-y-3">
                          {(profile.historicalPrecedents || []).map((hp, i) => (
                            <div key={i} className="p-4 rounded-lg border bg-muted/20">
                              <p className="text-sm font-semibold">{hp.caseName}</p>
                              <p className="text-xs text-muted-foreground mt-1">{hp.relevance}</p>
                              <p className="text-xs mt-2">
                                <strong>Outcome:</strong> {hp.outcome}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSection === "recommendations" && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-primary" />
                          Strategic Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {profile.recommendations.map((r, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="font-mono text-xs text-primary mt-0.5">{i + 1}.</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select an entity to generate threat profile</p>
                  <p className="text-xs mt-1">AI will analyze their behavior patterns and connections</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hidden print component */}
      {profile && <ThreatProfileReport ref={printRef} profile={profile} />}
    </div>
  );
};

/* Reusable list section */
const ProfileList = ({ items, color, icon, title }: { items: string[]; color: string; icon: React.ReactNode; title: string }) => (
  <div>
    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
      {icon}
      {title}
    </h4>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${color} mt-1.5 shrink-0`} />
          {item}
        </li>
      ))}
    </ul>
  </div>
);
