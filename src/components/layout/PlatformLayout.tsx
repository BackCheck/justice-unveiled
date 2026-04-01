import { ReactNode, lazy, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, LogOut, LogIn, Eye, ChevronDown } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { CaseSelector } from "./CaseSelector";
import SiteFooter from "./SiteFooter";
import hrpmLogo from "@/assets/human-rights-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const GlobalSearch = lazy(() => import("./GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const NotificationCenter = lazy(() => import("./NotificationCenter").then(m => ({ default: m.NotificationCenter })));

interface PlatformLayoutProps {
  children: ReactNode;
}

export const PlatformLayout = ({ children }: PlatformLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { role } = useUserRole();
  const isHomePage = location.pathname === "/" || location.pathname === "";

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const userRoleDisplay = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Analyst";
  const userEmail = user?.email || "";
  const avatarUrl = profile?.avatar_url || "";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <SidebarProvider defaultOpen={false}>
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

              {/* Case Selector — prominent and always visible */}
              <CaseSelector />

              {/* Center: global search */}
              <div className="flex-1 flex justify-center min-w-0">
                <div className="w-full max-w-md">
                  <Suspense fallback={null}><GlobalSearch /></Suspense>
                </div>
              </div>

              {/* Right: settings + notifications + profile */}
              <div className="flex items-center gap-1.5 shrink-0">

                <LanguageSwitcher />
                <ThemeToggle />

                <Suspense fallback={null}><NotificationCenter /></Suspense>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <Avatar className="h-7 w-7 border-2 border-primary/20">
                          <AvatarImage src={avatarUrl} alt="User avatar" />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">{displayName}</span>
                        <ChevronDown className="hidden sm:block h-3 w-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRoleDisplay}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/watchlist")}>
                        <Eye className="mr-2 h-4 w-4" /> My Watchlist
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <Link to="/auth">
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In
                    </Link>
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
