import { lazy, Suspense } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles,
  LayoutGrid,
  AlertCircle,
  Radio,
} from "lucide-react";

// Eagerly load above-fold only
import { DashboardStatsHeader, QuickNavigationGrid, CaseOverviewCard } from "./widgets";
import { GreetingBanner } from "@/components/GreetingBanner";
import { DashboardHero } from "./DashboardHero";
import { usePlatformStats } from "@/hooks/usePlatformStats";

// Lazy-load everything below the fold
const IntelChat = lazy(() => import("./IntelChat").then(m => ({ default: m.IntelChat })));
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

      {/* Live Comm + AI — Prominent Full-Width Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Live Comm + AI
          </h2>
        </div>
        <Suspense fallback={<div className="h-[500px] animate-pulse bg-muted/30 rounded-xl" />}>
          <IntelChat />
        </Suspense>
      </section>

      {/* Separator */}
      <div className="section-divider" />
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
    </div>
  );
};
