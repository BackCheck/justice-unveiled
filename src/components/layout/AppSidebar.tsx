import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Clock, 
  BarChart3, 
  BookOpen, 
  Network, 
  FileText, 
  Scale, 
  Upload, 
  Info,
  User,
  Settings,
  LogOut,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Shield,
  Home,
  Brain,
  FolderOpen,
  Target,
  Eye,
  GitBranch,
  ClipboardCheck,
  TrendingDown,
  Gavel,
  Newspaper,
  Phone,
  HelpCircle,
  Code,
  Search,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { GreetingBanner } from "@/components/GreetingBanner";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const coreNavItems = [
  { path: "/", labelKey: "nav.home", icon: Home },
  { path: "/cases", labelKey: "nav.caseFiles", icon: FolderOpen },
  { path: "/timeline", labelKey: "nav.timeline", icon: Clock },
  { path: "/dashboard", labelKey: "nav.intelDashboard", icon: BarChart3 },
  { path: "/network", labelKey: "nav.entityNetwork", icon: Network },
];

const investigationNavItems = [
  { path: "/investigations", labelKey: "nav.investigations", icon: Target },
  { path: "/analyze", labelKey: "nav.aiAnalyzer", icon: Brain },
  { path: "/threat-profiler", labelKey: "nav.threatProfiler", icon: Shield },
  { path: "/evidence", labelKey: "nav.evidenceMatrix", icon: FileText },
  { path: "/watchlist", labelKey: "nav.watchlist", icon: Eye },
];

const analysisNavItems = [
  { path: "/reconstruction", labelKey: "nav.reconstruction", icon: GitBranch },
  { path: "/correlation", labelKey: "nav.correlation", icon: Scale },
  { path: "/compliance", labelKey: "nav.complianceChecker", icon: ClipboardCheck },
  { path: "/regulatory-harm", labelKey: "nav.harm", icon: TrendingDown },
  { path: "/legal-intelligence", labelKey: "nav.legal", icon: Gavel },
  { path: "/international", labelKey: "nav.international", icon: Scale },
  { path: "/legal-research", labelKey: "nav.legalResearch", icon: Search },
];

const resourcesNavItems = [
  { path: "/intel-briefing", labelKey: "nav.intelBriefing", icon: BookOpen },
  { path: "/blog", labelKey: "nav.blogNews", icon: Newspaper },
  { path: "/changelog", labelKey: "nav.changelog", icon: Rocket },
  { path: "/docs", labelKey: "nav.documentation", icon: FileText },
  { path: "/api", labelKey: "nav.developerApi", icon: Code },
  { path: "/how-to-use", labelKey: "nav.howToUse", icon: HelpCircle },
];

const systemNavItems = [
  { path: "/uploads", labelKey: "nav.uploads", icon: Upload },
  { path: "/about", labelKey: "nav.about", icon: Info },
  { path: "/contact", labelKey: "nav.contact", icon: Phone },
];

const navGroups = [
  { labelKey: "nav.core", items: coreNavItems, defaultOpen: true },
  { labelKey: "nav.investigation", items: investigationNavItems, defaultOpen: true },
  { labelKey: "nav.analysis", items: analysisNavItems, defaultOpen: false },
  { labelKey: "nav.resources", items: resourcesNavItems, defaultOpen: false },
  { labelKey: "nav.system", items: systemNavItems, defaultOpen: false },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, toggleSidebar } = useSidebar();
  const { user, profile, signOut } = useAuth();
  const { role, canEdit, canUpload, isAdmin } = useUserRole();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  // Get user display info
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const userRoleDisplay = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Analyst";
  const userEmail = user?.email || "";
  const avatarUrl = profile?.avatar_url || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  // Check if any item in a group is active
  const isGroupActive = (items: typeof coreNavItems) => 
    items.some(item => isActive(item.path));

  const NavItem = ({ item }: { item: { path: string; labelKey: string; icon: React.ComponentType<{ className?: string }> } }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const label = t(item.labelKey);
    
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={label}>
          <Link 
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 group/item",
              active 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
            )}
          >
            <Icon className={cn(
              "h-4 w-4 shrink-0 transition-colors duration-200",
              active && "text-primary"
            )} />
            <span className={cn("truncate text-sm", collapsed && "sr-only")}>{label}</span>
            {active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar h-screen max-h-screen flex flex-col">
      <SidebarHeader className="border-b border-border/30 p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-professional transition-all duration-300 group-hover:shadow-professional-lg group-hover:scale-105 shrink-0 overflow-hidden">
              <img src={hrpmLogo} alt="HRPM Logo" className="w-8 h-8 object-contain transition-transform duration-500 group-hover:scale-110" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-xl font-bold text-primary tracking-tight leading-none">HRPM</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase mt-0.5 truncate">
                  Human Rights Protection
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
                className={cn(
                  "h-8 w-8 shrink-0 transition-all duration-200 hover:bg-accent/50",
                  collapsed && "mx-auto"
                )}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
        {/* Greeting */}
        {!collapsed && (
          <div className="mb-3 px-2">
            <GreetingBanner compact showIcon />
          </div>
        )}

        {/* Nav Groups with Collapsible sections */}
        {navGroups.map((group) => {
          const groupActive = isGroupActive(group.items);
          const groupLabel = t(group.labelKey);
          return (
            <SidebarGroup key={group.labelKey} className="mb-1">
              {collapsed ? (
                <>
                  <SidebarGroupLabel className="sr-only">{groupLabel}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <NavItem key={item.path} item={item} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </>
              ) : (
                <Collapsible defaultOpen={group.defaultOpen || groupActive}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md hover:bg-accent/10 group/trigger">
                    <span className="flex items-center gap-2">
                      {groupLabel}
                      {groupActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </span>
                    <ChevronRight className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu className="mt-1">
                        {group.items.map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarGroup>
          );
        })}

        {/* Admin - only visible to admins */}
        {isAdmin && (
          <SidebarGroup className="mb-1">
            <SidebarGroupLabel className={cn("text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
              {t('nav.admin')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem item={{ path: "/admin", labelKey: "nav.admin", icon: Shield }} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 p-2 shrink-0">
        {/* Language & Theme Toggle */}
        <div className={cn("flex items-center gap-2 px-2 py-1", collapsed ? "justify-center flex-col" : "justify-between")}>
          {!collapsed && (
            <span className="text-xs text-muted-foreground">{t('nav.settings')}</span>
          )}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* User Profile Section */}
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
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate w-full">
                        {displayName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {userRoleDisplay}
                      </span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="top" 
              align={collapsed ? "center" : "start"}
              className="w-56 mb-2"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('common.signOut')}
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
                <span className="text-sm font-medium">{t('common.signIn')}</span>
                <span className="text-xs text-muted-foreground">{t('pages.optional')}</span>
              </div>
            )}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
