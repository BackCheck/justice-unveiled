import { useState, useMemo } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { osintCategories } from "@/data/osintCommandsData";
import { Search, Copy, Check, ExternalLink, Terminal, ChevronRight, Hash, Layers, Command, Lightbulb, BookOpen } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OsintCommandCard } from "@/components/osint-commands/OsintCommandCard";
import { OsintCategorySection } from "@/components/osint-commands/OsintCategorySection";

export default function OsintCommands() {
  useSEO({
    title: "OSINT Command Library — HRPM Intelligence Platform",
    description: "Comprehensive collection of OSINT one-liner commands for open-source intelligence gathering, organized by category.",
  });

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const totalCommands = useMemo(
    () => osintCategories.reduce((sum, cat) => sum + cat.subcategories.reduce((s, sub) => s + sub.commands.length, 0), 0),
    []
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return osintCategories
      .filter((cat) => !activeCategory || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        subcategories: cat.subcategories
          .map((sub) => ({
            ...sub,
            commands: q
              ? sub.commands.filter(
                  (c) =>
                    c.title.toLowerCase().includes(q) ||
                    c.command.toLowerCase().includes(q)
                )
              : sub.commands,
          }))
          .filter((sub) => sub.commands.length > 0),
      }))
      .filter((cat) => cat.subcategories.length > 0);
  }, [search, activeCategory]);

  const filteredCount = filtered.reduce(
    (sum, cat) => sum + cat.subcategories.reduce((s, sub) => s + sub.commands.length, 0),
    0
  );

  return (
    <PlatformLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Terminal-style Header */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-foreground p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
          <div className="absolute top-0 left-0 right-0 h-8 bg-foreground/80 border-b border-primary/20 flex items-center px-3 gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-chart-5/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-chart-2/70" />
            <span className="ml-3 text-[10px] font-mono text-primary-foreground/40">hrpm@osint:~</span>
          </div>
          <div className="relative pt-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary font-mono text-sm">$</span>
              <span className="font-mono text-primary-foreground/90 text-sm">cat /lib/osint-commands</span>
              <span className="w-2 h-4 bg-primary animate-pulse-ring inline-block" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground font-mono mt-2 tracking-tight">
              OSINT Command Library
            </h1>
            <p className="text-primary-foreground/50 text-sm font-mono mt-1">
              <span className="text-primary">{totalCommands}</span> one-liner commands &middot; search, copy, deploy
            </p>
            <p className="text-[10px] text-primary-foreground/30 font-mono mt-2">
              // source: <a href="https://github.com/yogsec/One-Liner-OSINT" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">yogsec/One-Liner-OSINT</a> — curated for HRPM investigators
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="grep -i 'search commands by title or syntax…'"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 font-mono text-sm bg-card border-border/60 focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-xs font-mono",
                activeCategory === null && "bg-primary text-primary-foreground"
              )}
              onClick={() => setActiveCategory(null)}
            >
              <Layers className="h-3 w-3 mr-1" />
              ALL
            </Button>
            {osintCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 text-xs font-mono",
                  activeCategory === cat.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono border-b border-border/40 pb-2">
            <span className="flex items-center gap-1">
              <Command className="h-3 w-3 text-primary" />
              <span className="text-foreground font-semibold">{filteredCount}</span> commands
            </span>
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-primary" />
              <span className="text-foreground font-semibold">{filtered.length}</span> categories
            </span>
            {search && (
              <span className="text-primary">
                grep: "{search}"
              </span>
            )}
          </div>
        </div>

        {/* Command Categories */}
        <ScrollArea className="h-[calc(100vh-420px)]">
          <div className="space-y-4 pr-2">
            {filtered.length === 0 && (
              <div className="border border-border/50 rounded-lg bg-card p-12 text-center">
                <Terminal className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="font-mono text-muted-foreground font-medium">
                  $ grep "{search}" /dev/null
                </p>
                <p className="text-sm text-muted-foreground/60 mt-2 font-mono">
                  No commands matched. Try adjusting your search or filter.
                </p>
              </div>
            )}

            {filtered.map((category) => (
              <OsintCategorySection key={category.id} category={category} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </PlatformLayout>
  );
}
