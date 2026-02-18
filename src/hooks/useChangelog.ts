import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string | null;
  changes: string[];
  release_date: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

export const useChangelog = () => {
  return useQuery({
    queryKey: ["changelog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .eq("is_published", true)
        .order("release_date", { ascending: false });

      if (error) throw error;

      return (data || []).map((entry: any) => ({
        ...entry,
        changes: Array.isArray(entry.changes) ? entry.changes : [],
      })) as ChangelogEntry[];
    },
  });
};
