import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Network, 
  FileText, 
  BarChart3, 
  Clock, 
  Menu,
  X,
  Upload,
  BookOpen,
  Globe
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { path: "/", label: "Timeline", icon: Clock },
  { path: "/dashboard", label: "Intel Dashboard", icon: BarChart3 },
  { path: "/intel-briefing", label: "Briefing", icon: BookOpen },
  { path: "/network", label: "Entity Network", icon: Network },
  { path: "/evidence", label: "Evidence Matrix", icon: FileText },
  { path: "/uploads", label: "Uploads", icon: Upload },
  { path: "/about", label: "About", icon: Globe },
];

export const PlatformHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="flex items-center gap-3">
              {/* Logo with professional styling */}
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-professional transition-all duration-300 group-hover:shadow-professional-lg">
                <Globe className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary tracking-tight leading-none">HRPM</span>
                <span className="hidden sm:block text-[11px] font-medium text-muted-foreground tracking-wide uppercase mt-0.5">
                  Human Rights Protection Movement
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-all duration-200",
                      isActive && "bg-primary/10 text-primary border border-primary/20"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 mr-2", isActive && "text-primary")} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Search, Theme & Mobile menu */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Intel
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-all duration-200",
                      isActive && "bg-primary/10 text-primary border border-primary/20"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
