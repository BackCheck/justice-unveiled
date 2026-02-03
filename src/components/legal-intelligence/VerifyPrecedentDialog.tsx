import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useVerifyPrecedent } from "@/hooks/useLegalIntelligence";
import type { CaseLawPrecedent } from "@/types/legal-intelligence";

interface VerifyPrecedentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  precedent: CaseLawPrecedent;
}

const COURTS = [
  "Supreme Court of Pakistan",
  "Federal Shariat Court",
  "Lahore High Court",
  "Sindh High Court",
  "Peshawar High Court",
  "Balochistan High Court",
  "Islamabad High Court",
  "Special Court",
  "Tribunal",
  "Other",
];

export const VerifyPrecedentDialog = ({
  open,
  onOpenChange,
  precedent,
}: VerifyPrecedentDialogProps) => {
  const [court, setCourt] = useState(precedent.court || "");
  const [year, setYear] = useState(precedent.year?.toString() || "");
  const [citation, setCitation] = useState(precedent.citation || "");
  const [sourceUrl, setSourceUrl] = useState(precedent.source_url || "");
  const [notes, setNotes] = useState(precedent.notes || "");

  const verifyPrecedent = useVerifyPrecedent();

  const isValid =
    court.trim() !== "" &&
    year.trim() !== "" &&
    !isNaN(parseInt(year)) &&
    citation.trim() !== "" &&
    sourceUrl.trim() !== "";

  const handleSubmit = () => {
    if (!isValid) return;

    verifyPrecedent.mutate(
      {
        precedentId: precedent.id,
        court,
        year: parseInt(year),
        citation,
        sourceUrl,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            Verify Precedent
          </DialogTitle>
          <DialogDescription>
            Complete all required fields to verify this case law precedent for
            litigation use. Verification confirms the citation is accurate and
            from an official source.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Case Name</Label>
            <p className="text-sm font-medium">{precedent.case_name}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="court">
              Court <span className="text-destructive">*</span>
            </Label>
            <Select value={court} onValueChange={setCourt}>
              <SelectTrigger>
                <SelectValue placeholder="Select court..." />
              </SelectTrigger>
              <SelectContent>
                {COURTS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">
              Year <span className="text-destructive">*</span>
            </Label>
            <Input
              id="year"
              type="number"
              min="1947"
              max={new Date().getFullYear()}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2019"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="citation">
              Official Citation <span className="text-destructive">*</span>
            </Label>
            <Input
              id="citation"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              placeholder="e.g., 2019 SCMR 123 or PLD 2020 SC 45"
            />
            <p className="text-xs text-muted-foreground">
              Use official format: PLD, SCMR, YLR, CLC, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceUrl">
              Source URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Link to official court website or legal database where this
              judgment can be verified
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this verification..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || verifyPrecedent.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {verifyPrecedent.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verify Precedent
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
