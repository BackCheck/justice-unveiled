import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Network, Users, AlertTriangle, Link2, Sparkles, 
  Bookmark, LayoutGrid 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingStatsBarProps {
  stats: {
    totalNodes: number;
    totalLinks: number;
    criticalCount: number;
  };
  aiEntityCount: number;
  watchlistCount: number;
  showClusters: boolean;
  onToggleClusters: () => void;
  onOpenWatchlist: () => void;
}

export const FloatingStatsBar = ({
  stats,
  aiEntityCount,
  watchlistCount,
  showClusters,
  onToggleClusters,
  onOpenWatchlist
}: FloatingStatsBarProps) => {
  return (
    <div className="flex items-center gap-3 bg-card/90 backdrop-blur-xl border border-border/50 rounded-full px-4 py-2 shadow-lg">
      {/* Entity count */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{stats.totalNodes}</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">entities</span>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Connections */}
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{stats.totalLinks}</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">links</span>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Critical */}
      {stats.criticalCount > 0 && (
        <>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">{stats.criticalCount}</span>
          </div>
          <div className="w-px h-4 bg-border" />
        </>
      )}

      {/* AI Extracted */}
      {aiEntityCount > 0 && (
        <>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 py-0.5">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs">{aiEntityCount}</span>
          </Badge>
          <div className="w-px h-4 bg-border hidden sm:block" />
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 rounded-full",
            showClusters && "bg-primary/10 text-primary"
          )}
          onClick={onToggleClusters}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 rounded-full relative"
          onClick={onOpenWatchlist}
        >
          <Bookmark className="w-3.5 h-3.5" />
          {watchlistCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {watchlistCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
