import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

export interface CanonicalEntity {
  id: string;
  primary_name: string;
  normalized_name: string;
  entity_type: string;
  status: string;
  confidence: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CanonicalEntityWithRole extends CanonicalEntity {
  case_role?: string;
  role_notes?: string;
  role_confidence?: number;
}

export interface EntityAlias {
  id: string;
  entity_id: string;
  alias_name: string;
  alias_normalized: string;
  source: string;
}

export interface ReviewQueueItem {
  id: string;
  case_id: string;
  candidate_entity_id: string;
  possible_duplicate_of: string;
  reason: string;
  score: number;
  status: string;
  created_at: string;
  candidate?: CanonicalEntity;
  duplicate?: CanonicalEntity;
}

export interface MergeHistoryItem {
  id: string;
  winner_entity_id: string;
  loser_entity_id: string;
  merged_by: string | null;
  merged_at: string;
  reason: string | null;
  snapshot: Record<string, unknown> | null;
}

/** Fetch canonical entities with optional case-scoped roles */
export function useCanonicalEntities() {
  const { selectedCaseId } = useCaseFilter();

  return useQuery({
    queryKey: ["canonical-entities", selectedCaseId],
    queryFn: async (): Promise<CanonicalEntityWithRole[]> => {
      // Fetch active canonical entities
      const { data: entities, error } = await supabase
        .from("entities")
        .select("*")
        .eq("status", "ACTIVE")
        .order("primary_name");

      if (error) throw error;

      if (!selectedCaseId) {
        return (entities || []).map((e) => ({ ...e } as CanonicalEntityWithRole));
      }

      // Fetch case-scoped roles
      const { data: roles } = await supabase
        .from("case_entity_roles")
        .select("entity_id, role, role_notes, confidence")
        .eq("case_id", selectedCaseId);

      const roleMap = new Map(
        (roles || []).map((r) => [r.entity_id, r])
      );

      return (entities || []).map((e) => ({
        ...e,
        case_role: roleMap.get(e.id)?.role,
        role_notes: roleMap.get(e.id)?.role_notes,
        role_confidence: roleMap.get(e.id)?.confidence,
      })) as CanonicalEntityWithRole[];
    },
  });
}

/** Fetch the review queue */
export function useEntityReviewQueue(caseId?: string) {
  return useQuery({
    queryKey: ["entity-review-queue", caseId],
    queryFn: async (): Promise<ReviewQueueItem[]> => {
      let query = supabase
        .from("entity_review_queue")
        .select("*")
        .eq("status", "PENDING")
        .order("score", { ascending: false });

      if (caseId) {
        query = query.eq("case_id", caseId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch entity details for candidates and duplicates
      const entityIds = new Set<string>();
      (data || []).forEach((item) => {
        entityIds.add(item.candidate_entity_id);
        entityIds.add(item.possible_duplicate_of);
      });

      const { data: entities } = await supabase
        .from("entities")
        .select("*")
        .in("id", Array.from(entityIds));

      const entityMap = new Map(
        (entities || []).map((e) => [e.id, e])
      );

      return (data || []).map((item) => ({
        ...item,
        candidate: entityMap.get(item.candidate_entity_id) as CanonicalEntity,
        duplicate: entityMap.get(item.possible_duplicate_of) as CanonicalEntity,
      }));
    },
  });
}

/** Fetch merge history */
export function useMergeHistory() {
  return useQuery({
    queryKey: ["entity-merge-history"],
    queryFn: async (): Promise<MergeHistoryItem[]> => {
      const { data, error } = await supabase
        .from("entity_merge_history")
        .select("*")
        .order("merged_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as MergeHistoryItem[];
    },
  });
}

/** Fetch aliases for an entity */
export function useEntityAliasesV2(entityId?: string) {
  return useQuery({
    queryKey: ["entity-aliases-v2", entityId],
    enabled: !!entityId,
    queryFn: async (): Promise<EntityAlias[]> => {
      const { data, error } = await supabase
        .from("entity_aliases_v2")
        .select("*")
        .eq("entity_id", entityId!)
        .order("created_at");

      if (error) throw error;
      return (data || []) as EntityAlias[];
    },
  });
}
