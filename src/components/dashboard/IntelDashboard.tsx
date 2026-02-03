import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3,
  MessageSquare,
  FileText,
  Sparkles,
  LayoutGrid,
  AlertCircle,
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
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Section 1: Status Banner - Compact AI notification */}
      {(platformStats.aiExtractedEvents > 0 || platformStats.aiExtractedEntities > 0) && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
          <div className="p-1.5 rounded-md bg-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-sm text-foreground/80">
            <strong className="text-foreground">{platformStats.aiExtractedEvents}</strong> AI-extracted events and{" "}
            <strong className="text-foreground">{platformStats.aiExtractedEntities}</strong> entities enriching the intelligence database
          </span>
        </div>
      )}

      {/* Section 2: Key Metrics - Primary stats with improved spacing */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Platform Overview</h2>
        </div>
        <DashboardStatsHeader />
      </section>

      {/* Section 3: Quick Navigation - Streamlined module access */}
      <section>
        <QuickNavigationGrid />
      </section>

      {/* Main Content: Two-column layout with clear separation */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Primary Column - Case Intelligence */}
        <div className="lg:col-span-8 space-y-8">
          {/* Case Overview - Hero card for the primary investigation */}
          <section>
            <CaseOverviewCard />
          </section>

          {/* Case Profile Badges - Compliance & violation indicators */}
          <section>
            <CaseProfileBadges />
          </section>

          {/* Analytics Hub - Tabbed interface for deep analysis */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Analytics Hub</h2>
            </div>
            
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50">
                <TabsTrigger value="charts" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Entity Charts</span>
                  <span className="sm:hidden">Charts</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Chat</span>
                  <span className="sm:hidden">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">Reports</span>
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
          </section>

          {/* Intel Briefing - Narrative summary */}
          <section>
            <IntelBriefingCard />
          </section>

          {/* Key Findings - Critical intelligence items */}
          <section>
            <KeyFindingsGrid />
          </section>
        </div>

        {/* Secondary Column - Monitoring Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Critical Alerts - Priority monitoring */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Monitoring</h2>
            </div>
            <CriticalAlertsPanel />
          </section>

          {/* Timeline Visualization */}
          <section>
            <TimelineSparkline />
          </section>

          {/* Activity Feed - Recent platform activity */}
          <section>
            <ActivityFeed />
          </section>
        </aside>
      </div>
    </div>
  );
};
