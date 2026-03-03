/**
 * Entity upsert service — canonical entity resolution with deduplication.
 * Attempts exact match → alias match → fuzzy match → create new.
 */

import { supabase } from "@/integrations/supabase/client";
import { normalizeName } from "@/lib/normalizeName";

/** Token-set equality check to prevent merging distinct names with high trigram similarity */
function tokensMatch(a: string, b: string): boolean {
  const tokensA = a.split(" ").filter(Boolean).sort();
  const tokensB = b.split(" ").filter(Boolean).sort();
  return tokensA.length === tokensB.length && tokensA.every((t, i) => tokensB[i] === t);
}

/** Deterministic canonical key: sha256(normalized_name::entity_type) */
async function computeCanonicalKey(normalized: string, entityType: string): Promise<string> {
  const data = new TextEncoder().encode(`${normalized}::${entityType}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

interface UpsertEntityInput {
  case_id: string;
  name: string;
  entity_type: string;
  role?: string;
  confidence?: number;
  description?: string;
}

interface UpsertEntityResult {
  entity_id: string;
  is_new: boolean;
  match_type: "exact" | "alias" | "fuzzy" | "new";
  review_queued: boolean;
}

export async function upsertEntity(input: UpsertEntityInput): Promise<UpsertEntityResult> {
  const normalized = normalizeName(input.name);
  const entityType = input.entity_type;
  const confidence = input.confidence ?? 0.5;

  // 1. Exact match on normalized_name + entity_type among ACTIVE entities
  const { data: exactMatch } = await supabase
    .from("entities")
    .select("id, verified")
    .eq("normalized_name", normalized)
    .eq("entity_type", entityType)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (exactMatch) {
    // Ensure case role exists
    await ensureCaseRole(input.case_id, exactMatch.id, input.role);
    return { entity_id: exactMatch.id, is_new: false, match_type: "exact", review_queued: false };
  }

  // 2. Alias match
  const { data: aliasMatch } = await supabase
    .from("entity_aliases_v2")
    .select("entity_id, entity:entities!inner(id, status, entity_type)")
    .eq("alias_normalized", normalized)
    .limit(1)
    .maybeSingle();

  if (aliasMatch && (aliasMatch as any).entity?.status === "ACTIVE") {
    const matchedId = aliasMatch.entity_id;
    await ensureCaseRole(input.case_id, matchedId, input.role);
    return { entity_id: matchedId, is_new: false, match_type: "alias", review_queued: false };
  }

  // 3. Fuzzy match via trigram similarity
  const { data: fuzzyMatches } = await supabase
    .rpc("find_similar_entities", {
      p_normalized_name: normalized,
      p_entity_type: entityType,
      p_threshold: 0.92,
    });

  if (fuzzyMatches && fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches[0];

    // If score >= 0.98 AND token sets match exactly, treat as match
    // This prevents "Saqib Mumtaz" from auto-merging with "Saqib Mehmood"
    if (bestMatch.similarity_score >= 0.98 && tokensMatch(normalized, bestMatch.normalized_name)) {
      await ensureCaseRole(input.case_id, bestMatch.entity_id, input.role);
      return { entity_id: bestMatch.entity_id, is_new: false, match_type: "fuzzy", review_queued: false };
    }

    // Otherwise create new entity but queue for review
    const newEntityId = await createCanonicalEntity(input, normalized);
    await ensureCaseRole(input.case_id, newEntityId, input.role);

    // Queue review
    await supabase.from("entity_review_queue").insert({
      case_id: input.case_id,
      candidate_entity_id: newEntityId,
      possible_duplicate_of: bestMatch.entity_id,
      reason: `Trigram similarity ${(bestMatch.similarity_score * 100).toFixed(1)}%: "${input.name}" ≈ "${bestMatch.primary_name}"`,
      score: bestMatch.similarity_score,
      status: "PENDING",
    });

    return { entity_id: newEntityId, is_new: true, match_type: "fuzzy", review_queued: true };
  }

  // 4. No match — create new canonical entity
  const newEntityId = await createCanonicalEntity(input, normalized);
  await ensureCaseRole(input.case_id, newEntityId, input.role);
  return { entity_id: newEntityId, is_new: true, match_type: "new", review_queued: false };
}

async function createCanonicalEntity(input: UpsertEntityInput, normalized: string): Promise<string> {
  const canonicalKey = await computeCanonicalKey(normalized, input.entity_type);

  const { data, error } = await supabase
    .from("entities")
    .insert({
      primary_name: input.name,
      normalized_name: normalized,
      entity_type: input.entity_type,
      confidence: input.confidence ?? 0.5,
      status: "ACTIVE",
      verified: false,
      canonical_key: canonicalKey,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create entity: ${error.message}`);

  // Also add the original name as an alias
  await supabase.from("entity_aliases_v2").insert({
    entity_id: data.id,
    alias_name: input.name,
    alias_normalized: normalized,
    source: "AI",
  });

  return data.id;
}

async function ensureCaseRole(caseId: string, entityId: string, role?: string): Promise<void> {
  const mappedRole = mapRole(role);

  // Check if role already exists for this case+entity
  const { data: existing } = await supabase
    .from("case_entity_roles")
    .select("id")
    .eq("case_id", caseId)
    .eq("entity_id", entityId)
    .eq("role", mappedRole)
    .maybeSingle();

  if (!existing) {
    await supabase.from("case_entity_roles").insert({
      case_id: caseId,
      entity_id: entityId,
      role: mappedRole,
    });
  }
}

/**
 * Neutral role mapping — uses structural legal labels only.
 * Never maps from adjectives (corrupt, threat) to prevent bias.
 * Courts require neutral categorization for admissibility.
 */
function mapRole(role?: string): string {
  if (!role) return "UNKNOWN";
  const lower = role.toLowerCase().trim();

  // Structural labels only — no adjectives, no tone inference
  if (lower.includes("complainant") || lower.includes("victim") || lower.includes("petitioner") || lower.includes("protagonist")) return "PROTAGONIST";
  if (lower.includes("accused") || lower.includes("respondent") || lower.includes("suspect") || lower.includes("antagonist")) return "ANTAGONIST";
  if (lower.includes("witness") || lower.includes("pw-") || lower.includes("dw-") || lower.includes("deponent")) return "WITNESS";
  if (lower.includes("judge") || lower.includes("magistrate") || lower.includes("registrar") || lower.includes("official")) return "OFFICIAL";
  if (lower.includes("counsel") || lower.includes("lawyer") || lower.includes("advocate") || lower.includes("attorney")) return "COUNSEL";
  if (lower.includes("victim")) return "VICTIM";
  return "UNKNOWN";
}
