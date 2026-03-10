import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Direct label mapping — no i18n dependency
const routeLabels: Record<string, string> = {
  "/": "Home",
  "/cases": "Case Library",
  "/timeline": "Timeline",
  "/blog": "Blog & News",
  "/evidence/new": "Contribute Evidence",
  "/uploads": "Upload Center",
  "/analyze": "Analyze Hub",
  "/evidence": "Evidence Matrix",
  "/network": "Entity Network",
  "/correlation": "Claim Correlation",
  "/reconstruction": "Reconstruction",
  "/legal-intelligence": "Legal Intelligence",
  "/legal-research": "Legal Research",
  "/compliance": "Compliance Checker",
  "/threat-profiler": "Threat Profiler",
  "/regulatory-harm": "Economic Harm",
  "/international": "International Rights",
  "/investigations": "Investigation Hub",
  "/analysis-history": "Analysis History",
  "/osint-toolkit": "OSINT Toolkit",
  "/reports": "Report Center",
  "/intel-briefing": "Intel Briefing",
  "/dashboard": "Intel Dashboard",
  "/how-to-use": "How to Use",
  "/docs": "Documentation",
  "/api": "Developer API",
  "/changelog": "Changelog",
  "/about": "About",
  "/contact": "Contact",
  "/auth": "Sign In",
  "/admin": "Admin Panel",
  "/admin/entity-review": "Entity Review",
  "/watchlist": "Watchlist",
  "/disclaimer": "Disclaimer",
  "/terms": "Terms",
  "/privacy": "Privacy",
  "/welcome": "Welcome",
  "/commitment": "Commitment",
};

// Parent relationships — only real hierarchy
const routeParents: Record<string, string> = {
  "/admin/entity-review": "/admin",
  "/api": "/docs",
};

// Analyze tool labels for ?tool= suffix
const analyzeToolLabels: Record<string, string> = {
  ai: "AI Analyzer",
  evidence: "Evidence Matrix",
  network: "Entity Network",
  correlation: "Claim Correlation",
  reconstruction: "Reconstruction",
  "legal-intelligence": "Legal Intelligence",
  "legal-research": "Legal Research",
  compliance: "Compliance Checker",
  "threat-profiler": "Threat Profiler",
  "regulatory-harm": "Economic Harm",
  international: "International Rights",
  investigations: "Investigation Hub",
  "analysis-history": "Analysis History",
  "osint-toolkit": "OSINT Toolkit",
  reports: "Report Center",
  "intel-briefing": "Intel Briefing",
  dashboard: "Intel Dashboard",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentPath = location.pathname;

  if (currentPath === "/" || currentPath === "") return null;

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [];
    let path = currentPath;

    // Walk up the parent chain
    const visited = new Set<string>();
    while (path && path !== "/" && !visited.has(path)) {
      visited.add(path);
      const label = routeLabels[path];
      if (label) {
        crumbs.unshift({ label, path });
        path = routeParents[path] || "/";
      } else {
        // Dynamic segment: e.g. /cases/:caseId
        const segments = path.split("/").filter(Boolean);
        const basePath = "/" + segments[0];
        const baseLabel = routeLabels[basePath];
        if (baseLabel && segments.length > 1) {
          const lastSeg = segments[segments.length - 1];
          const dynamicLabel = lastSeg.length > 20
            ? lastSeg.slice(0, 18) + "…"
            : lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1).replace(/-/g, " ");
          crumbs.unshift({ label: dynamicLabel, path });
          crumbs.unshift({ label: baseLabel, path: basePath });
        }
        break;
      }
    }

    // Analyze tool suffix via ?tool=
    if (currentPath === "/analyze") {
      const toolKey = searchParams.get("tool");
      if (toolKey && analyzeToolLabels[toolKey]) {
        crumbs.push({ label: analyzeToolLabels[toolKey], path: `/analyze?tool=${toolKey}` });
      }
    }

    // Always start with Home
    if (crumbs.length === 0 || crumbs[0].path !== "/") {
      crumbs.unshift({ label: "Home", path: "/", icon: Home });
    } else {
      crumbs[0].icon = Home;
    }

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-none">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;
        return (
          <div key={`${crumb.path}-${index}`} className="flex items-center gap-1 shrink-0">
            {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
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
