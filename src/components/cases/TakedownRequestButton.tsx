import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Flag, Send, Loader2 } from "lucide-react";

interface Props {
  caseId: string;
}

export const TakedownRequestButton = ({ caseId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({ title: "Please provide a reason", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from("takedown_requests" as any).insert({
        case_id: caseId,
        reason,
        contact: contact || null,
        submitted_by: user?.id || null,
        status: "pending",
      } as any);

      toast({ title: "Request submitted", description: "Your takedown/correction request has been sent for review." });
      setOpen(false);
      setReason("");
      setContact("");
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive">
          <Flag className="w-4 h-4" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Issue / Request Takedown</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            If you believe any information on this case page is inaccurate, defamatory, or should be removed, please describe the issue below.
          </p>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue, correction needed, or reason for takedown…"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact (optional)</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email or phone for follow-up"
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !reason.trim()} className="w-full gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Submitting…" : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
