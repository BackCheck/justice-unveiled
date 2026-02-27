import { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3,
  MessageSquare,
  FileText,
  Sparkles,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";

// Eagerly load above-fold only
import { DashboardStatsHeader, QuickNavigationGrid, CaseOverviewCard } from "./widgets";
import { GreetingBanner } from "@/components/GreetingBanner";
import { DashboardHero } from "./DashboardHero";
import { usePlatformStats } from "@/hooks/usePlatformStats";

// Lazy-load everything below the fold
const EntityCharts = lazy(() => import("./EntityCharts").then(m => ({ default: m.EntityCharts })));
const IntelChat = lazy(() => import("./IntelChat").then(m => ({ default: m.IntelChat })));
const IntelReports = lazy(() => import("./IntelReports").then(m => ({ default: m.IntelReports })));
const IntelBriefingCard = lazy(() => import("./IntelBriefingCard").then(m => ({ default: m.IntelBriefingCard })));
const CaseProfileBadges = lazy(() => import("./CaseProfileBadges").then(m => ({ default: m.CaseProfileBadges })));
const KeyFindingsGrid = lazy(() => import("./widgets/KeyFindingsGrid").then(m => ({ default: m.KeyFindingsGrid })));
const ViolationsSummaryWidget = lazy(() => import("./widgets/ViolationsSummaryWidget").then(m => ({ default: m.ViolationsSummaryWidget })));
const CriticalAlertsPanel = lazy(() => import("./widgets/CriticalAlertsPanel").then(m => ({ default: m.CriticalAlertsPanel })));
const ActivityFeed = lazy(() => import("./widgets/ActivityFeed").then(m => ({ default: m.ActivityFeed })));
const TimelineSparkline = lazy(() => import("./widgets/TimelineSparkline").then(m => ({ default: m.TimelineSparkline })));

export const IntelDashboard = () => {
  const { stats: platformStats, isLoading } = usePlatformStats();

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Purpose Hero */}
      <DashboardHero />

      {/* Greeting + AI Status Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="widget-card flex-1">
          <CardContent className="p-0">
            <GreetingBanner className="rounded-lg" />
          </CardContent>
        </div>

        {(platformStats.aiExtractedEvents > 0 || platformStats.aiExtractedEntities > 0) && (
          <div className="stat-card border-amber-500/20 shrink-0">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-sm text-foreground/80">
                <strong className="text-foreground">{platformStats.aiExtractedEvents}</strong> AI events &{" "}
                <strong className="text-foreground">{platformStats.aiExtractedEntities}</strong> entities
              </span>
            </CardContent>
          </div>
        )}
      </div>

      {/* Platform Overview Stats */}
      <div className="widget-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Platform Overview
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <DashboardStatsHeader />
        </CardContent>
      </div>

      {/* Separator */}
      <div className="section-divider" />

      {/* Quick Navigation */}
      <section>
        <QuickNavigationGrid />
      </section>

      {/* Separator */}
      <div className="section-divider" />

      {/* Main Content: Two-column layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Primary Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Case Overview */}
          <CaseOverviewCard />

          {/* Case Profile Badges */}
          <Suspense fallback={<div className="h-20 animate-pulse bg-muted/30 rounded-xl" />}>
            <CaseProfileBadges />
          </Suspense>

          {/* Intel Briefing */}
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted/30 rounded-xl" />}>
            <IntelBriefingCard />
          </Suspense>

          {/* Key Findings */}
          <div className="widget-card">
            <CardContent className="p-4 sm:p-6">
              <Suspense fallback={<div className="h-48 animate-pulse bg-muted/30 rounded-xl" />}>
                <KeyFindingsGrid />
              </Suspense>
            </CardContent>
          </div>
        </div>

        {/* Secondary Column - Monitoring Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Critical Alerts */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Monitoring</h2>
            </div>
            <Suspense fallback={<div className="h-32 animate-pulse bg-muted/30 rounded-xl" />}>
              <CriticalAlertsPanel />
            </Suspense>
          </section>

          <div className="section-divider" />

          {/* Timeline */}
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted/30 rounded-xl" />}>
            <TimelineSparkline />
          </Suspense>

          <div className="section-divider" />

          {/* Activity Feed */}
          <Suspense fallback={<div className="h-48 animate-pulse bg-muted/30 rounded-xl" />}>
            <ActivityFeed />
          </Suspense>
        </aside>
      </div>

      {/* Legal Violations Summary */}
      <Suspense fallback={<div className="h-32 animate-pulse bg-muted/30 rounded-xl" />}>
        <ViolationsSummaryWidget />
      </Suspense>

      {/* Separator */}
      <div className="section-divider" />

      {/* Analytics Hub - Full Width, below Key Findings */}
      <div className="widget-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Analytics Hub
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
              <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">Loading charts…</div>}>
                <EntityCharts />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="chat" className="mt-4">
              <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">Loading chat…</div>}>
                <IntelChat />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">Loading reports…</div>}>
                <IntelReports />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </div>
  );
};
