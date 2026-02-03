import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  ProceduralRequirement, 
  ComplianceCheck, 
  ComplianceViolation,
  ComplianceStats,
  ComplianceStatus,
  RequirementCategory,
  CategorySummary
} from '@/types/compliance';

export const useCompliance = (caseId?: string) => {
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<ProceduralRequirement[]>([]);
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ComplianceStats | null>(null);

  // Fetch all procedural requirements
  const fetchRequirements = useCallback(async () => {
    const { data, error } = await supabase
      .from('procedural_requirements')
      .select('*')
      .order('requirement_category', { ascending: true });

    if (error) {
      console.error('Error fetching requirements:', error);
      return [];
    }
    return (data || []) as ProceduralRequirement[];
  }, []);

  // Fetch compliance checks for a case
  const fetchChecks = useCallback(async () => {
    if (!caseId) return [];

    const { data, error } = await supabase
      .from('compliance_checks')
      .select(`
        *,
        requirement:procedural_requirements(*)
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching compliance checks:', error);
      return [];
    }
    return (data || []) as ComplianceCheck[];
  }, [caseId]);

  // Fetch violations for a case
  const fetchViolations = useCallback(async () => {
    if (!caseId) return [];

    const { data, error } = await supabase
      .from('compliance_violations')
      .select('*')
      .eq('case_id', caseId)
      .order('flagged_at', { ascending: false });

    if (error) {
      console.error('Error fetching violations:', error);
      return [];
    }
    return (data || []) as ComplianceViolation[];
  }, [caseId]);

  // Calculate stats from checks and requirements
  const calculateStats = useCallback((reqs: ProceduralRequirement[], chks: ComplianceCheck[]): ComplianceStats => {
    const checksByReq = new Map(chks.map(c => [c.requirement_id, c]));
    
    let compliant = 0, violated = 0, pending = 0, partial = 0, notApplicable = 0, criticalViolations = 0;
    
    const categoryMap = new Map<RequirementCategory, { total: number; compliant: number; violated: number; pending: number }>();
    
    reqs.forEach(req => {
      const check = checksByReq.get(req.id);
      const status = check?.status || 'pending';
      
      // Update totals
      if (status === 'compliant') compliant++;
      else if (status === 'violated') {
        violated++;
        if (req.severity_if_violated === 'critical') criticalViolations++;
      }
      else if (status === 'pending') pending++;
      else if (status === 'partial') partial++;
      else if (status === 'not_applicable') notApplicable++;
      
      // Update category stats
      const cat = req.requirement_category as RequirementCategory;
      const existing = categoryMap.get(cat) || { total: 0, compliant: 0, violated: 0, pending: 0 };
      existing.total++;
      if (status === 'compliant') existing.compliant++;
      else if (status === 'violated') existing.violated++;
      else if (status === 'pending') existing.pending++;
      categoryMap.set(cat, existing);
    });
    
    const byCategory: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      label: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      ...data,
      complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0
    }));
    
    const totalChecked = compliant + violated + partial;
    const overallComplianceRate = totalChecked > 0 ? Math.round((compliant / totalChecked) * 100) : 0;
    
    return {
      totalRequirements: reqs.length,
      compliant,
      violated,
      pending,
      partiallyCompliant: partial,
      notApplicable,
      overallComplianceRate,
      criticalViolations,
      byCategory
    };
  }, []);

  // Initialize compliance checks for a case (create pending entries for all requirements)
  const initializeChecks = useCallback(async () => {
    if (!caseId) return;

    const reqs = await fetchRequirements();
    const existingChecks = await fetchChecks();
    const existingReqIds = new Set(existingChecks.map(c => c.requirement_id));

    const newChecks = reqs
      .filter(r => !existingReqIds.has(r.id))
      .map(r => ({
        case_id: caseId,
        requirement_id: r.id,
        status: 'pending' as ComplianceStatus,
        expected_action: r.requirement_description
      }));

    if (newChecks.length > 0) {
      const { error } = await supabase
        .from('compliance_checks')
        .insert(newChecks);

      if (error) {
        console.error('Error initializing checks:', error);
      } else {
        await refreshData();
      }
    }
  }, [caseId, fetchRequirements, fetchChecks]);

  // Update a compliance check status
  const updateCheckStatus = useCallback(async (
    checkId: string, 
    status: ComplianceStatus, 
    details?: {
      actual_action?: string;
      violation_details?: string;
      notes?: string;
      manual_override?: boolean;
    }
  ) => {
    const { error } = await supabase
      .from('compliance_checks')
      .update({
        status,
        checked_at: new Date().toISOString(),
        manual_override: details?.manual_override ?? true,
        ...details
      })
      .eq('id', checkId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update compliance status',
        variant: 'destructive'
      });
      return false;
    }

    // If violated, create a violation record
    if (status === 'violated') {
      const check = checks.find(c => c.id === checkId);
      if (check?.requirement) {
        await createViolation({
          case_id: caseId || null,
          compliance_check_id: checkId,
          violation_type: 'procedural',
          severity: check.requirement.severity_if_violated,
          title: `${check.requirement.requirement_name} Violation`,
          description: details?.violation_details || `Violation of ${check.requirement.legal_reference}`,
          legal_consequence: `May invalidate proceedings under ${check.requirement.legal_reference}`,
          flagged_by: 'manual'
        });
      }
    }

    toast({
      title: 'Updated',
      description: 'Compliance status updated successfully'
    });

    await refreshData();
    return true;
  }, [caseId, checks, toast]);

  // Create a violation record
  const createViolation = useCallback(async (violation: Omit<ComplianceViolation, 'id' | 'flagged_at' | 'resolved' | 'resolution_notes' | 'remediation_possible'>) => {
    const { error } = await supabase
      .from('compliance_violations')
      .insert({
        ...violation,
        remediation_possible: false
      });

    if (error) {
      console.error('Error creating violation:', error);
      return false;
    }
    return true;
  }, []);

  // Link an event to a compliance check (for AI detection)
  const linkEventToCheck = useCallback(async (checkId: string, eventId: string) => {
    const { error } = await supabase
      .from('compliance_checks')
      .update({ supporting_event_id: eventId })
      .eq('id', checkId);

    if (error) {
      console.error('Error linking event:', error);
      return false;
    }
    await refreshData();
    return true;
  }, []);

  // AI-based auto-detection of violations from events
  const runAutoDetection = useCallback(async () => {
    if (!caseId) return;

    toast({
      title: 'Running Auto-Detection',
      description: 'Analyzing events for procedural violations...'
    });

    // Fetch events for this case
    const { data: events } = await supabase
      .from('extracted_events')
      .select('*')
      .eq('case_id', caseId);

    if (!events?.length) {
      toast({
        title: 'No Events Found',
        description: 'Upload documents and extract events first',
        variant: 'destructive'
      });
      return;
    }

    // Simple keyword-based detection (can be enhanced with AI later)
    const violationPatterns: Record<string, { keywords: string[]; requirementCategory: RequirementCategory }> = {
      warrant: { 
        keywords: ['without warrant', 'no warrant', 'warrantless', 'unauthorized search'], 
        requirementCategory: 'search_warrant' 
      },
      witness: { 
        keywords: ['no witness', 'without witness', 'no independent witness', 'police witness only'], 
        requirementCategory: 'witness_protocol' 
      },
      custody: { 
        keywords: ['unsealed', 'not sealed', 'handed to', 'given to complainant', 'chain broken', 'custody gap'], 
        requirementCategory: 'chain_of_custody' 
      },
      timeline: { 
        keywords: ['delayed', 'after 24 hours', 'not produced', 'late submission'], 
        requirementCategory: 'timeline_compliance' 
      },
      constitutional: { 
        keywords: ['torture', 'coercion', 'forced confession', 'denied counsel', 'no lawyer'], 
        requirementCategory: 'constitutional' 
      }
    };

    let detectionsCount = 0;

    for (const event of events) {
      const eventText = `${event.description} ${event.evidence_discrepancy} ${event.outcome}`.toLowerCase();
      
      for (const [patternKey, pattern] of Object.entries(violationPatterns)) {
        const hasViolation = pattern.keywords.some(kw => eventText.includes(kw));
        
        if (hasViolation) {
          // Find matching requirement
          const matchingReq = requirements.find(r => 
            r.requirement_category === pattern.requirementCategory
          );
          
          if (matchingReq) {
            // Find or create check
            let check = checks.find(c => c.requirement_id === matchingReq.id);
            
            if (check && check.status === 'pending' && !check.manual_override) {
              await supabase
                .from('compliance_checks')
                .update({
                  status: 'violated',
                  ai_detected: true,
                  ai_confidence: 0.75,
                  supporting_event_id: event.id,
                  violation_details: `Auto-detected: "${pattern.keywords.find(kw => eventText.includes(kw))}" found in event`
                })
                .eq('id', check.id);
              
              detectionsCount++;
            }
          }
        }
      }
    }

    toast({
      title: 'Detection Complete',
      description: `Found ${detectionsCount} potential violations. Review and confirm.`
    });

    await refreshData();
  }, [caseId, requirements, checks, toast]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    const [reqs, chks, viols] = await Promise.all([
      fetchRequirements(),
      fetchChecks(),
      fetchViolations()
    ]);
    setRequirements(reqs);
    setChecks(chks);
    setViolations(viols);
    setStats(calculateStats(reqs, chks));
    setLoading(false);
  }, [fetchRequirements, fetchChecks, fetchViolations, calculateStats]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    requirements,
    checks,
    violations,
    stats,
    loading,
    initializeChecks,
    updateCheckStatus,
    linkEventToCheck,
    runAutoDetection,
    refreshData
  };
};
