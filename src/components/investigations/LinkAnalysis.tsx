import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Search,
  Network,
  ArrowRight,
  AlertTriangle,
  Building2,
  User,
  ChevronRight,
  Link as LinkIcon,
  Sparkles,
  Target,
  Eye,
} from "lucide-react";
import { useCombinedEntities } from "@/hooks/useCombinedEntities";
import { useCombinedTimeline } from "@/hooks/useCombinedTimeline";
import { Link } from "react-router-dom";

interface EntityLink {
  source: string;
  sourceName: string;
  sourceType: string;
  target: string;
  targetName: string;
  targetType: string;
  type: string;
  strength: number;
  isInferred: boolean;
}

export const LinkAnalysis = () => {
  const { entities, connections } = useCombinedEntities();
  const { events } = useCombinedTimeline();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Build enhanced links with entity names
  const entityLinks = useMemo<EntityLink[]>(() => {
    return connections.map(conn => {
      const source = entities.find(e => e.id === conn.source);
      const target = entities.find(e => e.id === conn.target);
      return {
        source: conn.source,
        sourceName: source?.name || conn.source,
        sourceType: source?.type || "unknown",
        target: conn.target,
        targetName: target?.name || conn.target,
        targetType: target?.type || "unknown",
        type: conn.type,
        strength: conn.strength,
        isInferred: conn.isInferred || false,
      };
    });
  }, [connections, entities]);

  // Filter entities based on search
  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      const matchesSearch = 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.role && e.role.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === "all" || e.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [entities, searchQuery, filterType]);

  // Get connections for selected entity
  const selectedEntityLinks = useMemo(() => {
    if (!selectedEntity) return [];
    return entityLinks.filter(
      link => link.source === selectedEntity || link.target === selectedEntity
    );
  }, [selectedEntity, entityLinks]);

  // Get connected entities
  const connectedEntities = useMemo(() => {
    if (!selectedEntity) return [];
    const connectedIds = new Set<string>();
    selectedEntityLinks.forEach(link => {
      if (link.source === selectedEntity) connectedIds.add(link.target);
      if (link.target === selectedEntity) connectedIds.add(link.source);
    });
    return entities.filter(e => connectedIds.has(e.id));
  }, [selectedEntity, selectedEntityLinks, entities]);

  // Get related events
  const relatedEvents = useMemo(() => {
    if (!selectedEntity) return [];
    const entity = entities.find(e => e.id === selectedEntity);
    if (!entity) return [];
    
    return events.filter(e => {
      const individuals = e.individuals.toLowerCase();
      const firstName = entity.name.split(' ')[0].toLowerCase();
      const lastName = entity.name.split(' ').pop()?.toLowerCase() || '';
      return individuals.includes(firstName) || individuals.includes(lastName);
    }).slice(0, 5);
  }, [selectedEntity, entities, events]);

  const entityTypes = useMemo(() => {
    const types = new Set(entities.map(e => e.type));
    return ["all", ...Array.from(types)];
  }, [entities]);

  const selectedEntityData = entities.find(e => e.id === selectedEntity);

  const getTypeIcon = (type: string) => {
    if (type === "person") return User;
    if (type === "agency" || type === "organization") return Building2;
    return Users;
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "antagonist": return "text-red-500 bg-red-500/10";
      case "protagonist": return "text-emerald-500 bg-emerald-500/10";
      case "official": return "text-blue-500 bg-blue-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Link Analysis
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Explore entity relationships and connection patterns
          </p>
        </div>
        <Link to="/network">
          <Button variant="outline" size="sm" className="gap-2">
            <Network className="w-4 h-4" />
            View Full Network
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{entities.length}</p>
                <p className="text-xs text-muted-foreground">Total Entities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <LinkIcon className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{connections.length}</p>
                <p className="text-xs text-muted-foreground">Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {entities.filter(e => e.category === "antagonist").length}
                </p>
                <p className="text-xs text-muted-foreground">Threat Actors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {entities.filter(e => e.isAIExtracted).length}
                </p>
                <p className="text-xs text-muted-foreground">AI Extracted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Select Entity
            </CardTitle>
            <CardDescription>
              Choose an entity to analyze connections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {entityTypes.map((type) => (
                <Badge
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilterType(type)}
                >
                  {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              ))}
            </div>

            {/* Entity List */}
            <ScrollArea className="h-[350px]">
              <div className="space-y-2">
                {filteredEntities.map((entity) => {
                  const Icon = getTypeIcon(entity.type);
                  return (
                    <Button
                      key={entity.id}
                      variant={selectedEntity === entity.id ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-auto py-3"
                      onClick={() => setSelectedEntity(entity.id)}
                    >
                      <div className={`p-2 rounded-full ${getCategoryColor(entity.category)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-sm truncate">{entity.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entity.role || entity.type}
                        </p>
                      </div>
                      {entity.isAIExtracted && (
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Connection Details */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" />
              Connection Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEntityData ? (
              <ScrollArea className="h-[450px]">
                <div className="space-y-6">
                  {/* Entity Profile */}
                  <div className="p-4 rounded-lg bg-accent/30 border border-border/50">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${getCategoryColor(selectedEntityData.category)}`}>
                        {(() => {
                          const Icon = getTypeIcon(selectedEntityData.type);
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{selectedEntityData.name}</h3>
                          {selectedEntityData.isAIExtracted && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30">
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedEntityData.role || selectedEntityData.type}
                        </p>
                        {selectedEntityData.description && (
                          <p className="text-sm mt-2">{selectedEntityData.description}</p>
                        )}
                      </div>
                      <Badge className={`${getCategoryColor(selectedEntityData.category)} border-0`}>
                        {selectedEntityData.category || "neutral"}
                      </Badge>
                    </div>
                  </div>

                  {/* Connections */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-purple-500" />
                      Direct Connections ({connectedEntities.length})
                    </h4>
                    {connectedEntities.length > 0 ? (
                      <div className="space-y-2">
                        {connectedEntities.map((entity) => {
                          const link = selectedEntityLinks.find(
                            l => l.source === entity.id || l.target === entity.id
                          );
                          const Icon = getTypeIcon(entity.type);
                          return (
                            <div
                              key={entity.id}
                              className="p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer flex items-center gap-3"
                              onClick={() => setSelectedEntity(entity.id)}
                            >
                              <div className={`p-2 rounded-full ${getCategoryColor(entity.category)}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{entity.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {entity.role || entity.type}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-[10px]">
                                  {link?.type || "connected"}
                                </Badge>
                                {link?.isInferred && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    AI inferred
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No direct connections found
                      </p>
                    )}
                  </div>

                  {/* Related Events */}
                  {relatedEvents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        Related Events ({relatedEvents.length})
                      </h4>
                      <div className="space-y-2">
                        {relatedEvents.map((event, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-accent/20 border border-border/50"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px]">
                                {event.category}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {event.date}
                              </span>
                            </div>
                            <p className="text-sm line-clamp-2">{event.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[450px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select an entity to analyze connections</p>
                  <p className="text-xs mt-1">Click on any entity from the list</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
