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
import { Sparkles, FileText, Github, Newspaper, Code, Phone, Mail, MapPin, BookOpen, History } from "lucide-react";
import { CaseSelector } from "./CaseSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import hrpmLogo from "@/assets/human-rights-logo.png";

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

  const { data: recentPosts } = useQuery({
    queryKey: ["recent-blog-posts-footer"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("title, slug")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        {/* Ambient background glow - hidden on mobile for performance */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden hidden sm:block">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>
        
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
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
                  <CaseSelector />
                </div>
              )}

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <GlobalSearch />
                <div className="hidden sm:block">
                  <QuickActions />
                </div>
                <NotificationCenter />
              </div>
            </div>

            {!isHomePage && (
              <div className="hidden sm:block px-4 pb-2 pt-0">
                <Breadcrumbs />
              </div>
            )}
          </header>

          <main className="flex-1">{children}</main>
          
          {/* Enhanced Footer */}
          <footer className="border-t border-border/30 bg-card/30 backdrop-blur py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Brand */}
                <div className="col-span-2 sm:col-span-1 space-y-3">
                  <div className="flex items-center gap-2.5 group">
                    <img src={hrpmLogo} alt="HRPM Logo" className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-110" />
                    <div>
                      <p className="font-semibold text-foreground text-sm sm:text-base">HRPM.org</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Open-Source · Non-Profit</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <span className="block font-medium text-foreground/80 mb-0.5">{t('footer.tagline')}</span>
                    {t('footer.description')}
                  </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">{t('footer.quickLinks')}</h4>
                  <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-muted-foreground">
                    <Link to="/who-what-why" className="hover:text-primary transition-colors">{t('nav.about')}</Link>
                    <Link to="/how-to-use" className="hover:text-primary transition-colors flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {t('footer.howToUse')}
                    </Link>
                    <Link to="/cases" className="hover:text-primary transition-colors">{t('cases.title')}</Link>
                    <Link to="/docs" className="hover:text-primary transition-colors flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {t('pages.docs')}
                    </Link>
                    <Link to="/api" className="hover:text-primary transition-colors flex items-center gap-1">
                      <Code className="w-3 h-3" /> {t('pages.api')}
                    </Link>
                    <Link to="/changelog" className="hover:text-primary transition-colors flex items-center gap-1">
                      <History className="w-3 h-3" /> Changelog
                    </Link>
                    <a href="https://github.com/BackCheck/justice-unveiled" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                      <Github className="w-3 h-3" /> {t('footer.openSource')}
                    </a>
                  </div>
                </div>

                {/* Recent Posts */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">{t('footer.recentPosts')}</h4>
                  <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-muted-foreground">
                    {recentPosts && recentPosts.length > 0 ? (
                      recentPosts.map((post) => (
                        <Link key={post.slug} to={`/blog/${post.slug}`} className="hover:text-primary transition-colors line-clamp-1">
                          {post.title}
                        </Link>
                      ))
                    ) : (
                      <Link to="/blog" className="hover:text-primary transition-colors">{t('footer.visitBlog')}</Link>
                    )}
                    <Link to="/blog" className="text-primary hover:text-primary/80 transition-colors font-medium mt-1">
                      {t('footer.viewAllPosts')} →
                    </Link>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">{t('footer.contact')}</h4>
                  <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-primary shrink-0" />
                      <span>+65 31 290 390</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-primary shrink-0" />
                      <a href="mailto:info@hrpm.org" className="hover:text-primary transition-colors">info@hrpm.org</a>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-foreground/80">{t('footer.headOffice')}</p>
                        <p className="text-[11px] sm:text-xs">36 Robinson Road, #20-01 City House, Singapore 068877</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="mt-8 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  © {new Date().getFullYear()} Human Rights Protection Movement. Open-source & non-profit. {t('footer.copyright')}
                </p>
                <div className="flex items-center gap-4 text-[10px] sm:text-xs text-muted-foreground">
                  <Link to="/who-what-why" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
                  <Link to="/who-what-why" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};
