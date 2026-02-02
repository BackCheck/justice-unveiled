import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { localViolations, LocalViolation } from "@/data/violationsData";
import { Gavel, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";

const severityStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  medium: "bg-blue-500/10 text-blue-700 border-blue-500/30"
};

const ViolationRow = ({ violation }: { violation: LocalViolation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = violation.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <Badge variant="outline" className="text-xs font-mono">
                {violation.statute}
              </Badge>
              <span className="ml-2 text-xs text-muted-foreground">{violation.section}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="font-medium">{violation.title}</TableCell>
        <TableCell className="max-w-xs">
          <p className="text-sm text-muted-foreground line-clamp-2">{violation.description}</p>
        </TableCell>
        <TableCell>
          <Badge className={severityStyles[violation.severity]} variant="outline">
            {violation.severity.toUpperCase()}
          </Badge>
        </TableCell>
        <TableCell className="text-center">{violation.incidents.length}</TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <TableRow className="bg-muted/30">
          <TableCell colSpan={6} className="p-0">
            <div className="p-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Documented Incidents:</h4>
                <ul className="space-y-1">
                  {violation.incidents.map((incident, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      {incident}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Dates: </span>
                {violation.eventDates.map((date, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {format(new Date(date), "MMM d, yyyy")}
                  </Badge>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const LocalViolationsTable = () => {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gavel className="w-5 h-5 text-amber-600" />
          Local Law Violations (Pakistani Statutes)
          <Badge variant="secondary" className="ml-auto">
            {localViolations.length} Documented
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[180px]">Statute</TableHead>
              <TableHead>Violation</TableHead>
              <TableHead className="w-[250px]">Description</TableHead>
              <TableHead className="w-[100px]">Severity</TableHead>
              <TableHead className="w-[80px] text-center">Incidents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localViolations.map((violation) => (
              <ViolationRow key={violation.id} violation={violation} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
