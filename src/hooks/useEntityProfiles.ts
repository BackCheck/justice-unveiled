import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EntityAlias {
  id: string;
  entity_id: string;
  alias_type: "name" | "cnic" | "email" | "phone" | "employee_id" | "other";
  alias_value: string;
  is_primary: boolean;
  verified: boolean;
  source: string | null;
  created_at: string;
}

export interface EntityRelationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  influence_direction: "source_to_target" | "target_to_source" | "bidirectional" | "unknown";
  influence_weight: number;
  relationship_start_date: string | null;
  relationship_end_date: string | null;
  description: string | null;
  evidence_sources: string[] | null;
  is_verified: boolean;
  case_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnhancedEntity {
  id: string;
  name: string;
  entity_type: string;
  role: string | null;
  description: string | null;
  category: string | null;
  aliases: Record<string, string>[];
  role_tags: string[];
  contact_info: Record<string, string>;
  position_title: string | null;
  organization_affiliation: string | null;
  influence_score: number;
  first_seen_date: string | null;
  last_seen_date: string | null;
  profile_image_url: string | null;
  source_upload_id: string | null;
  case_id: string | null;
  created_at: string;
}

// Role tag categories for power network analysis
export const ROLE_TAG_CATEGORIES = {
  investigative: ["investigator", "prosecutor", "forensic_expert", "io", "technical_officer"],
  judicial: ["judge", "magistrate", "lawyer", "defense_counsel", "public_prosecutor"],
  complainant: ["complainant", "victim", "witness", "informant"],
  accused: ["accused", "suspect", "person_of_interest", "co_accused"],
  official: ["government_official", "regulator", "enforcement", "administrator"],
  corporate: ["executive", "director", "employee", "shareholder", "vendor"],
  beneficiary: ["beneficiary", "interested_party", "stakeholder", "heir"],
  facilitator: ["facilitator", "intermediary", "agent", "broker"],
} as const;

export const ROLE_TAG_LABELS: Record<string, string> = {
  investigator: "Investigator",
  prosecutor: "Prosecutor",
  forensic_expert: "Forensic Expert",
  io: "Investigation Officer",
  technical_officer: "Technical Officer",
  judge: "Judge",
  magistrate: "Magistrate",
  lawyer: "Lawyer",
  defense_counsel: "Defense Counsel",
  public_prosecutor: "Public Prosecutor",
  complainant: "Complainant",
  victim: "Victim",
  witness: "Witness",
  informant: "Informant",
  accused: "Accused",
  suspect: "Suspect",
  person_of_interest: "Person of Interest",
  co_accused: "Co-Accused",
  government_official: "Government Official",
  regulator: "Regulator",
  enforcement: "Enforcement",
  administrator: "Administrator",
  executive: "Executive",
  director: "Director",
  employee: "Employee",
  shareholder: "Shareholder",
  vendor: "Vendor",
  beneficiary: "Beneficiary",
  interested_party: "Interested Party",
  stakeholder: "Stakeholder",
  heir: "Heir",
  facilitator: "Facilitator",
  intermediary: "Intermediary",
  agent: "Agent",
  broker: "Broker",
};

export const RELATIONSHIP_TYPES = [
  "reports_to",
  "supervises",
  "collaborated_with",
  "filed_against",
  "testified_against",
  "influenced",
  "bribed",
  "threatened",
  "family_of",
  "employed_by",
  "contracted_with",
  "investigated",
  "prosecuted",
  "defended",
  "business_partner",
  "political_ally",
  "competitor",
] as const;

export const RELATIONSHIP_LABELS: Record<string, string> = {
  reports_to: "Reports To",
  supervises: "Supervises",
  collaborated_with: "Collaborated With",
  filed_against: "Filed Case Against",
  testified_against: "Testified Against",
  influenced: "Influenced",
  bribed: "Bribed",
  threatened: "Threatened",
  family_of: "Family Of",
  employed_by: "Employed By",
  contracted_with: "Contracted With",
  investigated: "Investigated",
  prosecuted: "Prosecuted",
  defended: "Defended",
  business_partner: "Business Partner",
  political_ally: "Political Ally",
  competitor: "Competitor",
};

// Fetch enhanced entity profiles with new fields
export const useEnhancedEntities = () => {
  return useQuery({
    queryKey: ["enhanced-entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_entities")
        .select("*")
        .order("influence_score", { ascending: false });

      if (error) throw error;
      return data as EnhancedEntity[];
    },
  });
};

// Fetch entity aliases
export const useEntityAliases = (entityId?: string) => {
  return useQuery({
    queryKey: ["entity-aliases", entityId],
    queryFn: async () => {
      let query = supabase.from("entity_aliases").select("*");
      
      if (entityId) {
        query = query.eq("entity_id", entityId);
      }
      
      const { data, error } = await query.order("is_primary", { ascending: false });

      if (error) throw error;
      return data as EntityAlias[];
    },
    enabled: entityId !== undefined,
  });
};

// Fetch all aliases for search functionality
export const useAllEntityAliases = () => {
  return useQuery({
    queryKey: ["all-entity-aliases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_aliases")
        .select("*")
        .order("alias_type");

      if (error) throw error;
      return data as EntityAlias[];
    },
  });
};

// Fetch entity relationships (influence network)
export const useEntityRelationships = (entityId?: string) => {
  return useQuery({
    queryKey: ["entity-relationships", entityId],
    queryFn: async () => {
      let query = supabase.from("entity_relationships").select("*");
      
      if (entityId) {
        query = query.or(`source_entity_id.eq.${entityId},target_entity_id.eq.${entityId}`);
      }
      
      const { data, error } = await query.order("influence_weight", { ascending: false });

      if (error) throw error;
      return data as EntityRelationship[];
    },
  });
};

// Add alias to entity
export const useAddEntityAlias = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alias: Omit<EntityAlias, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("entity_aliases")
        .insert(alias)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entity-aliases", variables.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["all-entity-aliases"] });
      toast.success("Alias added successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add alias");
    },
  });
};

// Add relationship between entities
export const useAddEntityRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationship: Omit<EntityRelationship, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("entity_relationships")
        .insert(relationship)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entity-relationships"] });
      queryClient.invalidateQueries({ queryKey: ["entity-relationships", variables.source_entity_id] });
      queryClient.invalidateQueries({ queryKey: ["entity-relationships", variables.target_entity_id] });
      toast.success("Relationship added successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add relationship");
    },
  });
};

// Update entity with role tags and influence score
export const useUpdateEntityProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      entityId, 
      updates 
    }: { 
      entityId: string; 
      updates: Partial<Pick<EnhancedEntity, "role_tags" | "influence_score" | "position_title" | "organization_affiliation" | "category">> 
    }) => {
      const { data, error } = await supabase
        .from("extracted_entities")
        .update(updates)
        .eq("id", entityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-entities"] });
      queryClient.invalidateQueries({ queryKey: ["extracted-entities"] });
      toast.success("Entity profile updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update entity");
    },
  });
};

// Search entities by alias
export const useSearchByAlias = (searchTerm: string) => {
  return useQuery({
    queryKey: ["search-by-alias", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("entity_aliases")
        .select("*")
        .ilike("alias_value", `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data as EntityAlias[];
    },
    enabled: searchTerm.length >= 2,
  });
};
