import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Target, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StartInvestigationButtonProps {
  blogTitle: string;
  blogExcerpt: string | null;
  blogContent: string;
  blogCategory: string | null;
  blogSlug: string;
}

const severityOptions = ["low", "medium", "high", "critical"];
const categoryOptions = [
  "Human Rights Abuse",
  "Systemic Corruption",
  "Judicial Failure",
  "Abuse of Power",
  "Enforced Disappearance",
  "Custodial Torture",
  "Discrimination",
  "Other",
];

export const StartInvestigationButton = ({
  blogTitle,
  blogExcerpt,
  blogContent,
  blogCategory,
  blogSlug,
}: StartInvestigationButtonProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(blogTitle);
  const [description, setDescription] = useState(
    blogExcerpt || ""
  );
  const [category, setCategory] = useState(
    categoryOptions.find((c) => blogCategory?.toLowerCase().includes(c.toLowerCase())) || "Other"
  );
  const [severity, setSeverity] = useState("medium");

  const handleCreate = async () => {
    setLoading(true);
    try {
      const caseNumber = `HRPM-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await supabase.from("cases").insert({
        title,
        case_number: caseNumber,
        description: `${description}\n\n---\n*Investigation initiated from blog post: ${blogSlug}*`,
        category,
        severity,
        status: "open",
        date_opened: new Date().toISOString(),
      }).select("id").single();

      if (error) throw error;

      toast.success("Investigation created successfully");
      setOpen(false);
      navigate(`/case/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create investigation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Target className="w-4 h-4" />
          Start Investigation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Start New Investigation
          </DialogTitle>
          <DialogDescription>
            Create a new case investigation based on this blog post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="case-title">Case Title</Label>
            <Input
              id="case-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="case-description">Description</Label>
            <Textarea
              id="case-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !title.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Investigation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
