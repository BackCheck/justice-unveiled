import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  MapPin,
  Users,
  Upload,
  Shield,
  Send,
} from "lucide-react";

const STEPS = [
  { label: "Case Basics", icon: FileText },
  { label: "People & Entities", icon: Users },
  { label: "Evidence", icon: Upload },
  { label: "Visibility", icon: Shield },
  { label: "Review & Submit", icon: Send },
];

const INCIDENT_TYPES = [
  "Enforced Disappearance",
  "Extrajudicial Killing",
  "Torture / Ill-treatment",
  "Arbitrary Detention",
  "Business Interference",
  "Harassment / Intimidation",
  "Land Grabbing",
  "Corruption / Fraud",
  "Media Suppression",
  "Discrimination",
  "Other",
];

const EVIDENCE_LABELS = [
  "FIR",
  "Court Order",
  "CCTV",
  "Medical Record",
  "Message Logs",
  "News Link",
  "Photograph",
  "Audio Recording",
  "Video Recording",
  "Affidavit",
  "Government Document",
  "Other",
];

const SubmitCase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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

  // Step 4: Visibility
  const [visibility, setVisibility] = useState("public");
  const [consentChecked, setConsentChecked] = useState(false);
  const [autoRedact, setAutoRedact] = useState(true);

  if (!user) {
    return (
      <PlatformLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in required</h1>
          <p className="text-muted-foreground mb-6">
            You need to sign in before submitting a case.
          </p>
          <Button asChild>
            <a href="/auth">Sign In</a>
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
    try {
      const caseNumber = `CF-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await supabase.from("cases").insert({
        title,
        case_number: caseNumber,
        description: summary,
        location,
        category: incidentType,
        status: "draft",
        severity: "medium",
      }).select().single();

      if (error) throw error;

      // Upload evidence files if any
      if (evidenceFiles.length > 0 && data) {
        for (const file of evidenceFiles) {
          const path = `${data.id}/${Date.now()}-${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from("evidence")
            .upload(path, file);

          if (!uploadErr) {
            const { data: urlData } = supabase.storage
              .from("evidence")
              .getPublicUrl(path);

            await supabase.from("evidence_uploads").insert({
              case_id: data.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: path,
              public_url: urlData.publicUrl,
              category: evidenceLabel || "general",
              uploaded_by: user.id,
            });
          }
        }
      }

      toast({
        title: "Case submitted",
        description: `Case ${caseNumber} has been created and sent for review.`,
      });

      navigate(`/cases/${data.id}`);
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlatformLayout>
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
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Case Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Unlawful detention of journalists in Karachi" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                  </div>
                  <div className="space-y-2">
                    <Label>Incident Type *</Label>
                    <Select value={incidentType} onValueChange={setIncidentType}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {INCIDENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date / Date Range</Label>
                  <Input id="dateRange" value={dateRange} onChange={(e) => setDateRange(e.target.value)} placeholder="e.g., March 2020 – Present" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief description of the case…" rows={4} />
                </div>
              </>
            )}

            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="people">People & Organizations</Label>
                <p className="text-sm text-muted-foreground">
                  List names, aliases, organizations, and their roles (victim, witness, accused, agency, lawyer). One per line.
                </p>
                <Textarea
                  id="people"
                  value={peopleText}
                  onChange={(e) => setPeopleText(e.target.value)}
                  placeholder={"John Doe — Victim\nAcme Corp — Accused Organization\nJane Smith — Witness"}
                  rows={8}
                />
              </div>
            )}

            {step === 2 && (
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
                        <Badge key={i} variant="secondary" className="text-xs">
                          {f.name}
                        </Badge>
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
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="restricted">Restricted (authenticated users only)</SelectItem>
                      <SelectItem value="private">Private (admins only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="redact" checked={autoRedact} onCheckedChange={(v) => setAutoRedact(!!v)} />
                  <Label htmlFor="redact" className="text-sm">
                    Auto-redact sensitive PII (CNIC, phone numbers, email addresses)
                  </Label>
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox id="consent" checked={consentChecked} onCheckedChange={(v) => setConsentChecked(!!v)} />
                  <Label htmlFor="consent" className="text-sm leading-relaxed">
                    I confirm this submission is made in good faith for documentation purposes. I understand HRPM may redact or reject submissions that do not meet verification standards. *
                  </Label>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Review your submission before sending.</p>
                <div className="grid gap-3">
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-sm text-muted-foreground">Title</span>
                    <span className="text-sm font-medium text-foreground">{title}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="text-sm font-medium text-foreground">{incidentType}</span>
                  </div>
                  {location && (
                    <div className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium text-foreground">{location}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-sm text-muted-foreground">Visibility</span>
                    <Badge variant="outline" className="capitalize">{visibility}</Badge>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-sm text-muted-foreground">Evidence files</span>
                    <span className="text-sm font-medium text-foreground">{evidenceFiles.length}</span>
                  </div>
                </div>
              </div>
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
