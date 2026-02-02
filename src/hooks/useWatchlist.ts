import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WatchlistItem {
  id: string;
  user_id: string;
  item_type: 'event' | 'local_violation' | 'international_violation' | 'entity';
  item_id: string;
  item_title: string;
  item_description?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export const useWatchlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!user,
  });

  const addToWatchlist = useMutation({
    mutationFn: async (item: Omit<WatchlistItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          ...item,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Already in watchlist');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Added to watchlist');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    },
    onError: () => {
      toast.error('Failed to remove from watchlist');
    },
  });

  const isInWatchlist = (itemType: string, itemId: string) => {
    return watchlist?.some(item => item.item_type === itemType && item.item_id === itemId) ?? false;
  };

  const getWatchlistItem = (itemType: string, itemId: string) => {
    return watchlist?.find(item => item.item_type === itemType && item.item_id === itemId);
  };

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    getWatchlistItem,
  };
};
