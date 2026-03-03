import { Badge } from "@/components/ui/badge";

interface Props {
  title: string;
  incidentType: string;
  location: string;
  visibility: string;
  evidenceFileCount: number;
  dateRange: string;
  summary: string;
  peopleText: string;
}

export const SubmitCaseStepReview = ({
  title, incidentType, location, visibility, evidenceFileCount, dateRange, summary, peopleText,
}: Props) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Review your submission before sending.</p>
    <div className="grid gap-3">
      <ReviewRow label="Title" value={title} />
      <ReviewRow label="Type" value={incidentType} />
      {location && <ReviewRow label="Location" value={location} />}
      {dateRange && <ReviewRow label="Date Range" value={dateRange} />}
      <div className="flex justify-between border-b border-border/30 pb-2">
        <span className="text-sm text-muted-foreground">Visibility</span>
        <Badge variant="outline" className="capitalize">{visibility}</Badge>
      </div>
      <ReviewRow label="Evidence files" value={String(evidenceFileCount)} />
      {peopleText && <ReviewRow label="People listed" value={`${peopleText.split("\n").filter(Boolean).length} entries`} />}
      {summary && (
        <div className="border-b border-border/30 pb-2">
          <span className="text-sm text-muted-foreground">Summary</span>
          <p className="text-sm text-foreground mt-1 line-clamp-3">{summary}</p>
        </div>
      )}
    </div>
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-4">
      <p className="text-xs text-muted-foreground">
        After submission, your case will be assigned a <strong>CF-###</strong> reference number and placed in the moderation queue for review. You'll be able to track its status in the Upload Center.
      </p>
    </div>
  </div>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-border/30 pb-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);
