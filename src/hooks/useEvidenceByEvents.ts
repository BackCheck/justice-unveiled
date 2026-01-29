import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EvidenceFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  description: string | null;
  category: string | null;
}

export const useEvidenceByEventIndex = (eventIndex: number) => {
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvidence = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('evidence_uploads')
        .select('id, file_name, file_type, file_size, public_url, description, category')
        .contains('related_event_ids', [eventIndex]);

      if (!error && data) {
        setEvidence(data);
      }
      setLoading(false);
    };

    fetchEvidence();
  }, [eventIndex]);

  return { evidence, loading };
};
