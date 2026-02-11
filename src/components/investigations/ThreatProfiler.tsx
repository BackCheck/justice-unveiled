import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  FileText,
  Scale,
  Eye,
  Network,
  RefreshCw,
  Printer,
} from "lucide-react";
import { ThreatProfileReport } from "./ThreatProfileReport";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ThreatProfile {
  entityId: string;
  entityName: string;
  threatLevel: "critical" | "high" | "medium" | "low";
  summary: string;
  motivations: string[];
  tactics: string[];
  connections: string[];
  timeline: string[];
  vulnerabilities: string[];
  recommendations: string[];
}

export const ThreatProfiler = () => {
  const { entities, connections } = useCombinedEntities();
  const { events } = useCombinedTimeline();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<ThreatProfile | null>(null);
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
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .pt-3 { padding-top: 0.75rem; } .pt-6 { padding-top: 1.5rem; }
        .pb-4 { padding-bottom: 1rem; }
        .gap-3 { gap: 0.75rem; } .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .rounded-full { border-radius: 9999px; } .rounded-lg { border-radius: 0.5rem; }
        .border { border: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .border-l-4 { border-left: 4px solid; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-blue-50 { background-color: #eff6ff; }
        .border-gray-100 { border-color: #f3f4f6; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-blue-100 { border-color: #dbeafe; }
        .text-gray-300 { color: #d1d5db; } .text-gray-400 { color: #9ca3af; }
        .text-gray-500 { color: #6b7280; } .text-gray-600 { color: #4b5563; }
        .text-gray-700 { color: #374151; } .text-gray-800 { color: #1f2937; }
        .text-gray-900 { color: #111827; } .text-white { color: #fff; }
        .text-red-700 { color: #b91c1c; }
        .w-6 { width: 1.5rem; } .w-8 { width: 2rem; } .w-10 { width: 2.5rem; }
        .w-16 { width: 4rem; } .w-32 { width: 8rem; }
        .h-1 { height: 0.25rem; } .h-8 { height: 2rem; } .h-10 { height: 2.5rem; }
        .h-24 { height: 6rem; } .w-auto { width: auto; }
        .max-w-lg { max-width: 32rem; }
        .shrink-0 { flex-shrink: 0; }
        .inline-block { display: inline-block; } .inline-flex { display: inline-flex; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .break-all { word-break: break-all; }
        @media print { 
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { margin: 0; }
      </style></head><body>${printContent}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  // Filter antagonist entities
  const threatEntities = entities.filter(e => e.category === "antagonist");

  const generateThreatProfile = async (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;

    setSelectedEntity(entityId);
    setIsGenerating(true);
    setProfile(null);

    try {
      // Get related events
      const relatedEvents = events.filter(e => 
        e.individuals.toLowerCase().includes(entity.name.split(' ')[0].toLowerCase())
      );

      // Get connections
      const entityConnections = connections
        .filter(c => c.source === entityId || c.target === entityId)
        .map(c => {
          const connectedId = c.source === entityId ? c.target : c.source;
          const connectedEntity = entities.find(e => e.id === connectedId);
          return connectedEntity?.name || connectedId;
        });

      // Call AI to generate threat profile
      const response = await supabase.functions.invoke("threat-profiler", {
        body: {
          entity: {
            name: entity.name,
            role: entity.role,
            type: entity.type,
            description: entity.description,
          },
          relatedEvents: relatedEvents.slice(0, 10).map(e => ({
            date: e.date,
            category: e.category,
            description: e.description,
            outcome: e.outcome,
          })),
          connections: entityConnections,
        },
      });

      if (response.error) throw response.error;

      setProfile(response.data);
      toast.success("Threat profile generated");
    } catch (error) {
      console.error("Profile generation error:", error);
      toast.error("Failed to generate threat profile");
      
      // Get connections for fallback profile
      const fallbackConnections = connections
        .filter(c => c.source === entityId || c.target === entityId)
        .map(c => {
          const connectedId = c.source === entityId ? c.target : c.source;
          const connectedEntity = entities.find(e => e.id === connectedId);
          return connectedEntity?.name || connectedId;
        });
      
      // Get related events for fallback profile
      const fallbackEvents = events.filter(e => 
        e.individuals.toLowerCase().includes(entity.name.split(' ')[0].toLowerCase())
      );
      
      // Generate mock profile for demo
      setProfile({
        entityId,
        entityName: entity.name,
        threatLevel: "high",
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
        connections: fallbackConnections.slice(0, 5),
        timeline: fallbackEvents.slice(0, 5).map(e => `${e.date}: ${e.description.slice(0, 100)}...`),
        vulnerabilities: [
          "Documented procedural violations in filed cases",
          "Inconsistent statements across multiple proceedings",
          "Trail of communications showing coordination",
        ],
        recommendations: [
          "Focus on timeline inconsistencies in legal filings",
          "Cross-reference with agency action dates",
          "Document all procedural failures for court submission",
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            AI Threat Profiler
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate comprehensive adversary profiles using AI analysis
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          Gemini Powered
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Entity Selection */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Select Target Entity
            </CardTitle>
            <CardDescription>
              Choose an entity to analyze ({threatEntities.length} antagonists identified)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {threatEntities.map((entity) => (
                  <Button
                    key={entity.id}
                    variant={selectedEntity === entity.id ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={() => generateThreatProfile(entity.id)}
                    disabled={isGenerating}
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      {entity.type === "person" ? (
                        <User className="w-4 h-4 text-red-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{entity.name}</p>
                      <p className="text-xs text-muted-foreground">{entity.role || entity.type}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Threat Profile Analysis
              </CardTitle>
              {profile && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintReport}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing entity data...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generating threat assessment profile
                  </p>
                </div>
              </div>
            ) : profile ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b">
                    <div>
                      <h3 className="text-lg font-semibold">{profile.entityName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{profile.summary}</p>
                    </div>
                    <Badge className={`${threatLevelColors[profile.threatLevel]} border shrink-0`}>
                      {profile.threatLevel.toUpperCase()} THREAT
                    </Badge>
                  </div>

                  {/* Motivations */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      Suspected Motivations
                    </h4>
                    <ul className="space-y-1">
                      {profile.motivations.map((m, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tactics */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-500" />
                      Known Tactics
                    </h4>
                    <ul className="space-y-1">
                      {profile.tactics.map((t, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Connections */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-500" />
                      Key Connections
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.connections.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Vulnerabilities */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-emerald-500" />
                      Exploitable Vulnerabilities
                    </h4>
                    <ul className="space-y-1">
                      {profile.vulnerabilities.map((v, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-primary" />
                      Strategic Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {profile.recommendations.map((r, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="font-mono text-xs text-primary">{i + 1}.</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
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
      {profile && (
        <ThreatProfileReport ref={printRef} profile={profile} />
      )}
    </div>
  );
};
