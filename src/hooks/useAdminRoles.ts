import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "editor" | "analyst";

interface UserWithRole {
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  email: string | null;
}

export function useAllUserRoles() {
  return useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async (): Promise<UserWithRole[]> => {
      // First get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      // Then get profiles for display names
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name");

      if (profilesError) throw profilesError;

      // Create a map for quick lookup
      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p.display_name]) || []
      );

      // Combine the data
      return (roles || []).map((role) => ({
        user_id: role.user_id,
        role: role.role as AppRole,
        created_at: role.created_at,
        updated_at: role.updated_at,
        display_name: profileMap.get(role.user_id) || null,
        email: null, // We can't access auth.users directly
      }));
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: AppRole;
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
    },
  });
}
