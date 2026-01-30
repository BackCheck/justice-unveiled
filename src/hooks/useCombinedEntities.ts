import { useMemo } from "react";
import { useExtractedEntities, useExtractedEvents, ExtractedEntity } from "./useExtractedEvents";
import { entities as staticEntities, connections as staticConnections, Entity, EntityConnection, EntityType } from "@/data/entitiesData";

export interface CombinedEntity extends Entity {
  isAIExtracted?: boolean;
  sourceUploadId?: string | null;
  relatedEventIds?: string[];
}

export interface CombinedConnection extends EntityConnection {
  isInferred?: boolean;
}

// Map extracted entity types to our entity types
const mapEntityType = (type: string): EntityType => {
  switch (type) {
    case "Person": return "person";
    case "Organization": return "organization";
    case "Official Body": return "agency";
    case "Legal Entity": return "legal";
    default: return "person";
  }
};

// Infer category based on role and description
const inferCategory = (entity: ExtractedEntity): "protagonist" | "antagonist" | "neutral" | "official" => {
  const text = `${entity.role || ""} ${entity.description || ""}`.toLowerCase();
  
  if (text.includes("victim") || text.includes("acquit") || text.includes("target")) {
    return "protagonist";
  }
  if (text.includes("accus") || text.includes("compla") || text.includes("corrupt") || text.includes("illeg")) {
    return "antagonist";
  }
  if (text.includes("judge") || text.includes("court") || text.includes("fir") || text.includes("agency")) {
    return "official";
  }
  return "neutral";
};

export const useCombinedEntities = () => {
  const { data: extractedEntities, isLoading: entitiesLoading } = useExtractedEntities();
  const { data: extractedEvents, isLoading: eventsLoading } = useExtractedEvents();

  const combinedData = useMemo(() => {
    // Start with static entities
    const combined: CombinedEntity[] = staticEntities.map(e => ({
      ...e,
      isAIExtracted: false
    }));

    // Track existing entity names to avoid duplicates (case-insensitive)
    const existingNames = new Set(staticEntities.map(e => e.name.toLowerCase()));

    // Add extracted entities
    if (extractedEntities) {
      extractedEntities.forEach(extracted => {
        // Skip if already exists (by name)
        if (existingNames.has(extracted.name.toLowerCase())) return;

        const aiEntity: CombinedEntity = {
          id: `ai-${extracted.id}`,
          name: extracted.name,
          type: mapEntityType(extracted.entity_type),
          role: extracted.role || "Unknown Role",
          description: extracted.description || "AI-extracted entity",
          connections: [],
          category: inferCategory(extracted),
          isAIExtracted: true,
          sourceUploadId: extracted.source_upload_id,
          relatedEventIds: extracted.related_event_ids || []
        };

        combined.push(aiEntity);
        existingNames.add(extracted.name.toLowerCase());
      });
    }

    // Start with static connections
    const combinedConnections: CombinedConnection[] = staticConnections.map(c => ({
      ...c,
      isInferred: false
    }));

    // Infer connections from shared events
    if (extractedEntities && extractedEvents) {
      // Build a map of event -> entities
      const eventEntities: Record<string, string[]> = {};
      
      extractedEntities.forEach(entity => {
        (entity.related_event_ids || []).forEach(eventId => {
          if (!eventEntities[eventId]) {
            eventEntities[eventId] = [];
          }
          eventEntities[eventId].push(`ai-${entity.id}`);
        });
      });

      // Also map by individual names mentioned in events
      extractedEvents.forEach(event => {
        const eventEntityNames: string[] = [];
        const individuals = event.individuals.toLowerCase();
        
        combined.forEach(entity => {
          const firstName = entity.name.split(' ')[0].toLowerCase();
          const lastName = entity.name.split(' ').pop()?.toLowerCase() || '';
          
          if (individuals.includes(firstName) || individuals.includes(lastName) || 
              individuals.includes(entity.name.toLowerCase())) {
            eventEntityNames.push(entity.id);
          }
        });

        // Create connections between entities mentioned in the same event
        for (let i = 0; i < eventEntityNames.length; i++) {
          for (let j = i + 1; j < eventEntityNames.length; j++) {
            const source = eventEntityNames[i];
            const target = eventEntityNames[j];
            
            // Check if connection already exists
            const exists = combinedConnections.some(
              c => (c.source === source && c.target === target) || 
                   (c.source === target && c.target === source)
            );
            
            if (!exists) {
              combinedConnections.push({
                source,
                target,
                relationship: `Mentioned in: ${event.description.slice(0, 30)}...`,
                type: "legal",
                strength: 2,
                isInferred: true
              });
            }
          }
        }
      });
    }

    return {
      entities: combined,
      connections: combinedConnections
    };
  }, [extractedEntities, extractedEvents]);

  return {
    entities: combinedData.entities,
    connections: combinedData.connections,
    isLoading: entitiesLoading || eventsLoading,
    aiEntityCount: combinedData.entities.filter(e => e.isAIExtracted).length,
    inferredConnectionCount: combinedData.connections.filter(c => c.isInferred).length
  };
};
