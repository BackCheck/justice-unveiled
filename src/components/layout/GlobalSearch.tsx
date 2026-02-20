import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Search, Clock, Network, FileText, Target, Brain, FolderOpen, ArrowRight, Command,
  BarChart3, BookOpen, Scale, Upload, Info, Eye, GitBranch, ClipboardCheck,
  TrendingDown, Gavel, Shield, Home, Newspaper, Phone, HelpCircle, Code, Search as SearchIcon,
  Sparkles, AlertTriangle, Users, Calendar
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
import { useExtractedEvents, useExtractedEntities, useExtractedDiscrepancies } from "@/hooks/useExtractedEvents";

interface SearchResult {
  id: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  categoryKey: string;
  badge?: string;
}

const allPages: SearchResult[] = [
  // Core
  { id: "home", titleKey: "nav.home", descriptionKey: "nav.home", path: "/", icon: Home, categoryKey: "nav.core" },
  { id: "cases", titleKey: "nav.caseFiles", descriptionKey: "pages.caseFilesSub", path: "/cases", icon: FolderOpen, categoryKey: "nav.core" },
  { id: "timeline", titleKey: "nav.timeline", descriptionKey: "pages.investigativeTimeline", path: "/timeline", icon: Clock, categoryKey: "nav.core" },
  { id: "dashboard", titleKey: "nav.intelDashboard", descriptionKey: "pages.intelDashboardSub", path: "/dashboard", icon: BarChart3, categoryKey: "nav.core" },
  { id: "network", titleKey: "nav.entityNetwork", descriptionKey: "pages.entityNetworkSub", path: "/network", icon: Network, categoryKey: "nav.core" },
  // Investigation
  { id: "investigations", titleKey: "nav.investigations", descriptionKey: "pages.investigationHubSub", path: "/investigations", icon: Target, categoryKey: "nav.investigation", badge: "AI" },
  { id: "analyze", titleKey: "nav.aiAnalyzer", descriptionKey: "pages.aiAnalyzerSub", path: "/analyze", icon: Brain, categoryKey: "nav.investigation", badge: "AI" },
  { id: "threat-profiler", titleKey: "nav.threatProfiler", descriptionKey: "pages.threatProfilerSub", path: "/threat-profiler", icon: Shield, categoryKey: "nav.investigation", badge: "AI" },
  { id: "evidence", titleKey: "nav.evidenceMatrix", descriptionKey: "pages.evidenceMatrixSub", path: "/evidence", icon: FileText, categoryKey: "nav.investigation" },
  { id: "watchlist", titleKey: "nav.watchlist", descriptionKey: "pages.watchlistSub", path: "/watchlist", icon: Eye, categoryKey: "nav.investigation" },
  // Analysis
  { id: "reconstruction", titleKey: "nav.reconstruction", descriptionKey: "pages.reconstructionSub", path: "/reconstruction", icon: GitBranch, categoryKey: "nav.analysis" },
  { id: "correlation", titleKey: "nav.correlation", descriptionKey: "pages.correlationSub", path: "/correlation", icon: Scale, categoryKey: "nav.analysis" },
  { id: "compliance", titleKey: "nav.complianceChecker", descriptionKey: "pages.complianceSub", path: "/compliance", icon: ClipboardCheck, categoryKey: "nav.analysis" },
  { id: "regulatory-harm", titleKey: "nav.harm", descriptionKey: "pages.harmSub", path: "/regulatory-harm", icon: TrendingDown, categoryKey: "nav.analysis" },
  { id: "legal-intelligence", titleKey: "nav.legal", descriptionKey: "pages.legalIntelligenceSub", path: "/legal-intelligence", icon: Gavel, categoryKey: "nav.analysis" },
  { id: "international", titleKey: "nav.international", descriptionKey: "pages.internationalRightsSub", path: "/international", icon: Scale, categoryKey: "nav.analysis" },
  { id: "legal-research", titleKey: "nav.legalResearch", descriptionKey: "pages.legalResearchSub", path: "/legal-research", icon: SearchIcon, categoryKey: "nav.analysis" },
  // Resources
  { id: "intel-briefing", titleKey: "nav.intelBriefing", descriptionKey: "pages.intelligenceBriefing", path: "/intel-briefing", icon: BookOpen, categoryKey: "nav.resources" },
  { id: "blog", titleKey: "nav.blogNews", descriptionKey: "pages.blogSub", path: "/blog", icon: Newspaper, categoryKey: "nav.resources" },
  { id: "docs", titleKey: "nav.documentation", descriptionKey: "pages.docsSub", path: "/docs", icon: FileText, categoryKey: "nav.resources" },
  { id: "api", titleKey: "nav.developerApi", descriptionKey: "pages.apiSub", path: "/api", icon: Code, categoryKey: "nav.resources" },
  { id: "how-to-use", titleKey: "nav.howToUse", descriptionKey: "pages.howToUseSub", path: "/how-to-use", icon: HelpCircle, categoryKey: "nav.resources" },
  // System
  { id: "uploads", titleKey: "nav.uploads", descriptionKey: "pages.uploadsSub", path: "/uploads", icon: Upload, categoryKey: "nav.system" },
  { id: "about", titleKey: "nav.about", descriptionKey: "pages.aboutSub", path: "/about", icon: Info, categoryKey: "nav.system" },
  { id: "contact", titleKey: "nav.contact", descriptionKey: "pages.contactSub", path: "/contact", icon: Phone, categoryKey: "nav.system" },
];

const categoryKeys = ["nav.core", "nav.investigation", "nav.analysis", "nav.resources", "nav.system"];

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fetch database records for search
  const { data: events } = useExtractedEvents();
  const { data: entities } = useExtractedEntities();
  const { data: discrepancies } = useExtractedDiscrepancies();

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

  // Filter database records based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return (events || []).filter(e =>
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.individuals.toLowerCase().includes(q) ||
      e.sources.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [events, searchQuery]);

  const filteredEntities = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return (entities || []).filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.role || "").toLowerCase().includes(q) ||
      (e.description || "").toLowerCase().includes(q) ||
      e.entity_type.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [entities, searchQuery]);

  const filteredDiscrepancies = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return (discrepancies || []).filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.discrepancy_type.toLowerCase().includes(q) ||
      (d.legal_reference || "").toLowerCase().includes(q)
    ).slice(0, 8);
  }, [discrepancies, searchQuery]);

  const hasDbResults = filteredEvents.length > 0 || filteredEntities.length > 0 || filteredDiscrepancies.length > 0;

  const handleSelect = (path: string) => {
    setOpen(false);
    setSearchQuery("");
    navigate(path);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return "🔴";
      case "high": return "🟠";
      case "medium": return "🟡";
      default: return "🔵";
    }
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
        <span className="hidden sm:inline">{t('pages.searchIntel')}</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="w-3 h-3" />K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearchQuery(""); }}>
        <CommandInput 
          placeholder={t('pages.searchPlaceholder')} 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>{t('pages.noResults')}</CommandEmpty>

          {/* Database Results - Events */}
          {filteredEvents.length > 0 && (
            <>
              <CommandGroup heading={`Extracted Events (${filteredEvents.length})`}>
                {filteredEvents.map((event) => (
                  <CommandItem
                    key={`event-${event.id}`}
                    value={`event ${event.description} ${event.category} ${event.individuals}`}
                    onSelect={() => handleSelect(`/events/${event.id}`)}
                    className="flex items-center gap-3 p-2 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-primary/10">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{event.description.slice(0, 60)}{event.description.length > 60 ? '...' : ''}</span>
                        <Badge variant="outline" className="h-4 px-1.5 text-[10px] shrink-0">
                          {event.category}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {event.date} · {event.individuals}
                      </div>
                    </div>
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Database Results - Entities */}
          {filteredEntities.length > 0 && (
            <>
              <CommandGroup heading={`Extracted Entities (${filteredEntities.length})`}>
                {filteredEntities.map((entity) => (
                  <CommandItem
                    key={`entity-${entity.id}`}
                    value={`entity ${entity.name} ${entity.role} ${entity.entity_type} ${entity.description}`}
                    onSelect={() => handleSelect(`/entities/ai-${entity.id}`)}
                    className="flex items-center gap-3 p-2 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-accent/50">
                      <Users className="w-3.5 h-3.5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{entity.name}</span>
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] shrink-0">
                          {entity.entity_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {entity.role || entity.description || 'No description'}
                      </div>
                    </div>
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Database Results - Discrepancies/Violations */}
          {filteredDiscrepancies.length > 0 && (
            <>
              <CommandGroup heading={`Violations & Discrepancies (${filteredDiscrepancies.length})`}>
                {filteredDiscrepancies.map((disc) => (
                  <CommandItem
                    key={`disc-${disc.id}`}
                    value={`violation ${disc.title} ${disc.description} ${disc.discrepancy_type} ${disc.legal_reference}`}
                    onSelect={() => handleSelect(`/analysis-history`)}
                    className="flex items-center gap-3 p-2 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-destructive/10">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{disc.title}</span>
                        <Badge variant="outline" className="h-4 px-1.5 text-[10px] shrink-0">
                          {getSeverityIcon(disc.severity)} {disc.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {disc.discrepancy_type} · {disc.legal_reference || disc.description.slice(0, 50)}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          
          {/* Page Navigation */}
          {categoryKeys.map((catKey, idx) => {
            const items = allPages.filter(p => p.categoryKey === catKey);
            return (
              <div key={catKey}>
                {(idx > 0 || hasDbResults) && <CommandSeparator />}
                <CommandGroup heading={t(catKey)}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${t(item.titleKey)} ${t(item.descriptionKey)}`}
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
                          <span className="font-medium text-sm">{t(item.titleKey)}</span>
                          {item.badge && (
                            <Badge variant="default" className="h-4 px-1.5 text-[10px]">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{t(item.descriptionKey)}</div>
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
