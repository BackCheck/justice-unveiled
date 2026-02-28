import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { lazy, Suspense } from "react";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { Sparkles, Github, Code, BookOpen, History, Rss } from "lucide-react";
import hrpmLogo from "@/assets/human-rights-logo.png";

const GlobalSearch = lazy(() => import("./GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const QuickActions = lazy(() => import("./QuickActions").then(m => ({ default: m.QuickActions })));
const NotificationCenter = lazy(() => import("./NotificationCenter").then(m => ({ default: m.NotificationCenter })));
const CaseSelector = lazy(() => import("./CaseSelector").then(m => ({ default: m.CaseSelector })));

interface PlatformLayoutProps {
  children: ReactNode;
}

// Page titles mapped to translation keys
const pageTitleKeys: Record<string, { titleKey: string; subtitleKey?: string; isAI?: boolean }> = {
  "/": { titleKey: "nav.home" },
  "/timeline": { titleKey: "nav.timeline", subtitleKey: "pages.investigativeTimeline" },
  "/dashboard": { titleKey: "nav.intelDashboard", subtitleKey: "pages.intelDashboardSub" },
  "/intel-briefing": { titleKey: "nav.intelBriefing", subtitleKey: "pages.intelligenceBriefing" },
  "/network": { titleKey: "nav.entityNetwork", subtitleKey: "pages.entityNetworkSub" },
  "/investigations": { titleKey: "nav.investigations", subtitleKey: "pages.investigationHubSub", isAI: true },
  "/cases": { titleKey: "nav.caseFiles", subtitleKey: "pages.caseFilesSub" },
  "/analyze": { titleKey: "nav.aiAnalyzer", subtitleKey: "pages.aiAnalyzerSub", isAI: true },
  "/evidence": { titleKey: "nav.evidenceMatrix", subtitleKey: "pages.evidenceMatrixSub" },
  "/international": { titleKey: "nav.international", subtitleKey: "pages.internationalRightsSub" },
  "/uploads": { titleKey: "nav.uploads", subtitleKey: "pages.uploadsSub" },
  "/about": { titleKey: "nav.about", subtitleKey: "pages.aboutSub" },
  "/admin": { titleKey: "nav.admin", subtitleKey: "pages.adminSub" },
  "/auth": { titleKey: "common.signIn", subtitleKey: "pages.authSub" },
  "/reconstruction": { titleKey: "nav.reconstruction", subtitleKey: "pages.reconstructionSub" },
  "/correlation": { titleKey: "nav.correlation", subtitleKey: "pages.correlationSub" },
  "/compliance": { titleKey: "nav.complianceChecker", subtitleKey: "pages.complianceSub" },
  "/regulatory-harm": { titleKey: "nav.harm", subtitleKey: "pages.harmSub" },
  "/legal-intelligence": { titleKey: "nav.legal", subtitleKey: "pages.legalIntelligenceSub", isAI: true },
  "/legal-research": { titleKey: "nav.legalResearch", subtitleKey: "pages.legalResearchSub" },
  "/threat-profiler": { titleKey: "nav.threatProfiler", subtitleKey: "pages.threatProfilerSub", isAI: true },
  "/watchlist": { titleKey: "nav.watchlist", subtitleKey: "pages.watchlistSub" },
  "/blog": { titleKey: "nav.blogNews", subtitleKey: "pages.blogSub" },
  "/docs": { titleKey: "nav.documentation", subtitleKey: "pages.docsSub" },
  "/api": { titleKey: "nav.developerApi", subtitleKey: "pages.apiSub" },
  "/how-to-use": { titleKey: "nav.howToUse", subtitleKey: "pages.howToUseSub" },
  "/contact": { titleKey: "nav.contact", subtitleKey: "pages.contactSub" },
  "/osint-toolkit": { titleKey: "nav.osintToolkit", subtitleKey: "pages.osintToolkitSub", isAI: true },
  "/changelog": { titleKey: "nav.changelog", subtitleKey: "pages.changelogSub" },
  "/analysis-history": { titleKey: "nav.analysisHistory", subtitleKey: "pages.analysisHistorySub", isAI: true },
  "/who-what-why": { titleKey: "nav.about", subtitleKey: "pages.aboutSub" },
  "/reports": { titleKey: "nav.reportCenter", subtitleKey: "pages.reportCenterSub" },
};

export const PlatformLayout = ({ children }: PlatformLayoutProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname;
  const pageConfig = pageTitleKeys[currentPath];
  const pageTitle = pageConfig ? t(pageConfig.titleKey) : "HRPM";
  const pageSubtitle = pageConfig?.subtitleKey ? t(pageConfig.subtitleKey) : undefined;
  const isAI = pageConfig?.isAI;
  const isHomePage = currentPath === "/" || currentPath === "";


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        {/* Ambient glow removed for performance */}
        
        <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <ScrollProgressBar />
          {/* Header */}
          <header className="sticky top-0 z-40 glass-header border-b border-border/30">
            <div className="px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="h-8 w-8 hover-glow-primary rounded-lg shrink-0" />
              
              {!isHomePage && (
                <div className="hidden md:flex items-center gap-3 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="font-semibold text-foreground truncate">{pageTitle}</h1>
                      {isAI && (
                        <Badge variant="secondary" className="gap-1 h-5 px-1.5 text-[10px] shrink-0">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </Badge>
                      )}
                    </div>
                    {pageSubtitle && (
                      <span className="text-xs text-muted-foreground truncate">{pageSubtitle}</span>
                    )}
                  </div>
                </div>
              )}

              {!isHomePage && (
                <h1 className="md:hidden text-sm font-semibold text-foreground truncate min-w-0 flex-shrink">
                  {pageTitle}
                </h1>
              )}

              <div className="flex-1 min-w-0" />

              {!isHomePage && (
                <div className="hidden sm:block">
                  <Suspense fallback={null}><CaseSelector /></Suspense>
                </div>
              )}

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Suspense fallback={null}><GlobalSearch /></Suspense>
                <div className="hidden sm:block">
                  <Suspense fallback={null}><QuickActions /></Suspense>
                </div>
                <Suspense fallback={null}><NotificationCenter /></Suspense>
              </div>
            </div>

            {!isHomePage && (
              <div className="hidden sm:block px-4 pb-2 pt-0">
                <Breadcrumbs />
              </div>
            )}
          </header>

          <main className="flex-1">{children}</main>
          
          {/* Compact Footer */}
          <footer className="border-t border-border/20 bg-card/40 backdrop-blur-xl backdrop-saturate-150 py-4">
            <div className="max-w-7xl mx-auto px-4">
              {/* Top row: Brand + Recent Posts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Brand */}
                <div className="flex items-center gap-2.5 group">
                  <img src={hrpmLogo} alt="HRPM Logo" className="w-8 h-8 transition-transform group-hover:scale-110" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">HRPM.org</p>
                    <p className="text-[10px] text-muted-foreground">Open-Source · Non-Profit</p>
                  </div>
                </div>

                {/* Quick Links as text */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <Link to="/who-what-why" className="hover:text-primary transition-colors">Who, What & Why</Link>
                  <Link to="/how-to-use" className="hover:text-primary transition-colors">{t('footer.howToUse')}</Link>
                  <Link to="/cases" className="hover:text-primary transition-colors">{t('cases.title')}</Link>
                  <Link to="/blog" className="hover:text-primary transition-colors">{t('nav.blogNews')}</Link>
                  <Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</Link>
                </div>
              </div>

              {/* Bottom Bar: Copyright + Icon links */}
              <div className="pt-3 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  © {new Date().getFullYear()} Human Rights Protection & Monitoring. {t('footer.copyright')}
                </p>
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/docs" className="hover:text-primary transition-colors">
                          <BookOpen className="w-3.5 h-3.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('pages.docs')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/api" className="hover:text-primary transition-colors">
                          <Code className="w-3.5 h-3.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('pages.api')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/changelog" className="hover:text-primary transition-colors">
                          <History className="w-3.5 h-3.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>Changelog</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/case-rss-feed`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          <Rss className="w-3.5 h-3.5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent><p>RSS Feed</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href="https://github.com/BackCheck/justice-unveiled" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('footer.openSource')}</p></TooltipContent>
                    </Tooltip>

                    <span className="text-border">|</span>

                    <Link to="/privacy" className="text-[10px] sm:text-xs hover:text-primary transition-colors">{t('footer.privacy')}</Link>
                    <Link to="/terms" className="text-[10px] sm:text-xs hover:text-primary transition-colors">{t('footer.terms')}</Link>
                  </div>
                </TooltipProvider>
              </div>

              {/* Freedom of Expression & Good Faith */}
              <div className="pt-2 text-center">
                <p className="text-[9px] leading-relaxed text-muted-foreground/70 max-w-3xl mx-auto">
                  This site constitutes protected expression under principles of freedom of expression and public-interest reporting as recognized under international human rights law, including Article 19 of the ICCPR and related frameworks. This publication is issued without malice and solely for documentation, transparency, and human rights advocacy purposes.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};
