import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCase } from "@/hooks/useCases";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadField } from "@/components/evidence/FileUploadField";
import { UploadProgressOverlay } from "@/components/evidence/UploadProgressOverlay";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Upload, FileText,
  Link as LinkIcon, Send, Shield,
} from "lucide-react";

const EVIDENCE_LABELS = [
  "FIR", "Court Order", "CCTV", "Medical Record", "Message Logs",
  "News Link", "Photograph", "Audio Recording", "Video Recording",
  "Affidavit", "Government Document", "Other",
];

const STEPS = [
  { label: "Evidence Details", icon: FileText },
  { label: "Upload Files", icon: Upload },
  { label: "Review & Submit", icon: Send },
];

const AddEvidence = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: caseData, isLoading: caseLoading } = useCase(caseId);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: "" });

  // Step 1
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState("original");
  const [evidenceDate, setEvidenceDate] = useState("");

  // Step 2
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState("");

  // Step 2 optional
  const [proposeEvent, setProposeEvent] = useState(false);
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");

  if (!user) {
    return (
      <PlatformLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to contribute</h1>
          <p className="text-muted-foreground mb-6">Sign in to contribute evidence to this case.</p>
          <Button asChild>
            <a href={`/auth?redirect=${encodeURIComponent(`/cases/${caseId}/add-evidence`)}`}>Sign In</a>
          </Button>
        </div>
      </PlatformLayout>
    );
  }

  if (caseLoading) {
    return (
      <PlatformLayout>
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PlatformLayout>
    );
  }

  if (!caseData) {
    return (
      <PlatformLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Case not found</h1>
          <Button asChild><Link to="/cases">Back to Cases</Link></Button>
        </div>
      </PlatformLayout>
    );
  }

  const canProceed = () => {
    if (step === 0) return evidenceLabel.length > 0;
    if (step === 1) return files.length > 0 || urls.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let submissionId: string | null = null;

    try {
      // 1. Create submission record FIRST
      const { data: subData, error: subError } = await supabase.from("submissions" as any).insert({
        submission_type: "evidence",
        status: "pending_review",
        upload_state: "in_progress",
        case_id: caseId,
        submitted_by: user.id,
        payload: {
          evidenceLabel,
          description,
          sourceType,
          evidenceDate,
          urls: urls.split("\n").filter(Boolean),
          fileCount: files.length,
          proposedEvent: proposeEvent ? { description: eventDescription, date: eventDate } : null,
        },
      } as any).select().single();

      if (subError) throw subError;
      submissionId = (subData as any)?.id;

      // 2. Upload files
      const uploadedPaths: string[] = [];
      if (files.length > 0) {
        setUploadProgress({ current: 0, total: files.length, fileName: "" });
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress({ current: i + 1, total: files.length, fileName: file.name });
          const path = `${caseId}/${Date.now()}-${file.name}`;
          const { error: uploadErr } = await supabase.storage.from("evidence").upload(path, file);

          if (uploadErr) {
            throw new Error(`Failed to upload ${file.name}: ${uploadErr.message}`);
          }

          const { data: urlData } = supabase.storage.from("evidence").getPublicUrl(path);
          await supabase.from("evidence_uploads").insert({
            case_id: caseId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: path,
            public_url: urlData.publicUrl,
            category: evidenceLabel || "general",
            uploaded_by: user.id,
            description,
          });
          uploadedPaths.push(path);
        }
        setUploadProgress({ current: 0, total: 0, fileName: "" });
      }

      // 3. Mark complete
      await supabase.from("submissions" as any).update({
        upload_state: "complete",
        payload: {
          evidenceLabel,
          description,
          sourceType,
          evidenceDate,
          urls: urls.split("\n").filter(Boolean),
          fileCount: files.length,
          uploadedPaths,
          proposedEvent: proposeEvent ? { description: eventDescription, date: eventDate } : null,
        },
      } as any).eq("id", submissionId);

      toast({
        title: "Evidence submitted for review",
        description: `${files.length} file(s) uploaded to case ${caseData.case_number}.`,
      });

      navigate(`/cases/${caseId}`);
    } catch (err: any) {
      if (submissionId) {
        await supabase.from("submissions" as any).update({
          status: "failed",
          upload_state: "error",
          error_message: err.message || "Upload failed",
        } as any).eq("id", submissionId);
      }

      toast({
        title: "Upload failed",
        description: err.message || "Something went wrong. You can retry from the Upload Center.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformLayout>
      {uploadProgress.total > 0 && (
        <UploadProgressOverlay
          current={uploadProgress.current}
          total={uploadProgress.total}
          fileName={uploadProgress.fileName}
        />
      )}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to={`/cases/${caseId}`} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {caseData.case_number}
          </Link>
          <span>/ Add Evidence</span>
        </div>

        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const current = i === step;
            return (
              <div key={i} className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    current && "bg-primary text-primary-foreground",
                    done && "bg-primary/10 text-primary cursor-pointer",
                    !current && !done && "text-muted-foreground"
                  )}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn("w-6 h-px", done ? "bg-primary" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
              {STEPS[step].label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label>Evidence Type *</Label>
                  <Select value={evidenceLabel} onValueChange={setEvidenceLabel}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {EVIDENCE_LABELS.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this evidence show?" rows={3} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Type</Label>
                    <Select value={sourceType} onValueChange={setSourceType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original / Primary</SelectItem>
                        <SelectItem value="secondary">Secondary / Copy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edate">Evidence Date</Label>
                    <Input id="edate" type="date" value={evidenceDate} onChange={(e) => setEvidenceDate(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <FileUploadField files={files} onFilesChange={setFiles} />
                <div className="space-y-2">
                  <Label htmlFor="urls">Or Add URLs (one per line)</Label>
                  <Textarea id="urls" value={urls} onChange={(e) => setUrls(e.target.value)} placeholder="https://example.com/article" rows={3} />
                </div>
                <div className="border-t border-border/30 pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox id="propose-event" checked={proposeEvent} onCheckedChange={(v) => setProposeEvent(!!v)} />
                    <Label htmlFor="propose-event" className="text-sm">Propose a timeline event from this evidence</Label>
                  </div>
                  {proposeEvent && (
                    <div className="pl-6 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="event-desc">Event Description</Label>
                        <Textarea id="event-desc" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="What happened?" rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Event Date</Label>
                        <Input id="event-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Review your evidence submission.</p>
                <div className="grid gap-3">
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-sm text-muted-foreground">Case</span>
                    <span className="text-sm font-medium text-foreground">{caseData.case_number} — {caseData.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-sm text-muted-foreground">Evidence Type</span>
                    <span className="text-sm font-medium text-foreground">{evidenceLabel}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-sm text-muted-foreground">Files</span>
                    <span className="text-sm font-medium text-foreground">{files.length}</span>
                  </div>
                  {urls.trim() && (
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-sm text-muted-foreground">URLs</span>
                      <span className="text-sm font-medium text-foreground">{urls.split("\n").filter(Boolean).length}</span>
                    </div>
                  )}
                  {proposeEvent && (
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-sm text-muted-foreground">Proposed Event</span>
                      <span className="text-sm font-medium text-foreground">Yes</span>
                    </div>
                  )}
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    Your evidence will be submitted for review. Track its status in the <Link to="/uploads" className="text-primary hover:underline">Upload Center</Link>.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? "Submitting…" : "Submit Evidence"} <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default AddEvidence;
