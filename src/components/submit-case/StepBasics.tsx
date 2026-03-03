import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface Props {
  title: string; setTitle: (v: string) => void;
  location: string; setLocation: (v: string) => void;
  incidentType: string; setIncidentType: (v: string) => void;
  dateRange: string; setDateRange: (v: string) => void;
  summary: string; setSummary: (v: string) => void;
}

export const SubmitCaseStepBasics = ({ title, setTitle, location, setLocation, incidentType, setIncidentType, dateRange, setDateRange, summary, setSummary }: Props) => (
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
);
