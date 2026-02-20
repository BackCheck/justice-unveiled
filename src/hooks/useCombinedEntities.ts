import { useMemo } from "react";
import { useExtractedEntities, useExtractedEvents, ExtractedEntity } from "./useExtractedEvents";
import { entities as staticEntities, connections as staticConnections, Entity, EntityConnection, EntityType } from "@/data/entitiesData";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

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

// Get category from database or infer based on role and description
const getCategory = (entity: ExtractedEntity): "protagonist" | "antagonist" | "neutral" | "official" => {
  // Use database category if set
  if (entity.category && entity.category !== 'neutral') {
    return entity.category;
  }
  
  // Fallback to inference
  const text = `${entity.role || ""} ${entity.description || ""}`.toLowerCase();
  
  if (text.includes("victim") || text.includes("acquit") || text.includes("target")) {
    return "protagonist";
  }
  if (text.includes("accus") || text.includes("compla") || text.includes("corrupt") || text.includes("illeg") || text.includes("threat") || text.includes("intimidat") || text.includes("forged")) {
    return "antagonist";
  }
  if (text.includes("judge") || text.includes("court") || text.includes("fir") || text.includes("agency")) {
    return "official";
  }
  return "neutral";
};

export const useCombinedEntities = () => {
  const { selectedCaseId } = useCaseFilter();
  const { data: extractedEntities, isLoading: entitiesLoading } = useExtractedEntities(selectedCaseId);
  const { data: extractedEvents, isLoading: eventsLoading } = useExtractedEvents(selectedCaseId);

  const combinedData = useMemo(() => {
    // Start with static entities only when no case filter
    const combined: CombinedEntity[] = !selectedCaseId 
      ? staticEntities.map(e => ({ ...e, isAIExtracted: false }))
      : [];

    // Track existing entity names to avoid duplicates
    const existingNames = new Set(combined.map(e => e.name.toLowerCase()));

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
          category: getCategory(extracted),
          isAIExtracted: true,
          sourceUploadId: extracted.source_upload_id,
          relatedEventIds: extracted.related_event_ids || []
        };

        combined.push(aiEntity);
        existingNames.add(extracted.name.toLowerCase());
      });
    }

    // Start with static connections only when no case filter
    const combinedConnections: CombinedConnection[] = !selectedCaseId
      ? staticConnections.map(c => ({ ...c, isInferred: false }))
      : [];

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
              // Infer connection type from event category
              const inferredType = event.category?.toLowerCase().includes("family") ? "family"
                : event.category?.toLowerCase().includes("profession") || event.category?.toLowerCase().includes("business") ? "professional"
                : event.category?.toLowerCase().includes("harass") || event.category?.toLowerCase().includes("threat") ? "adversarial"
                : event.category?.toLowerCase().includes("official") || event.category?.toLowerCase().includes("government") ? "official"
                : "legal";
              
              combinedConnections.push({
                source,
                target,
                relationship: `Mentioned in: ${event.description.slice(0, 30)}...`,
                type: inferredType,
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
  }, [extractedEntities, extractedEvents, selectedCaseId]);

  return {
    entities: combinedData.entities,
    connections: combinedData.connections,
    isLoading: entitiesLoading || eventsLoading,
    aiEntityCount: combinedData.entities.filter(e => e.isAIExtracted).length,
    inferredConnectionCount: combinedData.connections.filter(c => c.isInferred).length
  };
};
