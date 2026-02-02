import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Network, FileText, Target, Brain, FolderOpen, ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "navigation" | "feature" | "recent";
  badge?: string;
}

const navigationItems: SearchResult[] = [
  { id: "home", title: "Home", description: "Landing page", path: "/", icon: Target, category: "navigation" },
  { id: "timeline", title: "Timeline", description: "Chronological events", path: "/timeline", icon: Clock, category: "navigation" },
  { id: "dashboard", title: "Intel Dashboard", description: "Analytics & metrics", path: "/dashboard", icon: Target, category: "navigation" },
  { id: "network", title: "Entity Network", description: "Relationship mapping", path: "/network", icon: Network, category: "navigation" },
  { id: "cases", title: "Case Files", description: "Investigation directory", path: "/cases", icon: FolderOpen, category: "navigation" },
  { id: "investigations", title: "Investigation Hub", description: "AI-powered analysis tools", path: "/investigations", icon: Target, category: "feature", badge: "AI" },
  { id: "analyze", title: "AI Analyzer", description: "Document intelligence extraction", path: "/analyze", icon: Brain, category: "feature", badge: "AI" },
  { id: "evidence", title: "Evidence Matrix", description: "Source cross-reference", path: "/evidence", icon: FileText, category: "navigation" },
];

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const navigationResults = navigationItems.filter((item) => item.category === "navigation");
  const featureResults = navigationItems.filter((item) => item.category === "feature");

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-8 w-8 sm:w-auto sm:px-3 gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5",
          "text-muted-foreground hover:text-foreground transition-all"
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="w-3 h-3" />K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, features, or type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            {navigationResults.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => handleSelect(item.path)}
                className="flex items-center gap-3 p-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="AI Features">
            {featureResults.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => handleSelect(item.path)}
                className="flex items-center gap-3 p-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.title}</span>
                    {item.badge && (
                      <Badge variant="default" className="h-4 px-1.5 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
