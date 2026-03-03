import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FolderOpen,
  Clock,
  Newspaper,
  PlusCircle,
  UploadCloud,
  Brain,
  HelpCircle,
  BookMarked,
  Code,
  Rocket,
  Info,
  Phone,
  Shield,
  Eye,
  LogOut,
  LogIn,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import hrpmLogo from "@/assets/human-rights-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// ── Navigation groups ──────────────────────────────────────────────

type NavItem = { path: string; label: string; icon: React.ComponentType<{ className?: string }> };

const exploreItems: NavItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/cases", label: "Case Library", icon: FolderOpen },
  { path: "/timeline", label: "Timeline", icon: Clock },
  { path: "/blog", label: "Blog & News", icon: Newspaper },
];

const contributeItems: NavItem[] = [
  { path: "/submit-case", label: "Submit a Case", icon: PlusCircle },
  { path: "/uploads", label: "Upload Center", icon: UploadCloud },
];

const analyzeItems: NavItem[] = [
  { path: "/analyze", label: "Analyze Hub", icon: Brain },
];

const learnItems: NavItem[] = [
  { path: "/how-to-use", label: "How to Use", icon: HelpCircle },
  { path: "/docs", label: "Documentation", icon: BookMarked },
  { path: "/api", label: "Developer API", icon: Code },
  { path: "/changelog", label: "Changelog", icon: Rocket },
  { path: "/about", label: "About", icon: Info },
  { path: "/contact", label: "Contact", icon: Phone },
];

const adminItems: NavItem[] = [
  { path: "/admin", label: "Admin Panel", icon: Shield },
  { path: "/admin/entity-review", label: "Entity Review", icon: Eye },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const { user, profile, signOut } = useAuth();
  const { role, isAdmin } = useUserRole();
  const collapsed = state === "collapsed";
  const [learnOpen, setLearnOpen] = useState(false);

  // Auto-open Learn group when navigating to a Learn route
  const isOnLearnRoute = learnItems.some((item) => isActive(item.path));
  useEffect(() => {
    if (isOnLearnRoute && !learnOpen) setLearnOpen(true);
  }, [isOnLearnRoute]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

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

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton asChild tooltip={item.label}>
          <Link
            to={item.path}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
              active
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active && "text-primary")} />
            <span className={cn("truncate text-sm", collapsed && "sr-only")}>{item.label}</span>
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup key={label} className="mb-1">
      {collapsed ? (
        <SidebarGroupLabel className="sr-only">{label}</SidebarGroupLabel>
      ) : (
        <SidebarGroupLabel className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>{items.map(renderNavItem)}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar h-screen max-h-screen flex flex-col"
    >
      {/* ── Brand header ── */}
      <SidebarHeader className="border-b border-border/30 p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
              <img src={hrpmLogo} alt="HRPM Logo" className="w-8 h-8 object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-xl font-bold text-primary tracking-tight leading-none">HRPM</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase mt-0.5 truncate">
                  Open-Source · Non-Profit
                </span>
              </div>
            )}
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn("h-8 w-8 shrink-0 hover:bg-accent/50", collapsed && "mx-auto")}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      {/* ── Navigation groups ── */}
      <SidebarContent className="px-2 py-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
        {renderGroup("Explore", exploreItems)}
        {renderGroup("Contribute", contributeItems)}
        {renderGroup("Analyze", analyzeItems)}

        {/* Learn — collapsed by default */}
        <SidebarGroup className="mb-1">
          {collapsed ? (
            <>
              <SidebarGroupLabel className="sr-only">Learn</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{learnItems.map(renderNavItem)}</SidebarMenu>
              </SidebarGroupContent>
            </>
          ) : (
            <Collapsible open={learnOpen} onOpenChange={setLearnOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Learn
                {learnOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>{learnItems.map(renderNavItem)}</SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          )}
        </SidebarGroup>

        {/* Admin — role-gated */}
        {isAdmin && renderGroup("Admin", adminItems)}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-border/30 p-2 shrink-0">
        <div className={cn("flex items-center gap-2 px-2 py-1", collapsed ? "justify-center flex-col" : "justify-between")}>
          {!collapsed && <span className="text-xs text-muted-foreground">Settings</span>}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg p-2 transition-all duration-200",
                  "hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  collapsed && "justify-center"
                )}
              >
                <Avatar className="h-9 w-9 shrink-0 border-2 border-primary/20">
                  <AvatarImage src={avatarUrl} alt="User avatar" />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate w-full">{displayName}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">{userRoleDisplay}</span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align={collapsed ? "center" : "start"} className="w-56 mb-2">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
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
          <Link
            to="/auth"
            className={cn(
              "flex items-center gap-3 w-full rounded-lg p-2 transition-all duration-200",
              "hover:bg-primary/10 text-muted-foreground hover:text-primary",
              collapsed && "justify-center"
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
              <LogIn className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-medium">Sign In</span>
                <span className="text-xs text-muted-foreground">Required to contribute</span>
              </div>
            )}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
