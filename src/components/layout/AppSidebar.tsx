import { Link, useLocation } from "react-router-dom";
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
  ChevronUp,
  ChevronDown,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const { state } = useSidebar();
  const { isAdmin } = useUserRole();
  const collapsed = state === "collapsed";
  const [learnOpen, setLearnOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Auto-open Learn group when navigating to a Learn route
  const isOnLearnRoute = learnItems.some((item) => isActive(item.path));
  useEffect(() => {
    if (isOnLearnRoute && !learnOpen) setLearnOpen(true);
  }, [isOnLearnRoute]);

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
    </Sidebar>
  );
}
