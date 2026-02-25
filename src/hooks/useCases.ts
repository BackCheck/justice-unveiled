import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string | null;
  status: string;
  severity: string | null;
  category: string | null;
  location: string | null;
  date_opened: string | null;
  date_closed: string | null;
  lead_investigator: string | null;
  total_sources: number;
  total_events: number;
  total_entities: number;
  cover_image_url: string | null;
  report_downloads: number;
  created_at: string;
  updated_at: string;
}

export const useCases = () => {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Case[];
    },
  });
};

export const useCase = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .maybeSingle();

      if (error) throw error;
      return data as Case | null;
    },
    enabled: !!caseId,
  });
};

export const useCaseEvents = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case-events", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      const { data, error } = await supabase
        .from("extracted_events")
        .select("*")
        .eq("case_id", caseId)
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });
};

export const useCaseEntities = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case-entities", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      const { data, error } = await supabase
        .from("extracted_entities")
        .select("*")
        .eq("case_id", caseId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });
};

export const useCaseDiscrepancies = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case-discrepancies", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      const { data, error } = await supabase
        .from("extracted_discrepancies")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });
};

export const useCaseEvidence = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case-evidence", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      const { data, error } = await supabase
        .from("evidence_uploads")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });
};
