import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EVIDENCE_LABELS = [
  "FIR", "Court Order", "CCTV", "Medical Record", "Message Logs",
  "News Link", "Photograph", "Audio Recording", "Video Recording",
  "Affidavit", "Government Document", "Other",
];

interface Props {
  evidenceFiles: File[];
  setEvidenceFiles: (v: File[]) => void;
  evidenceLabel: string;
  setEvidenceLabel: (v: string) => void;
  evidenceSourceType: string;
  setEvidenceSourceType: (v: string) => void;
  evidenceDescription: string;
  setEvidenceDescription: (v: string) => void;
}

export const SubmitCaseStepEvidence = ({
  evidenceFiles, setEvidenceFiles,
  evidenceLabel, setEvidenceLabel,
  evidenceSourceType, setEvidenceSourceType,
  evidenceDescription, setEvidenceDescription,
}: Props) => (
  <>
    <div className="space-y-2">
      <Label>Upload Evidence Files</Label>
      <p className="text-sm text-muted-foreground">
        PDF, images, video, audio. Max 20MB per file.
      </p>
      <Input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.mp3,.wav,.m4a,.doc,.docx,.txt,.md"
        onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
      />
      {evidenceFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {evidenceFiles.map((f, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{f.name}</Badge>
          ))}
        </div>
      )}
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Evidence Label</Label>
        <Select value={evidenceLabel} onValueChange={setEvidenceLabel}>
          <SelectTrigger><SelectValue placeholder="Select label" /></SelectTrigger>
          <SelectContent>
            {EVIDENCE_LABELS.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Source Type</Label>
        <Select value={evidenceSourceType} onValueChange={setEvidenceSourceType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="original">Original / Primary</SelectItem>
            <SelectItem value="secondary">Secondary / Copy</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="evidenceDesc">Evidence Description</Label>
      <Textarea
        id="evidenceDesc"
        value={evidenceDescription}
        onChange={(e) => setEvidenceDescription(e.target.value)}
        placeholder="Describe the evidence and its relevance to the case…"
        rows={3}
      />
    </div>
  </>
);
