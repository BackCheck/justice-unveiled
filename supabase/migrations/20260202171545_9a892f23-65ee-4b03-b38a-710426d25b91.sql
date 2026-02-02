-- Create watchlist table for users to save items
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL, -- 'event', 'local_violation', 'international_violation', 'entity'
  item_id TEXT NOT NULL, -- UUID for db items, string ID for static data
  item_title TEXT NOT NULL,
  item_description TEXT,
  notes TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Users can only see their own watchlist items
CREATE POLICY "Users can view their own watchlist"
ON public.watchlist
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their own watchlist
CREATE POLICY "Users can add to their own watchlist"
ON public.watchlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own watchlist items
CREATE POLICY "Users can update their own watchlist"
ON public.watchlist
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete from their own watchlist
CREATE POLICY "Users can delete from their own watchlist"
ON public.watchlist
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_item_type ON public.watchlist(item_type);

-- Trigger for updated_at
CREATE TRIGGER update_watchlist_updated_at
BEFORE UPDATE ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();