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
  BookOpen
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import hrpmLogo from "@/assets/hrpm-logo.png";

const navItems = [
  { path: "/", label: "Timeline", icon: Clock },
  { path: "/dashboard", label: "Intel Dashboard", icon: BarChart3 },
  { path: "/intel-briefing", label: "Briefing", icon: BookOpen },
  { path: "/network", label: "Entity Network", icon: Network },
  { path: "/evidence", label: "Evidence Matrix", icon: FileText },
  { path: "/uploads", label: "Uploads", icon: Upload },
];

export const PlatformHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 border-b border-border">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={hrpmLogo} alt="HRPM Logo" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">HRPM.org</h1>
              <p className="text-sm text-muted-foreground">Human Rights Protection Movement</p>
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
                      "text-muted-foreground hover:text-foreground hover:bg-accent",
                      isActive && "bg-accent text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
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
              className="hidden sm:flex"
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
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                      isActive && "bg-accent text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
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
