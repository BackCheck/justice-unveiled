import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  RegulatoryHarmIncident, 
  FinancialLoss, 
  FinancialAffidavit,
  TimeTrackingEntry,
  HarmStatistics,
  IncidentType,
  IncidentStatus,
  Severity
} from '@/types/regulatory-harm';

export const useRegulatoryHarm = (caseId?: string) => {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<RegulatoryHarmIncident[]>([]);
  const [losses, setLosses] = useState<FinancialLoss[]>([]);
  const [affidavits, setAffidavits] = useState<FinancialAffidavit[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeTrackingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HarmStatistics | null>(null);

  // Fetch incidents
  const fetchIncidents = useCallback(async () => {
    let query = supabase.from('regulatory_harm_incidents').select('*');
    if (caseId) query = query.eq('case_id', caseId);
    query = query.order('incident_date', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
    return (data || []) as RegulatoryHarmIncident[];
  }, [caseId]);

  // Fetch financial losses
  const fetchLosses = useCallback(async () => {
    let query = supabase.from('financial_losses').select('*');
    if (caseId) query = query.eq('case_id', caseId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching losses:', error);
      return [];
    }
    return (data || []) as FinancialLoss[];
  }, [caseId]);

  // Fetch affidavits
  const fetchAffidavits = useCallback(async () => {
    let query = supabase.from('financial_affidavits').select('*');
    if (caseId) query = query.eq('case_id', caseId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching affidavits:', error);
      return [];
    }
    return (data || []) as FinancialAffidavit[];
  }, [caseId]);

  // Fetch time entries
  const fetchTimeEntries = useCallback(async () => {
    let query = supabase.from('harm_time_tracking').select('*');
    if (caseId) query = query.eq('case_id', caseId);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
    return (data || []) as TimeTrackingEntry[];
  }, [caseId]);

  // Calculate statistics
  const calculateStats = useCallback((
    incs: RegulatoryHarmIncident[], 
    lss: FinancialLoss[],
    times: TimeTrackingEntry[]
  ): HarmStatistics => {
    const totalFinancialLoss = lss.reduce((sum, l) => sum + Number(l.amount), 0);
    const totalTimeSpent = times.reduce((sum, t) => sum + Number(t.hours_spent), 0);
    const totalTimeCost = times.reduce((sum, t) => sum + Number(t.total_cost || 0), 0);

    const byCategory = {} as Record<IncidentType, { count: number; totalLoss: number }>;
    const byStatus = {} as Record<IncidentStatus, number>;
    const bySeverity = {} as Record<Severity, number>;

    incs.forEach(inc => {
      // By category
      if (!byCategory[inc.incident_type]) {
        byCategory[inc.incident_type] = { count: 0, totalLoss: 0 };
      }
      byCategory[inc.incident_type].count++;
      const incLosses = lss.filter(l => l.incident_id === inc.id);
      byCategory[inc.incident_type].totalLoss += incLosses.reduce((s, l) => s + Number(l.amount), 0);

      // By status
      byStatus[inc.status] = (byStatus[inc.status] || 0) + 1;

      // By severity
      bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
    });

    return {
      totalIncidents: incs.length,
      activeIncidents: incs.filter(i => i.status === 'active' || i.status === 'escalated').length,
      totalFinancialLoss,
      totalTimeSpent,
      totalTimeCost,
      byCategory,
      byStatus,
      bySeverity
    };
  }, []);

  // Create incident
  const createIncident = useCallback(async (incident: Partial<RegulatoryHarmIncident>) => {
    const { data, error } = await supabase
      .from('regulatory_harm_incidents')
      .insert([{
        case_id: caseId || null,
        incident_type: incident.incident_type || 'banking',
        incident_date: incident.incident_date || new Date().toISOString().split('T')[0],
        title: incident.title || 'Untitled Incident',
        description: incident.description,
        institution_name: incident.institution_name,
        institution_type: incident.institution_type,
        reference_number: incident.reference_number,
        status: incident.status || 'active',
        severity: incident.severity || 'medium'
      }])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create incident', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Created', description: 'Harm incident recorded' });
    await refreshData();
    return data;
  }, [caseId, toast]);

  // Update incident
  const updateIncident = useCallback(async (id: string, updates: Partial<RegulatoryHarmIncident>) => {
    const { error } = await supabase
      .from('regulatory_harm_incidents')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update incident', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Updated', description: 'Incident updated successfully' });
    await refreshData();
    return true;
  }, [toast]);

  // Add financial loss
  const addFinancialLoss = useCallback(async (loss: Partial<FinancialLoss>) => {
    const { data, error } = await supabase
      .from('financial_losses')
      .insert([{
        case_id: caseId || null,
        incident_id: loss.incident_id,
        loss_category: loss.loss_category || 'lost_revenue',
        description: loss.description || '',
        amount: loss.amount || 0,
        currency: loss.currency || 'PKR',
        time_spent_hours: loss.time_spent_hours || 0,
        hourly_rate: loss.hourly_rate || 0,
        start_date: loss.start_date,
        end_date: loss.end_date,
        is_recurring: loss.is_recurring || false,
        recurring_frequency: loss.recurring_frequency,
        is_estimated: loss.is_estimated ?? true,
        is_documented: loss.is_documented || false
      }])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add financial loss', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Added', description: 'Financial loss recorded' });
    await refreshData();
    return data;
  }, [caseId, toast]);

  // Add time entry
  const addTimeEntry = useCallback(async (entry: Partial<TimeTrackingEntry>) => {
    const { data, error } = await supabase
      .from('harm_time_tracking')
      .insert([{
        case_id: caseId || null,
        incident_id: entry.incident_id,
        activity_type: entry.activity_type || 'legal_consultation',
        description: entry.description,
        date: entry.date || new Date().toISOString().split('T')[0],
        hours_spent: entry.hours_spent || 0,
        hourly_rate: entry.hourly_rate || 0,
        person_name: entry.person_name,
        person_role: entry.person_role
      }])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add time entry', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Added', description: 'Time entry recorded' });
    await refreshData();
    return data;
  }, [caseId, toast]);

  // Upload affidavit
  const uploadAffidavit = useCallback(async (
    file: File, 
    metadata: Partial<FinancialAffidavit>
  ) => {
    const fileName = `${Date.now()}-${file.name}`;
    const storagePath = caseId ? `${caseId}/${fileName}` : fileName;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('affidavits')
      .upload(storagePath, file);

    if (uploadError) {
      toast({ title: 'Error', description: 'Failed to upload file', variant: 'destructive' });
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('affidavits')
      .getPublicUrl(storagePath);

    // Create record
    const { data, error } = await supabase
      .from('financial_affidavits')
      .insert([{
        case_id: caseId || null,
        incident_id: metadata.incident_id,
        document_type: metadata.document_type || 'affidavit',
        title: metadata.title || file.name,
        description: metadata.description,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        affidavit_date: metadata.affidavit_date,
        notarized: metadata.notarized || false,
        sworn_before: metadata.sworn_before
      }])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to save affidavit record', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Uploaded', description: 'Affidavit uploaded successfully' });
    await refreshData();
    return data;
  }, [caseId, toast]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    const [incs, lss, affs, times] = await Promise.all([
      fetchIncidents(),
      fetchLosses(),
      fetchAffidavits(),
      fetchTimeEntries()
    ]);

    // Enrich incidents with related data
    const enrichedIncidents = incs.map(inc => ({
      ...inc,
      financial_losses: lss.filter(l => l.incident_id === inc.id),
      affidavits: affs.filter(a => a.incident_id === inc.id),
      time_entries: times.filter(t => t.incident_id === inc.id),
      total_losses: lss.filter(l => l.incident_id === inc.id).reduce((s, l) => s + Number(l.amount), 0)
    }));

    setIncidents(enrichedIncidents);
    setLosses(lss);
    setAffidavits(affs);
    setTimeEntries(times);
    setStats(calculateStats(incs, lss, times));
    setLoading(false);
  }, [fetchIncidents, fetchLosses, fetchAffidavits, fetchTimeEntries, calculateStats]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    incidents,
    losses,
    affidavits,
    timeEntries,
    stats,
    loading,
    createIncident,
    updateIncident,
    addFinancialLoss,
    addTimeEntry,
    uploadAffidavit,
    refreshData
  };
};
