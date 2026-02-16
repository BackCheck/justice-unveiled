import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { QuickActions } from "./QuickActions";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationCenter } from "./NotificationCenter";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Github, Newspaper, Code } from "lucide-react";
import { CaseSelector } from "./CaseSelector";

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
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>
        
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Enhanced Header with breadcrumbs, search, and quick actions */}
          <header className="sticky top-0 z-40 glass-header border-b border-border/30">
            {/* Main Header Row */}
            <div className="px-4 py-3 flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8 hover-glow-primary rounded-lg shrink-0" />
              
              {/* Page Title - Desktop */}
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

              <div className="flex-1" />

              {/* Case Selector */}
              {!isHomePage && (
                <CaseSelector />
              )}

              {/* Right Side Actions */}
              <div className="flex items-center gap-2">
                <GlobalSearch />
                <QuickActions />
                
                <NotificationCenter />
              </div>
            </div>

            {/* Breadcrumb Row - Only on inner pages */}
            {!isHomePage && (
              <div className="px-4 pb-2 pt-0">
                <Breadcrumbs />
              </div>
            )}
          </header>

          <main className="flex-1">{children}</main>
          
          {/* Footer */}
          <footer className="border-t border-border/30 bg-card/30 backdrop-blur px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Human Rights Protection Movement</p>
              <div className="flex items-center gap-4">
                <Link to="/blog" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Newspaper className="w-4 h-4" />
                  {t('pages.blog')}
                </Link>
                <Link to="/docs" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <FileText className="w-4 h-4" />
                  {t('pages.docs')}
                </Link>
                <Link to="/api" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Code className="w-4 h-4" />
                  {t('pages.api')}
                </Link>
                <a 
                  href="https://github.com/BackCheck/justice-unveiled" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};
