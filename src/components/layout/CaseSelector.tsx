import { useCases } from "@/hooks/useCases";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase } from "lucide-react";

export const CaseSelector = () => {
  const { data: cases, isLoading } = useCases();
  const { selectedCaseId, setSelectedCaseId } = useCaseFilter();

  return (
    <div className="flex items-center gap-2">
      <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
      <Select
        value={selectedCaseId || "all"}
        onValueChange={(val) => setSelectedCaseId(val === "all" ? null : val)}
      >
        <SelectTrigger className="w-[140px] sm:w-[180px] h-8 text-xs bg-background/50 border-border/50">
          <SelectValue placeholder={isLoading ? "Loading..." : "All Cases"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cases</SelectItem>
          {(cases || []).map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.case_number} — {c.title.length > 20 ? c.title.slice(0, 20) + "…" : c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
