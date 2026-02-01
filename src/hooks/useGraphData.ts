import { useMemo } from "react";
import { useCombinedEntities, CombinedEntity, CombinedConnection } from "./useCombinedEntities";
import { useExtractedDiscrepancies, useExtractedEvents, ExtractedDiscrepancy, ExtractedEvent } from "./useExtractedEvents";
import { timelineData } from "@/data/timelineData";

export type NodeType = "person" | "organization" | "event" | "violation" | "location";
export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  riskLevel: RiskLevel;
  description?: string;
  category?: string;
  isAIExtracted?: boolean;
  connections: number;
  metadata?: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  strength: number;
  isInferred?: boolean;
}

export interface GraphStats {
  totalNodes: number;
  totalLinks: number;
  criticalCount: number;
  highCount: number;
  byType: Record<NodeType, number>;
}

// Map entity category to risk level
const categoryToRisk = (category?: string): RiskLevel => {
  switch (category) {
    case "antagonist": return "critical";
    case "protagonist": return "low";
    case "official": return "medium";
    default: return "low";
  }
};

// Map discrepancy severity to risk level
const severityToRisk = (severity: string): RiskLevel => {
  switch (severity) {
    case "critical": return "critical";
    case "high": return "high";
    case "medium": return "medium";
    default: return "low";
  }
};

// Predefined HR violations with connections to events/people
const HR_VIOLATIONS = [
  { id: "udhr-9", name: "UDHR Art.9 Violation", article: "Arbitrary Detention", severity: "critical" as RiskLevel, relatedEntities: ["danish-thanvi", "fia"] },
  { id: "udhr-12", name: "UDHR Art.12 Violation", article: "Privacy Violation", severity: "high" as RiskLevel, relatedEntities: ["danish-thanvi", "saqib-mumtaz"] },
  { id: "iccpr-14", name: "ICCPR Art.14 Violation", article: "Fair Trial Rights", severity: "critical" as RiskLevel, relatedEntities: ["danish-thanvi", "suresh-kumar"] },
  { id: "iccpr-17", name: "ICCPR Art.17 Violation", article: "Privacy Interference", severity: "high" as RiskLevel, relatedEntities: ["danish-thanvi", "nadra", "bcg"] },
  { id: "cat-15", name: "CAT Art.15 Violation", article: "Evidence from Torture", severity: "critical" as RiskLevel, relatedEntities: ["fia", "danish-thanvi"] },
  { id: "peca-33", name: "PECA §33 Violation", article: "Electronic Evidence", severity: "critical" as RiskLevel, relatedEntities: ["fia", "arbab", "imran-saad"] },
  { id: "crpc-103", name: "CrPC §103 Violation", article: "Search Witnesses", severity: "high" as RiskLevel, relatedEntities: ["fia", "danish-thanvi"] },
  { id: "crpc-342", name: "CrPC §342 Violation", article: "Accused Statement", severity: "high" as RiskLevel, relatedEntities: ["danish-thanvi", "kashif-bhatti"] },
];

export const useGraphData = () => {
  const { entities, connections, isLoading: entitiesLoading, aiEntityCount, inferredConnectionCount } = useCombinedEntities();
  const { data: discrepancies, isLoading: discrepanciesLoading } = useExtractedDiscrepancies();
  const { data: extractedEvents, isLoading: eventsLoading } = useExtractedEvents();

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const connectionCount: Record<string, number> = {};

    // Count connections for each entity
    connections.forEach(conn => {
      connectionCount[conn.source] = (connectionCount[conn.source] || 0) + 1;
      connectionCount[conn.target] = (connectionCount[conn.target] || 0) + 1;
    });

    // Add entities as nodes
    entities.forEach(entity => {
      const nodeType: NodeType = entity.type === "person" ? "person" : 
                                  entity.type === "agency" ? "organization" : 
                                  entity.type === "organization" ? "organization" : "person";
      
      nodes.push({
        id: entity.id,
        name: entity.name,
        type: nodeType,
        riskLevel: categoryToRisk(entity.category),
        description: entity.description,
        category: entity.category,
        isAIExtracted: entity.isAIExtracted,
        connections: connectionCount[entity.id] || 0,
        metadata: { role: entity.role, type: entity.type }
      });
    });

    // Add HR violations as nodes
    HR_VIOLATIONS.forEach(violation => {
      const violationId = `violation-${violation.id}`;
      nodes.push({
        id: violationId,
        name: violation.name,
        type: "violation",
        riskLevel: violation.severity,
        description: violation.article,
        connections: violation.relatedEntities.length,
        metadata: { article: violation.article, framework: violation.id.split("-")[0].toUpperCase() }
      });

      // Create links to related entities
      violation.relatedEntities.forEach(entityId => {
        if (entities.find(e => e.id === entityId)) {
          links.push({
            source: violationId,
            target: entityId,
            type: "violation",
            strength: 4,
            isInferred: false
          });
        }
      });
    });

    // Add discrepancies as nodes
    (discrepancies || []).forEach(disc => {
      const discId = `discrepancy-${disc.id}`;
      nodes.push({
        id: discId,
        name: disc.title,
        type: "violation",
        riskLevel: severityToRisk(disc.severity),
        description: disc.description,
        connections: 0,
        metadata: { 
          type: disc.discrepancy_type, 
          legalRef: disc.legal_reference,
          dates: disc.related_dates 
        }
      });
    });

    // Add key events as nodes (only significant ones)
    const allEvents = [...timelineData, ...(extractedEvents || [])];
    const significantEvents = allEvents.slice(0, 12); // Limit to key events
    
    significantEvents.forEach((event, idx) => {
      const eventId = `event-${idx}`;
      const eventCategory = event.category;
      let riskLevel: RiskLevel = "low";
      
      if (eventCategory === "Criminal Allegation" || eventCategory === "Harassment") {
        riskLevel = "high";
      } else if (eventCategory === "Legal Proceeding") {
        riskLevel = "medium";
      }

      nodes.push({
        id: eventId,
        name: event.description.slice(0, 40) + "...",
        type: "event",
        riskLevel,
        description: event.description,
        category: event.category,
        connections: 0,
        metadata: { 
          date: event.date, 
          individuals: event.individuals,
          outcome: event.outcome 
        }
      });

      // Link events to mentioned individuals
      const individuals = event.individuals.toLowerCase();
      entities.forEach(entity => {
        const firstName = entity.name.split(' ')[0].toLowerCase();
        const lastName = entity.name.split(' ').pop()?.toLowerCase() || '';
        
        if (individuals.includes(firstName) || individuals.includes(lastName)) {
          links.push({
            source: eventId,
            target: entity.id,
            type: "event-participant",
            strength: 3,
            isInferred: true
          });
          
          // Update connection count
          nodes.find(n => n.id === eventId)!.connections++;
        }
      });
    });

    // Add entity connections
    connections.forEach(conn => {
      links.push({
        source: conn.source,
        target: conn.target,
        type: conn.type,
        strength: conn.strength,
        isInferred: conn.isInferred
      });
    });

    // Calculate stats
    const stats: GraphStats = {
      totalNodes: nodes.length,
      totalLinks: links.length,
      criticalCount: nodes.filter(n => n.riskLevel === "critical").length,
      highCount: nodes.filter(n => n.riskLevel === "high").length,
      byType: {
        person: nodes.filter(n => n.type === "person").length,
        organization: nodes.filter(n => n.type === "organization").length,
        event: nodes.filter(n => n.type === "event").length,
        violation: nodes.filter(n => n.type === "violation").length,
        location: nodes.filter(n => n.type === "location").length,
      }
    };

    return { nodes, links, stats };
  }, [entities, connections, discrepancies, extractedEvents]);

  return {
    nodes: graphData.nodes,
    links: graphData.links,
    stats: graphData.stats,
    isLoading: entitiesLoading || discrepanciesLoading || eventsLoading,
    aiEntityCount,
    inferredConnectionCount
  };
};
