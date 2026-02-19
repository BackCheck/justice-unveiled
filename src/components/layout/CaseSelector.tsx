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
    <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1">
      <Briefcase className="w-4 h-4 text-primary shrink-0" />
      <Select
        value={selectedCaseId || "all"}
        onValueChange={(val) => setSelectedCaseId(val === "all" ? null : val)}
      >
        <SelectTrigger className="w-[180px] sm:w-[240px] h-9 text-sm font-medium bg-transparent border-0 shadow-none focus:ring-0 px-1">
          <SelectValue placeholder={isLoading ? "Loading..." : "All Cases"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cases</SelectItem>
          {(cases || []).map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.case_number} — {c.title.length > 25 ? c.title.slice(0, 25) + "…" : c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
