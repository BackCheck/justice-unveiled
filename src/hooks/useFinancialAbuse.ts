import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FinancialInvestigation {
  id: string;
  case_id: string | null;
  title: string;
  description: string | null;
  status: string;
  risk_level: string;
  total_suspicious_amount: number;
  total_actors: number;
  total_findings: number;
  investigation_summary: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialFinding {
  id: string;
  investigation_id: string;
  case_id: string | null;
  finding_type: string;
  category: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  risk_score: number;
  evidence_references: string[] | null;
  date_detected: string | null;
  actor_names: string[] | null;
  raw_data: any;
  created_at: string;
}

export interface FinancialActor {
  id: string;
  investigation_id: string;
  case_id: string | null;
  actor_name: string;
  total_amount: number;
  transaction_count: number;
  risk_score: number;
  pattern_types: string[] | null;
  role_description: string | null;
  created_at: string;
}

export interface FinancialEvidence {
  id: string;
  investigation_id: string;
  case_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  analysis_status: string;
  analysis_result: any;
  uploaded_by: string | null;
  created_at: string;
}

export const useFinancialAbuse = (caseId?: string) => {
  const { toast } = useToast();
  const [investigations, setInvestigations] = useState<FinancialInvestigation[]>([]);
  const [findings, setFindings] = useState<FinancialFinding[]>([]);
  const [actors, setActors] = useState<FinancialActor[]>([]);
  const [evidence, setEvidence] = useState<FinancialEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let invQuery = supabase.from('financial_investigations' as any).select('*').order('created_at', { ascending: false });
      if (caseId) invQuery = invQuery.eq('case_id', caseId);
      const { data: invData } = await invQuery;

      const invs = (invData || []) as unknown as FinancialInvestigation[];
      setInvestigations(invs);

      const invIds = invs.map(i => i.id);
      if (invIds.length > 0) {
        const [findingsRes, actorsRes, evidenceRes] = await Promise.all([
          supabase.from('financial_findings' as any).select('*').in('investigation_id', invIds).order('risk_score', { ascending: false }),
          supabase.from('financial_actors' as any).select('*').in('investigation_id', invIds).order('risk_score', { ascending: false }),
          supabase.from('financial_evidence' as any).select('*').in('investigation_id', invIds).order('created_at', { ascending: false }),
        ]);
        setFindings((findingsRes.data || []) as unknown as FinancialFinding[]);
        setActors((actorsRes.data || []) as unknown as FinancialActor[]);
        setEvidence((evidenceRes.data || []) as unknown as FinancialEvidence[]);
      } else {
        setFindings([]);
        setActors([]);
        setEvidence([]);
      }
    } catch (err) {
      console.error('Error fetching financial abuse data:', err);
    }
    setLoading(false);
  }, [caseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createInvestigation = useCallback(async (title: string, description?: string) => {
    const { data, error } = await supabase
      .from('financial_investigations' as any)
      .insert([{ case_id: caseId || null, title, description, status: 'active', risk_level: 'medium' }] as any)
      .select()
      .single();
    if (error) {
      toast({ title: 'Error', description: 'Failed to create investigation', variant: 'destructive' });
      return null;
    }
    toast({ title: 'Created', description: 'Financial investigation initiated' });
    await fetchData();
    return data as unknown as FinancialInvestigation;
  }, [caseId, toast, fetchData]);

  const analyzeDocument = useCallback(async (investigationId: string, fileContent: string, fileName: string, caseTitle?: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-financial-abuse', {
        body: { content: fileContent, file_name: fileName, case_title: caseTitle },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Save findings
      if (data.findings?.length) {
        await supabase.from('financial_findings' as any).insert(
          data.findings.map((f: any) => ({
            investigation_id: investigationId,
            case_id: caseId || null,
            finding_type: f.finding_type,
            category: f.category,
            title: f.title,
            description: f.description,
            amount: f.amount || 0,
            currency: f.currency || 'PKR',
            risk_score: f.risk_score || 0,
            date_detected: f.date_detected,
            actor_names: f.actor_names || [],
          })) as any
        );
      }

      // Save actors
      if (data.actors?.length) {
        await supabase.from('financial_actors' as any).insert(
          data.actors.map((a: any) => ({
            investigation_id: investigationId,
            case_id: caseId || null,
            actor_name: a.actor_name,
            total_amount: a.total_amount || 0,
            transaction_count: a.transaction_count || 0,
            risk_score: a.risk_score || 0,
            pattern_types: a.pattern_types || [],
            role_description: a.role_description,
          })) as any
        );
      }

      // Update investigation
      await supabase.from('financial_investigations' as any).update({
        risk_level: data.risk_level || 'medium',
        total_suspicious_amount: data.total_suspicious_amount || 0,
        total_actors: data.actors?.length || 0,
        total_findings: data.findings?.length || 0,
        investigation_summary: data.summary,
      } as any).eq('id', investigationId);

      toast({ title: 'Analysis Complete', description: `Detected ${data.findings?.length || 0} findings and ${data.actors?.length || 0} actors` });
      await fetchData();
      return data;
    } catch (err: any) {
      toast({ title: 'Analysis Failed', description: err.message || 'Unknown error', variant: 'destructive' });
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [caseId, toast, fetchData]);

  const uploadAndAnalyze = useCallback(async (investigationId: string, file: File, caseTitle?: string) => {
    // Upload file to storage
    const storagePath = `financial/${caseId || 'general'}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('evidence').upload(storagePath, file);
    if (uploadErr) {
      toast({ title: 'Upload Failed', description: uploadErr.message, variant: 'destructive' });
      return null;
    }

    const { data: urlData } = supabase.storage.from('evidence').getPublicUrl(storagePath);

    // Save evidence record
    await supabase.from('financial_evidence' as any).insert([{
      investigation_id: investigationId,
      case_id: caseId || null,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      analysis_status: 'analyzing',
    }] as any);

    // Read file content
    const text = await file.text();
    const result = await analyzeDocument(investigationId, text, file.name, caseTitle);

    // Update evidence analysis status
    if (result) {
      await supabase.from('financial_evidence' as any)
        .update({ analysis_status: 'completed', analysis_result: result } as any)
        .eq('storage_path', storagePath);
    }

    return result;
  }, [caseId, toast, analyzeDocument]);

  // Aggregate stats
  const stats = {
    totalInvestigations: investigations.length,
    totalFindings: findings.length,
    totalActors: actors.length,
    totalSuspiciousAmount: investigations.reduce((s, i) => s + Number(i.total_suspicious_amount || 0), 0),
    criticalFindings: findings.filter(f => f.risk_score >= 80).length,
    highRiskActors: actors.filter(a => a.risk_score >= 70).length,
    riskLevel: investigations.length > 0 ? investigations[0].risk_level : 'none',
    byCategory: findings.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: findings.reduce((acc, f) => {
      acc[f.finding_type] = (acc[f.finding_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    investigations, findings, actors, evidence,
    stats, loading, analyzing,
    createInvestigation, analyzeDocument, uploadAndAnalyze,
    refreshData: fetchData,
  };
};
