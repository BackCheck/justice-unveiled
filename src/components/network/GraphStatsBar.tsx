import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Link, AlertTriangle, Zap, Layers, Bookmark } from "lucide-react";
import { GraphStats } from "@/hooks/useGraphData";
import { cn } from "@/lib/utils";

interface GraphStatsBarProps {
  stats: GraphStats;
  activeTab: "clusters" | "watchlist";
  onTabChange: (tab: "clusters" | "watchlist") => void;
  watchlistCount: number;
}

export const GraphStatsBar = ({ stats, activeTab, onTabChange, watchlistCount }: GraphStatsBarProps) => {
  return (
    <div className="absolute left-4 top-4 right-4 z-10 flex items-center justify-between">
      {/* Stats */}
      <div className="flex items-center gap-4 bg-card/90 backdrop-blur-sm border rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-muted-foreground" />
          <div className="text-xs">
            <span className="text-muted-foreground">Nodes</span>
            <p className="font-bold text-foreground">{stats.totalNodes}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-muted-foreground" />
          <div className="text-xs">
            <span className="text-muted-foreground">Links</span>
            <p className="font-bold text-foreground">{stats.totalLinks}</p>
          </div>
        </div>
        <div className="border-l h-8" />
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <div className="text-xs">
            <span className="text-muted-foreground">Critical</span>
            <p className="font-bold text-destructive">{stats.criticalCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-chart-4" />
          <div className="text-xs">
            <span className="text-muted-foreground">High</span>
            <p className="font-bold text-chart-4">{stats.highCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border rounded-lg p-1">
        <Button
          variant={activeTab === "clusters" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onTabChange("clusters")}
          className="gap-1.5 h-8"
        >
          <Layers className="w-3.5 h-3.5" />
          Clusters
        </Button>
        <Button
          variant={activeTab === "watchlist" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onTabChange("watchlist")}
          className="gap-1.5 h-8"
        >
          <Bookmark className="w-3.5 h-3.5" />
          Watchlist
          {watchlistCount > 0 && (
            <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
              {watchlistCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};
