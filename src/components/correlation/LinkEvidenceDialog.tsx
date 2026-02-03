import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { LinkType, LegalClaim } from "@/types/correlation";

interface LinkEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: LegalClaim | null;
  onSubmit: (data: {
    claim_id: string;
    evidence_upload_id?: string;
    extracted_event_id?: string;
    link_type: LinkType;
    exhibit_number?: string;
    relevance_score: number;
    notes?: string;
  }) => void;
}

interface EvidenceFile {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  category: string | null;
}

interface ExtractedEvent {
  id: string;
  description: string;
  date: string;
  category: string;
}

export const LinkEvidenceDialog = ({
  open,
  onOpenChange,
  claim,
  onSubmit,
}: LinkEvidenceDialogProps) => {
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [linkType, setLinkType] = useState<LinkType>("supports");
  const [exhibitNumber, setExhibitNumber] = useState("");
  const [relevanceScore, setRelevanceScore] = useState([50]);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceType, setSourceType] = useState<"evidence" | "event">("evidence");

  // Fetch evidence files and events
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      const [evidenceRes, eventsRes] = await Promise.all([
        supabase
          .from("evidence_uploads")
          .select("id, file_name, file_type, created_at, category")
          .order("created_at", { ascending: false }),
        supabase
          .from("extracted_events")
          .select("id, description, date, category")
          .order("date", { ascending: false }),
      ]);

      if (evidenceRes.data) setEvidenceFiles(evidenceRes.data);
      if (eventsRes.data) setExtractedEvents(eventsRes.data);
    };

    fetchData();
  }, [open]);

  const handleSubmit = () => {
    if (!claim) return;
    if (!selectedEvidence && !selectedEvent) return;

    onSubmit({
      claim_id: claim.id,
      evidence_upload_id: sourceType === "evidence" ? selectedEvidence : undefined,
      extracted_event_id: sourceType === "event" ? selectedEvent : undefined,
      link_type: linkType,
      exhibit_number: exhibitNumber || undefined,
      relevance_score: relevanceScore[0],
      notes: notes || undefined,
    });

    // Reset form
    setSelectedEvidence("");
    setSelectedEvent("");
    setLinkType("supports");
    setExhibitNumber("");
    setRelevanceScore([50]);
    setNotes("");
    setSearchTerm("");
    onOpenChange(false);
  };

  const filteredEvidence = evidenceFiles.filter((f) =>
    f.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = extractedEvents.filter((e) =>
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link Evidence to Claim</DialogTitle>
        </DialogHeader>

        {claim && (
          <div className="p-3 rounded-lg bg-muted mb-4">
            <p className="text-sm font-medium mb-1">
              {claim.legal_section} - {claim.claim_type}
            </p>
            <p className="text-sm text-muted-foreground">{claim.allegation_text}</p>
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Source Type Toggle */}
          <div className="space-y-2">
            <Label>Source Type</Label>
            <RadioGroup
              value={sourceType}
              onValueChange={(v) => setSourceType(v as "evidence" | "event")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="evidence" id="evidence" />
                <Label htmlFor="evidence" className="cursor-pointer">
                  Evidence Files ({evidenceFiles.length})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event" id="event" />
                <Label htmlFor="event" className="cursor-pointer">
                  Extracted Events ({extractedEvents.length})
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Search */}
          <Input
            placeholder={`Search ${sourceType === "evidence" ? "files" : "events"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Selection List */}
          <div className="border rounded-lg max-h-48 overflow-y-auto">
            {sourceType === "evidence" ? (
              filteredEvidence.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No evidence files found
                </p>
              ) : (
                filteredEvidence.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted border-b last:border-b-0",
                      selectedEvidence === file.id && "bg-primary/10"
                    )}
                    onClick={() => setSelectedEvidence(file.id)}
                  >
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {file.category && (
                      <Badge variant="secondary" className="text-xs">
                        {file.category}
                      </Badge>
                    )}
                  </div>
                ))
              )
            ) : filteredEvents.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                No events found
              </p>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted border-b last:border-b-0",
                    selectedEvent === event.id && "bg-primary/10"
                  )}
                  onClick={() => setSelectedEvent(event.id)}
                >
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.description}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {event.category}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {/* Link Type */}
          <div className="space-y-2">
            <Label>Link Type</Label>
            <RadioGroup
              value={linkType}
              onValueChange={(v) => setLinkType(v as LinkType)}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supports" id="supports" />
                <Label htmlFor="supports" className="cursor-pointer text-emerald-600">
                  Supports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contradicts" id="contradicts" />
                <Label htmlFor="contradicts" className="cursor-pointer text-red-600">
                  Contradicts
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="cursor-pointer text-amber-600">
                  Partial
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exhibit" id="exhibit" />
                <Label htmlFor="exhibit" className="cursor-pointer text-blue-600">
                  Exhibit
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Exhibit Number */}
            <div className="space-y-2">
              <Label>Exhibit Number (optional)</Label>
              <Input
                placeholder="e.g., Exhibit A-1"
                value={exhibitNumber}
                onChange={(e) => setExhibitNumber(e.target.value)}
              />
            </div>

            {/* Relevance Score */}
            <div className="space-y-2">
              <Label>Relevance Score: {relevanceScore[0]}%</Label>
              <Slider
                value={relevanceScore}
                onValueChange={setRelevanceScore}
                max={100}
                step={5}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="How does this evidence relate to the claim?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            disabled={!selectedEvidence && !selectedEvent}
          >
            <LinkIcon className="w-4 h-4 mr-1" />
            Link Evidence
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
