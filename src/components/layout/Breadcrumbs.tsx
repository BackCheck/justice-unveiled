import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Route configuration with labels and parent relationships
const routeConfig: Record<string, { label: string; parent?: string }> = {
  "/": { label: "Home" },
  "/timeline": { label: "Timeline", parent: "/" },
  "/dashboard": { label: "Intel Dashboard", parent: "/" },
  "/intel-briefing": { label: "Intel Briefing", parent: "/" },
  "/network": { label: "Entity Network", parent: "/" },
  "/investigations": { label: "Investigation Hub", parent: "/" },
  "/cases": { label: "Case Files", parent: "/" },
  "/analyze": { label: "AI Analyzer", parent: "/investigations" },
  "/evidence": { label: "Evidence Matrix", parent: "/investigations" },
  "/international": { label: "International Rights", parent: "/" },
  "/uploads": { label: "Uploads", parent: "/" },
  "/about": { label: "About", parent: "/" },
  "/contact": { label: "Contact", parent: "/" },
  "/auth": { label: "Sign In", parent: "/" },
  "/admin": { label: "Admin Panel", parent: "/" },
  "/reconstruction": { label: "Reconstruction", parent: "/cases" },
  "/correlation": { label: "Claim Correlation", parent: "/cases" },
  "/compliance": { label: "Compliance Checker", parent: "/cases" },
  "/regulatory-harm": { label: "Economic Harm", parent: "/cases" },
  "/legal-intelligence": { label: "Legal Intelligence", parent: "/" },
  "/legal-research": { label: "Legal Research", parent: "/legal-intelligence" },
  "/threat-profiler": { label: "Threat Profiler", parent: "/investigations" },
  "/watchlist": { label: "My Watchlist", parent: "/" },
  "/blog": { label: "Blog", parent: "/" },
  "/docs": { label: "Documentation", parent: "/" },
  "/api": { label: "Developer API", parent: "/docs" },
  "/how-to-use": { label: "How to Use", parent: "/docs" },
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    let path = currentPath;

    // Handle dynamic routes like /cases/:id, /blog/:slug, /entities/:id, /events/:id, /violations/:type/:id
    const segments = path.split("/").filter(Boolean);
    const basePath = "/" + (segments[0] || "");

    while (path && path !== "/") {
      const config = routeConfig[path];
      if (config) {
        breadcrumbs.unshift({ label: config.label, path });
        path = config.parent || "";
      } else {
        // Dynamic route handling
        const parentConfig = routeConfig[basePath];
        if (parentConfig && breadcrumbs.length === 0) {
          // Add the dynamic segment as last crumb
          const lastSegment = segments[segments.length - 1];
          const dynamicLabel = lastSegment.length > 12 
            ? lastSegment.slice(0, 10) + "…" 
            : lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
          breadcrumbs.unshift({ label: dynamicLabel, path });
          // Then add the parent
          breadcrumbs.unshift({ label: parentConfig.label, path: basePath });
          path = parentConfig.parent || "";
        } else {
          break;
        }
      }
    }

    // Always start with Home
    if (breadcrumbs.length === 0 || breadcrumbs[0].path !== "/") {
      breadcrumbs.unshift({ label: "Home", path: "/", icon: Home });
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
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-xs sm:text-sm",
                  "hover:underline underline-offset-4"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
