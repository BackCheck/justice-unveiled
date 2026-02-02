import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { violationStats, internationalViolations, localViolations } from "@/data/violationsData";
import { BookOpen, Globe, Building2, Shield, Users, Scale } from "lucide-react";

const frameworkData = [
  {
    name: "United Nations",
    code: "UN",
    icon: Globe,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    instruments: ["UDHR", "ICCPR", "CAT"],
    description: "Universal human rights standards"
  },
  {
    name: "European Union",
    code: "EU",
    icon: Shield,
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    instruments: ["ECHR", "EU Charter"],
    description: "Regional enforcement mechanisms"
  },
  {
    name: "Organisation of Islamic Cooperation",
    code: "OIC",
    icon: Building2,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    instruments: ["Cairo Declaration"],
    description: "Islamic human rights perspective"
  },
  {
    name: "Regional Instruments",
    code: "Regional",
    icon: Users,
    color: "bg-orange-500",
    textColor: "text-orange-600",
    instruments: ["Banjul Charter", "Pact of San José"],
    description: "African and American frameworks"
  }
];

const localStatutes = [
  { name: "PECA 2016", violations: localViolations.filter(v => v.statute === "PECA 2016").length },
  { name: "CrPC", violations: localViolations.filter(v => v.statute === "CrPC").length },
  { name: "Constitution", violations: localViolations.filter(v => v.statute === "Constitution").length },
  { name: "QSO", violations: localViolations.filter(v => v.statute === "Qanun-e-Shahadat").length },
  { name: "PPC", violations: localViolations.filter(v => v.statute === "PPC").length }
];

export const FrameworkBreakdown = () => {
  const maxViolations = Math.max(
    ...Object.values(violationStats.frameworks),
    ...localStatutes.map(s => s.violations)
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* International Frameworks */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            International Framework Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {frameworkData.map((framework) => {
            const count = violationStats.frameworks[framework.code as keyof typeof violationStats.frameworks];
            const percentage = (count / maxViolations) * 100;
            const FrameworkIcon = framework.icon;

            return (
              <div key={framework.code} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FrameworkIcon className={`w-4 h-4 ${framework.textColor}`} />
                    <span className="text-sm font-medium">{framework.name}</span>
                  </div>
                  <Badge variant="secondary">{count} violations</Badge>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
                <div className="flex flex-wrap gap-1">
                  {framework.instruments.map((inst) => (
                    <Badge key={inst} variant="outline" className="text-xs">
                      {inst}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Local Statutes */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-600" />
            Local Statute Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {localStatutes.map((statute) => {
            const percentage = (statute.violations / maxViolations) * 100;

            return (
              <div key={statute.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{statute.name}</span>
                  <Badge variant="secondary">{statute.violations} violations</Badge>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </div>
            );
          })}
          
          {/* Severity breakdown */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Severity Distribution</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-destructive/10 text-center">
                <div className="text-lg font-bold text-destructive">{violationStats.local.critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 text-center">
                <div className="text-lg font-bold text-amber-700">{violationStats.local.high}</div>
                <div className="text-xs text-muted-foreground">High</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 text-center">
                <div className="text-lg font-bold text-blue-700">{violationStats.local.medium}</div>
                <div className="text-xs text-muted-foreground">Medium</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
