import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Route configuration with translation keys and parent relationships
const routeConfig: Record<string, { labelKey: string; parent?: string }> = {
  "/": { labelKey: "nav.home" },
  "/timeline": { labelKey: "nav.timeline", parent: "/" },
  "/dashboard": { labelKey: "nav.intelDashboard", parent: "/" },
  "/intel-briefing": { labelKey: "nav.intelBriefing", parent: "/" },
  "/network": { labelKey: "nav.entityNetwork", parent: "/" },
  "/investigations": { labelKey: "nav.investigations", parent: "/" },
  "/cases": { labelKey: "nav.caseFiles", parent: "/" },
  "/analyze": { labelKey: "nav.aiAnalyzer", parent: "/investigations" },
  "/evidence": { labelKey: "nav.evidenceMatrix", parent: "/investigations" },
  "/international": { labelKey: "nav.international", parent: "/" },
  "/uploads": { labelKey: "nav.uploads", parent: "/" },
  "/about": { labelKey: "nav.about", parent: "/" },
  "/contact": { labelKey: "nav.contact", parent: "/" },
  "/auth": { labelKey: "common.signIn", parent: "/" },
  "/admin": { labelKey: "nav.admin", parent: "/" },
  "/reconstruction": { labelKey: "nav.reconstruction", parent: "/cases" },
  "/correlation": { labelKey: "nav.correlation", parent: "/cases" },
  "/compliance": { labelKey: "nav.complianceChecker", parent: "/cases" },
  "/regulatory-harm": { labelKey: "nav.harm", parent: "/cases" },
  "/legal-intelligence": { labelKey: "nav.legal", parent: "/" },
  "/legal-research": { labelKey: "nav.legalResearch", parent: "/legal-intelligence" },
  "/threat-profiler": { labelKey: "nav.threatProfiler", parent: "/investigations" },
  "/watchlist": { labelKey: "nav.watchlist", parent: "/" },
  "/blog": { labelKey: "nav.blogNews", parent: "/" },
  "/docs": { labelKey: "nav.documentation", parent: "/" },
  "/api": { labelKey: "nav.developerApi", parent: "/docs" },
  "/how-to-use": { labelKey: "nav.howToUse", parent: "/docs" },
  "/osint-toolkit": { labelKey: "nav.osintToolkit", parent: "/investigations" },
  "/changelog": { labelKey: "nav.changelog", parent: "/" },
  "/analysis-history": { labelKey: "nav.analysisHistory", parent: "/" },
  "/reports": { labelKey: "nav.reportCenter", parent: "/" },
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname;

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    let path = currentPath;

    const segments = path.split("/").filter(Boolean);
    const basePath = "/" + (segments[0] || "");

    while (path && path !== "/") {
      const config = routeConfig[path];
      if (config) {
        breadcrumbs.unshift({ label: t(config.labelKey), path });
        path = config.parent || "";
      } else {
        const parentConfig = routeConfig[basePath];
        if (parentConfig && breadcrumbs.length === 0) {
          const lastSegment = segments[segments.length - 1];
          const dynamicLabel = lastSegment.length > 12 
            ? lastSegment.slice(0, 10) + "…" 
            : lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
          breadcrumbs.unshift({ label: dynamicLabel, path });
          breadcrumbs.unshift({ label: t(parentConfig.labelKey), path: basePath });
          path = parentConfig.parent || "";
        } else {
          break;
        }
      }
    }

    if (breadcrumbs.length === 0 || breadcrumbs[0].path !== "/") {
      breadcrumbs.unshift({ label: t('nav.home'), path: "/", icon: Home });
    } else {
      breadcrumbs[0].icon = Home;
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (currentPath === "/" || currentPath === "") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-none">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;

        return (
          <div key={`${crumb.path}-${index}`} className="flex items-center gap-1 shrink-0">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground flex items-center gap-1 text-[11px] sm:text-xs">
                {Icon && <Icon className="w-3 h-3" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[11px] sm:text-xs",
                  "hover:underline underline-offset-4"
                )}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
