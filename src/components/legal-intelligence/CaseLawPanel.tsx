import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Gavel,
  Search,
  Plus,
  Check,
  Star,
  Calendar,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  useCaseLawPrecedents,
  useLinkPrecedent,
  useCasePrecedentLinks,
} from "@/hooks/useLegalIntelligence";
import { useUserRole } from "@/hooks/useUserRole";
import { VerifyPrecedentDialog } from "./VerifyPrecedentDialog";
import type { CaseLawPrecedent } from "@/types/legal-intelligence";

interface CaseLawPanelProps {
  caseId: string;
}

export const CaseLawPanel = ({ caseId }: CaseLawPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnverified, setShowUnverified] = useState(false);
  const [verifyingPrecedent, setVerifyingPrecedent] =
    useState<CaseLawPrecedent | null>(null);

  const { data: precedents, isLoading } = useCaseLawPrecedents();
  const { data: linkedPrecedents } = useCasePrecedentLinks(caseId);
  const linkPrecedent = useLinkPrecedent();
  const { role } = useUserRole();

  const canVerify = role === "admin" || role === "editor";

  const linkedIds = new Set(
    linkedPrecedents?.map((l) => l.precedent_id) || []
  );

  // Filter by search term
  const searchFiltered = precedents?.filter(
    (precedent) =>
      precedent.case_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precedent.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precedent.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precedent.key_principles?.some((p) =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Apply verified filter (default: show only verified)
  const filteredPrecedents = showUnverified
    ? searchFiltered
    : searchFiltered?.filter((p) => p.verified);

  const verifiedCount = precedents?.filter((p) => p.verified).length || 0;
  const unverifiedCount = precedents?.filter((p) => !p.verified).length || 0;

  const handleLink = (precedentId: string) => {
    linkPrecedent.mutate({ caseId, precedentId });
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gavel className="h-5 w-5 text-amber-500" />
              Case Law Precedents
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500 border-green-500/20"
              >
                <ShieldCheck className="h-3 w-3 mr-1" />
                {verifiedCount} verified
              </Badge>
              {showUnverified && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-500 border-amber-500/20"
                >
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  {unverifiedCount} unverified
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search precedents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-unverified"
                  checked={showUnverified}
                  onCheckedChange={setShowUnverified}
                />
                <Label
                  htmlFor="show-unverified"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Show unverified precedents
                </Label>
              </div>
              {!showUnverified && unverifiedCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unverifiedCount} hidden
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading precedents...
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredPrecedents?.map((precedent) => {
                  const isLinked = linkedIds.has(precedent.id);
                  return (
                    <div
                      key={precedent.id}
                      className={`p-3 rounded-lg border transition-colors space-y-2 ${
                        precedent.verified
                          ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                          : "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">
                              {precedent.case_name}
                            </p>
                            {precedent.is_landmark && (
                              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 h-5">
                                <Star className="h-3 w-3 mr-1" />
                                Landmark
                              </Badge>
                            )}
                            {/* Verification Badge */}
                            {precedent.verified ? (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 h-5">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 h-5">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Unverified – do not cite
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                            <span className="font-mono">
                              {precedent.citation}
                            </span>
                            <span>•</span>
                            <span>{precedent.court}</span>
                            {precedent.year && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {precedent.year}
                                </span>
                              </>
                            )}
                            {precedent.source_url && (
                              <>
                                <span>•</span>
                                <a
                                  href={precedent.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Source
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Verify Button - Only for Admin/Editor and unverified */}
                          {canVerify && !precedent.verified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setVerifyingPrecedent(precedent)}
                              className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                            >
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verify
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={isLinked ? "secondary" : "outline"}
                            onClick={() => !isLinked && handleLink(precedent.id)}
                            disabled={isLinked || linkPrecedent.isPending}
                          >
                            {isLinked ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Linked
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Link
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {precedent.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {precedent.summary}
                        </p>
                      )}

                      {precedent.key_principles &&
                        precedent.key_principles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {precedent.key_principles
                              .slice(0, 3)
                              .map((principle, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs h-5"
                                >
                                  {principle}
                                </Badge>
                              ))}
                            {precedent.key_principles.length > 3 && (
                              <Badge variant="outline" className="text-xs h-5">
                                +{precedent.key_principles.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                      {/* Verification details */}
                      {precedent.verified && precedent.verified_at && (
                        <p className="text-xs text-green-500/70">
                          Verified{" "}
                          {new Date(precedent.verified_at).toLocaleDateString()}
                        </p>
                      )}
                      {precedent.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          Note: {precedent.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
                {filteredPrecedents?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {showUnverified
                        ? "No precedents found"
                        : "No verified precedents found"}
                    </p>
                    {!showUnverified && unverifiedCount > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowUnverified(true)}
                        className="mt-2"
                      >
                        Show {unverifiedCount} unverified precedent
                        {unverifiedCount > 1 ? "s" : ""}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      {verifyingPrecedent && (
        <VerifyPrecedentDialog
          open={!!verifyingPrecedent}
          onOpenChange={(open) => !open && setVerifyingPrecedent(null)}
          precedent={verifyingPrecedent}
        />
      )}
    </>
  );
};
