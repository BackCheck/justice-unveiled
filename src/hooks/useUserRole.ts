import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "editor" | "analyst";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export function useUserRole() {
  const { user } = useAuth();

  const { data: userRole, isLoading, error } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async (): Promise<UserRole | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data as UserRole;
    },
    enabled: !!user?.id,
  });

  const role = userRole?.role ?? null;
  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const isAnalyst = role === "analyst";
  const canEdit = isAdmin || isEditor;
  const canUpload = isAdmin || isEditor;
  const canDelete = isAdmin;
  const isAuthenticated = !!user;

  return {
    role,
    isAdmin,
    isEditor,
    isAnalyst,
    canEdit,
    canUpload,
    canDelete,
    isAuthenticated,
    isLoading,
    error,
  };
}
