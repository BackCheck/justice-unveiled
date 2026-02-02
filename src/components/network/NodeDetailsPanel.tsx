import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraphNode, GraphLink, NodeType, RiskLevel } from "@/hooks/useGraphData";
import { 
  X, Sparkles, Bookmark, ChevronRight, 
  Users, Building2, Calendar, AlertTriangle, MapPin,
  Link2, Info, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeDetailsPanelProps {
  selectedNode: GraphNode | null;
  nodes: GraphNode[];
  links: GraphLink[];
  watchlist: Set<string>;
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
  onToggleWatchlist: (nodeId: string) => void;
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

const typeIcons: Record<NodeType, typeof Users> = {
  person: Users,
  organization: Building2,
  event: Calendar,
  violation: AlertTriangle,
  location: MapPin
};

export const NodeDetailsPanel = ({
  selectedNode,
  nodes,
  links,
  watchlist,
  onClose,
  onSelectNode,
  onToggleWatchlist
}: NodeDetailsPanelProps) => {
  const navigate = useNavigate();
  
  const selectedConnections = useMemo(() => {
    if (!selectedNode) return [];
    return links.filter(
      l => l.source === selectedNode.id || l.target === selectedNode.id
    );
  }, [selectedNode, links]);

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    return selectedConnections
      .map(conn => {
        const otherId = conn.source === selectedNode.id ? conn.target : conn.source;
        const other = nodes.find(n => n.id === otherId);
        return other ? { node: other, type: conn.type } : null;
      })
      .filter(Boolean) as { node: GraphNode; type: string }[];
  }, [selectedNode, selectedConnections, nodes]);

  const handleViewDetails = () => {
    if (!selectedNode) return;
    // Map node type to detail page route
    if (selectedNode.type === 'person' || selectedNode.type === 'organization') {
      navigate(`/entities/${selectedNode.id}`);
    } else if (selectedNode.type === 'event') {
      navigate(`/events/${selectedNode.id}`);
    } else if (selectedNode.type === 'violation') {
      // Violations need type prefix - default to local
      navigate(`/violations/local/${selectedNode.id}`);
    }
  };

  if (!selectedNode) return null;

  const Icon = typeIcons[selectedNode.type];

  return (
    <Sheet open={!!selectedNode} onOpenChange={() => onClose()}>
      <SheetContent 
        side="right" 
        className="w-[360px] sm:w-[400px] p-0 border-l border-border/50 bg-card/95 backdrop-blur-xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-5 pb-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                  style={{ backgroundColor: riskColors[selectedNode.riskLevel] }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg font-semibold truncate pr-2 flex items-center gap-2">
                    {selectedNode.name}
                    {selectedNode.isAIExtracted && (
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge 
                      className="text-white text-[10px] uppercase tracking-wide"
                      style={{ backgroundColor: riskColors[selectedNode.riskLevel] }}
                    >
                      {selectedNode.riskLevel} Risk
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {typeLabels[selectedNode.type]}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1 px-5">
            <div className="py-5 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Link2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wide font-medium">Connections</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedNode.connections}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wide font-medium">Source</span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {selectedNode.isAIExtracted ? "AI Extracted" : "Manual Entry"}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedNode.description && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed">{selectedNode.description}</p>
                </div>
              )}

              {/* Metadata */}
              {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Details
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedNode.metadata).map(([key, value]) => (
                      value && (
                        <div 
                          key={key} 
                          className="flex justify-between items-start gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-border/30"
                        >
                          <span className="text-xs text-muted-foreground capitalize">{key}</span>
                          <span className="text-xs font-medium text-right max-w-[180px] truncate">
                            {String(value)}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Connected Entities */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Connected Entities ({connectedNodes.length})
                </h4>
                <div className="space-y-2">
                  {connectedNodes.slice(0, 15).map(({ node, type }, i) => {
                    const NodeIcon = typeIcons[node.type];
                    return (
                      <button
                        key={i}
                        onClick={() => onSelectNode(node)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-border/50 transition-all group"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${riskColors[node.riskLevel]}20` }}
                        >
                          <NodeIcon 
                            className="w-4 h-4" 
                            style={{ color: riskColors[node.riskLevel] }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium truncate">{node.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {typeLabels[node.type]} • {type}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    );
                  })}
                  {connectedNodes.length > 15 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      +{connectedNodes.length - 15} more connections
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/50 bg-muted/30 space-y-2">
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={handleViewDetails}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Details
            </Button>
            <Button
              variant={watchlist.has(selectedNode.id) ? "secondary" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => onToggleWatchlist(selectedNode.id)}
            >
              <Bookmark className={cn(
                "w-4 h-4 mr-2",
                watchlist.has(selectedNode.id) && "fill-current"
              )} />
              {watchlist.has(selectedNode.id) ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
