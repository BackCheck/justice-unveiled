import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimelineEvent, categoryColors } from "@/data/timelineData";

interface TimelineFiltersProps {
  selectedCategories: TimelineEvent["category"][];
  onCategoryToggle: (category: TimelineEvent["category"]) => void;
  totalEvents: number;
  filteredCount: number;
}

const categories: TimelineEvent["category"][] = [
  "Business Interference",
  "Harassment",
  "Legal Proceeding",
  "Criminal Allegation"
];

export const TimelineFilters = ({
  selectedCategories,
  onCategoryToggle,
  totalEvents,
  filteredCount
}: TimelineFiltersProps) => {
  return (
    <div className="bg-card border rounded-lg p-4 mb-8 sticky top-20 z-10 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2 self-center">Filter by:</span>
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <Button
                key={category}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryToggle(category)}
                className={isSelected ? `${categoryColors[category]} text-white border-transparent hover:opacity-90` : ""}
              >
                {category}
              </Button>
            );
          })}
        </div>
        <Badge variant="outline" className="text-sm">
          Showing {filteredCount} of {totalEvents} events
        </Badge>
      </div>
    </div>
  );
};
