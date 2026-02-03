import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  useEntityRelationships, 
  useEnhancedEntities,
  RELATIONSHIP_LABELS 
} from "@/hooks/useEntityProfiles";
import { 
  ArrowRight, ArrowLeftRight, ArrowLeft, Network, 
  ChevronRight, Calendar, Shield, Loader2, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface InfluenceNetworkPanelProps {
  entityId: string;
  entityName: string;
}

const influenceDirectionConfig = {
  source_to_target: { icon: ArrowRight, label: "Influences", color: "text-green-500" },
  target_to_source: { icon: ArrowLeft, label: "Influenced by", color: "text-orange-500" },
  bidirectional: { icon: ArrowLeftRight, label: "Mutual", color: "text-blue-500" },
  unknown: { icon: Network, label: "Connected", color: "text-muted-foreground" },
};

export const InfluenceNetworkPanel = ({ entityId, entityName }: InfluenceNetworkPanelProps) => {
  const navigate = useNavigate();
  const { data: relationships, isLoading: relLoading } = useEntityRelationships(entityId);
  const { data: entities, isLoading: entLoading } = useEnhancedEntities();

  const isLoading = relLoading || entLoading;

  // Calculate influence metrics
  const influencesOthers = (relationships || []).filter(
    r => r.source_entity_id === entityId && r.influence_direction === "source_to_target"
  );
  const influencedBy = (relationships || []).filter(
    r => r.target_entity_id === entityId && r.influence_direction === "source_to_target"
  );
  const mutualInfluence = (relationships || []).filter(
    r => r.influence_direction === "bidirectional" && 
        (r.source_entity_id === entityId || r.target_entity_id === entityId)
  );

  // Get entity details for relationships
  const getEntityById = (id: string) => entities?.find(e => e.id === id);

  // Sort relationships by influence weight
  const sortedRelationships = [...(relationships || [])].sort(
    (a, b) => b.influence_weight - a.influence_weight
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Influence Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Influence Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-lg font-bold text-green-600">{influencesOthers.length}</p>
            <p className="text-[10px] text-muted-foreground">Influences</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
            <p className="text-lg font-bold text-orange-600">{influencedBy.length}</p>
            <p className="text-[10px] text-muted-foreground">Influenced By</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-lg font-bold text-blue-600">{mutualInfluence.length}</p>
            <p className="text-[10px] text-muted-foreground">Mutual</p>
          </div>
        </div>

        {/* Relationships List */}
        {sortedRelationships.length === 0 ? (
          <div className="text-center py-6">
            <Network className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No influence relationships tracked</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Relationships will appear here when added
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {sortedRelationships.map((rel) => {
                const isSource = rel.source_entity_id === entityId;
                const otherId = isSource ? rel.target_entity_id : rel.source_entity_id;
                const otherEntity = getEntityById(otherId);
                
                // Determine display direction
                let displayDirection = rel.influence_direction;
                if (!isSource && rel.influence_direction === "source_to_target") {
                  displayDirection = "target_to_source";
                }
                
                const dirConfig = influenceDirectionConfig[displayDirection as keyof typeof influenceDirectionConfig] 
                  || influenceDirectionConfig.unknown;
                const DirIcon = dirConfig.icon;

                return (
                  <div
                    key={rel.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => otherEntity && navigate(`/entities/${otherId}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <DirIcon className={cn("w-4 h-4 shrink-0", dirConfig.color)} />
                        <span className="font-medium text-sm truncate">
                          {otherEntity?.name || "Unknown Entity"}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px]">
                        {RELATIONSHIP_LABELS[rel.relationship_type] || rel.relationship_type}
                      </Badge>
                      {rel.is_verified && (
                        <Badge variant="secondary" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20">
                          <Shield className="w-2.5 h-2.5 mr-0.5" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Influence Strength */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Influence Strength</span>
                        <span className="font-medium">{rel.influence_weight}/10</span>
                      </div>
                      <Progress 
                        value={rel.influence_weight * 10} 
                        className="h-1.5"
                      />
                    </div>

                    {/* Date Range */}
                    {(rel.relationship_start_date || rel.relationship_end_date) && (
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {rel.relationship_start_date && format(new Date(rel.relationship_start_date), "MMM yyyy")}
                          {rel.relationship_start_date && rel.relationship_end_date && " - "}
                          {rel.relationship_end_date && format(new Date(rel.relationship_end_date), "MMM yyyy")}
                          {rel.relationship_start_date && !rel.relationship_end_date && " - Present"}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {rel.description && (
                      <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                        {rel.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
