import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText
} from "lucide-react";
import type { ComplianceCheck, ProceduralRequirement } from "@/types/compliance";
import { statusConfig, severityConfig } from "@/types/compliance";
import { cn } from "@/lib/utils";

interface SOPComparisonTableProps {
  requirements: ProceduralRequirement[];
  checks: ComplianceCheck[];
}

export const SOPComparisonTable = ({ requirements, checks }: SOPComparisonTableProps) => {
  const checksByReq = new Map(checks.map(c => [c.requirement_id, c]));
  
  // Filter to only show items with violations or notable differences
  const notableItems = requirements.filter(req => {
    const check = checksByReq.get(req.id);
    return check && (check.status === 'violated' || check.status === 'partial' || check.actual_action);
  });

  if (notableItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No SOP Comparisons Available</h3>
          <p className="text-sm text-muted-foreground text-center">
            Mark items as violated and document actual vs. expected actions to see comparisons
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-5 h-5 text-primary" />
          SOP vs. Actual Action Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Requirement</TableHead>
              <TableHead>Expected (SOP)</TableHead>
              <TableHead className="w-[50px] text-center"></TableHead>
              <TableHead>Actual Action</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notableItems.map((req) => {
              const check = checksByReq.get(req.id);
              const status = check?.status || 'pending';
              const statusCfg = statusConfig[status];
              const severityCfg = severityConfig[req.severity_if_violated];

              return (
                <TableRow key={req.id} className={cn(
                  status === 'violated' && "bg-destructive/5"
                )}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{req.requirement_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {req.legal_reference}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm">{req.requirement_description}</p>
                      {req.statutory_timeline && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Timeline: {req.statutory_timeline}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "p-2 rounded border",
                      status === 'violated' ? "bg-destructive/10 border-destructive/30" : "bg-muted/50"
                    )}>
                      <p className="text-sm">
                        {check?.actual_action || check?.violation_details || 'No action documented'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      {status === 'violated' ? (
                        <XCircle className="w-5 h-5 text-destructive" />
                      ) : status === 'compliant' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", statusCfg.bgColor, statusCfg.color)}
                      >
                        {statusCfg.label}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
