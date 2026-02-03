import { ReconstructedEvent, DelayAlert, ContradictionFlag } from "@/types/reconstruction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Calendar, 
  Users, 
  Scale, 
  AlertTriangle, 
  Sparkles, 
  FileText,
  TrendingUp,
  Link2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDetailPanelProps {
  event: ReconstructedEvent | null;
  relatedDelays: DelayAlert[];
  relatedContradictions: ContradictionFlag[];
  onClose: () => void;
}

export const EventDetailPanel = ({ 
  event, 
  relatedDelays, 
  relatedContradictions,
  onClose 
}: EventDetailPanelProps) => {
  if (!event) return null;

  return (
    <Card className="glass-card border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{event.category}</Badge>
              {event.isExtracted && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Extracted
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{event.date}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Description
          </h4>
          <p className="text-sm text-muted-foreground">{event.description}</p>
        </div>

        <Separator />

        {/* Actors */}
        {event.actors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Actors
            </h4>
            <div className="flex flex-wrap gap-1">
              {event.actors.map((actor, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {actor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action & Impact */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Action</h4>
            <p className="text-sm">{event.action}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Impact</h4>
            <p className="text-sm">{event.impact}</p>
          </div>
        </div>

        {/* Track & Agency */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {event.trackType} Track
          </Badge>
          {event.agency && event.agency !== "Other" && (
            <Badge variant="outline" className="text-xs">
              {event.agency}
            </Badge>
          )}
          {event.sources && (
            <Badge variant="secondary" className="text-xs">
              Sources: {event.sources}
            </Badge>
          )}
        </div>

        {/* Contradictions */}
        {event.hasContradiction && event.contradictionDetails && (
          <>
            <Separator />
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Evidence Discrepancy
              </h4>
              <p className="text-sm text-muted-foreground">{event.contradictionDetails}</p>
            </div>
          </>
        )}

        {/* Related Delays */}
        {relatedDelays.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Associated Delays ({relatedDelays.length})
              </h4>
              <div className="space-y-2">
                {relatedDelays.map(delay => (
                  <div 
                    key={delay.id}
                    className="p-2 rounded bg-orange-500/10 border border-orange-500/20 text-xs"
                  >
                    <span className="font-medium">{delay.delayDays} days delay</span>
                    <span className="text-muted-foreground"> — {delay.description.substring(0, 60)}...</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Related Contradictions */}
        {relatedContradictions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-destructive" />
                Linked Contradictions ({relatedContradictions.length})
              </h4>
              <div className="space-y-2">
                {relatedContradictions.map(contradiction => (
                  <div 
                    key={contradiction.id}
                    className="p-2 rounded bg-destructive/10 border border-destructive/20 text-xs"
                  >
                    <Badge variant="outline" className="text-xs mb-1 capitalize">
                      {contradiction.type}
                    </Badge>
                    <p className="text-muted-foreground">{contradiction.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Confidence Score */}
        {event.confidenceScore && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>AI Confidence</span>
              <span>{Math.round(event.confidenceScore * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${event.confidenceScore * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
