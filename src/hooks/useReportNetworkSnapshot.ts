/**
 * Unified network snapshot for reports — single source of truth.
 * Resolves the "0 connections" vs "N relationships" discrepancy.
 */

import { useMemo } from "react";
import { useCombinedEntities } from "./useCombinedEntities";
import { useEntityRelationships } from "./useEntityProfiles";
import { fmtNum } from "@/lib/reportQA";

export interface NetworkSnapshot {
  entities_total: number;
  relationships_total: number;
  connections_total: number;
  hostile_entities_total: number;
  hostile_percentage: string;
  hostile_fraction: string;
  density: string;
  notes: {
    filteredByCase: boolean;
    source: string;
  };
}

export function useReportNetworkSnapshot(caseId?: string | null) {
  const { entities, connections } = useCombinedEntities();
  const { data: relationships } = useEntityRelationships();

  const snapshot = useMemo((): NetworkSnapshot => {
    const hostileEntities = entities.filter(e => e.category === 'antagonist');
    const relCount = relationships?.length || 0;
    const connCount = connections.length;

    // Use the larger of the two as "effective connections" to avoid 0-connection reports
    const effectiveConnections = Math.max(relCount, connCount);

    const avgDensity = entities.length > 0
      ? ((effectiveConnections * 2) / entities.length).toFixed(1)
      : '0';

    return {
      entities_total: entities.length,
      relationships_total: relCount,
      connections_total: connCount,
      hostile_entities_total: hostileEntities.length,
      hostile_percentage: entities.length > 0
        ? ((hostileEntities.length / entities.length) * 100).toFixed(1)
        : '0',
      hostile_fraction: `${fmtNum(hostileEntities.length)}/${fmtNum(entities.length)}`,
      density: avgDensity,
      notes: {
        filteredByCase: !!caseId,
        source: connCount !== relCount
          ? `Graph snapshot: ${fmtNum(connCount)} edges; Database: ${fmtNum(relCount)} relationships`
          : `${fmtNum(connCount)} connections`,
      },
    };
  }, [entities, connections, relationships, caseId]);

  return snapshot;
}

/**
 * Build network stats labels that differentiate DB vs graph when they differ.
 */
export function buildNetworkStatsLabels(snapshot: NetworkSnapshot) {
  const showBoth = snapshot.relationships_total !== snapshot.connections_total &&
    snapshot.relationships_total > 0 && snapshot.connections_total > 0;

  if (showBoth) {
    return [
      { label: 'Connections (Graph)', value: snapshot.connections_total },
      { label: 'Relationships (DB)', value: snapshot.relationships_total },
    ];
  }

  const effectiveCount = Math.max(snapshot.relationships_total, snapshot.connections_total);
  return [{ label: 'Connections', value: effectiveCount }];
}
