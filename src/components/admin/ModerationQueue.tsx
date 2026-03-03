import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import {
  Clock, CheckCircle2, XCircle, HelpCircle, FileText, Upload,
  ChevronRight, Loader2, AlertTriangle, Flag, ChevronLeft, Search,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending_review: { label: "Pending Review", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30", icon: Clock },
  needs_info: { label: "Needs Info", color: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30", icon: HelpCircle },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30", icon: XCircle },
  failed: { label: "Failed", color: "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30", icon: AlertTriangle },
};

const PAGE_SIZE = 25;

function SLABadge({ createdAt }: { createdAt: string }) {
  const days = differenceInDays(new Date(), new Date(createdAt));
  const color = days >= 5 ? "text-red-600 bg-red-500/10 border-red-500/30" :
    days >= 2 ? "text-amber-600 bg-amber-500/10 border-amber-500/30" :
    "text-muted-foreground bg-muted/50 border-border/30";
  return (
    <Badge variant="outline" className={`text-xs ${color}`}>
      {days === 0 ? "Today" : `${days}d ago`}
    </Badge>
  );
}

export const ModerationQueue = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [takedowns, setTakedowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewerQuestion, setReviewerQuestion] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [page, setPage] = useState(0);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [subRes, tdRes] = await Promise.all([
      supabase.from("submissions" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("takedown_requests" as any).select("*").order("created_at", { ascending: false }),
    ]);
    setSubmissions((subRes.data as any[]) || []);
    setTakedowns((tdRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return submissions.filter((s: any) => {
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (filterType !== "all" && s.submission_type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const payload = s.payload || {};
        const matchTitle = payload.title?.toLowerCase().includes(q);
        const matchType = s.submission_type?.toLowerCase().includes(q);
        const matchId = s.id?.toLowerCase().includes(q);
        const matchCaseId = s.case_id?.toLowerCase().includes(q);
        if (!matchTitle && !matchType && !matchId && !matchCaseId) return false;
      }
      return true;
    });
  }, [submissions, filterStatus, filterType, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((s: any) => s.id)));
    }
  };

  const writeAuditLog = async (action: string, tableName: string, recordId: string, oldData: any, newData: any) => {
    await supabase.from("audit_logs").insert({
      action,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
    });
  };

  const handleApprove = async (sub: any) => {
    setActionLoading(true);
    try {
      await supabase.from("submissions" as any).update({ status: "approved", reviewer_notes: adminNotes || null } as any).eq("id", sub.id);
      if (sub.submission_type === "case" && sub.case_id) {
        await supabase.from("cases").update({ status: "active" }).eq("id", sub.case_id);
      }
      await writeAuditLog("MODERATE_APPROVE", "submissions", sub.id, { status: sub.status }, { status: "approved", notes: adminNotes });
      toast({ title: "Submission approved" });
      setSelected(null);
      setAdminNotes("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleNeedsInfo = async (sub: any) => {
    if (!reviewerQuestion.trim()) {
      toast({ title: "Please enter a question for the submitter", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      await supabase.from("submissions" as any).update({ status: "needs_info", reviewer_question: reviewerQuestion, reviewer_notes: adminNotes || null } as any).eq("id", sub.id);
      await writeAuditLog("MODERATE_NEEDS_INFO", "submissions", sub.id, { status: sub.status }, { status: "needs_info", question: reviewerQuestion });
      toast({ title: "Info requested from submitter" });
      setSelected(null);
      setReviewerQuestion("");
      setAdminNotes("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleReject = async (sub: any) => {
    if (!rejectReason.trim()) {
      toast({ title: "Please enter a rejection reason", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      await supabase.from("submissions" as any).update({ status: "rejected", reviewer_notes: rejectReason } as any).eq("id", sub.id);
      await writeAuditLog("MODERATE_REJECT", "submissions", sub.id, { status: sub.status }, { status: "rejected", reason: rejectReason });
      toast({ title: "Submission rejected" });
      setSelected(null);
      setRejectReason("");
      setAdminNotes("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleBulkApprove = async () => {
    setActionLoading(true);
    try {
      for (const id of selectedIds) {
        const sub = submissions.find((s: any) => s.id === id);
        if (!sub || sub.status === "approved") continue;
        await supabase.from("submissions" as any).update({ status: "approved" } as any).eq("id", id);
        if (sub.submission_type === "case" && sub.case_id) {
          await supabase.from("cases").update({ status: "active" }).eq("id", sub.case_id);
        }
        await writeAuditLog("MODERATE_BULK_APPROVE", "submissions", id, { status: sub.status }, { status: "approved" });
      }
      toast({ title: `${selectedIds.size} submissions approved` });
      setSelectedIds(new Set());
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleBulkReject = async () => {
    if (!bulkRejectReason.trim()) {
      toast({ title: "Please enter a rejection reason", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      for (const id of selectedIds) {
        const sub = submissions.find((s: any) => s.id === id);
        if (!sub || sub.status === "rejected") continue;
        await supabase.from("submissions" as any).update({ status: "rejected", reviewer_notes: bulkRejectReason } as any).eq("id", id);
        await writeAuditLog("MODERATE_BULK_REJECT", "submissions", id, { status: sub.status }, { status: "rejected", reason: bulkRejectReason });
      }
      toast({ title: `${selectedIds.size} submissions rejected` });
      setSelectedIds(new Set());
      setBulkRejectReason("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleResolveTakedown = async (td: any) => {
    setActionLoading(true);
    try {
      await supabase.from("takedown_requests" as any).update({ status: "resolved", admin_notes: adminNotes || "Resolved", resolved_at: new Date().toISOString() } as any).eq("id", td.id);
      await writeAuditLog("TAKEDOWN_RESOLVED", "takedown_requests", td.id, { status: td.status }, { status: "resolved", notes: adminNotes });
      toast({ title: "Takedown request resolved" });
      setAdminNotes("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="needs_info">Needs Info</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="case">Case</SelectItem>
            <SelectItem value="evidence">Evidence</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 w-56"
            placeholder="Search submissions…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          />
        </div>
        <Badge variant="outline" className="self-center">{filtered.length} submissions</Badge>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button size="sm" onClick={handleBulkApprove} disabled={actionLoading} className="gap-1">
              <CheckCircle2 className="w-3 h-3" /> Bulk Approve
            </Button>
            <div className="flex items-center gap-2">
              <Input
                className="w-48 h-8 text-sm"
                placeholder="Rejection reason…"
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
              />
              <Button size="sm" variant="destructive" onClick={handleBulkReject} disabled={actionLoading} className="gap-1">
                <XCircle className="w-3 h-3" /> Bulk Reject
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          </CardContent>
        </Card>
      )}

      {/* Submissions list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Submissions ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {paged.length > 0 && (
            <div className="flex items-center gap-2 pb-2 border-b border-border/30">
              <Checkbox
                checked={selectedIds.size === paged.length && paged.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-xs text-muted-foreground">Select all on page</span>
            </div>
          )}

          {paged.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No submissions match filters.</p>
          ) : paged.map((sub: any) => {
            const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending_review;
            const StatusIcon = config.icon;
            const payload = sub.payload || {};
            const isSuspicious = payload.evidenceFileCount === 0 && (payload.urls?.length > 5 || false);

            return (
              <div key={sub.id} className="flex items-center gap-3 border border-border/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <Checkbox
                  checked={selectedIds.has(sub.id)}
                  onCheckedChange={() => toggleSelect(sub.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setSelected(sub)}
                  className="flex-1 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {sub.submission_type === "case" ? <FileText className="w-4 h-4 text-primary" /> : <Upload className="w-4 h-4 text-primary" />}
                    <div>
                      <span className="text-sm font-medium capitalize">{sub.submission_type}</span>
                      {payload.title && <span className="text-sm text-muted-foreground ml-2">— {payload.title}</span>}
                      <p className="text-xs text-muted-foreground">{format(new Date(sub.created_at), "MMM d, yyyy HH:mm")}</p>
                    </div>
                    {isSuspicious && (
                      <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Flagged
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <SLABadge createdAt={sub.created_at} />
                    <Badge className={`${config.color} border text-xs`}>
                      <StatusIcon className="w-3 h-3 mr-1" />{config.label}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Takedown requests */}
      {takedowns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-destructive" />
              Takedown Requests ({takedowns.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {takedowns.map((td: any) => (
              <div key={td.id} className="border border-border/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <Badge variant="outline" className="capitalize">{td.status}</Badge>
                  <span className="text-xs text-muted-foreground">{format(new Date(td.created_at), "MMM d, yyyy")}</span>
                </div>
                <p className="text-sm">{td.reason}</p>
                {td.contact && <p className="text-xs text-muted-foreground">Contact: {td.contact}</p>}
                {td.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Resolution notes…" rows={2} className="text-sm" />
                    <Button size="sm" onClick={() => handleResolveTakedown(td)} disabled={actionLoading}>Resolve</Button>
                  </div>
                )}
                {td.admin_notes && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-1">Admin: {td.admin_notes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Review Drawer */}
      <Sheet open={!!selected} onOpenChange={() => { setSelected(null); setReviewerQuestion(""); setRejectReason(""); setAdminNotes(""); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="capitalize">{selected.submission_type} Submission Review</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending_review).color} border`}>
                    {(STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending_review).label}
                  </Badge>
                  <SLABadge createdAt={selected.created_at} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Submission Details</h4>
                  {Object.entries(selected.payload || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm border-b border-border/20 pb-1">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className="text-foreground max-w-[60%] text-right truncate">
                        {typeof val === "object" ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>

                {selected.error_message && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
                    <p className="text-xs font-semibold text-destructive mb-1">Error:</p>
                    <p className="text-sm text-destructive">{selected.error_message}</p>
                  </div>
                )}

                {selected.submitter_reply && (
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Submitter Reply:</p>
                    <p className="text-sm">{selected.submitter_reply}</p>
                  </div>
                )}

                <Separator />

                {selected.status !== "approved" && selected.status !== "rejected" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Admin Notes (optional)</Label>
                      <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes…" rows={2} />
                    </div>
                    <Button className="w-full gap-2" onClick={() => handleApprove(selected)} disabled={actionLoading}>
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                    </Button>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Request More Information</Label>
                      <Textarea value={reviewerQuestion} onChange={(e) => setReviewerQuestion(e.target.value)} placeholder="Ask the submitter a question…" rows={2} />
                      <Button variant="outline" className="w-full gap-2" onClick={() => handleNeedsInfo(selected)} disabled={actionLoading}>
                        <HelpCircle className="w-4 h-4" /> Needs Info
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Reject</Label>
                      <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection…" rows={2} />
                      <Button variant="destructive" className="w-full gap-2" onClick={() => handleReject(selected)} disabled={actionLoading}>
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
