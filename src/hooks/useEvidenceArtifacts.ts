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
    mutationFn: async (params: { uploadId?: string; scanAll?: boolean; onProgress?: (current: number, total: number, fileName: string) => void }) => {
      if (params.uploadId) {
        const { data, error } = await supabase.functions.invoke("extract-artifacts", {
          body: { uploadId: params.uploadId, caseId: selectedCaseId, scanAll: false },
        });
        if (error) throw error;
        return data;
      }

      // For scanAll: fetch uploads list, then process one at a time
      let query = (supabase as any).from("evidence_uploads").select("id, file_name");
      if (selectedCaseId) query = query.eq("case_id", selectedCaseId);
      const { data: uploads, error: listErr } = await query;
      if (listErr) throw listErr;
      if (!uploads || uploads.length === 0) return { success: true, totalArtifacts: 0, uploadsScanned: 0 };

      let totalArtifacts = 0;
      let scanned = 0;

      for (const upload of uploads) {
        params.onProgress?.(scanned + 1, uploads.length, upload.file_name);
        try {
          const { data, error } = await supabase.functions.invoke("extract-artifacts", {
            body: { uploadId: upload.id, caseId: selectedCaseId, scanAll: false },
          });
          if (!error && data?.totalArtifacts) totalArtifacts += data.totalArtifacts;
        } catch (e) {
          console.error(`Failed to scan ${upload.file_name}:`, e);
        }
        scanned++;
        // Invalidate after each doc so UI updates progressively
        qc.invalidateQueries({ queryKey: ["evidence-artifacts"] });
      }

      return { success: true, totalArtifacts, uploadsScanned: scanned };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["evidence-artifacts"] });
    },
  });
}
