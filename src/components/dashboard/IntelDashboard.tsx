import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  MessageSquare,
  FileText,
  Sparkles
} from "lucide-react";
import { IntelBriefingCard } from "./IntelBriefingCard";
import { CaseProfileBadges } from "./CaseProfileBadges";
import { EntityCharts } from "./EntityCharts";
import { IntelChat } from "./IntelChat";
import { IntelReports } from "./IntelReports";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import {
  DashboardStatsHeader,
  CriticalAlertsPanel,
  ActivityFeed,
  TimelineSparkline,
  QuickNavigationGrid,
  CaseOverviewCard,
  KeyFindingsGrid,
} from "./widgets";

export const IntelDashboard = () => {
  const { stats: platformStats, isLoading } = usePlatformStats();

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
      {/* AI Stats Banner */}
      {(platformStats.aiExtractedEvents > 0 || platformStats.aiExtractedEntities > 0) && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-sm">
            <strong>{platformStats.aiExtractedEvents}</strong> AI-extracted events and{" "}
            <strong>{platformStats.aiExtractedEntities}</strong> entities enriching the intelligence database
          </span>
        </div>
      )}

      {/* Stats Header */}
      <DashboardStatsHeader />

      {/* Quick Navigation */}
      <QuickNavigationGrid />

      {/* Main Content Grid: 3-column layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Case Overview */}
          <CaseOverviewCard />

          {/* Case Profile Badges */}
          <CaseProfileBadges />

          {/* Analytics Tabs */}
          <Tabs defaultValue="charts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Entity Charts
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reports
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="mt-4">
              <EntityCharts />
            </TabsContent>
            
            <TabsContent value="chat" className="mt-4">
              <IntelChat />
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              <IntelReports />
            </TabsContent>
          </Tabs>

          {/* Intel Briefing */}
          <IntelBriefingCard />

          {/* Key Findings */}
          <KeyFindingsGrid />
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Critical Alerts */}
          <CriticalAlertsPanel />

          {/* Timeline Sparkline */}
          <TimelineSparkline />

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};
