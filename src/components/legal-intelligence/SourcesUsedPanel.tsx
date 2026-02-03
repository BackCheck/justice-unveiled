import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Scale, 
  Gavel, 
  Calendar, 
  AlertTriangle, 
  ChevronDown, 
  AlertCircle,
  ExternalLink 
} from "lucide-react";
import type { CitedSources, SummaryCitation, SourcesJson } from "@/types/legal-intelligence";

interface SourcesUsedPanelProps {
  sourcesUsed: CitedSources;
  sourcesJson?: SourcesJson;
  unverifiedPrecedentsCount?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  includesUnverified?: boolean;
  caseId?: string;
}

const SourceLink = ({ 
  source, 
  caseId 
}: { 
  source: SummaryCitation; 
  caseId?: string;
}) => {
  const getLink = () => {
    switch (source.type) {
      case "event":
        return `/events/${source.id}`;
      case "precedent":
        // Link to case law in legal intelligence with query param
        return caseId ? `/legal-intelligence?caseId=${caseId}&precedent=${source.id}` : "#";
      case "statute":
        return caseId ? `/legal-intelligence?caseId=${caseId}&statute=${source.id}` : "#";
      case "violation":
        return caseId ? `/compliance?caseId=${caseId}&violation=${source.id}` : "#";
      default:
        return "#";
    }
  };

  return (
    <Link 
      to={getLink()} 
      className="group flex items-center justify-between p-2 rounded border bg-muted/50 border-border/50 hover:bg-muted/80 hover:border-primary/30 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-primary">{source.reference}</span>
          {source.verified !== undefined && (
            <Badge 
              variant="outline" 
              className={`text-xs ${source.verified ? "text-green-500 border-green-500/30" : "text-amber-500 border-amber-500/30"}`}
            >
              {source.verified ? "Verified" : "Unverified"}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{source.description}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
    </Link>
  );
};

const SourcesList = ({ 
  sources, 
  title, 
  icon: Icon,
  caseId 
}: { 
  sources: SummaryCitation[]; 
  title: string;
  icon: React.ElementType;
  caseId?: string;
}) => {
  if (!sources || sources.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title} ({sources.length})
      </h4>
      <div className="space-y-2">
        {sources.map((source, idx) => (
          <SourceLink key={`${source.id}-${idx}`} source={source} caseId={caseId} />
        ))}
      </div>
    </div>
  );
};

export const SourcesUsedPanel = ({
  sourcesUsed,
  sourcesJson,
  unverifiedPrecedentsCount,
  isOpen,
  onOpenChange,
  includesUnverified,
  caseId,
}: SourcesUsedPanelProps) => {
  if (!sourcesUsed) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="mt-4">
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Sources Used in Generation
            {includesUnverified && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                Contains Unverified
              </Badge>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 p-4 rounded-lg border border-border/50 bg-muted/30 space-y-4">
        {/* Generation metadata */}
        {sourcesJson?.generation_metadata && (
          <div className="text-xs text-muted-foreground pb-3 border-b border-border/50">
            Generated: {new Date(sourcesJson.generation_metadata.generated_at).toLocaleString()} • 
            Model: {sourcesJson.generation_metadata.model} • 
            Type: {sourcesJson.generation_metadata.summary_type}
          </div>
        )}

        {/* Unverified warning */}
        {unverifiedPrecedentsCount && unverifiedPrecedentsCount > 0 && !includesUnverified && (
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{unverifiedPrecedentsCount} unverified precedent(s) were excluded from citations</span>
          </div>
        )}

        {includesUnverified && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/30 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <span className="font-medium">This summary includes unverified precedents and is marked as DRAFT</span>
          </div>
        )}
        
        <SourcesList 
          sources={sourcesUsed.statutes} 
          title="Statutes Cited" 
          icon={Scale}
          caseId={caseId}
        />
        <SourcesList 
          sources={sourcesUsed.precedents} 
          title={includesUnverified ? "Precedents Cited" : "Precedents Cited (Verified Only)"} 
          icon={Gavel}
          caseId={caseId}
        />
        <SourcesList 
          sources={sourcesUsed.events} 
          title="Timeline Events Referenced" 
          icon={Calendar}
          caseId={caseId}
        />
        <SourcesList 
          sources={sourcesUsed.violations} 
          title="Violations Referenced" 
          icon={AlertTriangle}
          caseId={caseId}
        />

        {/* Empty state */}
        {sourcesUsed.statutes.length === 0 && 
         sourcesUsed.precedents.length === 0 && 
         sourcesUsed.events.length === 0 && 
         sourcesUsed.violations.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No sources were used in this generation
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
