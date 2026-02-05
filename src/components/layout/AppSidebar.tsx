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
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { GreetingBanner } from "@/components/GreetingBanner";
import hrpmLogo from "@/assets/human-rights-logo.svg";
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
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const { user, profile, signOut } = useAuth();
  const { role, canEdit, canUpload, isAdmin } = useUserRole();
  const collapsed = state === "collapsed";

  const mainNavItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/investigations", label: t('nav.investigations'), icon: Target },
    { path: "/cases", label: t('nav.cases'), icon: FolderOpen },
    { path: "/timeline", label: t('nav.timeline'), icon: Clock },
    { path: "/dashboard", label: t('nav.dashboard'), icon: BarChart3 },
    { path: "/intel-briefing", label: t('nav.briefing'), icon: BookOpen },
    { path: "/network", label: t('nav.network'), icon: Network },
    { path: "/watchlist", label: t('nav.watchlist'), icon: Eye },
  ];

  const analysisNavItems = [
    { path: "/reconstruction", label: t('nav.reconstruction'), icon: GitBranch },
    { path: "/correlation", label: t('nav.correlation'), icon: Scale },
    { path: "/compliance", label: t('nav.compliance'), icon: ClipboardCheck },
    { path: "/regulatory-harm", label: t('nav.harm'), icon: TrendingDown },
    { path: "/legal-intelligence", label: t('nav.legal'), icon: Gavel },
    { path: "/analyze", label: t('nav.aiAnalyzer'), icon: Brain },
    { path: "/evidence", label: t('nav.evidence'), icon: FileText },
    { path: "/international", label: t('nav.international'), icon: Scale },
  ];

  const contentNavItems = [
    { path: "/case-law", label: t('nav.caseLaw'), icon: Gavel },
    { path: "/blog", label: t('nav.blog'), icon: BookOpen },
    { path: "/news", label: t('nav.news'), icon: Newspaper },
  ];

  const systemNavItems = [
    { path: "/uploads", label: t('nav.uploads'), icon: Upload },
    { path: "/about", label: t('nav.about'), icon: Info },
  ];

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
    toast.success(t('common.signedOutSuccess'));
    navigate("/auth");
  };

  const NavItem = ({ item, index = 0 }: { item: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }; index?: number }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.label}>
          <Link 
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 group/item",
              active 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/20 hover:translate-x-1"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Icon className={cn(
              "h-5 w-5 shrink-0 transition-all duration-300",
              active && "text-primary",
              !active && "group-hover/item:scale-110"
            )} />
            <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
            {active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar overflow-hidden">
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
              {collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 overflow-y-auto overflow-x-hidden">
        {/* Time-based Greeting - Compact version for sidebar */}
        {!collapsed && (
          <div className="mb-4 px-2">
            <GreetingBanner compact showIcon />
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            {t('sidebar.main')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analysis */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            {t('sidebar.analysis')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content & Resources */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            {t('sidebar.content')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            {t('sidebar.system')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
              {/* Admin Panel - only visible to admins */}
              {isAdmin && (
                <NavItem item={{ path: "/admin", label: t('nav.admin'), icon: Shield }} />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 p-2">
        {/* Language & Theme Toggle */}
        <div className={cn("flex items-center gap-2 px-2 py-1", collapsed ? "justify-center flex-col" : "justify-between")}>
          {!collapsed && (
            <span className="text-xs text-muted-foreground">{t('sidebar.settings')}</span>
          )}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* User Profile Section - Show Sign In for guests */}
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
                {t('common.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                {t('common.settings')}
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
                <span className="text-xs text-muted-foreground">{t('common.optional')}</span>
              </div>
            )}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
