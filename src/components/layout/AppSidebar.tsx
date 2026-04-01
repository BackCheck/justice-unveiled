import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FolderOpen,
  Clock,
  Newspaper,
  Plus,
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
  FileText,
  Network,
  Scale,
  AlertTriangle,
  Search,
  GitBranch,
  ClipboardCheck,
  TrendingUp,
  FileWarning,
  Crosshair,
  Globe,
  Gavel,
  BarChart3,
  Folder,
  Accessibility,
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
import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

// ── Navigation groups ──────────────────────────────────────────────

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "secondary" | "outline";
};

// ─── Quick Access ───
const quickAccessItems: NavItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Intel Dashboard", icon: BarChart3 },
  { path: "/cases", label: "Case Library", icon: FolderOpen },
];

// ─── Build Your Case (primary user workflow) ───
const buildCaseItems: NavItem[] = [
  { path: "/submit-case", label: "Submit New Case", icon: FileText },
  { path: "/evidence/new", label: "Add Evidence", icon: Plus, badge: "New", badgeVariant: "default" },
  { path: "/uploads", label: "Upload Center", icon: UploadCloud },
  { path: "/evidence", label: "Evidence Matrix", icon: Folder },
  { path: "/analyze", label: "Analyze Documents", icon: Brain, badge: "AI", badgeVariant: "secondary" },
  { path: "/timeline", label: "Timeline", icon: Clock },
  { path: "/network", label: "Entity Network", icon: Network },
];

// ─── Analyze & Investigate ───
const analyzeItems: NavItem[] = [
  { path: "/investigations", label: "Investigations", icon: Search },
  { path: "/reconstruction", label: "Reconstruction", icon: GitBranch },
  { path: "/correlation", label: "Claim Correlation", icon: Crosshair },
  { path: "/threat-profiler", label: "Threat Profiler", icon: AlertTriangle },
  { path: "/osint-toolkit", label: "OSINT Toolkit", icon: Terminal },
];

// ─── Legal & Compliance ───
const legalItems: NavItem[] = [
  { path: "/compliance", label: "Compliance Audit", icon: ClipboardCheck },
  { path: "/legal-intelligence", label: "Legal Intelligence", icon: Scale },
  { path: "/legal-research", label: "Statute Browser", icon: Gavel },
  { path: "/regulatory-harm", label: "Harm Assessment", icon: FileWarning },
  { path: "/international", label: "Int'l Frameworks", icon: Globe },
];

// ─── Reports & Intel ───
const reportsItems: NavItem[] = [
  { path: "/reports", label: "Report Center", icon: FileText },
  { path: "/intel-briefing", label: "Intel Briefing", icon: TrendingUp },
  { path: "/blog", label: "Blog & News", icon: Newspaper },
];

// ─── Learn & Help ───
const learnItems: NavItem[] = [
  { path: "/how-to-use", label: "How to Use", icon: HelpCircle },
  { path: "/docs", label: "Documentation", icon: BookMarked },
  { path: "/api", label: "Developer API", icon: Code },
  { path: "/changelog", label: "Changelog", icon: Rocket },
  { path: "/about", label: "About", icon: Info },
  { path: "/contact", label: "Contact", icon: Phone },
];

// ─── Admin ───
const adminItems: NavItem[] = [
  { path: "/admin", label: "Admin Panel", icon: Shield },
  { path: "/admin/entity-review", label: "Entity Review", icon: Eye },
];

// Collapsible group definitions
type CollapsibleGroup = {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
  accentColor?: string;
};

export function AppSidebar() {
  const location = useLocation();
  const { state, setOpen } = useSidebar();
  const { isAdmin } = useUserRole();
  const collapsed = state === "collapsed";
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Quick Access": true,
    "Build Case": true,
    "Analyze": false,
    "Legal": false,
    "Reports": false,
    "Learn": false,
  });

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Auto-open the group containing the active route
  const collapsibleGroups: CollapsibleGroup[] = [
    { label: "Build Case", items: buildCaseItems, defaultOpen: true, accentColor: "text-primary" },
    { label: "Analyze", items: analyzeItems, accentColor: "text-chart-2" },
    { label: "Legal", items: legalItems, accentColor: "text-chart-4" },
    { label: "Reports", items: reportsItems, accentColor: "text-chart-1" },
    { label: "Learn", items: learnItems },
  ];

  useEffect(() => {
    for (const group of collapsibleGroups) {
      if (group.items.some((item) => isActive(item.path))) {
        setOpenGroups((prev) => ({ ...prev, [group.label]: true }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
                ? "text-primary bg-primary/10 shadow-sm shadow-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active && "text-primary")} />
            <span className={cn("truncate text-sm", collapsed && "sr-only")}>{item.label}</span>
            {item.badge && !collapsed && (
              <Badge
                variant={item.badgeVariant || "default"}
                className="ml-auto text-[10px] px-1.5 py-0 h-4 font-medium"
              >
                {item.badge}
              </Badge>
            )}
            {active && !item.badge && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Always-open group (no collapsible)
  const renderStaticGroup = (label: string, items: NavItem[]) => (
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

  // Collapsible group
  const renderCollapsibleGroup = (group: CollapsibleGroup) => {
    const isOpen = openGroups[group.label] ?? group.defaultOpen ?? false;
    const hasActive = group.items.some((item) => isActive(item.path));

    return (
      <SidebarGroup key={group.label} className="mb-1">
        {collapsed ? (
          <>
            <SidebarGroupLabel className="sr-only">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{group.items.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </>
        ) : (
          <Collapsible open={isOpen} onOpenChange={() => toggleGroup(group.label)}>
            <CollapsibleTrigger
              className={cn(
                "flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors rounded-md",
                hasActive
                  ? cn("text-primary", group.accentColor)
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-1.5">
                {group.label}
                {hasActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </span>
              {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{group.items.map(renderNavItem)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        )}
      </SidebarGroup>
    );
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpen(true), 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpen(false), 300);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/30 h-screen max-h-screen flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="px-2 py-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
        {/* Quick Access — always visible */}
        {renderStaticGroup("Quick Access", quickAccessItems)}

        {/* Separator */}
        {!collapsed && (
          <div className="mx-3 my-1 border-t border-border/20" />
        )}

        {/* Collapsible workflow groups */}
        {collapsibleGroups.map(renderCollapsibleGroup)}

        {/* Admin — role-gated */}
        {isAdmin && (
          <>
            {!collapsed && <div className="mx-3 my-1 border-t border-border/20" />}
            {renderStaticGroup("Admin", adminItems)}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
