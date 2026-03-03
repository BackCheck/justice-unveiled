import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FileText, Upload, Clock, CheckCircle2, XCircle, HelpCircle, Send } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending_review: { label: "Pending Review", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30", icon: Clock },
  needs_info: { label: "Needs Info", color: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30", icon: HelpCircle },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30", icon: XCircle },
};

export const MySubmissionsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchSubmissions = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("submissions" as any)
        .select("*")
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false });
      setSubmissions((data as any[]) || []);
      setLoading(false);
    };
    fetchSubmissions();
  }, [user]);

  const handleReply = async (submissionId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    const { error } = await supabase
      .from("submissions" as any)
      .update({ submitter_reply: replyText, status: "pending_review" } as any)
      .eq("id", submissionId);

    if (error) {
      toast({ title: "Failed to send reply", variant: "destructive" });
    } else {
      toast({ title: "Reply sent" });
      setReplyingTo(null);
      setReplyText("");
      // Refresh
      const { data } = await supabase
        .from("submissions" as any)
        .select("*")
        .eq("submitted_by", user!.id)
        .order("created_at", { ascending: false });
      setSubmissions((data as any[]) || []);
    }
    setSending(false);
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>My Submissions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>My Submissions</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You haven't made any submissions yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          My Submissions ({submissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {submissions.map((sub: any) => {
          const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending_review;
          const StatusIcon = config.icon;
          const payload = sub.payload || {};

          return (
            <div key={sub.id} className="border border-border/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {sub.submission_type === "case" ? (
                    <FileText className="w-4 h-4 text-primary" />
                  ) : (
                    <Upload className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm font-medium capitalize">{sub.submission_type} Submission</span>
                </div>
                <Badge className={`${config.color} border text-xs`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Submitted: {format(new Date(sub.created_at), "MMM d, yyyy 'at' HH:mm")}</p>
                {payload.title && <p>Title: <strong>{payload.title}</strong></p>}
                {sub.case_id && (
                  <p>Case: <Link to={`/cases/${sub.case_id}`} className="text-primary hover:underline">View Case</Link></p>
                )}
                {sub.updated_at !== sub.created_at && (
                  <p>Last updated: {format(new Date(sub.updated_at), "MMM d, yyyy 'at' HH:mm")}</p>
                )}
              </div>

              {/* Reviewer question for "needs_info" */}
              {sub.status === "needs_info" && sub.reviewer_question && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 mt-2">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">Reviewer Question:</p>
                  <p className="text-sm text-amber-900 dark:text-amber-200">{sub.reviewer_question}</p>

                  {replyingTo === sub.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply…"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReply(sub.id)} disabled={sending} className="gap-1">
                          <Send className="w-3 h-3" /> {sending ? "Sending…" : "Send Reply"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setReplyingTo(sub.id)}>
                      Reply
                    </Button>
                  )}
                </div>
              )}

              {sub.submitter_reply && (
                <div className="bg-muted/50 rounded-md p-3 mt-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Your Reply:</p>
                  <p className="text-sm">{sub.submitter_reply}</p>
                </div>
              )}

              {sub.reviewer_notes && sub.status !== "needs_info" && (
                <div className="bg-muted/50 rounded-md p-3 mt-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Reviewer Notes:</p>
                  <p className="text-sm">{sub.reviewer_notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
