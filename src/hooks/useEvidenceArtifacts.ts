import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

export interface EvidenceArtifact {
  id: string;
  evidence_upload_id: string | null;
  case_id: string | null;
  artifact_type: string;
  artifact_value: string;
  context_snippet: string | null;
  confidence: number | null;
  metadata: Record<string, any>;
  created_at: string;
  // joined
  file_name?: string;
}

export function useEvidenceArtifacts() {
  const { selectedCaseId } = useCaseFilter();
  return useQuery({
    queryKey: ["evidence-artifacts", selectedCaseId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("evidence_artifacts")
        .select("*, evidence_uploads(file_name)")
        .order("created_at", { ascending: false });
      if (selectedCaseId) query = query.eq("case_id", selectedCaseId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((row: any) => ({
        ...row,
        file_name: row.evidence_uploads?.file_name || null,
      })) as EvidenceArtifact[];
    },
  });
}

export function useScanArtifacts() {
  const qc = useQueryClient();
  const { selectedCaseId } = useCaseFilter();
  return useMutation({
    mutationFn: async (params: { uploadId?: string; scanAll?: boolean }) => {
      const { data, error } = await supabase.functions.invoke("extract-artifacts", {
        body: {
          uploadId: params.uploadId,
          caseId: selectedCaseId,
          scanAll: params.scanAll || false,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["evidence-artifacts"] });
    },
  });
}
