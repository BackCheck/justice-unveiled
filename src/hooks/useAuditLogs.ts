import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
}

interface UseAuditLogsOptions {
  tableName?: string;
  action?: "INSERT" | "UPDATE" | "DELETE";
  userId?: string;
  limit?: number;
}

export const useAuditLogs = (options: UseAuditLogsOptions = {}) => {
  const { tableName, action, userId, limit = 100 } = options;

  return useQuery({
    queryKey: ["audit-logs", tableName, action, userId, limit],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (tableName) {
        query = query.eq("table_name", tableName);
      }
      if (action) {
        query = query.eq("action", action);
      }
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLog[];
    },
  });
};
