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
  "/cases": "Investigative Case Library",
  "/timeline": "Investigative Chronology",
  "/blog": "Investigative Reports & News",
  "/evidence/new": "Contribute Evidence",
  "/uploads": "Evidence Upload Center",
  "/analyze": "Analysis Hub",
  "/evidence": "Evidence Repository & Matrix",
  "/network": "Entity Relationship Network",
  "/correlation": "Claim–Evidence Correlation",
  "/reconstruction": "Timeline Reconstruction Engine",
  "/legal-intelligence": "Legal Intelligence Suite",
  "/legal-research": "Legal Research & Precedents",
  "/compliance": "Procedural Compliance Audit",
  "/threat-profiler": "AI Threat Profiler",
  "/regulatory-harm": "Regulatory & Economic Harm",
  "/financial-abuse": "Financial Abuse Intelligence",
  "/international": "International Rights Analysis",
  "/investigations": "Investigation Command Center",
  "/analysis-history": "AI Analysis Archive",
  "/osint-toolkit": "OSINT Intelligence Toolkit",
  "/reports": "Investigative Report Builder",
  "/intel-briefing": "Threat Intelligence Briefing",
  "/dashboard": "Intelligence Dashboard",
  "/how-to-use": "Platform User Guide",
  "/docs": "Developer Documentation",
  "/api": "Public API Reference",
  "/changelog": "Platform Changelog & Updates",
  "/about": "About HRPM",
  "/contact": "Contact HRPM",
  "/auth": "Sign In",
  "/admin": "Administration Panel",
  "/admin/entity-review": "Entity Review Queue",
  "/watchlist": "Investigation Watchlist",
  "/disclaimer": "Legal Disclaimer",
  "/terms": "Terms of Service",
  "/privacy": "Privacy Policy",
  "/welcome": "Welcome",
  "/commitment": "HRPM Commitment & Ethics",
};

// Parent relationships — only real hierarchy
const routeParents: Record<string, string> = {
  "/admin/entity-review": "/admin",
  "/api": "/docs",
};

// Analyze tool labels for ?tool= suffix
const analyzeToolLabels: Record<string, string> = {
  ai: "AI Document Analyzer",
  evidence: "Evidence Repository & Matrix",
  network: "Entity Relationship Network",
  correlation: "Claim–Evidence Correlation",
  reconstruction: "Timeline Reconstruction Engine",
  "legal-intelligence": "Legal Intelligence Suite",
  "legal-research": "Legal Research & Precedents",
  compliance: "Procedural Compliance Audit",
  "threat-profiler": "AI Threat Profiler",
  "regulatory-harm": "Regulatory & Economic Harm",
  international: "International Rights Analysis",
  investigations: "Investigation Command Center",
  "analysis-history": "AI Analysis Archive",
  "osint-toolkit": "OSINT Intelligence Toolkit",
  reports: "Investigative Report Builder",
  "intel-briefing": "Threat Intelligence Briefing",
  dashboard: "Intelligence Dashboard",
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
