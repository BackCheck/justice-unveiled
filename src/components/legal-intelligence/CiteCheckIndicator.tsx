import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown,
  Shield,
  FileWarning,
  AlertCircle
} from "lucide-react";
import type { SourcesJson } from "@/types/legal-intelligence";

interface CiteCheckIndicatorProps {
  sourcesJson: SourcesJson | null;
  content: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CiteCheckResult {
  passed: boolean;
  hasUnverifiedPrecedents: boolean;
  unverifiedCount: number;
  missingEventCitations: boolean;
  unresolvedCitations: string[];
  warnings: string[];
  errors: string[];
}

const performCiteCheck = (sourcesJson: SourcesJson | null, content: string): CiteCheckResult => {
  const result: CiteCheckResult = {
    passed: true,
    hasUnverifiedPrecedents: false,
    unverifiedCount: 0,
    missingEventCitations: false,
    unresolvedCitations: [],
    warnings: [],
    errors: [],
  };

  if (!sourcesJson) {
    result.warnings.push("No source tracking data available");
    return result;
  }

  // Check for unverified precedents
  const unverifiedPrecedents = sourcesJson.precedents.filter(p => !p.verified);
  if (unverifiedPrecedents.length > 0) {
    result.hasUnverifiedPrecedents = true;
    result.unverifiedCount = unverifiedPrecedents.length;
    result.passed = false;
    result.errors.push(`${unverifiedPrecedents.length} unverified precedent(s) cited - cannot file in court`);
  }

  // Check if facts section is empty (no events cited)
  if (sourcesJson.facts.length === 0) {
    result.missingEventCitations = true;
    result.warnings.push("No timeline events cited - factual claims may be unsupported");
  }

  // Check for citation patterns in content that don't match sources_json
  const eventMatches = content.match(/\[EVENT:[^\]]+\]/g) || [];
  const statuteMatches = content.match(/\[STATUTE:[^\]]+\]/g) || [];
  const precedentMatches = content.match(/\[PRECEDENT:[^\]]+\]/g) || [];

  // Extract IDs and check if they exist in sources
  const factIds = new Set(sourcesJson.facts.map(f => f.event_id));
  const statuteIds = new Set(sourcesJson.statutes.map(s => s.provision_id));
  const precedentIds = new Set(sourcesJson.precedents.map(p => p.precedent_id));

  eventMatches.forEach(match => {
    const id = match.replace(/\[EVENT:|\]/g, '');
    if (!factIds.has(id)) {
      result.unresolvedCitations.push(match);
    }
  });

  statuteMatches.forEach(match => {
    const id = match.replace(/\[STATUTE:|\]/g, '');
    if (!statuteIds.has(id)) {
      result.unresolvedCitations.push(match);
    }
  });

  precedentMatches.forEach(match => {
    const id = match.replace(/\[PRECEDENT:|\]/g, '');
    if (!precedentIds.has(id)) {
      result.unresolvedCitations.push(match);
    }
  });

  if (result.unresolvedCitations.length > 0) {
    result.passed = false;
    result.errors.push(`${result.unresolvedCitations.length} citation(s) could not be resolved`);
  }

  return result;
};

export const CiteCheckIndicator = ({ 
  sourcesJson, 
  content,
  isOpen = false,
  onOpenChange 
}: CiteCheckIndicatorProps) => {
  const result = performCiteCheck(sourcesJson, content);

  if (!sourcesJson) {
    return (
      <div className="p-2 rounded border border-muted bg-muted/30 text-xs flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Manual summary - no citation tracking</span>
      </div>
    );
  }

  const statusColor = result.passed 
    ? "bg-green-500/10 border-green-500/30 text-green-600" 
    : "bg-destructive/10 border-destructive/30 text-destructive";
  
  const statusIcon = result.passed 
    ? <CheckCircle2 className="h-4 w-4 text-green-500" /> 
    : <XCircle className="h-4 w-4 text-destructive" />;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`w-full justify-between text-xs ${statusColor}`}
        >
          <span className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            Cite Check: {result.passed ? "PASSED" : "FAILED"}
            {result.hasUnverifiedPrecedents && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs h-4 px-1">
                {result.unverifiedCount} unverified
              </Badge>
            )}
          </span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 p-3 rounded border border-border/50 bg-muted/30 space-y-2 text-xs">
        {/* Status Summary */}
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          {statusIcon}
          <span className="font-medium">
            {result.passed ? "Ready for filing" : "Issues must be resolved before filing"}
          </span>
        </div>

        {/* Errors */}
        {result.errors.length > 0 && (
          <div className="space-y-1">
            <span className="font-medium text-destructive flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Errors ({result.errors.length})
            </span>
            {result.errors.map((error, idx) => (
              <div key={idx} className="pl-4 text-destructive/80">• {error}</div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-1">
            <span className="font-medium text-amber-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Warnings ({result.warnings.length})
            </span>
            {result.warnings.map((warning, idx) => (
              <div key={idx} className="pl-4 text-amber-600/80">• {warning}</div>
            ))}
          </div>
        )}

        {/* Unresolved citations */}
        {result.unresolvedCitations.length > 0 && (
          <div className="space-y-1">
            <span className="font-medium text-destructive flex items-center gap-1">
              <FileWarning className="h-3 w-3" /> Unresolved Citations
            </span>
            <div className="pl-4 flex flex-wrap gap-1">
              {result.unresolvedCitations.slice(0, 5).map((cite, idx) => (
                <Badge key={idx} variant="outline" className="text-destructive border-destructive/30 text-xs">
                  {cite}
                </Badge>
              ))}
              {result.unresolvedCitations.length > 5 && (
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  +{result.unresolvedCitations.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Pass state */}
        {result.passed && result.warnings.length === 0 && (
          <div className="text-green-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            All citations verified and resolvable
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
