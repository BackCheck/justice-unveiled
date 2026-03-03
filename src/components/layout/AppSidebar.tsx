import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Clock,
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
  Rocket,
  Radar,
  PlusCircle,
  FilePlus,
  UploadCloud,
  BookMarked,
  BarChart3,
  Globe,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ── Navigation groups ──────────────────────────────────────────────

const exploreItems = [
  { path: "/", labelKey: "Home", icon: Home },
  { path: "/cases", labelKey: "Case Library", icon: FolderOpen },
  { path: "/timeline", labelKey: "Timeline", icon: Clock },
  { path: "/blog", labelKey: "Blog & News", icon: Newspaper },
];

const contributeItems = [
  { path: "/submit-case", labelKey: "Submit a Case", icon: PlusCircle },
  { path: "/uploads", labelKey: "Upload Center", icon: UploadCloud },
];

const analyzeItems = [
  { path: "/analyze", labelKey: "AI Analyzer", icon: Brain },
  { path: "/evidence", labelKey: "Evidence Matrix", icon: FileText },
  { path: "/network", labelKey: "Entity Network", icon: Network },
  { path: "/correlation", labelKey: "Claim Correlation", icon: Scale },
  { path: "/reconstruction", labelKey: "Reconstruction", icon: GitBranch },
  { path: "/legal-intelligence", labelKey: "Legal Intelligence", icon: Gavel },
  { path: "/legal-research", labelKey: "Legal Research", icon: Search },
  { path: "/compliance", labelKey: "Compliance Checker", icon: ClipboardCheck },
  { path: "/threat-profiler", labelKey: "Threat Profiler", icon: Shield },
  { path: "/regulatory-harm", labelKey: "Economic Harm", icon: TrendingDown },
  { path: "/international", labelKey: "International Rights", icon: Globe },
  { path: "/investigations", labelKey: "Investigation Hub", icon: Target },
  { path: "/analysis-history", labelKey: "Analysis History", icon: Clock },
  { path: "/osint-toolkit", labelKey: "OSINT Toolkit", icon: Radar },
  { path: "/reports", labelKey: "Report Center", icon: BarChart3 },
  { path: "/intel-briefing", labelKey: "Intel Briefing", icon: BookOpen },
];

const learnItems = [
  { path: "/how-to-use", labelKey: "How to Use", icon: HelpCircle },
  { path: "/docs", labelKey: "Documentation", icon: BookMarked },
  { path: "/api", labelKey: "Developer API", icon: Code },
  { path: "/changelog", labelKey: "Changelog", icon: Rocket },
  { path: "/about", labelKey: "About", icon: Info },
  { path: "/contact", labelKey: "Contact", icon: Phone },
];

const adminItems = [
  { path: "/admin", labelKey: "Admin Panel", icon: Shield },
  { path: "/admin/entity-review", labelKey: "Entity Review", icon: Eye },
];

type NavItem = { path: string; labelKey: string; icon: React.ComponentType<{ className?: string }> };

interface NavGroupDef {
  label: string;
  items: NavItem[];
  defaultOpen: boolean;
  adminOnly?: boolean;
}

const navGroups: NavGroupDef[] = [
  { label: "Explore", items: exploreItems, defaultOpen: true },
  { label: "Contribute", items: contributeItems, defaultOpen: true },
  { label: "Analyze", items: analyzeItems, defaultOpen: false },
  { label: "Learn", items: learnItems, defaultOpen: false },
  { label: "Admin", items: adminItems, defaultOpen: false, adminOnly: true },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, toggleSidebar } = useSidebar();
  const { user, profile, signOut } = useAuth();
  const { role, isAdmin } = useUserRole();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

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

  const isGroupActive = (items: NavItem[]) =>
    items.some((item) => isActive(item.path));

  const NavItemRow = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.labelKey}>
          <Link
            to={item.path}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
              active
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active && "text-primary"
              )}
            />
            <span className={cn("truncate text-sm", collapsed && "sr-only")}>
              {item.labelKey}
            </span>
            {active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar h-screen max-h-screen flex flex-col"
    >
      <SidebarHeader className="border-b border-border/30 p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-professional shrink-0 overflow-hidden">
              <img
                src={hrpmLogo}
                alt="HRPM Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-xl font-bold text-primary tracking-tight leading-none">
                  HRPM
                </span>
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
                className={cn(
                  "h-8 w-8 shrink-0 hover:bg-accent/50",
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
        {navGroups.map((group) => {
          if (group.adminOnly && !isAdmin) return null;
          const groupActive = isGroupActive(group.items);

          return (
            <SidebarGroup key={group.label} className="mb-1">
              {collapsed ? (
                <>
                  <SidebarGroupLabel className="sr-only">
                    {group.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <NavItemRow key={item.path} item={item} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </>
              ) : (
                <Collapsible defaultOpen={group.defaultOpen || groupActive}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md hover:bg-accent/10 group/trigger">
                    <span className="flex items-center gap-2">
                      {group.label}
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
                          <NavItemRow key={item.path} item={item} />
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 p-2 shrink-0">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1",
            collapsed ? "justify-center flex-col" : "justify-between"
          )}
        >
          {!collapsed && (
            <span className="text-xs text-muted-foreground">Settings</span>
          )}
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/watchlist")}
              >
                <Eye className="mr-2 h-4 w-4" />
                My Watchlist
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/about")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
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
                <span className="text-xs text-muted-foreground">
                  Required to contribute
                </span>
              </div>
            )}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
