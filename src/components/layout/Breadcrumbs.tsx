import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Route configuration with translation keys and parent relationships
// IMPORTANT: Only truly nested pages use parent other than "/"
const routeConfig: Record<string, { labelKey: string; parent?: string }> = {
  "/": { labelKey: "nav.home" },
  "/cases": { labelKey: "nav.caseFiles", parent: "/" },
  "/timeline": { labelKey: "nav.timeline", parent: "/" },
  "/blog": { labelKey: "nav.blogNews", parent: "/" },
  "/submit-case": { labelKey: "Submit a Case", parent: "/" },
  "/uploads": { labelKey: "nav.uploads", parent: "/" },
  "/analyze": { labelKey: "Analyze Hub", parent: "/" },
  // Top-level tool pages — NOT children of /analyze
  "/evidence": { labelKey: "nav.evidenceMatrix", parent: "/" },
  "/network": { labelKey: "nav.entityNetwork", parent: "/" },
  "/correlation": { labelKey: "nav.correlation", parent: "/" },
  "/reconstruction": { labelKey: "nav.reconstruction", parent: "/" },
  "/legal-intelligence": { labelKey: "nav.legal", parent: "/" },
  "/legal-research": { labelKey: "nav.legalResearch", parent: "/" },
  "/compliance": { labelKey: "nav.complianceChecker", parent: "/" },
  "/threat-profiler": { labelKey: "nav.threatProfiler", parent: "/" },
  "/regulatory-harm": { labelKey: "nav.harm", parent: "/" },
  "/international": { labelKey: "nav.international", parent: "/" },
  "/investigations": { labelKey: "nav.investigations", parent: "/" },
  "/analysis-history": { labelKey: "nav.analysisHistory", parent: "/" },
  "/osint-toolkit": { labelKey: "nav.osintToolkit", parent: "/" },
  "/reports": { labelKey: "nav.reportCenter", parent: "/" },
  "/intel-briefing": { labelKey: "nav.intelBriefing", parent: "/" },
  "/dashboard": { labelKey: "nav.intelDashboard", parent: "/" },
  "/how-to-use": { labelKey: "nav.howToUse", parent: "/" },
  "/docs": { labelKey: "nav.documentation", parent: "/" },
  "/api": { labelKey: "nav.developerApi", parent: "/docs" },
  "/changelog": { labelKey: "nav.changelog", parent: "/" },
  "/about": { labelKey: "nav.about", parent: "/" },
  "/contact": { labelKey: "nav.contact", parent: "/" },
  "/auth": { labelKey: "common.signIn", parent: "/" },
  "/admin": { labelKey: "nav.admin", parent: "/" },
  "/admin/entity-review": { labelKey: "Entity Review", parent: "/admin" },
  "/watchlist": { labelKey: "nav.watchlist", parent: "/" },
  "/disclaimer": { labelKey: "Disclaimer", parent: "/" },
  "/terms": { labelKey: "Terms", parent: "/" },
  "/privacy": { labelKey: "Privacy", parent: "/" },
};

// Tool key to label for ?tool= query param on /analyze
const analyzeToolLabels: Record<string, string> = {
  ai: "AI Analyzer",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
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

    // Add tool suffix for /analyze?tool=X
    if (currentPath === "/analyze") {
      const toolKey = searchParams.get("tool");
      if (toolKey && analyzeToolLabels[toolKey]) {
        breadcrumbs.push({ label: analyzeToolLabels[toolKey], path: `/analyze?tool=${toolKey}` });
      }
    }

    if (breadcrumbs.length === 0 || breadcrumbs[0].path !== "/") {
      breadcrumbs.unshift({ label: t("nav.home"), path: "/", icon: Home });
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
