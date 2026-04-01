import { lazy, Suspense } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  LayoutGrid,
  AlertCircle,
  Radio,
  Lightbulb,
  Activity,
  Shield,
  Scale,
  Info,
  TrendingUp,
  FileText,
  Target,
} from "lucide-react";

// Eagerly load above-fold only
import { DashboardStatsHeader, QuickNavigationGrid, CaseOverviewCard } from "./widgets";
import { GreetingBanner } from "@/components/GreetingBanner";
import { DashboardHero } from "./DashboardHero";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

// Lazy-load everything below the fold
const IntelChat = lazy(() => import("./IntelChat").then(m => ({ default: m.IntelChat })));

const CaseProfileBadges = lazy(() => import("./CaseProfileBadges").then(m => ({ default: m.CaseProfileBadges })));
const KeyFindingsGrid = lazy(() => import("./widgets/KeyFindingsGrid").then(m => ({ default: m.KeyFindingsGrid })));
const ViolationsSummaryWidget = lazy(() => import("./widgets/ViolationsSummaryWidget").then(m => ({ default: m.ViolationsSummaryWidget })));
const CriticalAlertsPanel = lazy(() => import("./widgets/CriticalAlertsPanel").then(m => ({ default: m.CriticalAlertsPanel })));
const ActivityFeed = lazy(() => import("./widgets/ActivityFeed").then(m => ({ default: m.ActivityFeed })));
const TimelineSparkline = lazy(() => import("./widgets/TimelineSparkline").then(m => ({ default: m.TimelineSparkline })));

const SectionHeader = ({ icon: Icon, title, description, iconColor = "text-primary", badge }: {
  icon: typeof Info;
  title: string;
  description: string;
  iconColor?: string;
  badge?: string;
}) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h2>
      </div>
      {badge && (
        <Badge variant="secondary" className="text-[10px]">{badge}</Badge>
      )}
    </div>
    <p className="text-xs text-muted-foreground/70 ml-6">{description}</p>
  </div>
);

export const IntelDashboard = () => {
  const { stats: platformStats, isLoading } = usePlatformStats();
  const { selectedCaseId } = useCaseFilter();

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Purpose Hero — explains what this page is and what scope you're viewing */}
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
              <div>
                <span className="text-sm text-foreground/80">
                  <strong className="text-foreground">{platformStats.aiExtractedEvents}</strong> AI events &{" "}
                  <strong className="text-foreground">{platformStats.aiExtractedEntities}</strong> entities
                </span>
                <p className="text-[10px] text-muted-foreground">Automatically extracted from uploaded documents</p>
              </div>
            </CardContent>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Platform Overview Stats */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="widget-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Platform Overview
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1 ml-6">
                {selectedCaseId 
                  ? "Metrics filtered to the selected case. Hover any card for a detailed explanation of what it measures."
                  : "Aggregated metrics across all cases. Hover any card for a detailed explanation. Use the case selector to filter."
                }
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] gap-1">
              <TrendingUp className="w-3 h-3" />
              7-day trends
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <DashboardStatsHeader />
        </CardContent>
      </div>

      {/* Separator */}
      <div className="section-divider" />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: Investigation Modules (Quick Navigation) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <QuickNavigationGrid />
      </section>

      {/* Separator */}
      <div className="section-divider" />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: Live Comm + AI */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={Radio}
          title="Live Comm + AI"
          description="Ask questions about your case data, draft legal documents, search for patterns, or get AI-powered analysis. Responses can be curated into reports."
          iconColor="text-primary"
        />
        <Suspense fallback={<div className="h-[500px] animate-pulse bg-muted/30 rounded-xl" />}>
          <IntelChat />
        </Suspense>
      </section>

      {/* Separator */}
      <div className="section-divider" />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: Case Intelligence (Main Content + Sidebar) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <SectionHeader
        icon={Target}
        title="Case Intelligence"
        description="Detailed case overview, AI-discovered findings, compliance status, and legal violation indicators. This is the core investigative intelligence for the selected scope."
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Primary Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Case Overview */}
          <CaseOverviewCard />

          {/* Case Profile Badges */}
          <Suspense fallback={<div className="h-20 animate-pulse bg-muted/30 rounded-xl" />}>
            <CaseProfileBadges />
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
            <SectionHeader
              icon={AlertCircle}
              title="Monitoring"
              description="High-priority alerts and critical discrepancies that need review or action."
              iconColor="text-destructive"
            />
            <Suspense fallback={<div className="h-32 animate-pulse bg-muted/30 rounded-xl" />}>
              <CriticalAlertsPanel />
            </Suspense>
          </section>

          <div className="section-divider" />

          {/* Timeline */}
          <section>
            <SectionHeader
              icon={TrendingUp}
              title="Event Distribution"
              description="How events are distributed across years. Spikes indicate periods of escalation."
            />
            <Suspense fallback={<div className="h-24 animate-pulse bg-muted/30 rounded-xl" />}>
              <TimelineSparkline />
            </Suspense>
          </section>

          <div className="section-divider" />

          {/* Activity Feed */}
          <section>
            <SectionHeader
              icon={Activity}
              title="Recent Activity"
              description="Latest uploads, AI extractions, and entity discoveries across the platform."
            />
            <Suspense fallback={<div className="h-48 animate-pulse bg-muted/30 rounded-xl" />}>
              <ActivityFeed />
            </Suspense>
          </section>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: Legal Violations Summary */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="section-divider" />

      <SectionHeader
        icon={Scale}
        title="Legal & Rights Violations"
        description="Summary of documented violations against local statutes (PECA, CrPC, QSO) and international human rights frameworks (UDHR, ICCPR, CAT, ECHR). Click either panel for the full analysis."
        iconColor="text-amber-600"
      />

      <Suspense fallback={<div className="h-32 animate-pulse bg-muted/30 rounded-xl" />}>
        <ViolationsSummaryWidget />
      </Suspense>

      {/* Separator */}
      <div className="section-divider" />
    </div>
  );
};
