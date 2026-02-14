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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NewCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const NewCaseDialog = ({ open, onOpenChange }: NewCaseDialogProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [severity, setSeverity] = useState("medium");
  const [location, setLocation] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const caseNumber = `HRPM-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await supabase.from("cases").insert({
        title: title.trim(),
        case_number: caseNumber,
        description: description.trim() || null,
        category,
        severity,
        status: "active",
        location: location.trim() || null,
        date_opened: new Date().toISOString(),
      }).select("id").single();

      if (error) throw error;

      toast.success("Case created successfully");
      onOpenChange(false);
      navigate(`/cases/${data.id}`);
    } catch (err: any) {
      console.error("Error creating case:", err);
      toast.error(err.message || "Failed to create case");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            New Investigation Case
          </DialogTitle>
          <DialogDescription>
            Create a new case file to begin an investigation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-case-title">Case Title *</Label>
            <Input
              id="new-case-title"
              placeholder="e.g. Enforced Disappearances in Balochistan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-case-desc">Description</Label>
            <Textarea
              id="new-case-desc"
              placeholder="Brief overview of the investigation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-case-location">Location</Label>
            <Input
              id="new-case-location"
              placeholder="e.g. Islamabad, Pakistan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !title.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
