import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { QuickActions } from "./QuickActions";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationCenter } from "./NotificationCenter";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Github, Newspaper, Code } from "lucide-react";

interface PlatformLayoutProps {
  children: ReactNode;
}

// Page titles for header context
const pageTitles: Record<string, { title: string; subtitle?: string; isAI?: boolean }> = {
  "/": { title: "Home" },
  "/timeline": { title: "Investigative Timeline", subtitle: "Chronological event documentation" },
  "/dashboard": { title: "Intel Dashboard", subtitle: "Analytics & key findings" },
  "/intel-briefing": { title: "Intelligence Briefing", subtitle: "Synthesized case intelligence" },
  "/network": { title: "Entity Network", subtitle: "Relationship mapping" },
  "/investigations": { title: "Investigation Hub", subtitle: "AI-powered analysis tools", isAI: true },
  "/cases": { title: "Case Files", subtitle: "Investigation directory" },
  "/analyze": { title: "AI Document Analyzer", subtitle: "Extract intelligence from evidence", isAI: true },
  "/evidence": { title: "Evidence Matrix", subtitle: "Source cross-reference system" },
  "/international": { title: "International Rights Audit", subtitle: "UN framework compliance" },
  "/uploads": { title: "Document Uploads", subtitle: "Evidence management" },
  "/about": { title: "About HRPM", subtitle: "Mission & values" },
  "/admin": { title: "Admin Panel", subtitle: "System administration" },
  "/auth": { title: "Authentication", subtitle: "Sign in or create account" },
  "/reconstruction": { title: "Event Reconstruction", subtitle: "Timeline reconstruction & contradictions" },
  "/correlation": { title: "Claim Correlation", subtitle: "Evidence-claim mapping" },
  "/compliance": { title: "Compliance Checker", subtitle: "Procedural compliance audit" },
  "/regulatory-harm": { title: "Economic Harm", subtitle: "Financial impact tracking" },
  "/legal-intelligence": { title: "Legal Intelligence", subtitle: "Statutes, precedents & doctrines", isAI: true },
  "/legal-research": { title: "Legal Research", subtitle: "Search case law & statutes" },
  "/threat-profiler": { title: "Threat Profiler", subtitle: "Entity threat assessment", isAI: true },
  "/watchlist": { title: "My Watchlist", subtitle: "Tracked entities & events" },
  "/blog": { title: "Blog & News", subtitle: "Articles and updates" },
  "/docs": { title: "Documentation", subtitle: "Platform documentation" },
  "/api": { title: "Developer API", subtitle: "API reference" },
  "/how-to-use": { title: "How to Use", subtitle: "Getting started guide" },
  "/contact": { title: "Contact", subtitle: "Get in touch" },
};

export const PlatformLayout = ({ children }: PlatformLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const pageInfo = pageTitles[currentPath] || { title: "HRPM" };
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
                      <h1 className="font-semibold text-foreground truncate">{pageInfo.title}</h1>
                      {pageInfo.isAI && (
                        <Badge variant="secondary" className="gap-1 h-5 px-1.5 text-[10px] shrink-0">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </Badge>
                      )}
                    </div>
                    {pageInfo.subtitle && (
                      <span className="text-xs text-muted-foreground truncate">{pageInfo.subtitle}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1" />

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
                  Blog
                </Link>
                <Link to="/docs" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <FileText className="w-4 h-4" />
                  Docs
                </Link>
                <Link to="/api" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Code className="w-4 h-4" />
                  API
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
