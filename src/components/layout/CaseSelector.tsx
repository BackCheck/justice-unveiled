import { useCases } from "@/hooks/useCases";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, ChevronDown } from "lucide-react";

export const CaseSelector = () => {
  const { data: cases, isLoading } = useCases();
  const { selectedCaseId, setSelectedCaseId } = useCaseFilter();

  return (
    <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-lg px-3 py-1 shadow-sm hover:border-primary/50 transition-colors">
      <Briefcase className="w-4 h-4 text-primary shrink-0" />
      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider hidden sm:block">Case:</span>
      <Select
        value={selectedCaseId || "all"}
        onValueChange={(val) => setSelectedCaseId(val === "all" ? null : val)}
      >
        <SelectTrigger className="w-[140px] sm:w-[220px] h-8 text-sm font-semibold bg-transparent border-0 shadow-none focus:ring-0 px-0.5 text-foreground">
          <SelectValue placeholder={isLoading ? "Loading..." : "All Cases"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cases</SelectItem>
          {(cases || []).map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.case_number} — {c.title.length > 30 ? c.title.slice(0, 30) + "…" : c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
