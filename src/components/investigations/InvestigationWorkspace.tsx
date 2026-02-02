import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Clock,
  TrendingUp,
  Brain,
  Zap,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import {
  InvestigationStatsGrid,
  CategoryBreakdown,
  SeverityMeter,
  EntityWatchlist,
  RecentViolations,
  RecentExtractions,
  EntityDistribution,
  QuickActionsPanel,
} from "./widgets";

export const InvestigationWorkspace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { stats } = usePlatformStats();

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Workspace */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entities, events, evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Assist
            </Button>
          </div>

          {/* Stats Grid */}
          <InvestigationStatsGrid />

          {/* Main Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Categories & Severity */}
            <div className="space-y-6">
              <CategoryBreakdown />
              <SeverityMeter />
            </div>

            {/* Center Column - Recent Activity */}
            <div className="space-y-6">
              <RecentExtractions />
              <RecentViolations />
            </div>

            {/* Right Column - Entity & Actions */}
            <div className="space-y-6">
              <EntityWatchlist />
              <EntityDistribution />
              <QuickActionsPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Activity Feed */}
      <div className="w-72 border-l border-border/50 bg-accent/20 p-4 hidden xl:flex flex-col overflow-hidden">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Activity Feed
        </h3>
        
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            <ActivityItem
              color="bg-chart-2"
              time="Just now"
              title="AI analysis complete"
              subtitle="3 new events extracted"
            />
            <ActivityItem
              color="bg-chart-4"
              time="2 min ago"
              title="Pattern detected"
              subtitle="New entity cluster identified"
            />
            <ActivityItem
              color="bg-primary"
              time="5 min ago"
              title="Report generated"
              subtitle="Monthly intelligence brief"
            />
            <ActivityItem
              color="bg-destructive"
              time="10 min ago"
              title="Critical alert"
              subtitle="New procedural violation flagged"
            />
            <ActivityItem
              color="bg-chart-1"
              time="15 min ago"
              title="Document uploaded"
              subtitle="Evidence file processed"
            />
            <ActivityItem
              color="bg-chart-3"
              time="20 min ago"
              title="Entity linked"
              subtitle="Connection discovered"
            />
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Key Metrics
          </h3>
          
          <MetricRow label="Events Analyzed" value={stats.totalEvents} />
          <MetricRow label="Entities Mapped" value={stats.totalEntities} />
          <MetricRow label="AI Extractions" value={stats.aiExtractedEvents} highlight />
          <MetricRow label="Connections" value={stats.totalConnections} />
          <MetricRow label="Issues Found" value={stats.totalDiscrepancies} danger />
        </div>
      </div>
    </div>
  );
};

// Helper components
const ActivityItem = ({ 
  color, 
  time, 
  title, 
  subtitle 
}: { 
  color: string; 
  time: string; 
  title: string; 
  subtitle: string;
}) => (
  <div className="p-3 rounded-lg bg-background/80 border border-border/50">
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-2.5 h-2.5" />
        {time}
      </span>
    </div>
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

const MetricRow = ({ 
  label, 
  value, 
  highlight = false, 
  danger = false 
}: { 
  label: string; 
  value: number; 
  highlight?: boolean; 
  danger?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`font-semibold ${highlight ? "text-primary" : danger ? "text-destructive" : ""}`}>
      {value}
    </span>
  </div>
);
