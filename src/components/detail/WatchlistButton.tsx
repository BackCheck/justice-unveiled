import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useWatchlist, WatchlistItem } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WatchlistButtonProps {
  itemType: WatchlistItem['item_type'];
  itemId: string;
  itemTitle: string;
  itemDescription?: string;
  priority?: WatchlistItem['priority'];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const WatchlistButton = ({
  itemType,
  itemId,
  itemTitle,
  itemDescription,
  priority = 'medium',
  variant = "outline",
  size = "default",
  className,
}: WatchlistButtonProps) => {
  const { user } = useAuth();
  const { isInWatchlist, getWatchlistItem, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const inWatchlist = isInWatchlist(itemType, itemId);
  const watchlistItem = getWatchlistItem(itemType, itemId);
  const isPending = addToWatchlist.isPending || removeFromWatchlist.isPending;

  const handleClick = () => {
    if (!user) {
      return;
    }

    if (inWatchlist && watchlistItem) {
      removeFromWatchlist.mutate(watchlistItem.id);
    } else {
      addToWatchlist.mutate({
        item_type: itemType,
        item_id: itemId,
        item_title: itemTitle,
        item_description: itemDescription,
        priority,
      });
    }
  };

  if (!user) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size={size} className={className} disabled>
            <Eye className="w-4 h-4 mr-2" />
            Watch
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sign in to add to watchlist</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={inWatchlist ? "default" : variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        inWatchlist && "bg-primary text-primary-foreground",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : inWatchlist ? (
        <EyeOff className="w-4 h-4 mr-2" />
      ) : (
        <Eye className="w-4 h-4 mr-2" />
      )}
      {inWatchlist ? "Watching" : "Watch"}
    </Button>
  );
};
