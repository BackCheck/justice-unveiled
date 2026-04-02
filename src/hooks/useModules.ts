import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteModule {
  id: string;
  module_key: string;
  module_name: string;
  description: string | null;
  icon_name: string | null;
  is_enabled: boolean;
  display_order: number;
  routes: string[];
  created_at: string;
  updated_at: string;
}

export function useModules() {
  return useQuery({
    queryKey: ["site-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_modules" as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data as unknown as SiteModule[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useIsModuleEnabled() {
  const { data: modules } = useModules();

  const disabledRoutes = new Set<string>();
  if (modules) {
    for (const mod of modules) {
      if (!mod.is_enabled) {
        for (const route of mod.routes) {
          disabledRoutes.add(route);
        }
      }
    }
  }

  const isRouteEnabled = (path: string): boolean => {
    return !disabledRoutes.has(path);
  };

  const isModuleEnabled = (moduleKey: string): boolean => {
    if (!modules) return true;
    const mod = modules.find((m) => m.module_key === moduleKey);
    return mod ? mod.is_enabled : true;
  };

  return { isRouteEnabled, isModuleEnabled, modules, disabledRoutes };
}

export function useToggleModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from("site_modules" as any)
        .update({ is_enabled, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-modules"] });
    },
  });
}
