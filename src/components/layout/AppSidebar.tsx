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
  Sparkles,
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
import { motion, AnimatePresence } from "framer-motion";
import hrpmLogo from "@/assets/human-rights-logo.png";

// ── Navigation groups ──────────────────────────────────────────────

type NavItem = { path: string; label: string; icon: React.ComponentType<{ className?: string }> };

const exploreItems: NavItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/cases", label: "Case Library", icon: FolderOpen },
  { path: "/timeline", label: "Timeline", icon: Clock },
  { path: "/blog", label: "Blog & News", icon: Newspaper },
];

const contributeItems: NavItem[] = [
  { path: "/evidence/new", label: "Contribute Evidence", icon: Plus },
  { path: "/uploads", label: "Upload Center", icon: UploadCloud },
];

const analyzeItems: NavItem[] = [
  { path: "/analyze", label: "Analyze Hub", icon: Brain },
  { path: "/osint-commands", label: "OSINT Commands", icon: Terminal },
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

  const isOnLearnRoute = learnItems.some((item) => isActive(item.path));
  useEffect(() => {
    if (isOnLearnRoute && !learnOpen) setLearnOpen(true);
  }, [isOnLearnRoute]);

  const renderNavItem = (item: NavItem, index: number) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton asChild tooltip={item.label}>
          <Link
            to={item.path}
            className={cn(
              "group/navitem relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 overflow-hidden",
              active
                ? "text-primary-foreground"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
            )}
          >
            {/* Active background with glow */}
            {active && (
              <motion.div
                layoutId="sidebar-active-pill"
                className="absolute inset-0 rounded-xl bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}

            {/* Hover background */}
            {!active && (
              <span className="absolute inset-0 rounded-xl bg-sidebar-accent/0 group-hover/navitem:bg-sidebar-accent/60 transition-colors duration-300" />
            )}

            {/* Icon with pulse on active */}
            <span className="relative z-10 flex items-center justify-center w-5 h-5">
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-all duration-300",
                  active
                    ? "text-primary-foreground drop-shadow-[0_0_6px_hsl(var(--primary-foreground)/0.5)]"
                    : "group-hover/navitem:scale-110"
                )}
              />
            </span>

            {/* Label */}
            <span
              className={cn(
                "relative z-10 truncate text-sm font-medium tracking-tight",
                collapsed && "sr-only"
              )}
            >
              {item.label}
            </span>

            {/* Active dot indicator on collapsed */}
            {active && collapsed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
              />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroup = (label: string, items: NavItem[], emoji?: string) => (
    <SidebarGroup key={label} className="mb-0.5">
      {collapsed ? (
        <>
          <SidebarGroupLabel className="sr-only">{label}</SidebarGroupLabel>
          {/* Collapsed divider dot */}
          <div className="flex justify-center py-2">
            <span className="w-1 h-1 rounded-full bg-sidebar-border" />
          </div>
        </>
      ) : (
        <SidebarGroupLabel className="px-3 py-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
          {emoji && <span className="text-xs">{emoji}</span>}
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5 px-1.5">
          {items.map((item, i) => renderNavItem(item, i))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/50 bg-sidebar h-screen max-h-screen flex flex-col"
    >
      <SidebarContent className="px-1 py-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
        {/* Logo strip at top */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 pb-4 mb-2 border-b border-sidebar-border/30"
          >
            <Link to="/" className="flex items-center gap-2.5">
              <div className="relative">
                <img src={hrpmLogo} alt="HRPM" className="w-8 h-8 rounded-lg" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar-background bg-primary/80" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sidebar-foreground text-sm tracking-tight leading-none">HRPM</span>
                <span className="text-[9px] text-sidebar-foreground/40 font-medium tracking-wider uppercase leading-none mt-0.5">Intelligence</span>
              </div>
            </Link>
          </motion.div>
        )}

        {collapsed && (
          <div className="flex justify-center pb-3 mb-2 border-b border-sidebar-border/30">
            <Link to="/">
              <img src={hrpmLogo} alt="HRPM" className="w-7 h-7 rounded-lg" />
            </Link>
          </div>
        )}

        {renderGroup("Explore", exploreItems, "🔍")}
        {renderGroup("Contribute", contributeItems, "📤")}
        {renderGroup("Analyze", analyzeItems, "⚡")}

        {/* Learn — collapsible */}
        <SidebarGroup className="mb-0.5">
          {collapsed ? (
            <>
              <SidebarGroupLabel className="sr-only">Learn</SidebarGroupLabel>
              <div className="flex justify-center py-2">
                <span className="w-1 h-1 rounded-full bg-sidebar-border" />
              </div>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5 px-1.5">{learnItems.map((item, i) => renderNavItem(item, i))}</SidebarMenu>
              </SidebarGroupContent>
            </>
          ) : (
            <Collapsible open={learnOpen} onOpenChange={setLearnOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.2em] hover:text-sidebar-foreground/60 transition-colors group/learn">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs">📚</span>
                  Learn
                </span>
                <motion.span
                  animate={{ rotate: learnOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3 w-3" />
                </motion.span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5 px-1.5">{learnItems.map((item, i) => renderNavItem(item, i))}</SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          )}
        </SidebarGroup>

        {/* Admin — role-gated */}
        {isAdmin && renderGroup("Admin", adminItems, "🛡️")}
      </SidebarContent>

      {/* Bottom accent line */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border/30">
          <div className="flex items-center gap-2 text-[10px] text-sidebar-foreground/30">
            <Sparkles className="h-3 w-3" />
            <span className="tracking-wider uppercase font-medium">Open Source · Non-Profit</span>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
