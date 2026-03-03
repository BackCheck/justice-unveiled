import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  visibility: string; setVisibility: (v: string) => void;
  consentChecked: boolean; setConsentChecked: (v: boolean) => void;
  autoRedact: boolean; setAutoRedact: (v: boolean) => void;
  redactCNIC: boolean; setRedactCNIC: (v: boolean) => void;
  redactPhone: boolean; setRedactPhone: (v: boolean) => void;
  redactEmail: boolean; setRedactEmail: (v: boolean) => void;
  faceBlur: boolean; setFaceBlur: (v: boolean) => void;
  contactChannel: string; setContactChannel: (v: string) => void;
}

export const SubmitCaseStepPrivacy = ({
  visibility, setVisibility,
  consentChecked, setConsentChecked,
  autoRedact, setAutoRedact,
  redactCNIC, setRedactCNIC,
  redactPhone, setRedactPhone,
  redactEmail, setRedactEmail,
  faceBlur, setFaceBlur,
  contactChannel, setContactChannel,
}: Props) => (
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

    <div className="space-y-3">
      <Label className="text-sm font-semibold">Auto-Redaction Preferences</Label>
      <div className="flex items-center gap-3">
        <Checkbox id="redact-all" checked={autoRedact} onCheckedChange={(v) => setAutoRedact(!!v)} />
        <Label htmlFor="redact-all" className="text-sm">Enable auto-redaction of sensitive PII</Label>
      </div>
      {autoRedact && (
        <div className="pl-6 space-y-2">
          <div className="flex items-center gap-3">
            <Checkbox id="redact-cnic" checked={redactCNIC} onCheckedChange={(v) => setRedactCNIC(!!v)} />
            <Label htmlFor="redact-cnic" className="text-sm">CNIC / National ID numbers</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="redact-phone" checked={redactPhone} onCheckedChange={(v) => setRedactPhone(!!v)} />
            <Label htmlFor="redact-phone" className="text-sm">Phone numbers</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="redact-email" checked={redactEmail} onCheckedChange={(v) => setRedactEmail(!!v)} />
            <Label htmlFor="redact-email" className="text-sm">Email addresses</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="face-blur" checked={faceBlur} onCheckedChange={(v) => setFaceBlur(!!v)} />
            <Label htmlFor="face-blur" className="text-sm">Request face blur on images/video (manual review)</Label>
          </div>
        </div>
      )}
    </div>

    <div className="space-y-2">
      <Label htmlFor="contact">Secure Contact Channel (optional)</Label>
      <p className="text-xs text-muted-foreground">
        If you'd like reviewers to contact you securely, provide a Signal number, ProtonMail, or encrypted channel.
      </p>
      <Input
        id="contact"
        value={contactChannel}
        onChange={(e) => setContactChannel(e.target.value)}
        placeholder="e.g., Signal: +1234567890"
      />
    </div>

    <div className="flex items-start gap-3 pt-2">
      <Checkbox id="consent" checked={consentChecked} onCheckedChange={(v) => setConsentChecked(!!v)} />
      <Label htmlFor="consent" className="text-sm leading-relaxed">
        I confirm this submission is made in good faith for documentation purposes. I understand HRPM may redact or reject submissions that do not meet verification standards. *
      </Label>
    </div>
  </>
);
