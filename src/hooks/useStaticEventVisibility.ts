import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HiddenStaticEvent {
  id: string;
  event_key: string;
  hidden_by: string | null;
  hidden_at: string;
  reason: string | null;
}

// Generate a unique key for a static event based on its properties
export const generateEventKey = (date: string, category: string, index: number): string => {
  return `static-${date}-${category}-${index}`;
};

export const useHiddenStaticEvents = () => {
  return useQuery({
    queryKey: ["hidden-static-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hidden_static_events")
        .select("*");

      if (error) throw error;
      return data as HiddenStaticEvent[];
    },
  });
};

export const useToggleStaticEventVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventKey, isHidden, reason }: { eventKey: string; isHidden: boolean; reason?: string }) => {
      if (isHidden) {
        // Hide the event - insert into hidden_static_events
        const { error } = await supabase
          .from("hidden_static_events")
          .insert({ event_key: eventKey, reason });

        if (error) throw error;
      } else {
        // Show the event - remove from hidden_static_events
        const { error } = await supabase
          .from("hidden_static_events")
          .delete()
          .eq("event_key", eventKey);

        if (error) throw error;
      }
    },
    onSuccess: (_, { isHidden }) => {
      queryClient.invalidateQueries({ queryKey: ["hidden-static-events"] });
      toast.success(isHidden ? "Event hidden from timeline" : "Event restored to timeline");
    },
    onError: (error) => {
      console.error("Toggle static visibility error:", error);
      toast.error("Failed to update event visibility");
    },
  });
};
