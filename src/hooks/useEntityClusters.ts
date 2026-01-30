import { useMemo } from "react";
import { CombinedEntity, CombinedConnection } from "./useCombinedEntities";

export interface EntityCluster {
  id: string;
  name: string;
  entities: string[];
  color: string;
  density: number; // Connection density within cluster
  keyEntity: string; // Most connected entity in cluster
}

const CLUSTER_COLORS = [
  "hsl(262, 83%, 58%)", // Purple - Conspiracy Network
  "hsl(221, 83%, 53%)", // Blue - Official Network
  "hsl(142, 76%, 36%)", // Green - Protagonist Network
  "hsl(25, 95%, 53%)",  // Orange - Family Network
  "hsl(340, 82%, 52%)", // Pink - Legal Network
  "hsl(174, 72%, 40%)", // Teal - Business Network
];

// Union-Find data structure for clustering
class UnionFind {
  parent: Map<string, string>;
  rank: Map<string, number>;

  constructor(elements: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    elements.forEach(e => {
      this.parent.set(e, e);
      this.rank.set(e, 0);
    });
  }

  find(x: string): string {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)!));
    }
    return this.parent.get(x)!;
  }

  union(x: string, y: string): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return;

    const rankX = this.rank.get(rootX) || 0;
    const rankY = this.rank.get(rootY) || 0;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
  }
}

// Calculate connection count for each entity
const getConnectionCounts = (
  entities: CombinedEntity[],
  connections: CombinedConnection[]
): Map<string, number> => {
  const counts = new Map<string, number>();
  entities.forEach(e => counts.set(e.id, 0));
  
  connections.forEach(conn => {
    counts.set(conn.source, (counts.get(conn.source) || 0) + conn.strength);
    counts.set(conn.target, (counts.get(conn.target) || 0) + conn.strength);
  });
  
  return counts;
};

// Generate cluster name based on member characteristics
const generateClusterName = (
  clusterEntities: CombinedEntity[],
  connections: CombinedConnection[]
): string => {
  // Check for dominant relationship type
  const typeCount: Record<string, number> = {};
  const entityIds = new Set(clusterEntities.map(e => e.id));
  
  connections.forEach(conn => {
    if (entityIds.has(conn.source) && entityIds.has(conn.target)) {
      typeCount[conn.type] = (typeCount[conn.type] || 0) + 1;
    }
  });
  
  const dominantType = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  
  // Check for agency presence
  const hasAgency = clusterEntities.some(e => e.type === "agency");
  const hasOrg = clusterEntities.some(e => e.type === "organization");
  
  // Check for category composition
  const categories = clusterEntities.map(e => e.category);
  const antagonistCount = categories.filter(c => c === "antagonist").length;
  const officialCount = categories.filter(c => c === "official").length;
  
  if (dominantType === "family") return "Family Network";
  if (dominantType === "adversarial" && antagonistCount > 2) return "Conspiracy Network";
  if (hasAgency && officialCount > 2) return "Institutional Network";
  if (hasOrg) return "Business Network";
  if (dominantType === "legal") return "Legal Proceedings";
  if (dominantType === "professional") return "Professional Network";
  
  return `Entity Cluster`;
};

export const useEntityClusters = (
  entities: CombinedEntity[],
  connections: CombinedConnection[],
  minClusterSize: number = 2,
  minConnectionStrength: number = 3
): EntityCluster[] => {
  return useMemo(() => {
    if (entities.length === 0) return [];

    // Filter to strong connections for clustering
    const strongConnections = connections.filter(c => c.strength >= minConnectionStrength);
    
    // Create Union-Find structure
    const uf = new UnionFind(entities.map(e => e.id));
    
    // Union entities with strong connections
    strongConnections.forEach(conn => {
      uf.union(conn.source, conn.target);
    });
    
    // Group entities by their cluster root
    const clusterMap = new Map<string, string[]>();
    entities.forEach(entity => {
      const root = uf.find(entity.id);
      if (!clusterMap.has(root)) {
        clusterMap.set(root, []);
      }
      clusterMap.get(root)!.push(entity.id);
    });
    
    // Filter out small clusters
    const validClusters = Array.from(clusterMap.entries())
      .filter(([_, members]) => members.length >= minClusterSize);
    
    // Calculate connection counts for finding key entities
    const connectionCounts = getConnectionCounts(entities, connections);
    
    // Build cluster objects
    const clusters: EntityCluster[] = validClusters.map(([_, memberIds], index) => {
      const clusterEntities = entities.filter(e => memberIds.includes(e.id));
      
      // Find key entity (most connected)
      const keyEntity = memberIds.reduce((max, id) => 
        (connectionCounts.get(id) || 0) > (connectionCounts.get(max) || 0) ? id : max
      , memberIds[0]);
      
      // Calculate internal connection density
      const internalConnections = connections.filter(
        c => memberIds.includes(c.source) && memberIds.includes(c.target)
      );
      const maxPossibleConnections = (memberIds.length * (memberIds.length - 1)) / 2;
      const density = maxPossibleConnections > 0 
        ? internalConnections.length / maxPossibleConnections 
        : 0;
      
      return {
        id: `cluster-${index}`,
        name: generateClusterName(clusterEntities, connections),
        entities: memberIds,
        color: CLUSTER_COLORS[index % CLUSTER_COLORS.length],
        density: Math.round(density * 100),
        keyEntity,
      };
    });
    
    // Sort by size (largest first)
    return clusters.sort((a, b) => b.entities.length - a.entities.length);
  }, [entities, connections, minClusterSize, minConnectionStrength]);
};
