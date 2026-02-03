import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PAKISTANI_LEGAL_SECTIONS, 
  INTERNATIONAL_LEGAL_SECTIONS,
  type ClaimType,
  type LegalFramework,
} from "@/types/correlation";

interface AddClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    claim_type: ClaimType;
    legal_section: string;
    legal_framework: LegalFramework;
    allegation_text: string;
    alleged_by?: string;
    alleged_against?: string;
    date_alleged?: string;
    source_document?: string;
  }) => void;
  caseId?: string;
}

export const AddClaimDialog = ({
  open,
  onOpenChange,
  onSubmit,
  caseId,
}: AddClaimDialogProps) => {
  const [framework, setFramework] = useState<LegalFramework>("pakistani");
  const [claimType, setClaimType] = useState<ClaimType>("criminal");
  const [legalSection, setLegalSection] = useState("");
  const [allegationText, setAllegationText] = useState("");
  const [allegedBy, setAllegedBy] = useState("");
  const [allegedAgainst, setAllegedAgainst] = useState("");
  const [dateAlleged, setDateAlleged] = useState("");
  const [sourceDocument, setSourceDocument] = useState("");

  const handleSubmit = () => {
    if (!legalSection || !allegationText) return;

    onSubmit({
      claim_type: claimType,
      legal_section: legalSection,
      legal_framework: framework,
      allegation_text: allegationText,
      alleged_by: allegedBy || undefined,
      alleged_against: allegedAgainst || undefined,
      date_alleged: dateAlleged || undefined,
      source_document: sourceDocument || undefined,
    });

    // Reset form
    setLegalSection("");
    setAllegationText("");
    setAllegedBy("");
    setAllegedAgainst("");
    setDateAlleged("");
    setSourceDocument("");
    onOpenChange(false);
  };

  const getSectionsForType = () => {
    if (framework === "international") {
      return INTERNATIONAL_LEGAL_SECTIONS;
    }
    return PAKISTANI_LEGAL_SECTIONS[claimType] || [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Legal Claim / Allegation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Framework Selection */}
          <Tabs value={framework} onValueChange={(v) => setFramework(v as LegalFramework)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pakistani">🇵🇰 Pakistani Law</TabsTrigger>
              <TabsTrigger value="international">🌍 International Law</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            {/* Claim Type */}
            {framework === "pakistani" && (
              <div className="space-y-2">
                <Label>Claim Type</Label>
                <Select value={claimType} onValueChange={(v) => setClaimType(v as ClaimType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="criminal">Criminal</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Legal Section */}
            <div className="space-y-2">
              <Label>Legal Section</Label>
              <Select value={legalSection} onValueChange={setLegalSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {getSectionsForType().map((section) => (
                    <SelectItem key={section.code} value={section.code}>
                      {section.code} - {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Allegation Text */}
          <div className="space-y-2">
            <Label>Allegation / Claim Text *</Label>
            <Textarea
              placeholder="Enter the specific allegation or claim made..."
              value={allegationText}
              onChange={(e) => setAllegationText(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Alleged By */}
            <div className="space-y-2">
              <Label>Alleged By</Label>
              <Input
                placeholder="Who made the allegation"
                value={allegedBy}
                onChange={(e) => setAllegedBy(e.target.value)}
              />
            </div>

            {/* Alleged Against */}
            <div className="space-y-2">
              <Label>Alleged Against</Label>
              <Input
                placeholder="Who is the allegation against"
                value={allegedAgainst}
                onChange={(e) => setAllegedAgainst(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Alleged */}
            <div className="space-y-2">
              <Label>Date of Allegation</Label>
              <Input
                type="date"
                value={dateAlleged}
                onChange={(e) => setDateAlleged(e.target.value)}
              />
            </div>

            {/* Source Document */}
            <div className="space-y-2">
              <Label>Source Document</Label>
              <Input
                placeholder="e.g., FIR No. 123/2024"
                value={sourceDocument}
                onChange={(e) => setSourceDocument(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!legalSection || !allegationText}>
            Add Claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
