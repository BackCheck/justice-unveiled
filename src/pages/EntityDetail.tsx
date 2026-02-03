import { useParams, useNavigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { DetailPageHeader } from "@/components/detail/DetailPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Users, Building2, Briefcase, Scale, FileText, 
  Link2, ArrowRight, Sparkles, Network, TrendingUp
} from "lucide-react";
import { EntityType, categoryColors } from "@/data/entitiesData";
import { useCombinedEntities, CombinedEntity, CombinedConnection } from "@/hooks/useCombinedEntities";
import { useEnhancedEntities, useUpdateEntityProfile } from "@/hooks/useEntityProfiles";
import { EntityAliasPanel } from "@/components/network/EntityAliasPanel";
import { InfluenceNetworkPanel } from "@/components/network/InfluenceNetworkPanel";
import { RoleTagsEditor } from "@/components/network/RoleTagsEditor";
import { useUserRole } from "@/hooks/useUserRole";

const typeIcons: Record<EntityType, typeof Users> = {
  person: Users,
  organization: Building2,
  agency: Briefcase,
  legal: Scale,
  evidence: FileText
};

const typeLabels: Record<EntityType, string> = {
  person: "Person",
  organization: "Organization",
  agency: "Government Agency",
  legal: "Legal Entity",
  evidence: "Evidence"
};

const categoryLabels: Record<string, string> = {
  protagonist: "Protagonist",
  antagonist: "Antagonist",
  neutral: "Neutral Party",
  official: "Official Body"
};

const EntityDetail = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const { entities: combinedEntities, connections: combinedConnections, isLoading } = useCombinedEntities();
  const { data: enhancedEntities } = useEnhancedEntities();
  const updateProfile = useUpdateEntityProfile();
  const { role } = useUserRole();
  
  const canEdit = role === "admin" || role === "editor";

  // Find entity from combined entities (includes both static and AI-extracted)
  const entity = combinedEntities.find(e => e.id === entityId);
  
  // Find enhanced entity data (from database with new fields)
  const enhancedEntity = enhancedEntities?.find(e => e.id === entityId || `ai-${e.id}` === entityId);

  // Get connections for this entity
  const entityConnections = combinedConnections.filter(
    c => c.source === entityId || c.target === entityId
  );

  // Get connected entities
  const connectedEntities = entityConnections
    .map(conn => {
      const otherId = conn.source === entityId ? conn.target : conn.source;
      const other = combinedEntities.find(e => e.id === otherId);
      return other ? { entity: other, connection: conn } : null;
    })
    .filter(Boolean) as { entity: CombinedEntity; connection: CombinedConnection }[];
  
  // Handle influence score update
  const handleInfluenceChange = (value: number[]) => {
    if (!enhancedEntity) return;
    updateProfile.mutate({
      entityId: enhancedEntity.id,
      updates: { influence_score: value[0] }
    });
  };

  if (isLoading) {
    return (
      <PlatformLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </PlatformLayout>
    );
  }

  if (!entity) {
    return (
      <PlatformLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Entity Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The entity you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/network")}>
                Back to Network Graph
              </Button>
            </CardContent>
          </Card>
        </div>
      </PlatformLayout>
    );
  }

  const Icon = typeIcons[entity.type];
  const categoryColor = entity.category ? categoryColors[entity.category] : "hsl(var(--muted))";

  const badges = [
    { label: typeLabels[entity.type], variant: "secondary" as const },
    ...(entity.category ? [{ 
      label: categoryLabels[entity.category], 
      variant: "outline" as const,
      className: entity.category === "antagonist" ? "border-destructive text-destructive" :
                 entity.category === "protagonist" ? "border-primary text-primary" :
                 ""
    }] : []),
    ...(entity.isAIExtracted ? [{ label: "AI Extracted", variant: "outline" as const, className: "border-amber-500 text-amber-600" }] : [])
  ];

  return (
    <PlatformLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <DetailPageHeader
          title={entity.name}
          subtitle={entity.role}
          description={entity.description}
          badges={badges}
          icon={<Icon className="w-6 h-6 text-primary" />}
          backPath="/network"
          backLabel="Back to Network"
          itemType="entity"
          itemId={entity.id}
          priority="medium"
          hashtags={['HumanRights', 'HRPM', entity.type]}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Entity Type</p>
                    <p className="font-medium">{typeLabels[entity.type]}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Role</p>
                    <p className="font-medium">{entity.role}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Category</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: categoryColor }}
                      />
                      <p className="font-medium">{entity.category ? categoryLabels[entity.category] : "Unknown"}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Connections</p>
                    <p className="font-medium">{entityConnections.length} relationships</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                  <p className="text-foreground leading-relaxed">{entity.description}</p>
                </div>

                {entity.isAIExtracted && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">AI-Extracted Entity</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      This entity was automatically extracted from uploaded documents using AI analysis.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Connected Entities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Connected Entities ({connectedEntities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectedEntities.length > 0 ? (
                  <div className="space-y-3">
                    {connectedEntities.map(({ entity: connected, connection }) => {
                      const ConnectedIcon = typeIcons[connected.type];
                      const connectedCategoryColor = connected.category ? categoryColors[connected.category] : "hsl(var(--muted))";
                      
                      return (
                        <div
                          key={connected.id}
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                          onClick={() => navigate(`/entities/${connected.id}`)}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${connectedCategoryColor}20` }}
                          >
                            <ConnectedIcon 
                              className="w-5 h-5" 
                              style={{ color: connectedCategoryColor }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{connected.name}</p>
                              {connected.isAIExtracted && (
                                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{connected.role}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px]">
                                {connection.relationship}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px]">
                                {connection.type}
                              </Badge>
                              {connection.isInferred && (
                                <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">
                                  Inferred
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No connections found for this entity.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Influence Score */}
            {enhancedEntity && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Influence Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{enhancedEntity.influence_score || 0}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <Progress value={enhancedEntity.influence_score || 0} className="h-2" />
                  {canEdit && (
                    <div className="pt-2">
                      <Slider
                        value={[enhancedEntity.influence_score || 0]}
                        max={100}
                        step={5}
                        onValueCommit={handleInfluenceChange}
                        disabled={updateProfile.isPending}
                      />
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Adjust influence based on evidence
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Role Tags */}
            {enhancedEntity && (
              <RoleTagsEditor
                entityId={enhancedEntity.id}
                currentTags={enhancedEntity.role_tags || []}
                canEdit={canEdit}
              />
            )}

            {/* Entity Aliases */}
            {enhancedEntity && (
              <EntityAliasPanel
                entityId={enhancedEntity.id}
                entityName={entity.name}
                canEdit={canEdit}
              />
            )}

            {/* Influence Network */}
            {enhancedEntity && (
              <InfluenceNetworkPanel
                entityId={enhancedEntity.id}
                entityName={entity.name}
              />
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/network")}
                >
                  <Network className="w-4 h-4 mr-2" />
                  View in Network Graph
                </Button>
              </CardContent>
            </Card>

            {/* Relationship Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Relationship Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['professional', 'family', 'legal', 'adversarial', 'official'].map(type => {
                    const count = entityConnections.filter(c => c.type === type).length;
                    if (count === 0) return null;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                  {entityConnections.filter(c => c.isInferred).length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-accent-foreground">AI-Inferred</span>
                      <Badge variant="outline" className="border-accent text-accent-foreground">
                        {entityConnections.filter(c => c.isInferred).length}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Events (for AI-extracted entities) */}
            {entity.isAIExtracted && entity.relatedEventIds && entity.relatedEventIds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Related Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {entity.relatedEventIds.slice(0, 5).map((eventId, idx) => (
                      <Button
                        key={eventId}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => navigate(`/events/${eventId}`)}
                      >
                        <FileText className="w-3 h-3 mr-2" />
                        Event #{idx + 1}
                        <ArrowRight className="w-3 h-3 ml-auto" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default EntityDetail;
