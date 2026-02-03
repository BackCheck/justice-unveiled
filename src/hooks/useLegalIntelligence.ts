import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  LegalStatute,
  CaseLawPrecedent,
  LegalDoctrine,
  CaseStatuteLink,
  CasePrecedentLink,
  CaseDoctrineLink,
  LegalIssue,
  AppealSummary,
  LegalIntelligenceStats,
} from "@/types/legal-intelligence";

// Fetch all statutes
export const useLegalStatutes = (framework?: string) => {
  return useQuery({
    queryKey: ["legal-statutes", framework],
    queryFn: async () => {
      let query = supabase
        .from("legal_statutes")
        .select("*")
        .eq("is_active", true)
        .order("statute_code", { ascending: true });

      if (framework) {
        query = query.eq("framework", framework);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LegalStatute[];
    },
  });
};

// Fetch all precedents
export const useCaseLawPrecedents = () => {
  return useQuery({
    queryKey: ["case-law-precedents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_law_precedents")
        .select("*")
        .order("year", { ascending: false });

      if (error) throw error;
      return data as CaseLawPrecedent[];
    },
  });
};

// Fetch all doctrines
export const useLegalDoctrines = () => {
  return useQuery({
    queryKey: ["legal-doctrines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_doctrines")
        .select("*")
        .order("doctrine_name", { ascending: true });

      if (error) throw error;
      return data as LegalDoctrine[];
    },
  });
};

// Fetch case-specific statute links
export const useCaseStatuteLinks = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case-statute-links", caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from("case_statute_links")
        .select(`
          *,
          statute:legal_statutes(*)
        `)
        .eq("case_id", caseId);

      if (error) throw error;
      return data as CaseStatuteLink[];
    },
    enabled: !!caseId,
  });
};

// Fetch case-specific precedent links
export const useCasePrecedentLinks = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case-precedent-links", caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from("case_precedent_links")
        .select(`
          *,
          precedent:case_law_precedents(*)
        `)
        .eq("case_id", caseId);

      if (error) throw error;
      return data as CasePrecedentLink[];
    },
    enabled: !!caseId,
  });
};

// Fetch case-specific doctrine links
export const useCaseDoctrineLinks = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case-doctrine-links", caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from("case_doctrine_links")
        .select(`
          *,
          doctrine:legal_doctrines(*)
        `)
        .eq("case_id", caseId);

      if (error) throw error;
      return data as CaseDoctrineLink[];
    },
    enabled: !!caseId,
  });
};

// Fetch legal issues for a case
export const useLegalIssues = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["legal-issues", caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from("legal_issues")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LegalIssue[];
    },
    enabled: !!caseId,
  });
};

// Fetch appeal summaries for a case
export const useAppealSummaries = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["appeal-summaries", caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from("appeal_summaries")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AppealSummary[];
    },
    enabled: !!caseId,
  });
};

// Calculate stats for a case
export const useLegalIntelligenceStats = (caseId: string | undefined) => {
  const { data: statuteLinks } = useCaseStatuteLinks(caseId);
  const { data: precedentLinks } = useCasePrecedentLinks(caseId);
  const { data: doctrineLinks } = useCaseDoctrineLinks(caseId);
  const { data: issues } = useLegalIssues(caseId);
  const { data: summaries } = useAppealSummaries(caseId);
  const { data: allStatutes } = useLegalStatutes();

  const stats: LegalIntelligenceStats = {
    totalStatutes: allStatutes?.length || 0,
    linkedStatutes: statuteLinks?.length || 0,
    linkedPrecedents: precedentLinks?.length || 0,
    linkedDoctrines: doctrineLinks?.length || 0,
    openIssues: issues?.filter((i) => !i.is_resolved).length || 0,
    resolvedIssues: issues?.filter((i) => i.is_resolved).length || 0,
    draftSummaries: summaries?.filter((s) => !s.is_finalized).length || 0,
    finalizedSummaries: summaries?.filter((s) => s.is_finalized).length || 0,
  };

  return stats;
};

// Mutations
export const useLinkStatute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caseId,
      statuteId,
      notes,
    }: {
      caseId: string;
      statuteId: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("case_statute_links")
        .insert({
          case_id: caseId,
          statute_id: statuteId,
          relevance_notes: notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["case-statute-links", caseId] });
      toast.success("Statute linked to case");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("This statute is already linked to the case");
      } else {
        toast.error("Failed to link statute");
      }
    },
  });
};

export const useLinkPrecedent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caseId,
      precedentId,
      notes,
    }: {
      caseId: string;
      precedentId: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("case_precedent_links")
        .insert({
          case_id: caseId,
          precedent_id: precedentId,
          application_notes: notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["case-precedent-links", caseId] });
      toast.success("Precedent linked to case");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("This precedent is already linked to the case");
      } else {
        toast.error("Failed to link precedent");
      }
    },
  });
};

export const useLinkDoctrine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caseId,
      doctrineId,
      notes,
    }: {
      caseId: string;
      doctrineId: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("case_doctrine_links")
        .insert({
          case_id: caseId,
          doctrine_id: doctrineId,
          application_notes: notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["case-doctrine-links", caseId] });
      toast.success("Doctrine linked to case");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("This doctrine is already linked to the case");
      } else {
        toast.error("Failed to link doctrine");
      }
    },
  });
};

export const useAddLegalIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: {
      case_id: string;
      issue_title: string;
      issue_type: string;
      issue_description?: string;
      severity?: string;
      ai_generated?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("legal_issues")
        .insert({
          case_id: issue.case_id,
          issue_title: issue.issue_title,
          issue_type: issue.issue_type,
          issue_description: issue.issue_description || null,
          severity: issue.severity || "medium",
          ai_generated: issue.ai_generated || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { case_id }) => {
      queryClient.invalidateQueries({ queryKey: ["legal-issues", case_id] });
      toast.success("Legal issue added");
    },
    onError: () => {
      toast.error("Failed to add legal issue");
    },
  });
};

export const useUpdateLegalIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      caseId,
      updates,
    }: {
      id: string;
      caseId: string;
      updates: Partial<LegalIssue>;
    }) => {
      const { data, error } = await supabase
        .from("legal_issues")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["legal-issues", caseId] });
      toast.success("Legal issue updated");
    },
    onError: () => {
      toast.error("Failed to update legal issue");
    },
  });
};

export const useAddAppealSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (summary: {
      case_id: string;
      title: string;
      summary_type: string;
      content: string;
      ai_generated?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("appeal_summaries")
        .insert({
          case_id: summary.case_id,
          title: summary.title,
          summary_type: summary.summary_type,
          content: summary.content,
          ai_generated: summary.ai_generated || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { case_id }) => {
      queryClient.invalidateQueries({ queryKey: ["appeal-summaries", case_id] });
      toast.success("Appeal summary added");
    },
    onError: () => {
      toast.error("Failed to add appeal summary");
    },
  });
};

export const useUpdateAppealSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      caseId,
      updates,
    }: {
      id: string;
      caseId: string;
      updates: Partial<AppealSummary>;
    }) => {
      const { data, error } = await supabase
        .from("appeal_summaries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["appeal-summaries", caseId] });
      toast.success("Appeal summary updated");
    },
    onError: () => {
      toast.error("Failed to update appeal summary");
    },
  });
};

// Verify a case law precedent
export const useVerifyPrecedent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      precedentId,
      sourceUrl,
      notes,
    }: {
      precedentId: string;
      sourceUrl?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("case_law_precedents")
        .update({
          verified: true,
          verified_by: user?.id || null,
          verified_at: new Date().toISOString(),
          source_url: sourceUrl || null,
          notes: notes || null,
        })
        .eq("id", precedentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-law-precedents"] });
      toast.success("Precedent verified successfully");
    },
    onError: () => {
      toast.error("Failed to verify precedent");
    },
  });
};
