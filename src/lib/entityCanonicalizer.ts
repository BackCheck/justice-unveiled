/**
 * Entity Canonicalizer — Deduplicates entities by normalized name,
 * aggregates roles, and recomputes all metrics.
 */

// Military/professional titles to strip for canonical matching
const TITLE_PATTERNS = [
  /\b(?:Major|Maj)\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Colonel|Col)\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Lt\.?\s*Col\.?|Lieutenant\s*Colonel)\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Brigadier|Brig)\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:General|Gen)\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Captain|Capt)\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Inspector|Insp)\s*/gi,
  /\b(?:Sub\s*Inspector|SI|ASI|DSP|SSP|DIG|IG|SP)\b\s*/gi,
  /\b(?:Justice|Hon'?ble|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?)\s*/gi,
];

// Common spelling variants (canonical → alternatives)
const SPELLING_VARIANTS: Record<string, string[]> = {
  'mehwish': ['mehvish', 'mahwish', 'mahvish'],
  'muhammad': ['mohammad', 'mohd', 'muhammed'],
  'hussain': ['husain', 'husein', 'hussein'],
  'ahmed': ['ahmad', 'ahamed'],
  'khan': ['kahn'],
  'shah': ['shaah'],
};

/** Strip titles, brackets, and normalize whitespace */
function stripTitles(name: string): string {
  let cleaned = name;
  TITLE_PATTERNS.forEach(p => { cleaned = cleaned.replace(p, ''); });
  // Remove bracket content like (PW-03), (Rtd), etc.
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  // Remove role suffixes like "— Complainant"
  cleaned = cleaned.replace(/\s*[–—-]\s*(Complainant|Respondent|Witness|Accused|Defendant|Petitioner|PW-?\d+|DW-?\d+).*/gi, '');
  return cleaned.replace(/\s+/g, ' ').trim();
}

/** Normalize spelling variants to canonical forms */
function normalizeSpelling(name: string): string {
  let lower = name.toLowerCase();
  for (const [canonical, variants] of Object.entries(SPELLING_VARIANTS)) {
    for (const variant of variants) {
      lower = lower.replace(new RegExp(`\\b${variant}\\b`, 'gi'), canonical);
    }
  }
  return lower;
}

/** Generate a deterministic canonical ID from an entity name */
export function getCanonicalEntityId(name: string): string {
  const stripped = stripTitles(name);
  const normalized = normalizeSpelling(stripped);
  const slug = normalized
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `entity_${slug}`;
}

/** Extract the best display name (longest/most complete version) */
function pickDisplayName(names: string[]): string {
  return names.sort((a, b) => b.length - a.length)[0] || names[0];
}

/** Extract role from entity data or name suffix */
function extractRoles(entity: { role?: string; name?: string; category?: string }): string[] {
  const roles: string[] = [];
  if (entity.role && entity.role.trim()) roles.push(entity.role.trim());
  // Check name for role hints
  const nameMatch = entity.name?.match(/[–—-]\s*(.+)$/);
  if (nameMatch) roles.push(nameMatch[1].trim());
  // PW/DW witness patterns
  const witnessMatch = entity.name?.match(/\b(PW-?\d+|DW-?\d+)\b/i);
  if (witnessMatch) roles.push(`Witness (${witnessMatch[1].toUpperCase()})`);
  return [...new Set(roles)];
}

export interface CanonicalEntity {
  canonicalId: string;
  name: string;           // Best display name
  originalNames: string[]; // All original name variants
  roles: string[];         // Aggregated roles
  category: string;        // Most severe category wins
  type: string;
  description?: string;
  id: string;              // Primary entity ID (first seen)
  mergedIds: string[];     // All merged entity IDs
  connections?: any[];
  influence_score?: number;
  confidence: string;
}

export interface CanonicalizationResult {
  entities: CanonicalEntity[];
  originalCount: number;
  canonicalCount: number;
  reductionRatio: number;
  mergeLog: Array<{ canonicalId: string; mergedNames: string[]; count: number }>;
}

const CATEGORY_PRIORITY: Record<string, number> = {
  antagonist: 3,
  protagonist: 2,
  neutral: 1,
};

/**
 * Canonicalize a list of entities, merging duplicates.
 */
export function canonicalizeEntities(
  entities: Array<{
    id: string;
    name: string;
    type: string;
    role?: string;
    category?: string;
    description?: string;
    connections?: any[];
    influence_score?: number;
  }>
): CanonicalizationResult {
  const groups = new Map<string, typeof entities>();

  for (const entity of entities) {
    const cid = getCanonicalEntityId(entity.name);
    if (!groups.has(cid)) groups.set(cid, []);
    groups.get(cid)!.push(entity);
  }

  const canonicalEntities: CanonicalEntity[] = [];
  const mergeLog: CanonicalizationResult['mergeLog'] = [];

  for (const [canonicalId, group] of groups) {
    const allNames = group.map(e => e.name);
    const allRoles = group.flatMap(e => extractRoles(e));
    const uniqueRoles = [...new Set(allRoles)];
    
    // Pick most severe category
    const bestCategory = group
      .map(e => e.category || 'neutral')
      .sort((a, b) => (CATEGORY_PRIORITY[b] || 0) - (CATEGORY_PRIORITY[a] || 0))[0];

    // Pick best type (prefer 'person' over 'organization')
    const bestType = group.find(e => e.type === 'person')?.type || group[0].type;

    // Merge descriptions
    const descriptions = group.map(e => e.description).filter(Boolean);
    const bestDescription = descriptions.sort((a, b) => (b?.length || 0) - (a?.length || 0))[0];

    // Merge connections
    const allConnections = group.flatMap(e => e.connections || []);

    // Max influence
    const maxInfluence = Math.max(...group.map(e => e.influence_score || 0));

    canonicalEntities.push({
      canonicalId,
      name: pickDisplayName([...allNames]),
      originalNames: [...new Set(allNames)],
      roles: uniqueRoles,
      category: bestCategory,
      type: bestType,
      description: bestDescription,
      id: group[0].id,
      mergedIds: group.map(e => e.id),
      connections: allConnections,
      influence_score: maxInfluence,
      confidence: group.length > 1 ? 'role-aggregated' : 'single-entry',
    });

    if (group.length > 1) {
      mergeLog.push({
        canonicalId,
        mergedNames: allNames,
        count: group.length,
      });
    }
  }

  const originalCount = entities.length;
  const canonicalCount = canonicalEntities.length;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[EntityCanonicalizer] ${originalCount} → ${canonicalCount} entities (${((1 - canonicalCount / Math.max(originalCount, 1)) * 100).toFixed(1)}% reduction)`);
    mergeLog.forEach(m => console.log(`  Merged: ${m.mergedNames.join(' | ')} → ${m.canonicalId}`));
  }

  return {
    entities: canonicalEntities,
    originalCount,
    canonicalCount,
    reductionRatio: originalCount > 0 ? canonicalCount / originalCount : 1,
    mergeLog,
  };
}

/**
 * Recompute metrics from canonical entities.
 */
export function computeCanonicalMetrics(result: CanonicalizationResult) {
  const total = result.canonicalCount;
  const hostile = result.entities.filter(e => e.category === 'antagonist').length;
  const hostilePct = total > 0 ? ((hostile / total) * 100).toFixed(1) : '0.0';

  return {
    entityCount: total,
    hostileCount: hostile,
    hostilePercent: hostilePct,
    hostileFraction: `${hostile}/${total}`,
    reductionRatio: result.reductionRatio,
    mergeCount: result.mergeLog.length,
  };
}
