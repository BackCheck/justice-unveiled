import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEntityReviewQueue, useMergeHistory } from "@/hooks/useCanonicalEntities";
import { useUserRole } from "@/hooks/useUserRole";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GitMerge, Check, X, AlertTriangle, History, Shield, Loader2, ArrowRight,
} from "lucide-react";

const EntityReview = () => {
  const { isAdmin, canEdit } = useUserRole();
  const { selectedCaseId } = useCaseFilter();
  const queryClient = useQueryClient();
  const { data: queue, isLoading: queueLoading } = useEntityReviewQueue(selectedCaseId || undefined);
  const { data: history, isLoading: historyLoading } = useMergeHistory();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleMerge = async (item: any) => {
    if (!canEdit) return toast.error("Insufficient permissions");
    setProcessing(item.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("merge-entities", {
        body: {
          winner_entity_id: item.possible_duplicate_of,
          loser_entity_id: item.candidate_entity_id,
          reason: `Review queue merge: ${item.reason}`,
          review_queue_id: item.id,
        },
      });

      if (response.error) throw response.error;

      toast.success("Entities merged successfully");
      queryClient.invalidateQueries({ queryKey: ["entity-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["canonical-entities"] });
      queryClient.invalidateQueries({ queryKey: ["entity-merge-history"] });
    } catch (err: any) {
      toast.error(err.message || "Merge failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (item: any) => {
    if (!canEdit) return toast.error("Insufficient permissions");
    setProcessing(item.id);

    try {
      await supabase
        .from("entity_review_queue")
        .update({ status: "REJECTED" })
        .eq("id", item.id);

      toast.success("Marked as distinct entities");
      queryClient.invalidateQueries({ queryKey: ["entity-review-queue"] });
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleVerify = async (entityId: string) => {
    if (!isAdmin) return toast.error("Admin only");

    try {
      await supabase
        .from("entities")
        .update({ verified: true })
        .eq("id", entityId);

      toast.success("Entity verified");
      queryClient.invalidateQueries({ queryKey: ["canonical-entities"] });
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    }
  };

  if (!canEdit) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Editor or Admin access required.</p>
            </CardContent>
          </Card>
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GitMerge className="w-6 h-6 text-primary" />
              Entity Review & Merge
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review potential duplicates, merge entities, and maintain canonical profiles.
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {queue?.length || 0} pending
          </Badge>
        </div>

        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue" className="gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Review Queue
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="w-4 h-4" /> Merge History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-4">
            {queueLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !queue?.length ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Check className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">All clear!</p>
                  <p className="text-sm text-muted-foreground">No pending entity reviews.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {queue.map((item) => (
                  <Card key={item.id} className="border-border/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.candidate?.entity_type || "Unknown"}
                              </Badge>
                              <span className="font-semibold text-sm">
                                {item.candidate?.primary_name || "Unknown"}
                              </span>
                            </div>

                            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-primary">
                                {item.duplicate?.primary_name || "Unknown"}
                              </span>
                              {item.duplicate?.verified && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground">{item.reason}</p>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                item.score >= 0.95
                                  ? "border-red-500/50 text-red-600"
                                  : item.score >= 0.92
                                  ? "border-yellow-500/50 text-yellow-600"
                                  : "border-muted"
                              }
                            >
                              {(item.score * 100).toFixed(1)}% match
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleMerge(item)}
                            disabled={processing === item.id}
                            className="gap-1.5"
                          >
                            {processing === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <GitMerge className="w-3.5 h-3.5" />
                            )}
                            Merge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(item)}
                            disabled={processing === item.id}
                            className="gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            Distinct
                          </Button>
                          {isAdmin && item.candidate && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerify(item.candidate_entity_id)}
                              className="gap-1.5"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !history?.length ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">No merge history yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Winner</TableHead>
                        <TableHead>Merged</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(h.merged_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {(h.snapshot as any)?.primary_name
                              ? `→ ${h.winner_entity_id.slice(0, 8)}...`
                              : h.winner_entity_id.slice(0, 8) + "..."}
                          </TableCell>
                          <TableCell className="text-sm">
                            {(h.snapshot as any)?.primary_name || h.loser_entity_id.slice(0, 8) + "..."}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                            {h.reason || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PlatformLayout>
  );
};

export default EntityReview;
