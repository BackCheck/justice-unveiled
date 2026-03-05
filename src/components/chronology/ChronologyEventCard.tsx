import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Scale, FileText, AlertTriangle, Sparkles, ExternalLink, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ChronologyEvent } from "@/hooks/useChronologyEvents";

const CATEGORY_COLORS: Record<string, string> = {
  "Business Interference": "bg-amber-500 text-white",
  "Harassment": "bg-destructive text-destructive-foreground",
  "Legal Proceeding": "bg-primary text-primary-foreground",
  "Criminal Allegation": "bg-violet-500 text-white",
};

const CATEGORY_BORDER: Record<string, string> = {
  "Business Interference": "border-l-amber-500",
  "Harassment": "border-l-destructive",
  "Legal Proceeding": "border-l-primary",
  "Criminal Allegation": "border-l-violet-500",
};

function getConfidenceBadge(score: number | null) {
  const s = score ?? 0;
  if (s >= 0.8) return { label: "High", icon: ShieldCheck, className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" };
  if (s >= 0.5) return { label: "Medium", icon: Shield, className: "bg-amber-500/15 text-amber-700 border-amber-500/30" };
  if (s >= 0.2) return { label: "Low", icon: ShieldAlert, className: "bg-orange-500/15 text-orange-700 border-orange-500/30" };
  return { label: "Unverified", icon: ShieldAlert, className: "bg-destructive/15 text-destructive border-destructive/30" };
}

function formatDate(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    return isNaN(parsed.getTime()) ? dateStr : format(parsed, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

interface ChronologyEventCardProps {
  event: ChronologyEvent;
  onSelect: (id: string) => void;
}

export const ChronologyEventCard = memo(({ event, onSelect }: ChronologyEventCardProps) => {
  const navigate = useNavigate();
  const confidence = getConfidenceBadge(event.confidence_score);
  const ConfIcon = confidence.icon;

  // Parse actors from individuals string
  const actors = event.individuals
    ? event.individuals.split(",").map(a => a.replace(/\(.*?\)/g, "").trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-200 hover:shadow-lg hover:translate-x-1 cursor-pointer group",
        CATEGORY_BORDER[event.category] || "border-l-muted"
      )}
      onClick={() => onSelect(event.id)}
    >
      <CardContent className="p-4">
        {/* Top row: date + category + confidence */}
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            {formatDate(event.date)}
          </Badge>
          <Badge className={cn("text-xs", CATEGORY_COLORS[event.category])}>
            {event.category}
          </Badge>
          <Badge variant="outline" className={cn("text-xs flex items-center gap-1", confidence.className)}>
            <ConfIcon className="w-3 h-3" />
            {confidence.label}
            {event.confidence_score != null && (
              <span className="opacity-70">{Math.round(event.confidence_score * 100)}%</span>
            )}
          </Badge>
          {event.extraction_method === "ai_analysis" && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI
            </Badge>
          )}
        </div>

        {/* Title / Description */}
        {event.title && (
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.description}
        </p>

        {/* Bottom row: actors, evidence, violations, sources */}
        <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
          {actors.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {actors.slice(0, 2).join(", ")}
              {actors.length > 2 && ` +${actors.length - 2}`}
            </span>
          )}
          {event.legal_action && event.legal_action !== "None" && (
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-primary" />
              Legal Action
            </span>
          )}
          {event.evidence_discrepancy && event.evidence_discrepancy !== "None" && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Discrepancy
            </span>
          )}
          {event.sources && (
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {event.sources}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event.id}`);
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ChronologyEventCard.displayName = "ChronologyEventCard";
