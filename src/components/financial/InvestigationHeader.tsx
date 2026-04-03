import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  riskLevel: string;
  caseLabel: string;
  analyzing: boolean;
  onUpload: () => void;
}

const riskBadge: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
  none: "bg-muted text-muted-foreground",
};

export const InvestigationHeader = ({ riskLevel, caseLabel, analyzing, onUpload }: Props) => (
  <header className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center px-6 gap-4 shrink-0">
    <div className="flex items-center gap-3 min-w-0">
      <h1 className="text-sm font-semibold truncate">Financial Intelligence</h1>
      <Badge variant="outline" className="text-[10px] shrink-0">{caseLabel}</Badge>
      {riskLevel !== "none" && (
        <Badge className={`text-[10px] shrink-0 ${riskBadge[riskLevel]}`}>
          {riskLevel.toUpperCase()} RISK
        </Badge>
      )}
    </div>
    <div className="flex-1" />
    <Button variant="outline" size="sm" onClick={onUpload} disabled={analyzing} className="gap-2 text-xs">
      <Upload className="w-3.5 h-3.5" />
      {analyzing ? "Analyzing…" : "Upload Records"}
    </Button>
  </header>
);
