import { ReactNode, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SiteFooter from "./SiteFooter";
import hrpmLogo from "@/assets/human-rights-logo.png";

const GlobalSearch = lazy(() => import("./GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const NotificationCenter = lazy(() => import("./NotificationCenter").then(m => ({ default: m.NotificationCenter })));

interface PlatformLayoutProps {
  children: ReactNode;
}

export const PlatformLayout = ({ children }: PlatformLayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isHomePage = location.pathname === "/" || location.pathname === "";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <ScrollProgressBar />

          {/* ── Header ── */}
          <header className="sticky top-0 z-40 glass-header border-b border-border/30">
            <div className="px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-3">
              {/* Left: sidebar trigger + logo */}
              <SidebarTrigger className="h-8 w-8 hover-glow-primary rounded-lg shrink-0" />
              <Link to="/" className="hidden sm:flex items-center gap-2 shrink-0">
                <img src={hrpmLogo} alt="HRPM" className="w-7 h-7" />
                <span className="font-bold text-primary text-lg tracking-tight">HRPM</span>
              </Link>

              {/* Center: global search */}
              <div className="flex-1 flex justify-center min-w-0">
                <div className="w-full max-w-md">
                  <Suspense fallback={null}><GlobalSearch /></Suspense>
                </div>
              </div>

              {/* Right: CTAs + user */}
              <div className="flex items-center gap-2 shrink-0">
                <Button asChild size="sm" className="hidden sm:flex gap-1.5 h-8 text-xs">
                  <Link to="/submit-case">
                    <PlusCircle className="w-3.5 h-3.5" />
                    Submit a Case
                  </Link>
                </Button>
                <Suspense fallback={null}><NotificationCenter /></Suspense>
                {!user && (
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Breadcrumb on content pages */}
            {!isHomePage && (
              <div className="hidden sm:block px-4 pb-2 pt-0">
                <Breadcrumbs />
              </div>
            )}
          </header>

          <main className="flex-1">{children}</main>
          <SiteFooter compact />
        </div>
      </div>
    </SidebarProvider>
  );
};
