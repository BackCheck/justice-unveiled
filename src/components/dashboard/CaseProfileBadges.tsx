import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Shield, 
  Scale, 
  Globe, 
  AlertOctagon,
  FileWarning,
  Users,
  Building2,
  Eye,
  Gavel,
  BookOpen
} from "lucide-react";

interface ViolationBadge {
  id: string;
  label: string;
  framework: "local" | "international";
  article?: string;
  severity: "critical" | "high" | "medium";
  icon: typeof Shield;
  description: string;
}

interface CaseScore {
  id: string;
  label: string;
  value: number;
  maxValue: number;
  color: string;
  description: string;
}

const localViolations: ViolationBadge[] = [
  {
    id: "peca-33",
    label: "PECA §33",
    framework: "local",
    article: "Section 33",
    severity: "critical",
    icon: Shield,
    description: "Illegal search without warrant - Prevention of Electronic Crimes Act 2016"
  },
  {
    id: "crpc-103",
    label: "CrPC §103",
    framework: "local",
    article: "Section 103",
    severity: "critical",
    icon: FileWarning,
    description: "No independent witnesses during search - Criminal Procedure Code"
  },
  {
    id: "crpc-342",
    label: "CrPC §342",
    framework: "local",
    article: "Section 342",
    severity: "high",
    icon: Gavel,
    description: "Right to be heard - Criminal Procedure Code"
  },
  {
    id: "qso-117",
    label: "QSO Art.117",
    framework: "local",
    article: "Article 117",
    severity: "critical",
    icon: BookOpen,
    description: "Forged documents - Qanun-e-Shahadat Order"
  }
];

const internationalViolations: ViolationBadge[] = [
  {
    id: "udhr-9",
    label: "UDHR Art.9",
    framework: "international",
    article: "Article 9",
    severity: "critical",
    icon: Globe,
    description: "Arbitrary arrest and detention - Universal Declaration of Human Rights"
  },
  {
    id: "udhr-12",
    label: "UDHR Art.12",
    framework: "international",
    article: "Article 12",
    severity: "high",
    icon: Eye,
    description: "Privacy violations - Universal Declaration of Human Rights"
  },
  {
    id: "iccpr-14",
    label: "ICCPR Art.14",
    framework: "international",
    article: "Article 14",
    severity: "critical",
    icon: Scale,
    description: "Right to fair trial - International Covenant on Civil and Political Rights"
  },
  {
    id: "iccpr-17",
    label: "ICCPR Art.17",
    framework: "international",
    article: "Article 17",
    severity: "high",
    icon: Users,
    description: "Unlawful interference with privacy - ICCPR"
  },
  {
    id: "cat-16",
    label: "CAT Art.16",
    framework: "international",
    article: "Article 16",
    severity: "critical",
    icon: AlertOctagon,
    description: "Cruel, inhuman treatment - Convention Against Torture"
  },
  {
    id: "echr-6",
    label: "ECHR Art.6",
    framework: "international",
    article: "Article 6",
    severity: "high",
    icon: Building2,
    description: "Right to fair hearing - European Convention on Human Rights"
  }
];

const caseScores: CaseScore[] = [
  {
    id: "evidence-strength",
    label: "Evidence Strength",
    value: 94,
    maxValue: 100,
    color: "bg-emerald-500",
    description: "Based on 123 verified sources and forensic analysis"
  },
  {
    id: "procedural-failures",
    label: "Procedural Failure Rate",
    value: 87,
    maxValue: 100,
    color: "bg-destructive",
    description: "Percentage of legal procedures violated by authorities"
  },
  {
    id: "documentation-coverage",
    label: "Documentation Coverage",
    value: 91,
    maxValue: 100,
    color: "bg-primary",
    description: "Completeness of evidence documentation"
  },
  {
    id: "witness-corroboration",
    label: "Witness Corroboration",
    value: 78,
    maxValue: 100,
    color: "bg-chart-2",
    description: "Independent witness verification rate"
  }
];

const severityStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20",
  high: "bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20",
  medium: "bg-blue-500/10 text-blue-700 border-blue-500/30 hover:bg-blue-500/20"
};

export const CaseProfileBadges = () => {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Scores Section */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Case Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {caseScores.map((score) => (
                <Tooltip key={score.id}>
                  <TooltipTrigger asChild>
                    <div className="space-y-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-help">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{score.label}</span>
                        <span className="text-lg font-bold">{score.value}%</span>
                      </div>
                      <Progress value={score.value} className="h-2" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>{score.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Violations Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Local Law Violations */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-600" />
                Local Law Violations
                <Badge variant="outline" className="ml-auto bg-amber-500/10 text-amber-700 border-amber-200">
                  {localViolations.length} Documented
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {localViolations.map((violation) => {
                  const Icon = violation.icon;
                  return (
                    <Tooltip key={violation.id}>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className={`${severityStyles[violation.severity]} cursor-help transition-all px-3 py-1.5 text-sm font-medium`}
                        >
                          <Icon className="w-3.5 h-3.5 mr-1.5" />
                          {violation.label}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-semibold">{violation.article}</p>
                        <p className="text-xs mt-1">{violation.description}</p>
                        <Badge className={`mt-2 ${severityStyles[violation.severity]}`} variant="outline">
                          {violation.severity.toUpperCase()}
                        </Badge>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* International Framework Violations */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                International Frameworks
                <Badge variant="outline" className="ml-auto bg-blue-500/10 text-blue-700 border-blue-200">
                  {internationalViolations.length} Violated
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {internationalViolations.map((violation) => {
                  const Icon = violation.icon;
                  return (
                    <Tooltip key={violation.id}>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className={`${severityStyles[violation.severity]} cursor-help transition-all px-3 py-1.5 text-sm font-medium`}
                        >
                          <Icon className="w-3.5 h-3.5 mr-1.5" />
                          {violation.label}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-semibold">{violation.article}</p>
                        <p className="text-xs mt-1">{violation.description}</p>
                        <Badge className={`mt-2 ${severityStyles[violation.severity]}`} variant="outline">
                          {violation.severity.toUpperCase()}
                        </Badge>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Severity Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span>Critical Violation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500/60" />
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500/60" />
            <span>Medium Severity</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
