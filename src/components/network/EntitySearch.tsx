import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CombinedEntity } from "@/hooks/useCombinedEntities";
import { categoryColors } from "@/data/entitiesData";
import { 
  Search, 
  X, 
  Users, 
  Building2, 
  Shield, 
  Scale,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RedactedText } from "@/components/ui/RedactedText";

interface EntitySearchProps {
  entities: CombinedEntity[];
  onSelectEntity: (entity: CombinedEntity) => void;
  selectedEntity: CombinedEntity | null;
}

export const EntitySearch = ({ entities, onSelectEntity, selectedEntity }: EntitySearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "person": return Users;
      case "organization": return Building2;
      case "agency": return Shield;
      default: return Scale;
    }
  };

  const filteredEntities = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().split(" ").filter(Boolean);
    
    return entities
      .filter(entity => {
        const searchableText = `${entity.name} ${entity.role} ${entity.description} ${entity.type} ${entity.category}`.toLowerCase();
        return searchTerms.every(term => searchableText.includes(term));
      })
      .sort((a, b) => {
        // Prioritize exact name matches
        const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
        const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        // Then by name alphabetically
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10); // Limit to 10 results
  }, [entities, query]);

  const handleSelect = useCallback((entity: CombinedEntity) => {
    onSelectEntity(entity);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onSelectEntity]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || filteredEntities.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredEntities.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredEntities.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredEntities[highlightedIndex]) {
          handleSelect(filteredEntities[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, filteredEntities, highlightedIndex, handleSelect]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredEntities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search entities..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 h-9 text-sm"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredEntities.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg overflow-hidden">
          <ScrollArea className="max-h-[300px]">
            <div className="p-1">
              {filteredEntities.map((entity, index) => {
                const Icon = getIcon(entity.type);
                const isHighlighted = index === highlightedIndex;
                const isSelected = selectedEntity?.id === entity.id;
                
                return (
                  <button
                    key={entity.id}
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-sm text-left transition-colors",
                      isHighlighted && "bg-accent",
                      isSelected && "bg-primary/10 border-l-2 border-primary"
                    )}
                    onClick={() => handleSelect(entity)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div 
                      className="flex-shrink-0 p-1.5 rounded-full"
                      style={{ backgroundColor: categoryColors[entity.category || "neutral"] }}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <RedactedText className="font-medium text-sm truncate">
                          {entity.name}
                        </RedactedText>
                        {entity.isAIExtracted && (
                          <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] h-4 px-1.5"
                          style={{ 
                            borderColor: categoryColors[entity.category || "neutral"],
                            color: categoryColors[entity.category || "neutral"]
                          }}
                        >
                          {entity.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {entity.role}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          <div className="px-3 py-1.5 border-t bg-muted/50 text-[10px] text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-background rounded border">↑↓</kbd> navigate{" "}
            <kbd className="px-1 py-0.5 bg-background rounded border">↵</kbd> select{" "}
            <kbd className="px-1 py-0.5 bg-background rounded border">esc</kbd> close
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim() && filteredEntities.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No entities found for "{query}"
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching by name, role, or type
          </p>
        </div>
      )}
    </div>
  );
};
