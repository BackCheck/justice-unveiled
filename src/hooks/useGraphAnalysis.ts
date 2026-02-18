import { useMemo, useCallback } from "react";
import { GraphNode, GraphLink } from "./useGraphData";

export interface PathResult {
  path: string[];
  length: number;
}

export interface CentralityResult {
  nodeId: string;
  degree: number;
  betweenness: number;
  normalizedScore: number; // 0-1 combined
}

export interface Community {
  id: number;
  members: string[];
  color: string;
}

// BFS shortest path
export const findShortestPath = (
  nodes: GraphNode[],
  links: GraphLink[],
  sourceId: string,
  targetId: string
): PathResult | null => {
  const adjacency: Record<string, string[]> = {};
  nodes.forEach(n => { adjacency[n.id] = []; });
  links.forEach(l => {
    if (adjacency[l.source]) adjacency[l.source].push(l.target);
    if (adjacency[l.target]) adjacency[l.target].push(l.source);
  });

  const visited = new Set<string>();
  const parent: Record<string, string | null> = {};
  const queue: string[] = [sourceId];
  visited.add(sourceId);
  parent[sourceId] = null;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      // Reconstruct path
      const path: string[] = [];
      let node: string | null = targetId;
      while (node !== null) {
        path.unshift(node);
        node = parent[node];
      }
      return { path, length: path.length - 1 };
    }
    for (const neighbor of adjacency[current] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent[neighbor] = current;
        queue.push(neighbor);
      }
    }
  }
  return null;
};

// Degree + betweenness centrality
export const computeCentrality = (
  nodes: GraphNode[],
  links: GraphLink[]
): CentralityResult[] => {
  const nodeIds = nodes.map(n => n.id);
  const adjacency: Record<string, string[]> = {};
  nodeIds.forEach(id => { adjacency[id] = []; });
  links.forEach(l => {
    if (adjacency[l.source]) adjacency[l.source].push(l.target);
    if (adjacency[l.target]) adjacency[l.target].push(l.source);
  });

  // Degree centrality
  const degree: Record<string, number> = {};
  nodeIds.forEach(id => { degree[id] = adjacency[id]?.length || 0; });
  const maxDegree = Math.max(...Object.values(degree), 1);

  // Approximate betweenness (sample-based for performance)
  const betweenness: Record<string, number> = {};
  nodeIds.forEach(id => { betweenness[id] = 0; });
  
  // Sample up to 30 source nodes for performance
  const sampleSize = Math.min(nodeIds.length, 30);
  const sampledSources = nodeIds.slice(0, sampleSize);

  sampledSources.forEach(source => {
    // BFS from source
    const dist: Record<string, number> = {};
    const sigma: Record<string, number> = {};
    const predecessors: Record<string, string[]> = {};
    const stack: string[] = [];

    nodeIds.forEach(id => {
      dist[id] = -1;
      sigma[id] = 0;
      predecessors[id] = [];
    });

    dist[source] = 0;
    sigma[source] = 1;
    const bfsQueue: string[] = [source];

    while (bfsQueue.length > 0) {
      const v = bfsQueue.shift()!;
      stack.push(v);
      for (const w of adjacency[v] || []) {
        if (dist[w] === -1) {
          dist[w] = dist[v] + 1;
          bfsQueue.push(w);
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          predecessors[w].push(v);
        }
      }
    }

    // Accumulate
    const delta: Record<string, number> = {};
    nodeIds.forEach(id => { delta[id] = 0; });

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of predecessors[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      }
      if (w !== source) {
        betweenness[w] += delta[w];
      }
    }
  });

  const maxBetweenness = Math.max(...Object.values(betweenness), 1);

  return nodeIds.map(id => {
    const degNorm = degree[id] / maxDegree;
    const betNorm = betweenness[id] / maxBetweenness;
    return {
      nodeId: id,
      degree: degree[id],
      betweenness: betweenness[id],
      normalizedScore: degNorm * 0.4 + betNorm * 0.6, // Weight betweenness higher
    };
  });
};

// Community detection (label propagation)
const COMMUNITY_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6",
  "#06b6d4",
  "#f43f5e",
  "#84cc16",
  "#fb923c",
];

export const detectCommunities = (
  nodes: GraphNode[],
  links: GraphLink[]
): Community[] => {
  const nodeIds = nodes.map(n => n.id);
  const adjacency: Record<string, string[]> = {};
  nodeIds.forEach(id => { adjacency[id] = []; });
  links.forEach(l => {
    if (adjacency[l.source]) adjacency[l.source].push(l.target);
    if (adjacency[l.target]) adjacency[l.target].push(l.source);
  });

  // Initialize each node with its own label
  const labels: Record<string, number> = {};
  nodeIds.forEach((id, i) => { labels[id] = i; });

  // Iterate label propagation
  for (let iter = 0; iter < 20; iter++) {
    let changed = false;
    // Shuffle order
    const shuffled = [...nodeIds].sort(() => Math.random() - 0.5);
    
    for (const nodeId of shuffled) {
      const neighbors = adjacency[nodeId] || [];
      if (neighbors.length === 0) continue;

      // Count neighbor labels
      const labelCounts: Record<number, number> = {};
      neighbors.forEach(n => {
        const l = labels[n];
        labelCounts[l] = (labelCounts[l] || 0) + 1;
      });

      // Pick most common label
      let maxCount = 0;
      let maxLabel = labels[nodeId];
      Object.entries(labelCounts).forEach(([label, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxLabel = parseInt(label);
        }
      });

      if (labels[nodeId] !== maxLabel) {
        labels[nodeId] = maxLabel;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Group by label
  const groups: Record<number, string[]> = {};
  Object.entries(labels).forEach(([nodeId, label]) => {
    if (!groups[label]) groups[label] = [];
    groups[label].push(nodeId);
  });

  // Filter out singletons and sort by size
  return Object.entries(groups)
    .filter(([, members]) => members.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([, members], i) => ({
      id: i,
      members,
      color: COMMUNITY_COLORS[i % COMMUNITY_COLORS.length],
    }));
};

// Timeline filter helper
export const filterByDateRange = (
  nodes: GraphNode[],
  links: GraphLink[],
  startDate: string | null,
  endDate: string | null
): { nodes: GraphNode[]; links: GraphLink[] } => {
  if (!startDate && !endDate) return { nodes, links };

  const start = startDate ? new Date(startDate) : new Date("1900-01-01");
  const end = endDate ? new Date(endDate) : new Date("2099-12-31");

  // Filter event nodes by date
  const filteredNodes = nodes.filter(n => {
    if (n.type !== "event") return true; // Keep non-event nodes
    const eventDate = n.metadata?.date;
    if (!eventDate) return true;
    const d = new Date(eventDate);
    return d >= start && d <= end;
  });

  const filteredIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = links.filter(l => filteredIds.has(l.source) && filteredIds.has(l.target));

  return { nodes: filteredNodes, links: filteredLinks };
};

export type AnalysisMode = "none" | "pathfinding" | "centrality" | "communities" | "timeline";
