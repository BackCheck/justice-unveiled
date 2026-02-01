import { useState, useMemo, useCallback } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GraphNode, NodeType, RiskLevel } from "@/hooks/useGraphData";

interface EntitySearchBarProps {
  nodes: GraphNode[];
  onSelectNode: (node: GraphNode) => void;
  highlightedNodeId: string | null;
}

const riskColors: Record<RiskLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e"
};

const typeLabels: Record<NodeType, string> = {
  person: "Person",
  organization: "Organization",
  event: "Event",
  violation: "Violation",
  location: "Location"
};

export const EntitySearchBar = ({ 
  nodes, 
  onSelectNode,
  highlightedNodeId 
}: EntitySearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredNodes = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return nodes
      .filter(node => 
        node.name.toLowerCase().includes(lowerQuery) ||
        node.type.toLowerCase().includes(lowerQuery) ||
        node.description?.toLowerCase().includes(lowerQuery) ||
        node.metadata?.role?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10);
  }, [nodes, query]);

  const handleSelect = useCallback((node: GraphNode) => {
    onSelectNode(node);
    setQuery("");
    setIsFocused(false);
  }, [onSelectNode]);

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  const showResults = isFocused && query.trim().length > 0;

  return (
    <div className="relative z-20">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search entities, events, violations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-9 pr-9 h-9 w-64 bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary/50"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl overflow-hidden">
          {filteredNodes.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No entities found for "{query}"
            </div>
          ) : (
            <ScrollArea className="max-h-72">
              <div className="p-1">
                {filteredNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => handleSelect(node)}
                    className={cn(
                      "w-full flex items-start gap-3 p-2.5 rounded-md text-left transition-colors",
                      "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                      highlightedNodeId === node.id && "bg-primary/10"
                    )}
                  >
                    {/* Risk indicator */}
                    <div 
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: riskColors[node.riskLevel] }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {node.name}
                        </span>
                        {node.isAIExtracted && (
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                          {typeLabels[node.type]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {node.connections} connections
                        </span>
                      </div>
                      
                      {(node.metadata?.role || node.description) && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {node.metadata?.role || node.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};
