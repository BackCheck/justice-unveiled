import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type {
  LegalClaim,
  EvidenceRequirement,
  ClaimEvidenceLink,
  RequirementFulfillment,
  CorrelationAnalysis,
  ClaimType,
  LegalFramework,
  ClaimStatus,
  LinkType,
} from "@/types/correlation";

export const useCorrelation = (caseId?: string) => {
  const [claims, setClaims] = useState<LegalClaim[]>([]);
  const [requirements, setRequirements] = useState<EvidenceRequirement[]>([]);
  const [links, setLinks] = useState<ClaimEvidenceLink[]>([]);
  const [fulfillments, setFulfillments] = useState<RequirementFulfillment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all correlation data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel fetches
        const [claimsRes, reqRes, linksRes, fulfillRes] = await Promise.all([
          caseId
            ? supabase.from("legal_claims").select("*").eq("case_id", caseId).order("created_at", { ascending: false })
            : supabase.from("legal_claims").select("*").order("created_at", { ascending: false }),
          supabase.from("evidence_requirements").select("*").order("legal_section"),
          supabase.from("claim_evidence_links").select("*"),
          supabase.from("requirement_fulfillment").select("*"),
        ]);

        if (claimsRes.data) setClaims(claimsRes.data as LegalClaim[]);
        if (reqRes.data) setRequirements(reqRes.data as EvidenceRequirement[]);
        if (linksRes.data) setLinks(linksRes.data as ClaimEvidenceLink[]);
        if (fulfillRes.data) setFulfillments(fulfillRes.data as RequirementFulfillment[]);
      } catch (error) {
        console.error("Error fetching correlation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId]);

  // Analysis calculations
  const analysis = useMemo((): CorrelationAnalysis => {
    const totalClaims = claims.length;
    const supportedClaims = claims.filter((c) => c.status === "supported").length;
    const unsupportedClaims = claims.filter((c) => c.status === "unsupported").length;
    const partiallySupported = claims.filter((c) => c.status === "partially_supported").length;
    const unverifiedClaims = claims.filter((c) => c.status === "unverified").length;
    const averageSupportScore = totalClaims > 0
      ? claims.reduce((sum, c) => sum + (c.support_score || 0), 0) / totalClaims
      : 0;

    // Calculate missing mandatory evidence
    const claimIds = claims.map((c) => c.id);
    const claimFulfillments = fulfillments.filter((f) => claimIds.includes(f.claim_id));
    const mandatoryReqs = requirements.filter((r) => r.is_mandatory);
    let missingCount = 0;

    claims.forEach((claim) => {
      const claimReqs = mandatoryReqs.filter((r) => r.legal_section === claim.legal_section);
      const claimFulf = claimFulfillments.filter((f) => f.claim_id === claim.id);
      const unfulfilledMandatory = claimReqs.filter(
        (r) => !claimFulf.some((f) => f.requirement_id === r.id && f.is_fulfilled)
      );
      missingCount += unfulfilledMandatory.length;
    });

    const claimsByType: Record<ClaimType, number> = {
      criminal: claims.filter((c) => c.claim_type === "criminal").length,
      regulatory: claims.filter((c) => c.claim_type === "regulatory").length,
      civil: claims.filter((c) => c.claim_type === "civil").length,
    };

    const claimsByFramework: Record<LegalFramework, number> = {
      pakistani: claims.filter((c) => c.legal_framework === "pakistani").length,
      international: claims.filter((c) => c.legal_framework === "international").length,
    };

    return {
      totalClaims,
      supportedClaims,
      unsupportedClaims,
      partiallySupported,
      unverifiedClaims,
      averageSupportScore,
      missingMandatoryEvidence: missingCount,
      claimsByType,
      claimsByFramework,
    };
  }, [claims, requirements, fulfillments]);

  // Get requirements for a specific legal section
  const getRequirementsForSection = (legalSection: string, framework: LegalFramework) => {
    return requirements.filter(
      (r) => r.legal_section === legalSection && r.legal_framework === framework
    );
  };

  // Get evidence links for a claim
  const getLinksForClaim = (claimId: string) => {
    return links.filter((l) => l.claim_id === claimId);
  };

  // Get fulfillment status for a claim
  const getFulfillmentForClaim = (claimId: string) => {
    return fulfillments.filter((f) => f.claim_id === claimId);
  };

  // Create new claim
  const createClaim = async (claimData: {
    claim_type: string;
    legal_section: string;
    legal_framework: string;
    allegation_text: string;
    case_id?: string;
    alleged_by?: string;
    alleged_against?: string;
    date_alleged?: string;
    source_document?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("legal_claims")
        .insert([claimData])
        .select()
        .single();

      if (error) throw error;
      setClaims((prev) => [data as LegalClaim, ...prev]);
      toast({ title: "Claim added", description: "Legal claim has been recorded" });
      return data as LegalClaim;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  };

  // Update claim status
  const updateClaimStatus = async (claimId: string, status: ClaimStatus, supportScore: number) => {
    try {
      const { error } = await supabase
        .from("legal_claims")
        .update({ status, support_score: supportScore })
        .eq("id", claimId);

      if (error) throw error;
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status, support_score: supportScore } : c))
      );
      toast({ title: "Claim updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Link evidence to claim
  const linkEvidence = async (linkData: {
    claim_id: string;
    link_type: string;
    evidence_upload_id?: string;
    extracted_event_id?: string;
    exhibit_number?: string;
    relevance_score?: number;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("claim_evidence_links")
        .insert([linkData])
        .select()
        .single();

      if (error) throw error;
      setLinks((prev) => [...prev, data as ClaimEvidenceLink]);
      toast({ title: "Evidence linked", description: "Evidence has been attached to claim" });
      return data as ClaimEvidenceLink;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  };

  // Update requirement fulfillment
  const updateFulfillment = async (
    claimId: string,
    requirementId: string,
    isFulfilled: boolean,
    evidenceUploadId?: string,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("requirement_fulfillment")
        .upsert(
          {
            claim_id: claimId,
            requirement_id: requirementId,
            is_fulfilled: isFulfilled,
            evidence_upload_id: evidenceUploadId,
            fulfillment_notes: notes,
          },
          { onConflict: "claim_id,requirement_id" }
        )
        .select()
        .single();

      if (error) throw error;
      setFulfillments((prev) => {
        const existing = prev.findIndex(
          (f) => f.claim_id === claimId && f.requirement_id === requirementId
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data as RequirementFulfillment;
          return updated;
        }
        return [...prev, data as RequirementFulfillment];
      });
      toast({ title: "Requirement updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Delete claim
  const deleteClaim = async (claimId: string) => {
    try {
      const { error } = await supabase.from("legal_claims").delete().eq("id", claimId);
      if (error) throw error;
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      toast({ title: "Claim deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Get unsupported claims (for flagging)
  const unsupportedClaims = useMemo(() => {
    return claims.filter((c) => c.status === "unsupported" || c.support_score < 30);
  }, [claims]);

  // Get claims with missing mandatory evidence
  const claimsWithMissingEvidence = useMemo(() => {
    return claims.filter((claim) => {
      const claimReqs = requirements.filter(
        (r) => r.legal_section === claim.legal_section && r.is_mandatory
      );
      const claimFulf = fulfillments.filter((f) => f.claim_id === claim.id);
      return claimReqs.some(
        (r) => !claimFulf.some((f) => f.requirement_id === r.id && f.is_fulfilled)
      );
    });
  }, [claims, requirements, fulfillments]);

  return {
    claims,
    requirements,
    links,
    fulfillments,
    loading,
    analysis,
    getRequirementsForSection,
    getLinksForClaim,
    getFulfillmentForClaim,
    createClaim,
    updateClaimStatus,
    linkEvidence,
    updateFulfillment,
    deleteClaim,
    unsupportedClaims,
    claimsWithMissingEvidence,
  };
};
