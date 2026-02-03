import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  FileText,
  User,
  Calendar,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { 
  LegalClaim, 
  ClaimEvidenceLink, 
  RequirementFulfillment,
  EvidenceRequirement,
  CLAIM_STATUS_CONFIG,
  CLAIM_TYPE_CONFIG,
} from "@/types/correlation";

interface ClaimCardProps {
  claim: LegalClaim;
  evidenceLinks: ClaimEvidenceLink[];
  requirements: EvidenceRequirement[];
  fulfillments: RequirementFulfillment[];
  onLinkEvidence?: (claimId: string) => void;
  onUpdateStatus?: (claimId: string) => void;
}

const statusIcons = {
  unverified: HelpCircle,
  supported: CheckCircle,
  unsupported: XCircle,
  partially_supported: AlertCircle,
};

const statusColors = {
  unverified: "bg-slate-500",
  supported: "bg-emerald-500",
  unsupported: "bg-red-500",
  partially_supported: "bg-amber-500",
};

const typeColors = {
  criminal: "bg-red-600",
  regulatory: "bg-blue-600",
  civil: "bg-purple-600",
};

export const ClaimCard = ({
  claim,
  evidenceLinks,
  requirements,
  fulfillments,
  onLinkEvidence,
  onUpdateStatus,
}: ClaimCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusIcons[claim.status];

  // Calculate requirement fulfillment
  const claimRequirements = requirements.filter(
    (r) => r.legal_section === claim.legal_section && r.legal_framework === claim.legal_framework
  );
  const claimFulfillments = fulfillments.filter((f) => f.claim_id === claim.id);
  const fulfilledCount = claimFulfillments.filter((f) => f.is_fulfilled).length;
  const mandatoryReqs = claimRequirements.filter((r) => r.is_mandatory);
  const mandatoryFulfilled = mandatoryReqs.filter((r) =>
    claimFulfillments.some((f) => f.requirement_id === r.id && f.is_fulfilled)
  ).length;

  const supportingLinks = evidenceLinks.filter((l) => l.link_type === "supports");
  const contradictingLinks = evidenceLinks.filter((l) => l.link_type === "contradicts");
  const exhibits = evidenceLinks.filter((l) => l.link_type === "exhibit");

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      claim.status === "unsupported" && "border-red-500/50",
      claim.status === "supported" && "border-emerald-500/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn("text-white", typeColors[claim.claim_type])}>
                {claim.claim_type}
              </Badge>
              <Badge variant="outline">{claim.legal_section}</Badge>
              <Badge variant="secondary">
                {claim.legal_framework === "pakistani" ? "🇵🇰 Pakistani" : "🌍 International"}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">{claim.allegation_text}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("text-white", statusColors[claim.status])}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {claim.status.replace("_", " ")}
            </Badge>
            <div className="text-right">
              <p className="text-2xl font-bold">{claim.support_score}%</p>
              <p className="text-xs text-muted-foreground">support</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {claim.alleged_by && (
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>By: {claim.alleged_by}</span>
            </div>
          )}
          {claim.alleged_against && (
            <div className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Against: {claim.alleged_against}</span>
            </div>
          )}
          {claim.date_alleged && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(claim.date_alleged).toLocaleDateString()}</span>
            </div>
          )}
          {claim.source_document && (
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{claim.source_document}</span>
            </div>
          )}
        </div>

        {/* Evidence summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{supportingLinks.length} supporting</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>{contradictingLinks.length} contradicting</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{exhibits.length} exhibits</span>
          </div>
        </div>

        {/* Requirement progress */}
        {claimRequirements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Evidence Requirements ({fulfilledCount}/{claimRequirements.length})
              </span>
              {mandatoryReqs.length > 0 && mandatoryFulfilled < mandatoryReqs.length && (
                <Badge variant="destructive" className="text-xs">
                  {mandatoryReqs.length - mandatoryFulfilled} mandatory missing
                </Badge>
              )}
            </div>
            <Progress 
              value={(fulfilledCount / claimRequirements.length) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Expandable details */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Show Requirements & Evidence
            </>
          )}
        </Button>

        {expanded && (
          <div className="space-y-4 pt-2 border-t">
            {/* Requirements checklist */}
            {claimRequirements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Required Evidence</h4>
                <div className="space-y-1.5">
                  {claimRequirements.map((req) => {
                    const fulfilled = claimFulfillments.find(
                      (f) => f.requirement_id === req.id && f.is_fulfilled
                    );
                    return (
                      <div
                        key={req.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded text-sm",
                          fulfilled ? "bg-emerald-500/10" : "bg-muted"
                        )}
                      >
                        {fulfilled ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 shrink-0",
                            req.is_mandatory ? "border-red-500" : "border-muted-foreground"
                          )} />
                        )}
                        <span className="flex-1">{req.requirement_name}</span>
                        {req.is_mandatory && !fulfilled && (
                          <Badge variant="destructive" className="text-xs">Mandatory</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Linked evidence */}
            {evidenceLinks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Linked Evidence</h4>
                <div className="space-y-1.5">
                  {evidenceLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 p-2 rounded bg-muted text-sm"
                    >
                      <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-white",
                          link.link_type === "supports" && "bg-emerald-500",
                          link.link_type === "contradicts" && "bg-red-500",
                          link.link_type === "partial" && "bg-amber-500",
                          link.link_type === "exhibit" && "bg-blue-500"
                        )}
                      >
                        {link.exhibit_number || link.link_type}
                      </Badge>
                      <span className="flex-1 text-muted-foreground">
                        {link.notes || `Evidence ID: ${link.evidence_upload_id?.slice(0, 8) || link.extracted_event_id?.slice(0, 8)}...`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {link.relevance_score}% relevant
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => onLinkEvidence?.(claim.id)}>
                <LinkIcon className="w-4 h-4 mr-1" />
                Link Evidence
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateStatus?.(claim.id)}>
                Update Status
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
