import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Network,
  FileText,
  Upload,
  Brain,
  Target,
  FolderOpen,
  BarChart3,
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Upload Documents",
    path: "/uploads",
    icon: Upload,
    description: "Add new evidence files",
  },
  {
    label: "AI Analyzer",
    path: "/analyze",
    icon: Brain,
    description: "Extract intelligence from documents",
    badge: "AI",
  },
  {
    label: "Investigation Hub",
    path: "/investigations",
    icon: Target,
    description: "Threat profiling & pattern detection",
    badge: "New",
  },
  {
    label: "View Timeline",
    path: "/timeline",
    icon: Clock,
    description: "Chronological event view",
  },
  {
    label: "Entity Network",
    path: "/network",
    icon: Network,
    description: "Relationship mapping",
  },
  {
    label: "Evidence Matrix",
    path: "/evidence",
    icon: FileText,
    description: "Cross-reference sources",
  },
];

// Contextual actions based on current route
const contextualActions: Record<string, QuickAction[]> = {
  "/timeline": [
    { label: "View Network", path: "/network", icon: Network, description: "See entity relationships" },
    { label: "Intel Dashboard", path: "/dashboard", icon: BarChart3, description: "Analytics overview" },
  ],
  "/network": [
    { label: "View Timeline", path: "/timeline", icon: Clock, description: "Chronological events" },
    { label: "Investigation Hub", path: "/investigations", icon: Target, description: "Deep analysis tools" },
  ],
  "/dashboard": [
    { label: "Case Files", path: "/cases", icon: FolderOpen, description: "Browse investigations" },
    { label: "Upload Evidence", path: "/uploads", icon: Upload, description: "Add new documents" },
  ],
  "/investigations": [
    { label: "Entity Network", path: "/network", icon: Network, description: "Visualize connections" },
    { label: "Evidence Matrix", path: "/evidence", icon: FileText, description: "Source verification" },
  ],
};

export const QuickActions = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Get contextual quick actions or default
  const relevantActions = contextualActions[currentPath] || quickActions.slice(0, 3);

  return (
    <div className="flex items-center gap-2">
      {/* Contextual Quick Actions - Desktop */}
      <div className="hidden lg:flex items-center gap-2">
        {relevantActions.slice(0, 2).map((action) => (
          <Button
            key={action.path}
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link to={action.path}>
              <action.icon className="w-4 h-4" />
              <span>{action.label}</span>
              {action.badge && (
                <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                  {action.badge}
                </Badge>
              )}
            </Link>
          </Button>
        ))}
      </div>

      {/* Full Quick Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/30 hover:border-primary/50">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Quick Navigation
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {quickActions.map((action) => (
            <DropdownMenuItem key={action.path} asChild>
              <Link
                to={action.path}
                className={cn(
                  "flex items-start gap-3 p-2 cursor-pointer",
                  currentPath === action.path && "bg-primary/10"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <action.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{action.label}</span>
                    {action.badge && (
                      <Badge
                        variant={action.badge === "AI" ? "default" : "secondary"}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
