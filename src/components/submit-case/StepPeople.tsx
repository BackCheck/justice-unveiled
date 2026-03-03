import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  peopleText: string;
  setPeopleText: (v: string) => void;
}

export const SubmitCaseStepPeople = ({ peopleText, setPeopleText }: Props) => (
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
);
