import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
