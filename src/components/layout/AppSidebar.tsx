import { Link, useLocation } from "react-router-dom";
import { 
  Clock, 
  BarChart3, 
  BookOpen, 
  Network, 
  FileText, 
  Scale, 
  Upload, 
  Info,
  Globe,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
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

const mainNavItems = [
  { path: "/", label: "Timeline", icon: Clock },
  { path: "/dashboard", label: "Intel Dashboard", icon: BarChart3 },
  { path: "/intel-briefing", label: "Briefing", icon: BookOpen },
  { path: "/network", label: "Entity Network", icon: Network },
];

const analysisNavItems = [
  { path: "/evidence", label: "Evidence Matrix", icon: FileText },
  { path: "/international", label: "International Rights", icon: Scale },
];

const systemNavItems = [
  { path: "/uploads", label: "Uploads", icon: Upload },
  { path: "/about", label: "About", icon: Info },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item }: { item: { path: string; label: string; icon: React.ComponentType<{ className?: string }> } }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.label}>
          <Link 
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
              active 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
            <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-professional transition-all duration-300 group-hover:shadow-professional-lg shrink-0">
            <Globe className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold text-primary tracking-tight leading-none">HRPM</span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase mt-0.5 truncate">
                Human Rights Protection
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Search */}
        {!collapsed && (
          <div className="px-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Intel
            </Button>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            Main
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
            Analysis
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <span className="text-xs text-muted-foreground">Theme</span>
          )}
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
