import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, Scale, FileText, AlertTriangle, ExternalLink, Shield, Download, Link2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useEventDetail } from "@/hooks/useChronologyEvents";

interface EventDetailDrawerProps {
  eventId: string | null;
  open: boolean;
  onClose: () => void;
}

export const EventDetailDrawer = ({ eventId, open, onClose }: EventDetailDrawerProps) => {
  const navigate = useNavigate();
  const { data, isLoading } = useEventDetail(eventId);

  const event = data?.event;

  const formatDate = (d: string) => {
    try { return format(parseISO(d), "MMMM d, yyyy"); } catch { return d; }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Event Detail</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !event ? (
          <p className="text-muted-foreground mt-6">Event not found.</p>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Date + Category */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(event.date)}
              </Badge>
              <Badge className="bg-primary text-primary-foreground">{event.category}</Badge>
              {event.confidence_score != null && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {Math.round(event.confidence_score * 100)}% confidence
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              {event.title && <h3 className="font-semibold text-lg mb-2">{event.title}</h3>}
              <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
            </div>

            {/* Details grid */}
            <div className="grid gap-4">
              <DetailRow icon={Users} label="Key Individuals" value={event.individuals} />
              <DetailRow icon={Scale} label="Legal Action" value={event.legal_action} />
              <DetailRow icon={FileText} label="Outcome" value={event.outcome} />
              <DetailRow icon={AlertTriangle} label="Evidence Discrepancy" value={event.evidence_discrepancy} highlight />
            </div>

            <Separator />

            {/* Linked Entities */}
            {data.entities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Link2 className="w-4 h-4" /> Linked Entities ({data.entities.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.entities.map((e: any) => (
                    <Badge
                      key={e.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => {
                        onClose();
                        navigate(`/entities/${e.entities?.id || e.entity_id}`);
                      }}
                    >
                      {e.entities?.primary_name || "Entity"} 
                      <span className="ml-1 text-muted-foreground text-[10px]">({e.role})</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Evidence */}
            {data.evidence.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Linked Evidence ({data.evidence.length})
                </h4>
                <div className="space-y-2">
                  {data.evidence.map((e: any) => (
                    <Card key={e.id} className="p-3 flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{e.evidence_uploads?.file_name || "File"}</p>
                        <p className="text-xs text-muted-foreground">{e.evidence_uploads?.category || "General"}</p>
                      </div>
                      {e.evidence_uploads?.public_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={e.evidence_uploads.public_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Violations */}
            {data.violations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Linked Violations ({data.violations.length})
                </h4>
                <div className="space-y-2">
                  {data.violations.map((v: any) => (
                    <Card key={v.id} className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={v.compliance_violations?.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                          {v.compliance_violations?.severity || "unknown"}
                        </Badge>
                        <span className="text-sm">{v.compliance_violations?.title || "Violation"}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Sources */}
            <div>
              <p className="text-xs text-muted-foreground">Sources: {event.sources}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { onClose(); navigate(`/events/${event.id}`); }}>
                <ExternalLink className="w-4 h-4 mr-1" /> Full Page
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

function DetailRow({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  if (!value || value === "None" || value === "N/A") return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlight ? "text-amber-500" : "text-muted-foreground"}`} />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={`text-sm ${highlight ? "text-amber-600" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
