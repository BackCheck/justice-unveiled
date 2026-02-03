import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, FileWarning, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LegalClaim } from "@/types/correlation";

interface UnsupportedClaimsAlertProps {
  unsupportedClaims: LegalClaim[];
  claimsWithMissingEvidence: LegalClaim[];
  onViewClaim?: (claimId: string) => void;
}

export const UnsupportedClaimsAlert = ({
  unsupportedClaims,
  claimsWithMissingEvidence,
  onViewClaim,
}: UnsupportedClaimsAlertProps) => {
  if (unsupportedClaims.length === 0 && claimsWithMissingEvidence.length === 0) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Unsupported Claims */}
      {unsupportedClaims.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Unsupported Claims ({unsupportedClaims.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              These allegations lack sufficient supporting evidence and may indicate manufactured charges.
            </p>
            {unsupportedClaims.slice(0, 5).map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-2 rounded bg-background border gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {claim.legal_section}
                    </Badge>
                    <Badge className="bg-red-600 text-white text-xs shrink-0">
                      {claim.support_score}%
                    </Badge>
                  </div>
                  <p className="text-sm truncate">{claim.allegation_text}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewClaim?.(claim.id)}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {unsupportedClaims.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{unsupportedClaims.length - 5} more unsupported claims
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Missing Mandatory Evidence */}
      {claimsWithMissingEvidence.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <FileWarning className="w-5 h-5" />
              Missing Mandatory Evidence ({claimsWithMissingEvidence.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              These claims are missing legally required evidence under Pakistani or international law.
            </p>
            {claimsWithMissingEvidence.slice(0, 5).map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-2 rounded bg-background border gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {claim.legal_section}
                    </Badge>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {claim.legal_framework === "pakistani" ? "🇵🇰" : "🌍"}
                    </Badge>
                  </div>
                  <p className="text-sm truncate">{claim.allegation_text}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewClaim?.(claim.id)}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {claimsWithMissingEvidence.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{claimsWithMissingEvidence.length - 5} more with missing evidence
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
