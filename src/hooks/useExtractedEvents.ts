import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExtractedEvent {
  id: string;
  source_upload_id: string | null;
  date: string;
  category: "Business Interference" | "Harassment" | "Legal Proceeding" | "Criminal Allegation";
  description: string;
  individuals: string;
  legal_action: string;
  outcome: string;
  evidence_discrepancy: string;
  sources: string;
  confidence_score: number | null;
  is_approved: boolean | null;
  extraction_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractedEntity {
  id: string;
  source_upload_id: string | null;
  name: string;
  entity_type: "Person" | "Organization" | "Official Body" | "Legal Entity";
  role: string | null;
  description: string | null;
  related_event_ids: string[] | null;
  created_at: string;
}

export interface ExtractedDiscrepancy {
  id: string;
  source_upload_id: string | null;
  discrepancy_type: "Procedural Failure" | "Chain of Custody" | "Testimony Contradiction" | "Document Forgery" | "Timeline Inconsistency" | "Other";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  legal_reference: string | null;
  related_dates: string[] | null;
  created_at: string;
}

export interface AnalysisJob {
  id: string;
  upload_id: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  events_extracted: number | null;
  entities_extracted: number | null;
  discrepancies_extracted: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export const useExtractedEvents = () => {
  return useQuery({
    queryKey: ["extracted-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_events")
        .select("*")
        .eq("is_approved", true)
        .order("date", { ascending: true });

      if (error) throw error;
      return data as ExtractedEvent[];
    },
  });
};

export const useExtractedEntities = () => {
  return useQuery({
    queryKey: ["extracted-entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_entities")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as ExtractedEntity[];
    },
  });
};

export const useExtractedDiscrepancies = () => {
  return useQuery({
    queryKey: ["extracted-discrepancies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_discrepancies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ExtractedDiscrepancy[];
    },
  });
};

export const useAnalysisJobs = () => {
  return useQuery({
    queryKey: ["analysis-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_analysis_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AnalysisJob[];
    },
  });
};

export const useAnalyzeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      uploadId, 
      documentContent, 
      fileName, 
      documentType 
    }: { 
      uploadId: string; 
      documentContent: string; 
      fileName: string;
      documentType: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { uploadId, documentContent, fileName, documentType }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["extracted-events"] });
      queryClient.invalidateQueries({ queryKey: ["extracted-entities"] });
      queryClient.invalidateQueries({ queryKey: ["extracted-discrepancies"] });
      queryClient.invalidateQueries({ queryKey: ["analysis-jobs"] });
      
      toast.success(`Analysis complete: ${data.eventsExtracted} events, ${data.entitiesExtracted} entities, ${data.discrepanciesExtracted} discrepancies extracted`);
    },
    onError: (error) => {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Document analysis failed");
    },
  });
};

export const useToggleEventApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, isApproved }: { eventId: string; isApproved: boolean }) => {
      const { error } = await supabase
        .from("extracted_events")
        .update({ is_approved: isApproved })
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracted-events"] });
    },
  });
};

export const useDeleteExtractedEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("extracted_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracted-events"] });
      toast.success("Event removed from timeline");
    },
  });
};
