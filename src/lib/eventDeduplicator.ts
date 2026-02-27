/**
 * Event Deduplicator — Merges near-duplicate timeline events
 * by date, category, actor overlap, and narrative similarity.
 */

/** Simple bigram-based string similarity (0-1) */
function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;

  const bigrams = (s: string): Set<string> => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };

  const ba = bigrams(na);
  const bb = bigrams(nb);
  let intersection = 0;
  for (const b of ba) if (bb.has(b)) intersection++;
  return (2 * intersection) / (ba.size + bb.size);
}

/** Extract primary actors from individuals field */
function extractActors(individuals: string): string[] {
  if (!individuals) return [];
  return individuals
    .split(/[,;&]/)
    .map(s => s.replace(/\([^)]*\)/g, '').trim().toLowerCase())
    .filter(s => s.length > 2);
}

/** Check if two actor lists overlap significantly */
function actorsOverlap(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  return a.some(actor => b.some(other =>
    actor === other || actor.includes(other) || other.includes(actor)
  ));
}

export interface TimelineEvent {
  id: string;
  date: string;
  category: string;
  description: string;
  individuals?: string;
  legal_action?: string;
  outcome?: string;
  evidence_discrepancy?: string;
  sources?: string;
  [key: string]: any;
}

export interface CanonicalEvent {
  canonicalEventId: string;
  date: string;
  category: string;
  description: string; // Best (longest) description
  mergedDescriptions: string[];
  individuals: string;
  tags: string[];
  sources: string[];
  legalReferences: string[];
  duplicateCount: number;
  mergedIds: string[];
  // Preserve original fields
  legal_action?: string;
  outcome?: string;
  evidence_discrepancy?: string;
  isExtracted?: boolean;
}

export interface DeduplicationResult {
  events: CanonicalEvent[];
  originalCount: number;
  canonicalCount: number;
  reductionRatio: number;
  clusters: Array<{ date: string; count: number; descriptions: string[] }>;
}

const SIMILARITY_THRESHOLD = 0.85;

/**
 * Deduplicate timeline events by grouping on:
 * 1. Same date
 * 2. Same or similar category
 * 3. Same primary actors OR narrative similarity > threshold
 */
export function deduplicateEvents(events: TimelineEvent[]): DeduplicationResult {
  // Group by date first
  const byDate = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const date = event.date || 'unknown';
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(event);
  }

  const canonicalEvents: CanonicalEvent[] = [];
  const clusters: DeduplicationResult['clusters'] = [];
  let nextId = 0;

  for (const [date, dateEvents] of byDate) {
    if (dateEvents.length === 1) {
      // No duplicates possible
      const e = dateEvents[0];
      canonicalEvents.push(eventToCanonical(e, `ce_${nextId++}`));
      continue;
    }

    // Cluster within same date
    const used = new Set<number>();

    for (let i = 0; i < dateEvents.length; i++) {
      if (used.has(i)) continue;

      const cluster: TimelineEvent[] = [dateEvents[i]];
      used.add(i);
      const actorsI = extractActors(dateEvents[i].individuals || '');

      for (let j = i + 1; j < dateEvents.length; j++) {
        if (used.has(j)) continue;

        const sameCategory = dateEvents[i].category === dateEvents[j].category;
        const actorsJ = extractActors(dateEvents[j].individuals || '');
        const sameActors = actorsOverlap(actorsI, actorsJ);
        const simDesc = stringSimilarity(dateEvents[i].description, dateEvents[j].description);
        const sameLegalAction = dateEvents[i].legal_action && dateEvents[j].legal_action &&
          dateEvents[i].legal_action === dateEvents[j].legal_action;

        const shouldMerge =
          (sameCategory && sameActors) ||
          (simDesc >= SIMILARITY_THRESHOLD) ||
          (sameCategory && sameLegalAction);

        if (shouldMerge) {
          cluster.push(dateEvents[j]);
          used.add(j);
        }
      }

      if (cluster.length > 1) {
        clusters.push({
          date,
          count: cluster.length,
          descriptions: cluster.map(e => e.description.slice(0, 80)),
        });
      }

      canonicalEvents.push(mergeCluster(cluster, `ce_${nextId++}`));
    }
  }

  // Sort chronologically
  canonicalEvents.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const originalCount = events.length;
  const canonicalCount = canonicalEvents.length;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[EventDeduplicator] ${originalCount} → ${canonicalCount} events (${((1 - canonicalCount / Math.max(originalCount, 1)) * 100).toFixed(1)}% reduction)`);
    clusters.forEach(c => console.log(`  Cluster ${c.date}: ${c.count} events merged`));
  }

  return {
    events: canonicalEvents,
    originalCount,
    canonicalCount,
    reductionRatio: originalCount > 0 ? canonicalCount / originalCount : 1,
    clusters,
  };
}

function eventToCanonical(e: TimelineEvent, id: string): CanonicalEvent {
  return {
    canonicalEventId: id,
    date: e.date,
    category: e.category,
    description: e.description,
    mergedDescriptions: [e.description],
    individuals: e.individuals || '',
    tags: [e.category],
    sources: e.sources ? [e.sources] : [],
    legalReferences: e.legal_action ? [e.legal_action] : [],
    duplicateCount: 1,
    mergedIds: [e.id],
    legal_action: e.legal_action,
    outcome: e.outcome,
    evidence_discrepancy: e.evidence_discrepancy,
    isExtracted: e.isExtracted || e.extraction_method === 'ai_analysis',
  };
}

function mergeCluster(cluster: TimelineEvent[], id: string): CanonicalEvent {
  // Pick longest description as primary
  const sorted = [...cluster].sort((a, b) => (b.description?.length || 0) - (a.description?.length || 0));
  const primary = sorted[0];

  // Merge all unique sources
  const allSources = [...new Set(cluster.map(e => e.sources).filter(Boolean))] as string[];

  // Merge all individuals
  const allIndividuals = [...new Set(
    cluster.flatMap(e => (e.individuals || '').split(/[,;&]/).map(s => s.trim()).filter(Boolean))
  )].join(', ');

  // Merge legal actions
  const allLegal = [...new Set(cluster.map(e => e.legal_action).filter(Boolean))] as string[];

  // Merge categories as tags
  const allTags = [...new Set(cluster.map(e => e.category))];

  // Pick most severe evidence_discrepancy
  const discrepancies = cluster
    .map(e => e.evidence_discrepancy)
    .filter(d => d && d.toLowerCase() !== 'none' && d.toLowerCase() !== 'n/a');
  const bestDiscrepancy = discrepancies.sort((a, b) => (b?.length || 0) - (a?.length || 0))[0];

  return {
    canonicalEventId: id,
    date: primary.date,
    category: primary.category,
    description: primary.description,
    mergedDescriptions: cluster.map(e => e.description),
    individuals: allIndividuals,
    tags: allTags,
    sources: allSources,
    legalReferences: allLegal,
    duplicateCount: cluster.length,
    mergedIds: cluster.map(e => e.id),
    legal_action: allLegal[0],
    outcome: primary.outcome,
    evidence_discrepancy: bestDiscrepancy,
    isExtracted: cluster.some(e => e.isExtracted || e.extraction_method === 'ai_analysis'),
  };
}

/**
 * Recompute timeline metrics from deduplicated events.
 */
export function computeDeduplicatedMetrics(result: DeduplicationResult) {
  const byYear: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const e of result.events) {
    const year = e.date?.split('-')[0] || 'Unknown';
    byYear[year] = (byYear[year] || 0) + 1;
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  }

  return {
    eventCount: result.canonicalCount,
    byYear,
    byCategory,
    duplicateClusters: result.clusters.length,
    totalDuplicatesRemoved: result.originalCount - result.canonicalCount,
  };
}
