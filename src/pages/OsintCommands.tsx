import { useState, useMemo } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { osintCategories, type OsintCommand } from "@/data/osintCommandsData";
import { Search, Copy, Check, ExternalLink, Terminal, BookOpen, Hash } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function CommandCard({ cmd }: { cmd: OsintCommand }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd.command);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-3 hover:border-primary/30 hover:bg-card/80 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-foreground leading-tight">{cmd.title}</p>
        <div className="flex items-center gap-1 shrink-0">
          {cmd.isLink && cmd.linkUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-60 hover:opacity-100"
              onClick={() => window.open(cmd.linkUrl, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-60 hover:opacity-100"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <div className="relative">
        <pre className="text-xs font-mono bg-muted/60 rounded-md p-2.5 overflow-x-auto text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
          <code>{cmd.command}</code>
        </pre>
      </div>
    </div>
  );
}

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
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">OSINT Command Library</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {totalCommands}+ one-liner commands for open-source intelligence gathering. Search, copy, and deploy.
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            Source: <a href="https://github.com/yogsec/One-Liner-OSINT" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">yogsec/One-Liner-OSINT</a> — curated for HRPM investigators.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commands by title or syntax…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs rounded-full"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Button>
            {osintCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {filteredCount} commands
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {filtered.length} categories
            </span>
          </div>
        </div>

        {/* Command Categories */}
        <ScrollArea className="h-[calc(100vh-340px)]">
          <div className="space-y-4 pr-2">
            {filtered.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                <Terminal className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No commands found</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
              </Card>
            )}

            {filtered.map((category) => (
              <Card key={category.id} className="overflow-hidden border-border/50">
                <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <h2 className={cn("text-base font-semibold", category.color)}>{category.name}</h2>
                    <Badge variant="secondary" className="text-[10px] h-5 ml-auto">
                      {category.subcategories.reduce((s, sub) => s + sub.commands.length, 0)}
                    </Badge>
                  </div>
                </div>

                <Accordion type="multiple" className="w-full">
                  {category.subcategories.map((sub, si) => (
                    <AccordionItem key={si} value={`${category.id}-${si}`} className="border-border/20">
                      <AccordionTrigger className="px-4 py-2.5 text-sm hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>{sub.icon}</span>
                          <span className="font-medium">{sub.name}</span>
                          <Badge variant="outline" className="text-[10px] h-4 ml-1">
                            {sub.commands.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          {sub.commands.map((cmd) => (
                            <CommandCard key={cmd.id} cmd={cmd} />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </PlatformLayout>
  );
}
