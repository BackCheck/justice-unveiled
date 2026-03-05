import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChronologyFilters } from "@/hooks/useChronologyEvents";
import { useIsMobile } from "@/hooks/use-mobile";

const CATEGORIES = [
  "Business Interference",
  "Harassment",
  "Legal Proceeding",
  "Criminal Allegation",
] as const;

const CONFIDENCE_LEVELS = [
  { key: "high", label: "High", color: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30" },
  { key: "medium", label: "Medium", color: "bg-amber-500/20 text-amber-700 border-amber-500/30" },
  { key: "low", label: "Low", color: "bg-orange-500/20 text-orange-700 border-orange-500/30" },
  { key: "unverified", label: "Unverified", color: "bg-destructive/20 text-destructive border-destructive/30" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "Business Interference": "bg-amber-500/20 text-amber-700 border-amber-500/30",
  "Harassment": "bg-destructive/20 text-destructive border-destructive/30",
  "Legal Proceeding": "bg-primary/20 text-primary border-primary/30",
  "Criminal Allegation": "bg-violet-500/20 text-violet-700 border-violet-500/30",
};

interface ChronologyFiltersPanelProps {
  filters: ChronologyFilters;
  onFiltersChange: (filters: ChronologyFilters) => void;
  activeFilterCount: number;
}

const FilterContent = ({ filters, onFiltersChange }: Omit<ChronologyFiltersPanelProps, "activeFilterCount">) => {
  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    onFiltersChange({ ...filters, categories: next });
  };

  const toggleConfidence = (level: string) => {
    const next = filters.confidenceLevel.includes(level)
      ? filters.confidenceLevel.filter(c => c !== level)
      : [...filters.confidenceLevel, level];
    onFiltersChange({ ...filters, confidenceLevel: next });
  };

  const resetFilters = () => {
    onFiltersChange({
      yearRange: [2015, 2026],
      categories: [],
      confidenceLevel: [],
      searchQuery: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Search</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events, actors..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="pl-9"
          />
          {filters.searchQuery && (
            <button onClick={() => onFiltersChange({ ...filters, searchQuery: "" })} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Year Range */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Year Range: {filters.yearRange[0]} – {filters.yearRange[1]}
        </Label>
        <Slider
          value={filters.yearRange}
          onValueChange={(v) => onFiltersChange({ ...filters, yearRange: v as [number, number] })}
          min={2015}
          max={2026}
          step={1}
          className="mt-3"
        />
      </div>

      {/* Event Type */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Type</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {CATEGORIES.map(cat => (
            <Badge
              key={cat}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all",
                filters.categories.includes(cat) ? CATEGORY_COLORS[cat] : "opacity-50 hover:opacity-80"
              )}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence Level</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {CONFIDENCE_LEVELS.map(({ key, label, color }) => (
            <Badge
              key={key}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all",
                filters.confidenceLevel.includes(key) ? color : "opacity-50 hover:opacity-80"
              )}
              onClick={() => toggleConfidence(key)}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Reset */}
      <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full text-muted-foreground">
        <X className="w-4 h-4 mr-1" /> Reset Filters
      </Button>
    </div>
  );
};

export const ChronologyFiltersPanel = ({ filters, onFiltersChange, activeFilterCount }: ChronologyFiltersPanelProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="sticky top-20 z-10 bg-card border rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-[10px] h-5">{activeFilterCount} active</Badge>
        )}
      </div>
      <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
    </div>
  );
};
