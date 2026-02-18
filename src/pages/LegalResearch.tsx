import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Scale, Search, ExternalLink, Calendar, Building, Globe, BookOpen,
  CheckCircle, AlertCircle, Landmark, Filter, Bookmark, BookmarkCheck,
  MessageSquare, Target, Send, Trash2, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface CaseLawPrecedent {
  id: string;
  citation: string;
  case_name: string;
  court: string;
  jurisdiction: string;
  year: number | null;
  summary: string | null;
  key_principles: string[] | null;
  related_statutes: string[] | null;
  is_landmark: boolean | null;
  source_url: string | null;
  verified: boolean | null;
  notes: string | null;
}

interface PrecedentComment {
  id: string;
  precedent_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const LegalResearch = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const { data: precedents, isLoading } = useQuery({
    queryKey: ["case-law-precedents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_law_precedents")
        .select("*")
        .order("year", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as CaseLawPrecedent[];
    },
  });

  const { data: savedIds } = useQuery({
    queryKey: ["saved-precedents", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("saved_precedents")
        .select("precedent_id")
        .eq("user_id", user.id);
      return (data || []).map(d => d.precedent_id);
    },
    enabled: !!user,
  });

  const jurisdictions = [...new Set(precedents?.map(p => p.jurisdiction).filter(Boolean))];

  const filteredPrecedents = precedents?.filter(precedent => {
    const matchesSearch = 
      precedent.case_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      precedent.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      precedent.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJurisdiction = jurisdictionFilter === "all" || precedent.jurisdiction === jurisdictionFilter;
    const matchesVerified = verifiedFilter === "all" || 
      (verifiedFilter === "verified" && precedent.verified) ||
      (verifiedFilter === "unverified" && !precedent.verified);
    const matchesSaved = !showSavedOnly || savedIds?.includes(precedent.id);
    return matchesSearch && matchesJurisdiction && matchesVerified && matchesSaved;
  });

  const landmarkCases = filteredPrecedents?.filter(p => p.is_landmark);
  const recentCases = filteredPrecedents?.filter(p => !p.is_landmark);

  const stats = {
    total: precedents?.length || 0,
    verified: precedents?.filter(p => p.verified).length || 0,
    landmark: precedents?.filter(p => p.is_landmark).length || 0,
    jurisdictions: jurisdictions.length,
    saved: savedIds?.length || 0,
  };

  return (
    <PlatformLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Scale className="w-8 h-8 text-primary" />
              Legal Research Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Verified case law precedents — save, comment, and start investigations
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: BookOpen, value: stats.total, label: "Total Precedents", color: "text-primary", bg: "bg-primary/10" },
            { icon: CheckCircle, value: stats.verified, label: "Verified", color: "text-chart-2", bg: "bg-chart-2/10" },
            { icon: Landmark, value: stats.landmark, label: "Landmark", color: "text-chart-4", bg: "bg-chart-4/10" },
            { icon: Globe, value: stats.jurisdictions, label: "Jurisdictions", color: "text-accent-foreground", bg: "bg-accent/10" },
            { icon: Bookmark, value: stats.saved, label: "Saved", color: "text-primary", bg: "bg-primary/10" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", s.bg)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search case name, citation, or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jurisdictions</SelectItem>
              {jurisdictions.map(j => (
                <SelectItem key={j} value={j}>{j}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
          {user && (
            <Button
              variant={showSavedOnly ? "default" : "outline"}
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className="gap-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              Saved
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPrecedents?.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No precedents found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {landmarkCases && landmarkCases.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-chart-4" />
                  Landmark Cases
                </h2>
                <div className="space-y-4">
                  {landmarkCases.map((precedent) => (
                    <PrecedentCard key={precedent.id} precedent={precedent} user={user} savedIds={savedIds || []} />
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              {landmarkCases && landmarkCases.length > 0 && (
                <h2 className="text-xl font-semibold">All Precedents</h2>
              )}
              <div className="space-y-4">
                {recentCases?.map((precedent) => (
                  <PrecedentCard key={precedent.id} precedent={precedent} user={user} savedIds={savedIds || []} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  );
};

// ─── Precedent Card with Save, Comments, Start Investigation ─────────────────

const PrecedentCard = ({ precedent, user, savedIds }: { precedent: CaseLawPrecedent; user: any; savedIds: string[] }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [creatingCase, setCreatingCase] = useState(false);
  const isSaved = savedIds.includes(precedent.id);

  // Comments query
  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ["precedent-comments", precedent.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("precedent_comments")
        .select("*")
        .eq("precedent_id", precedent.id)
        .order("created_at", { ascending: true });
      return (data || []) as PrecedentComment[];
    },
    enabled: showComments,
  });

  // Save/Unsave mutation
  const toggleSave = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Sign in to save precedents"); return; }
      if (isSaved) {
        await supabase.from("saved_precedents").delete().eq("precedent_id", precedent.id).eq("user_id", user.id);
      } else {
        await supabase.from("saved_precedents").insert({ precedent_id: precedent.id, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-precedents"] });
      toast.success(isSaved ? "Removed from saved" : "Saved to library");
    },
  });

  // Add comment
  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Sign in to comment"); return; }
      if (!newComment.trim()) return;
      const { error } = await supabase.from("precedent_comments").insert({
        precedent_id: precedent.id,
        user_id: user.id,
        content: newComment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["precedent-comments", precedent.id] });
      toast.success("Comment added");
    },
  });

  // Delete comment
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      await supabase.from("precedent_comments").delete().eq("id", commentId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["precedent-comments", precedent.id] }),
  });

  // Start investigation from precedent
  const handleStartInvestigation = async () => {
    if (!user) { toast.error("Sign in to start an investigation"); return; }
    setCreatingCase(true);
    try {
      const caseNumber = `HRPM-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase.from("cases").insert({
        title: `Investigation: ${precedent.case_name}`,
        case_number: caseNumber,
        description: `Legal research investigation based on precedent: ${precedent.citation}\n\n${precedent.summary || ""}`,
        category: "Human Rights Abuse",
        severity: "medium",
        status: "active",
        date_opened: new Date().toISOString(),
      }).select("id").single();
      if (error) throw error;
      toast.success("Investigation created");
      navigate(`/cases/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create investigation");
    } finally {
      setCreatingCase(false);
    }
  };

  return (
    <Card className={cn(
      "hover:border-primary/30 transition-all duration-300",
      precedent.is_landmark && "border-chart-4/30 bg-chart-4/5"
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{precedent.case_name}</h3>
                {precedent.is_landmark && (
                  <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/30">
                    <Landmark className="w-3 h-3 mr-1" />Landmark
                  </Badge>
                )}
                {precedent.verified ? (
                  <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/30">
                    <CheckCircle className="w-3 h-3 mr-1" />Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <AlertCircle className="w-3 h-3 mr-1" />Unverified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-primary font-mono">{precedent.citation}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => toggleSave.mutate()} className="gap-1.5">
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Discuss
              </Button>
              <Button variant="outline" size="sm" onClick={handleStartInvestigation} disabled={creatingCase} className="gap-1.5">
                {creatingCase ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                Investigate
              </Button>
              {precedent.source_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={precedent.source_url} target="_blank" rel="noopener noreferrer">
                    Source <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Building className="w-4 h-4" />{precedent.court}</span>
            <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{precedent.jurisdiction}</span>
            {precedent.year && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{precedent.year}</span>}
          </div>

          {precedent.summary && (
            <p className="text-sm text-foreground/80 leading-relaxed">{precedent.summary}</p>
          )}

          {precedent.key_principles && precedent.key_principles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Principles:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {precedent.key_principles.map((principle, i) => <li key={i}>{principle}</li>)}
              </ul>
            </div>
          )}

          {precedent.related_statutes && precedent.related_statutes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {precedent.related_statutes.map((statute, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{statute}</Badge>
              ))}
            </div>
          )}

          {/* Comments Section */}
          {showComments && (
            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Discussion ({comments?.length || 0})
              </h4>
              {loadingComments ? (
                <Skeleton className="h-16 w-full" />
              ) : comments && comments.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/50 text-sm flex justify-between items-start gap-2">
                      <div>
                        <p className="text-foreground">{c.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(c.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      {user?.id === c.user_id && (
                        <Button variant="ghost" size="sm" onClick={() => deleteComment.mutate(c.id)} className="shrink-0">
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to discuss.</p>
              )}
              {user && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && addComment.mutate()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => addComment.mutate()} disabled={!newComment.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LegalResearch;
