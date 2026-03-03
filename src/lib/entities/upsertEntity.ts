/**
 * Entity upsert service — canonical entity resolution with deduplication.
 * Attempts exact match → alias match → fuzzy match → create new.
 */

import { supabase } from "@/integrations/supabase/client";
import { normalizeName } from "@/lib/normalizeName";

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

    // If score >= 0.98 and existing is verified, treat as match
    if (bestMatch.similarity_score >= 0.98) {
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
  const { data, error } = await supabase
    .from("entities")
    .insert({
      primary_name: input.name,
      normalized_name: normalized,
      entity_type: input.entity_type,
      confidence: input.confidence ?? 0.5,
      status: "ACTIVE",
      verified: false,
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

function mapRole(role?: string): string {
  if (!role) return "UNKNOWN";
  const lower = role.toLowerCase();
  if (lower.includes("victim") || lower.includes("protagonist") || lower.includes("acquit")) return "PROTAGONIST";
  if (lower.includes("accus") || lower.includes("antagonist") || lower.includes("corrupt") || lower.includes("threat")) return "ANTAGONIST";
  if (lower.includes("witness") || lower.includes("pw-") || lower.includes("dw-")) return "WITNESS";
  if (lower.includes("judge") || lower.includes("court") || lower.includes("official")) return "OFFICIAL";
  if (lower.includes("counsel") || lower.includes("lawyer") || lower.includes("advocate")) return "COUNSEL";
  return "UNKNOWN";
}
