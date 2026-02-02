import { Link, useLocation } from "react-router-dom";
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
  "/intel-briefing": { label: "Intelligence Briefing", parent: "/" },
  "/network": { label: "Entity Network", parent: "/" },
  "/investigations": { label: "Investigation Hub", parent: "/" },
  "/cases": { label: "Case Files", parent: "/" },
  "/analyze": { label: "AI Analyzer", parent: "/investigations" },
  "/evidence": { label: "Evidence Matrix", parent: "/investigations" },
  "/international": { label: "International Rights", parent: "/" },
  "/uploads": { label: "Document Uploads", parent: "/" },
  "/about": { label: "About HRPM", parent: "/" },
  "/auth": { label: "Sign In", parent: "/" },
  "/admin": { label: "Admin Panel", parent: "/" },
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Build breadcrumb trail
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    let path = currentPath;

    // Handle dynamic routes (e.g., /cases/:id)
    const basePath = path.split("/").slice(0, 2).join("/") || "/";
    
    while (path && path !== "/") {
      const config = routeConfig[path] || routeConfig[basePath];
      if (config) {
        breadcrumbs.unshift({ label: config.label, path });
        path = config.parent || "";
      } else {
        // Handle unknown routes or dynamic segments
        const segments = path.split("/").filter(Boolean);
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          breadcrumbs.unshift({ 
            label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " "), 
            path 
          });
          path = "/" + segments.slice(0, -1).join("/") || "/";
        } else {
          break;
        }
      }
    }

    // Add home if not already first
    if (breadcrumbs.length === 0 || breadcrumbs[0].path !== "/") {
      breadcrumbs.unshift({ label: "Home", path: "/", icon: Home });
    } else {
      breadcrumbs[0].icon = Home;
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (currentPath === "/" || currentPath === "") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;

        return (
          <div key={crumb.path} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5",
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
