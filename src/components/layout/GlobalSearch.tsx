import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Clock, Network, FileText, Target, Brain, FolderOpen, ArrowRight, Command,
  BarChart3, BookOpen, Scale, Upload, Info, Eye, GitBranch, ClipboardCheck,
  TrendingDown, Gavel, Shield, Home, Newspaper, Phone, HelpCircle, Code, Search as SearchIcon
} from "lucide-react";
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
  category: string;
  badge?: string;
}

const allPages: SearchResult[] = [
  // Core
  { id: "home", title: "Home", description: "Landing page", path: "/", icon: Home, category: "Core" },
  { id: "cases", title: "Case Files", description: "Investigation directory", path: "/cases", icon: FolderOpen, category: "Core" },
  { id: "timeline", title: "Timeline", description: "Chronological events", path: "/timeline", icon: Clock, category: "Core" },
  { id: "dashboard", title: "Intel Dashboard", description: "Analytics & metrics", path: "/dashboard", icon: BarChart3, category: "Core" },
  { id: "network", title: "Entity Network", description: "Relationship mapping", path: "/network", icon: Network, category: "Core" },
  // Investigation
  { id: "investigations", title: "Investigation Hub", description: "AI-powered analysis tools", path: "/investigations", icon: Target, category: "Investigation", badge: "AI" },
  { id: "analyze", title: "AI Analyzer", description: "Document intelligence extraction", path: "/analyze", icon: Brain, category: "Investigation", badge: "AI" },
  { id: "threat-profiler", title: "Threat Profiler", description: "Entity threat assessment", path: "/threat-profiler", icon: Shield, category: "Investigation", badge: "AI" },
  { id: "evidence", title: "Evidence Matrix", description: "Source cross-reference", path: "/evidence", icon: FileText, category: "Investigation" },
  { id: "watchlist", title: "My Watchlist", description: "Tracked entities & events", path: "/watchlist", icon: Eye, category: "Investigation" },
  // Analysis
  { id: "reconstruction", title: "Reconstruction", description: "Event reconstruction timeline", path: "/reconstruction", icon: GitBranch, category: "Analysis" },
  { id: "correlation", title: "Claim Correlation", description: "Evidence-claim mapping", path: "/correlation", icon: Scale, category: "Analysis" },
  { id: "compliance", title: "Compliance Checker", description: "Procedural compliance audit", path: "/compliance", icon: ClipboardCheck, category: "Analysis" },
  { id: "regulatory-harm", title: "Economic Harm", description: "Financial impact tracking", path: "/regulatory-harm", icon: TrendingDown, category: "Analysis" },
  { id: "legal-intelligence", title: "Legal Intelligence", description: "Statutes, precedents & doctrines", path: "/legal-intelligence", icon: Gavel, category: "Analysis" },
  { id: "international", title: "International Rights", description: "UN framework compliance", path: "/international", icon: Scale, category: "Analysis" },
  { id: "legal-research", title: "Legal Research", description: "Search case law & statutes", path: "/legal-research", icon: SearchIcon, category: "Analysis" },
  // Resources
  { id: "intel-briefing", title: "Intel Briefing", description: "Synthesized case intelligence", path: "/intel-briefing", icon: BookOpen, category: "Resources" },
  { id: "blog", title: "Blog & News", description: "Articles and updates", path: "/blog", icon: Newspaper, category: "Resources" },
  { id: "docs", title: "Documentation", description: "Platform documentation", path: "/docs", icon: FileText, category: "Resources" },
  { id: "api", title: "Developer API", description: "API reference", path: "/api", icon: Code, category: "Resources" },
  { id: "how-to-use", title: "How to Use", description: "Getting started guide", path: "/how-to-use", icon: HelpCircle, category: "Resources" },
  // System
  { id: "uploads", title: "Uploads", description: "Evidence management", path: "/uploads", icon: Upload, category: "System" },
  { id: "about", title: "About", description: "Mission & values", path: "/about", icon: Info, category: "System" },
  { id: "contact", title: "Contact", description: "Get in touch", path: "/contact", icon: Phone, category: "System" },
];

const categories = ["Core", "Investigation", "Analysis", "Resources", "System"];

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

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
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          {categories.map((cat, idx) => {
            const items = allPages.filter(p => p.category === cat);
            return (
              <div key={cat}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup heading={cat}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.title} ${item.description}`}
                      onSelect={() => handleSelect(item.path)}
                      className="flex items-center gap-3 p-2 cursor-pointer"
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                        item.badge ? "bg-primary/10" : "bg-muted"
                      )}>
                        <item.icon className={cn("w-3.5 h-3.5", item.badge && "text-primary")} />
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
                        <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};
