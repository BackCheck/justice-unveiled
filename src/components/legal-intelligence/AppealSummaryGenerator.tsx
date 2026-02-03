import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  CheckCircle, 
  Edit, 
  Loader2,
  Save,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  Scale,
  Gavel,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAppealSummaries, useAddAppealSummary, useUpdateAppealSummary } from "@/hooks/useLegalIntelligence";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AppealSummary, CitedSources, SummaryCitation } from "@/types/legal-intelligence";

interface AppealSummaryGeneratorProps {
  caseId: string;
  caseTitle?: string;
}

interface GenerationResult {
  content: string;
  sourcesUsed?: CitedSources;
  unverifiedPrecedentsCount?: number;
}

export const AppealSummaryGenerator = ({ caseId, caseTitle }: AppealSummaryGeneratorProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [lastGenerationResult, setLastGenerationResult] = useState<GenerationResult | null>(null);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [editingSummary, setEditingSummary] = useState<AppealSummary | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newSummary, setNewSummary] = useState({
    title: "",
    summary_type: "factual" as AppealSummary["summary_type"],
    content: "",
  });

  const { data: summaries, isLoading } = useAppealSummaries(caseId);
  const addSummary = useAddAppealSummary();
  const updateSummary = useUpdateAppealSummary();

  const draftSummaries = summaries?.filter((s) => !s.is_finalized) || [];
  const finalizedSummaries = summaries?.filter((s) => s.is_finalized) || [];

  const handleGenerateAI = async (type: AppealSummary["summary_type"]) => {
    setIsGenerating(true);
    setGeneratingType(type);
    setLastGenerationResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-appeal-summary", {
        body: { caseId, summaryType: type, caseTitle, includeUnverifiedPrecedents: false },
      });

      if (error) throw error;

      if (data?.content) {
        // Store generation result for display
        setLastGenerationResult({
          content: data.content,
          sourcesUsed: data.sourcesUsed,
          unverifiedPrecedentsCount: data.unverifiedPrecedentsCount,
        });
        setShowSourcesPanel(true);

        addSummary.mutate(
          {
            case_id: caseId,
            title: data.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Summary`,
            summary_type: type,
            content: data.content,
            ai_generated: true,
          },
          {
            onSuccess: () => {
              const warningMsg = data.unverifiedPrecedentsCount > 0 
                ? ` (${data.unverifiedPrecedentsCount} unverified precedents excluded)`
                : "";
              toast.success(`AI summary generated with citations${warningMsg}`);
            },
          }
        );
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate AI summary");
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleAddManual = () => {
    if (!newSummary.title.trim() || !newSummary.content.trim()) return;

    addSummary.mutate(
      {
        case_id: caseId,
        ...newSummary,
        ai_generated: false,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewSummary({ title: "", summary_type: "factual", content: "" });
        },
      }
    );
  };

  const handleFinalize = (summary: AppealSummary) => {
    updateSummary.mutate({
      id: summary.id,
      caseId,
      updates: { is_finalized: true },
    });
  };

  const handleSaveEdit = () => {
    if (!editingSummary) return;

    updateSummary.mutate(
      {
        id: editingSummary.id,
        caseId,
        updates: { content: editContent },
      },
      {
        onSuccess: () => {
          setEditingSummary(null);
          setEditContent("");
        },
      }
    );
  };

  const startEdit = (summary: AppealSummary) => {
    setEditingSummary(summary);
    setEditContent(summary.content);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "factual":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "legal":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "procedural":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "full_appeal":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "";
    }
  };

  // Component to display sources used
  const SourcesList = ({ sources, title, icon: Icon }: { 
    sources: SummaryCitation[]; 
    title: string;
    icon: React.ElementType;
  }) => {
    if (!sources || sources.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title} ({sources.length})
        </h4>
        <div className="space-y-1">
          {sources.map((source, idx) => (
            <div 
              key={idx} 
              className={`text-xs p-2 rounded border ${
                source.verified === false 
                  ? "bg-amber-500/10 border-amber-500/30" 
                  : "bg-muted/50 border-border/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-primary">{source.reference}</span>
                {source.verified !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={source.verified ? "text-green-500" : "text-amber-500"}
                  >
                    {source.verified ? "Verified" : "Unverified"}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-1">{source.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SummaryCard = ({ summary }: { summary: AppealSummary }) => (
    <div className="p-4 rounded-lg border border-border/50 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium">{summary.title}</p>
            {summary.ai_generated && (
              <Badge className="bg-primary/10 text-primary border-primary/20 h-5">
                <Sparkles className="h-3 w-3 mr-1" />
                AI + Citations
              </Badge>
            )}
            <Badge variant="outline" className={getTypeColor(summary.summary_type)}>
              {summary.summary_type.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Version {summary.version} • Created {new Date(summary.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!summary.is_finalized && (
            <>
              <Button size="sm" variant="ghost" onClick={() => startEdit(summary)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleFinalize(summary)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Finalize
              </Button>
            </>
          )}
        </div>
      </div>
      
      {editingSummary?.id === summary.id ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[200px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingSummary(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateSummary.isPending}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg max-h-[200px] overflow-y-auto">
          {summary.content}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-green-500" />
            Appeal Summaries
          </CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Manual Summary</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Summary title..."
                        value={newSummary.title}
                        onChange={(e) => setNewSummary({ ...newSummary, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newSummary.summary_type}
                        onValueChange={(v) => setNewSummary({ ...newSummary, summary_type: v as AppealSummary["summary_type"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="factual">Factual Summary</SelectItem>
                          <SelectItem value="legal">Legal Summary</SelectItem>
                          <SelectItem value="procedural">Procedural Summary</SelectItem>
                          <SelectItem value="full_appeal">Full Appeal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      placeholder="Write your summary..."
                      value={newSummary.content}
                      onChange={(e) => setNewSummary({ ...newSummary, content: e.target.value })}
                      className="min-h-[300px]"
                    />
                  </div>
                  <Button onClick={handleAddManual} disabled={addSummary.isPending} className="w-full">
                    Add Summary
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* AI Generation Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="text-sm text-muted-foreground w-full flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate with AI (includes citations):
          </div>
          {["factual", "legal", "procedural", "full_appeal"].map((type) => (
            <Button
              key={type}
              size="sm"
              variant="outline"
              onClick={() => handleGenerateAI(type as AppealSummary["summary_type"])}
              disabled={isGenerating}
              className={getTypeColor(type)}
            >
              {isGenerating && generatingType === type ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              {type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Button>
          ))}
        </div>

        {/* Citation warning */}
        <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>AI summaries only cite <strong>verified precedents</strong>. Unverified case law is excluded to prevent citation errors in court.</span>
        </div>

        {/* Sources Used Panel (shows after generation) */}
        {lastGenerationResult?.sourcesUsed && (
          <Collapsible open={showSourcesPanel} onOpenChange={setShowSourcesPanel} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Sources Used in Last Generation
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showSourcesPanel ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 p-3 rounded-lg border border-border/50 bg-muted/30 space-y-4">
              {lastGenerationResult.unverifiedPrecedentsCount && lastGenerationResult.unverifiedPrecedentsCount > 0 && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>{lastGenerationResult.unverifiedPrecedentsCount} unverified precedent(s) were excluded from citations</span>
                </div>
              )}
              
              <SourcesList 
                sources={lastGenerationResult.sourcesUsed.statutes} 
                title="Statutes Cited" 
                icon={Scale}
              />
              <SourcesList 
                sources={lastGenerationResult.sourcesUsed.precedents} 
                title="Precedents Cited (Verified Only)" 
                icon={Gavel}
              />
              <SourcesList 
                sources={lastGenerationResult.sourcesUsed.events} 
                title="Timeline Events Referenced" 
                icon={Calendar}
              />
              <SourcesList 
                sources={lastGenerationResult.sourcesUsed.violations} 
                title="Violations Referenced" 
                icon={AlertTriangle}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading summaries...</p>
        ) : (
          <Tabs defaultValue="drafts">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="drafts">
                Drafts ({draftSummaries.length})
              </TabsTrigger>
              <TabsTrigger value="finalized">
                Finalized ({finalizedSummaries.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="drafts" className="mt-4">
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-3">
                  {draftSummaries.map((summary) => (
                    <SummaryCard key={summary.id} summary={summary} />
                  ))}
                  {draftSummaries.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No draft summaries</p>
                      <p className="text-xs">Generate one with AI or add manually</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="finalized" className="mt-4">
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-3">
                  {finalizedSummaries.map((summary) => (
                    <SummaryCard key={summary.id} summary={summary} />
                  ))}
                  {finalizedSummaries.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No finalized summaries</p>
                      <p className="text-xs">Finalize drafts when ready for appeal</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
