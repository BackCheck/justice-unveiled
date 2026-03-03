import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { UploadProgressOverlay } from "@/components/evidence/UploadProgressOverlay";
import { SubmitCaseStepBasics } from "@/components/submit-case/StepBasics";
import { SubmitCaseStepPeople } from "@/components/submit-case/StepPeople";
import { SubmitCaseStepEvidence } from "@/components/submit-case/StepEvidence";
import { SubmitCaseStepPrivacy } from "@/components/submit-case/StepPrivacy";
import { SubmitCaseStepReview } from "@/components/submit-case/StepReview";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  Upload,
  Shield,
  Send,
} from "lucide-react";

const STEPS = [
  { label: "Case Basics", icon: FileText },
  { label: "People & Entities", icon: Users },
  { label: "Evidence", icon: Upload },
  { label: "Privacy & Preferences", icon: Shield },
  { label: "Review & Submit", icon: Send },
];

const SubmitCase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: "" });

  useSEO({
    title: "Submit a Case — HRPM",
    description: "Submit a new human rights case for documentation and investigation.",
  });

  // Step 1: Basics
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [summary, setSummary] = useState("");

  // Step 2: People
  const [peopleText, setPeopleText] = useState("");

  // Step 3: Evidence
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceSourceType, setEvidenceSourceType] = useState("original");
  const [evidenceDescription, setEvidenceDescription] = useState("");

  // Step 4: Privacy
  const [visibility, setVisibility] = useState("public");
  const [consentChecked, setConsentChecked] = useState(false);
  const [autoRedact, setAutoRedact] = useState(true);
  const [redactCNIC, setRedactCNIC] = useState(true);
  const [redactPhone, setRedactPhone] = useState(true);
  const [redactEmail, setRedactEmail] = useState(true);
  const [faceBlur, setFaceBlur] = useState(false);
  const [contactChannel, setContactChannel] = useState("");

  if (!user) {
    return (
      <PlatformLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to contribute</h1>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to submit a case. Your progress will be here when you return.
          </p>
          <Button asChild>
            <a href={`/auth?redirect=${encodeURIComponent("/submit-case")}`}>Sign In</a>
          </Button>
        </div>
      </PlatformLayout>
    );
  }

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0 && incidentType.length > 0;
    if (step === 3) return consentChecked;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let submissionId: string | null = null;
    let caseId: string | null = null;

    try {
      // Rate limit check
      const { data: allowed } = await supabase.rpc("check_submission_rate_limit", {
        p_user_id: user.id,
        p_max_per_day: 10,
      });
      if (allowed === false) {
        toast({
          title: "Rate limit reached",
          description: "You can submit up to 10 cases per day. Please try again tomorrow.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const caseNumber = `CF-${Date.now().toString(36).toUpperCase()}`;

      // 1. Create submission record FIRST with upload_state = "in_progress"
      const { data: subData, error: subError } = await supabase.from("submissions" as any).insert({
        submission_type: "case",
        status: "pending_review",
        upload_state: "in_progress",
        submitted_by: user.id,
        contact_info: contactChannel || null,
        payload: {
          title,
          location,
          incidentType,
          dateRange,
          summary,
          peopleText,
          evidenceLabel,
          evidenceSourceType,
          evidenceDescription,
          visibility,
          redaction: { cnic: redactCNIC, phone: redactPhone, email: redactEmail, faceBlur },
          evidenceFileCount: evidenceFiles.length,
        },
      } as any).select().single();

      if (subError) throw subError;
      submissionId = (subData as any)?.id;

      // 2. Create case stub
      const { data: caseData, error: caseError } = await supabase.from("cases").insert({
        title,
        case_number: caseNumber,
        description: summary,
        location,
        category: incidentType,
        status: "under_review",
        severity: "medium",
      }).select().single();

      if (caseError) throw caseError;
      caseId = caseData.id;

      // Link case to submission
      await supabase.from("submissions" as any).update({ case_id: caseId } as any).eq("id", submissionId);

      // 3. Upload evidence files
      if (evidenceFiles.length > 0) {
        setUploadProgress({ current: 0, total: evidenceFiles.length, fileName: "" });
        for (let i = 0; i < evidenceFiles.length; i++) {
          const file = evidenceFiles[i];
          setUploadProgress({ current: i + 1, total: evidenceFiles.length, fileName: file.name });
          const path = `${caseData.id}/${Date.now()}-${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from("evidence")
            .upload(path, file);

          if (uploadErr) {
            throw new Error(`Failed to upload ${file.name}: ${uploadErr.message}`);
          }

          // Verify upload succeeded before inserting evidence record
          const { data: urlData } = supabase.storage
            .from("evidence")
            .getPublicUrl(path);

          await supabase.from("evidence_uploads").insert({
            case_id: caseData.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: path,
            public_url: urlData.publicUrl,
            category: evidenceLabel || "general",
            uploaded_by: user.id,
          });
        }
        setUploadProgress({ current: 0, total: 0, fileName: "" });
      }

      // 4. Mark upload as complete
      await supabase.from("submissions" as any).update({ upload_state: "complete" } as any).eq("id", submissionId);

      toast({
        title: "Case submitted for review",
        description: `Case ${caseNumber} has been created and sent for moderation.`,
      });

      navigate(`/cases/${caseData.id}`);
    } catch (err: any) {
      // Mark submission as failed if it was created
      if (submissionId) {
        await supabase.from("submissions" as any).update({
          status: "failed",
          upload_state: "error",
          error_message: err.message || "Upload failed",
        } as any).eq("id", submissionId);
      }

      toast({
        title: "Submission failed",
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
        {/* Progress */}
        <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
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
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn("w-6 h-px", done ? "bg-primary" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
              {STEPS[step].label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {step === 0 && (
              <SubmitCaseStepBasics
                title={title} setTitle={setTitle}
                location={location} setLocation={setLocation}
                incidentType={incidentType} setIncidentType={setIncidentType}
                dateRange={dateRange} setDateRange={setDateRange}
                summary={summary} setSummary={setSummary}
              />
            )}
            {step === 1 && (
              <SubmitCaseStepPeople
                peopleText={peopleText} setPeopleText={setPeopleText}
              />
            )}
            {step === 2 && (
              <SubmitCaseStepEvidence
                evidenceFiles={evidenceFiles} setEvidenceFiles={setEvidenceFiles}
                evidenceLabel={evidenceLabel} setEvidenceLabel={setEvidenceLabel}
                evidenceSourceType={evidenceSourceType} setEvidenceSourceType={setEvidenceSourceType}
                evidenceDescription={evidenceDescription} setEvidenceDescription={setEvidenceDescription}
              />
            )}
            {step === 3 && (
              <SubmitCaseStepPrivacy
                visibility={visibility} setVisibility={setVisibility}
                consentChecked={consentChecked} setConsentChecked={setConsentChecked}
                autoRedact={autoRedact} setAutoRedact={setAutoRedact}
                redactCNIC={redactCNIC} setRedactCNIC={setRedactCNIC}
                redactPhone={redactPhone} setRedactPhone={setRedactPhone}
                redactEmail={redactEmail} setRedactEmail={setRedactEmail}
                faceBlur={faceBlur} setFaceBlur={setFaceBlur}
                contactChannel={contactChannel} setContactChannel={setContactChannel}
              />
            )}
            {step === 4 && (
              <SubmitCaseStepReview
                title={title}
                incidentType={incidentType}
                location={location}
                visibility={visibility}
                evidenceFileCount={evidenceFiles.length}
                dateRange={dateRange}
                summary={summary}
                peopleText={peopleText}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? "Submitting…" : "Submit Case"}
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default SubmitCase;
