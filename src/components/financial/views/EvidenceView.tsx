import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, ExternalLink } from "lucide-react";
import type { FinancialEvidence } from "@/hooks/useFinancialAbuse";

interface Props {
  evidence: FinancialEvidence[];
  onUpload: () => void;
  analyzing: boolean;
}

export const EvidenceView = ({ evidence, onUpload, analyzing }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{evidence.length} documents</p>
        <Button size="sm" variant="outline" onClick={onUpload} disabled={analyzing} className="gap-2 text-xs">
          <Upload className="w-3.5 h-3.5" />Add Files
        </Button>
      </div>

      {evidence.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-sm">
          No evidence uploaded yet. Upload financial records to begin analysis.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {evidence.map(ev => (
            <Card key={ev.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.file_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(ev.file_size / 1024).toFixed(0)} KB • {new Date(ev.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={ev.analysis_status === "completed" ? "default" : "secondary"} className="text-[10px] shrink-0">
                  {ev.analysis_status === "completed" ? "✓ Analyzed" : ev.analysis_status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
