import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  labelKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  descriptionKey: string;
  badge?: string;
}

const quickActions: QuickAction[] = [
  { labelKey: "pages.uploadDocuments", path: "/uploads", icon: Upload, descriptionKey: "pages.addNewEvidence" },
  { labelKey: "nav.aiAnalyzer", path: "/analyze", icon: Brain, descriptionKey: "pages.extractIntelligence", badge: "AI" },
  { labelKey: "nav.investigations", path: "/investigations", icon: Target, descriptionKey: "pages.threatProfilingDesc", badge: "New" },
  { labelKey: "pages.viewTimeline", path: "/timeline", icon: Clock, descriptionKey: "pages.chronologicalView" },
  { labelKey: "nav.entityNetwork", path: "/network", icon: Network, descriptionKey: "pages.relationshipMapping" },
  { labelKey: "nav.evidenceMatrix", path: "/evidence", icon: FileText, descriptionKey: "pages.crossReferenceSources" },
];

const contextualActions: Record<string, QuickAction[]> = {
  "/timeline": [
    { labelKey: "nav.entityNetwork", path: "/network", icon: Network, descriptionKey: "pages.relationshipMapping" },
    { labelKey: "nav.intelDashboard", path: "/dashboard", icon: BarChart3, descriptionKey: "pages.intelDashboardSub" },
  ],
  "/network": [
    { labelKey: "pages.viewTimeline", path: "/timeline", icon: Clock, descriptionKey: "pages.chronologicalView" },
    { labelKey: "nav.investigations", path: "/investigations", icon: Target, descriptionKey: "pages.investigationHubSub" },
  ],
  "/dashboard": [
    { labelKey: "nav.caseFiles", path: "/cases", icon: FolderOpen, descriptionKey: "pages.caseFilesSub" },
    { labelKey: "pages.uploadDocuments", path: "/uploads", icon: Upload, descriptionKey: "pages.addNewEvidence" },
  ],
  "/investigations": [
    { labelKey: "nav.entityNetwork", path: "/network", icon: Network, descriptionKey: "pages.relationshipMapping" },
    { labelKey: "nav.evidenceMatrix", path: "/evidence", icon: FileText, descriptionKey: "pages.crossReferenceSources" },
  ],
};

export const QuickActions = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname;

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
              <span>{t(action.labelKey)}</span>
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
            <span className="hidden sm:inline">{t('pages.quickActions')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {t('pages.quickNavigation')}
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
                    <span className="font-medium text-sm">{t(action.labelKey)}</span>
                    {action.badge && (
                      <Badge
                        variant={action.badge === "AI" ? "default" : "secondary"}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{t(action.descriptionKey)}</span>
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
