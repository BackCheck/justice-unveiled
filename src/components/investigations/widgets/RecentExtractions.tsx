import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Calendar, ChevronRight, Brain } from "lucide-react";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { Link } from "react-router-dom";

export const RecentExtractions = () => {
  const { events } = useCombinedTimeline();

  // Get AI-extracted events only, sorted by most recent
  const aiEvents = events
    .filter(e => e.isExtracted)
    .slice(-8)
    .reverse();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Legal Proceeding":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "Harassment":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "Criminal Allegation":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "Business Interference":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Extractions
          </CardTitle>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
              View All <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[220px]">
          {aiEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No AI extractions yet</p>
              <Link to="/analyze">
                <Button variant="link" size="sm" className="mt-2">
                  Start Analyzing →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {aiEvents.map((event, idx) => (
                <div
                  key={event.extractedId || idx}
                  className="p-3 rounded-lg bg-accent/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {event.date}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{event.description}</p>
                  {event.confidenceScore && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${event.confidenceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round(event.confidenceScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
