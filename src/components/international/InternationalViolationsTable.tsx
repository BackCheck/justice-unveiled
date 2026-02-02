import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { internationalViolations, InternationalViolation, violationStats } from "@/data/violationsData";
import { Globe, ChevronDown, ChevronRight, Calendar, Shield, Building2, Users } from "lucide-react";
import { format } from "date-fns";

const severityStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  medium: "bg-blue-500/10 text-blue-700 border-blue-500/30"
};

const frameworkColors: Record<string, { bg: string; text: string; icon: typeof Globe }> = {
  UN: { bg: "bg-blue-500/10", text: "text-blue-600", icon: Globe },
  OIC: { bg: "bg-purple-500/10", text: "text-purple-600", icon: Building2 },
  EU: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: Shield },
  Regional: { bg: "bg-orange-500/10", text: "text-orange-600", icon: Users }
};

const ViolationRow = ({ violation }: { violation: InternationalViolation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = violation.icon;
  const framework = frameworkColors[violation.framework];

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
            <div className={`w-8 h-8 rounded-lg ${framework.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${framework.text}`} />
            </div>
            <div>
              <Badge variant="outline" className="text-xs font-mono">
                {violation.instrument}
              </Badge>
              <span className="ml-2 text-xs text-muted-foreground">{violation.article}</span>
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
                      <span className={`w-1.5 h-1.5 rounded-full ${framework.bg.replace('/10', '')} mt-2 flex-shrink-0`} />
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

const ViolationsTable = ({ violations }: { violations: InternationalViolation[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[40px]"></TableHead>
        <TableHead className="w-[180px]">Instrument</TableHead>
        <TableHead>Right Violated</TableHead>
        <TableHead className="w-[250px]">Description</TableHead>
        <TableHead className="w-[100px]">Severity</TableHead>
        <TableHead className="w-[80px] text-center">Incidents</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {violations.map((violation) => (
        <ViolationRow key={violation.id} violation={violation} />
      ))}
    </TableBody>
  </Table>
);

export const InternationalViolationsTable = () => {
  const unViolations = internationalViolations.filter(v => v.framework === "UN");
  const oicViolations = internationalViolations.filter(v => v.framework === "OIC");
  const euViolations = internationalViolations.filter(v => v.framework === "EU");
  const regionalViolations = internationalViolations.filter(v => v.framework === "Regional");

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          International Human Rights Violations
          <Badge variant="secondary" className="ml-auto">
            {internationalViolations.length} Documented
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pb-2 border-b border-border">
            <TabsList>
              <TabsTrigger value="all">All ({internationalViolations.length})</TabsTrigger>
              <TabsTrigger value="un">UN ({violationStats.frameworks.UN})</TabsTrigger>
              <TabsTrigger value="oic">OIC ({violationStats.frameworks.OIC})</TabsTrigger>
              <TabsTrigger value="eu">EU ({violationStats.frameworks.EU})</TabsTrigger>
              <TabsTrigger value="regional">Regional ({violationStats.frameworks.Regional})</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="m-0">
            <ViolationsTable violations={internationalViolations} />
          </TabsContent>
          
          <TabsContent value="un" className="m-0">
            <ViolationsTable violations={unViolations} />
          </TabsContent>
          
          <TabsContent value="oic" className="m-0">
            <ViolationsTable violations={oicViolations} />
          </TabsContent>
          
          <TabsContent value="eu" className="m-0">
            <ViolationsTable violations={euViolations} />
          </TabsContent>
          
          <TabsContent value="regional" className="m-0">
            <ViolationsTable violations={regionalViolations} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
