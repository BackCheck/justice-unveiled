import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/evidence/FileUploadField";

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
    <FileUploadField files={evidenceFiles} onFilesChange={setEvidenceFiles} />
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
