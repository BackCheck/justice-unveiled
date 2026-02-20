import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Scale, ChevronRight, Globe, BookOpen, AlertTriangle } from "lucide-react";
import { localViolations, internationalViolations } from "@/data/violationsData";

const frameworkIcons: Record<string, typeof Globe> = {
  UN: Globe,
  OIC: BookOpen,
  EU: Scale,
  Regional: Shield,
};

const frameworkColors: Record<string, { text: string; bg: string; border: string }> = {
  UN: { text: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  OIC: { text: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  EU: { text: "text-indigo-600", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  Regional: { text: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-500/20" },
};

export const ViolationsSummaryWidget = () => {
  // Aggregate local violations by statute
  const localByStatute: Record<string, { count: number; critical: number }> = {};
  localViolations.forEach(v => {
    if (!localByStatute[v.statute]) localByStatute[v.statute] = { count: 0, critical: 0 };
    localByStatute[v.statute].count++;
    if (v.severity === "critical") localByStatute[v.statute].critical++;
  });

  // Aggregate international by framework
  const intlByFramework: Record<string, { count: number; critical: number; instruments: Set<string> }> = {};
  internationalViolations.forEach(v => {
    if (!intlByFramework[v.framework]) intlByFramework[v.framework] = { count: 0, critical: 0, instruments: new Set() };
    intlByFramework[v.framework].count++;
    if (v.severity === "critical") intlByFramework[v.framework].critical++;
    intlByFramework[v.framework].instruments.add(v.instrument);
  });

  const totalLocal = localViolations.length;
  const totalIntl = internationalViolations.length;
  const totalCritical = localViolations.filter(v => v.severity === "critical").length +
    internationalViolations.filter(v => v.severity === "critical").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Local Laws Widget */}
      <Link to="/international-analysis" className="block group">
        <div className="widget-card h-full border-l-4 border-l-amber-500/60 hover:border-l-amber-500 transition-all hover:shadow-lg hover:shadow-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10">
                  <Scale className="w-4 h-4 text-amber-600" />
                </div>
                Local Law Violations
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]">
                  {totalLocal} violations
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {Object.entries(localByStatute).slice(0, 5).map(([statute, data]) => (
              <div key={statute} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-8 rounded-full bg-amber-500/40" />
                  <div>
                    <p className="text-sm font-medium text-foreground/90">{statute}</p>
                    <p className="text-[11px] text-muted-foreground">{data.count} section{data.count > 1 ? "s" : ""} violated</p>
                  </div>
                </div>
                {data.critical > 0 && (
                  <Badge variant="destructive" className="text-[9px] gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {data.critical}
                  </Badge>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center pt-1">
              Click to view full analysis →
            </p>
          </CardContent>
        </div>
      </Link>

      {/* International Frameworks Widget */}
      <Link to="/international-analysis" className="block group">
        <div className="widget-card h-full border-l-4 border-l-blue-500/60 hover:border-l-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                International Frameworks
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/15 text-blue-700 border-blue-500/30 text-[10px]">
                  {totalIntl} violations
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {Object.entries(intlByFramework).map(([framework, data]) => {
              const colors = frameworkColors[framework] || frameworkColors.Regional;
              const Icon = frameworkIcons[framework] || Shield;
              return (
                <div key={framework} className={`flex items-center justify-between p-2.5 rounded-lg ${colors.bg} border ${colors.border} transition-colors`}>
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground/90">{framework}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {[...data.instruments].join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${colors.text}`}>{data.count}</span>
                    {data.critical > 0 && (
                      <Badge variant="destructive" className="text-[9px] gap-1">
                        {data.critical} critical
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {totalCritical} critical violations total
              </span>
              <span className="text-xs text-muted-foreground">View details →</span>
            </div>
          </CardContent>
        </div>
      </Link>
    </div>
  );
};
