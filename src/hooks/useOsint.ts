import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

export function useArtifactForensics() {
  const { selectedCaseId } = useCaseFilter();
  return useQuery({
    queryKey: ["artifact-forensics", selectedCaseId],
    queryFn: async () => {
      let query = supabase.from("artifact_forensics").select("*").order("created_at", { ascending: false });
      if (selectedCaseId) query = query.eq("case_id", selectedCaseId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertForensics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: any) => {
      const { data, error } = await supabase.from("artifact_forensics").insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["artifact-forensics"] }),
  });
}

export function useWebArchives() {
  const { selectedCaseId } = useCaseFilter();
  return useQuery({
    queryKey: ["web-archives", selectedCaseId],
    queryFn: async () => {
      let query = supabase.from("web_archives").select("*").order("created_at", { ascending: false });
      if (selectedCaseId) query = query.eq("case_id", selectedCaseId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertWebArchive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: any) => {
      const { data, error } = await supabase.from("web_archives").insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["web-archives"] }),
  });
}

export function useOsintSearches() {
  const { selectedCaseId } = useCaseFilter();
  return useQuery({
    queryKey: ["osint-searches", selectedCaseId],
    queryFn: async () => {
      let query = supabase.from("osint_searches").select("*").order("created_at", { ascending: false });
      if (selectedCaseId) query = query.eq("case_id", selectedCaseId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertOsintSearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: any) => {
      const { data, error } = await supabase.from("osint_searches").insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["osint-searches"] }),
  });
}

export function useDarkWebArtifacts() {
  const { selectedCaseId } = useCaseFilter();
  return useQuery({
    queryKey: ["dark-web-artifacts", selectedCaseId],
    queryFn: async () => {
      let query = supabase.from("dark_web_artifacts").select("*").order("created_at", { ascending: false });
      if (selectedCaseId) query = query.eq("case_id", selectedCaseId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useInsertDarkWebArtifact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: any) => {
      const { data, error } = await supabase.from("dark_web_artifacts").insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dark-web-artifacts"] }),
  });
}
