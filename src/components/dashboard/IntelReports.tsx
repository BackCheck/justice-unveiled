import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Scale,
  FileWarning,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Fingerprint,
  Building2,
} from "lucide-react";

interface IntelReport {
  id: string;
  title: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "confirmed" | "investigating" | "pending";
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  keyFindings: string[];
  evidence: {
    type: string;
    description: string;
    confidence: number;
  }[];
  timeline: {
    date: string;
    event: string;
  }[];
  recommendations: string[];
}

const reports: IntelReport[] = [
  {
    id: "forensic-1",
    title: "Forensic Evidence Analysis",
    category: "Forensic",
    severity: "critical",
    status: "confirmed",
    icon: Fingerprint,
    summary: "Comprehensive analysis reveals systematic evidence fabrication including forged signatures, manipulated documents, and procedural violations during the FIA raid.",
    keyFindings: [
      "SI Imran Saad's signatures on recovery memos confirmed as forged by forensic expert",
      "Initial technical report produced in 25-35 minutes for 16+ devices - physically impossible timeline",
      "Hash values generated post-seizure, not at recovery site as legally required",
      "No independent witnesses present during search and seizure operations",
    ],
    evidence: [
      { type: "Document", description: "Forged recovery memo signatures", confidence: 94 },
      { type: "Technical", description: "Hash value timeline discrepancy", confidence: 89 },
      { type: "Procedural", description: "CrPC §103 violations documented", confidence: 96 },
    ],
    timeline: [
      { date: "2019-07-18", event: "Illegal FIA raid conducted without proper warrant" },
      { date: "2019-07-18", event: "Hash values generated off-site (chain of custody broken)" },
      { date: "2024-10-15", event: "Sessions Court notes 'falsus in uno' principle applies" },
      { date: "2025-05-20", event: "Full acquittal based on evidence fabrication findings" },
    ],
    recommendations: [
      "File criminal complaint against FIA officials for evidence tampering",
      "Request judicial inquiry into FIA Cyber Crime Wing practices",
      "Document all forensic findings for potential civil litigation",
    ],
  },
  {
    id: "surveillance-1",
    title: "State Surveillance Misuse",
    category: "Surveillance",
    severity: "critical",
    status: "confirmed",
    icon: Eye,
    summary: "Evidence of coordinated misuse of state surveillance apparatus through military intelligence connections to track, intimidate, and harass the target.",
    keyFindings: [
      "Lt. Col. Saqib Mumtaz used MI connections for unauthorized surveillance",
      "GPS coordinates sent as intimidation messages to target and family",
      "NADRA database access potentially misused for tracking movements",
      "Pattern of surveillance activity correlated with harassment timeline",
    ],
    evidence: [
      { type: "Communication", description: "Threatening messages with GPS coordinates", confidence: 92 },
      { type: "Pattern", description: "Surveillance activity correlation", confidence: 78 },
      { type: "Testimonial", description: "Witness statements on tracking", confidence: 85 },
    ],
    timeline: [
      { date: "2018-11-01", event: "First GPS-based threat message received" },
      { date: "2019-03-15", event: "Surveillance pattern identified around business premises" },
      { date: "2019-08-22", event: "NADRA access records show suspicious queries" },
    ],
    recommendations: [
      "File complaint with ISI oversight committee",
      "Request parliamentary inquiry into MI surveillance protocols",
      "Document all surveillance evidence for international human rights bodies",
    ],
  },
  {
    id: "financial-1",
    title: "Financial Sabotage Analysis",
    category: "Economic",
    severity: "high",
    status: "confirmed",
    icon: Building2,
    summary: "Coordinated actions by regulatory bodies resulted in 78% revenue loss for BCG, including suspicious NADRA contract termination and SECP winding-up proceedings.",
    keyFindings: [
      "NADRA terminated VeriSys access without 30-day notice as per contract",
      "Termination timeline correlates with Lt. Col. Saqib's threats",
      "SECP show-cause notice issued within weeks of NADRA termination",
      "High Court later stayed SECP winding-up proceedings",
    ],
    evidence: [
      { type: "Contract", description: "NADRA agreement 30-day clause violation", confidence: 100 },
      { type: "Financial", description: "78% revenue loss documentation", confidence: 95 },
      { type: "Timing", description: "Coordinated regulatory action pattern", confidence: 88 },
    ],
    timeline: [
      { date: "2019-04-01", event: "NADRA VeriSys contract terminated without notice" },
      { date: "2019-04-15", event: "SECP show-cause notice issued for winding up" },
      { date: "2019-07-01", event: "BCG revenue drops to 22% of pre-harassment levels" },
      { date: "2020-02-10", event: "High Court grants stay on SECP proceedings" },
    ],
    recommendations: [
      "Pursue breach of contract claim against NADRA",
      "Document complete financial impact for damages calculation",
      "Explore malicious prosecution claims against coordinating officials",
    ],
  },
  {
    id: "procedural-1",
    title: "Procedural Violations Matrix",
    category: "Legal",
    severity: "high",
    status: "confirmed",
    icon: Scale,
    summary: "Systematic violations of criminal procedure codes across multiple agencies, forming the basis for the acquittal under 'Falsus in Uno, Falsus in Omnibus' doctrine.",
    keyFindings: [
      "CrPC §103: No independent witnesses during search",
      "CrPC §342: Accused's statement not properly recorded",
      "PECA §33: Improper preservation of electronic evidence",
      "QSO Art.117: Documents not proven in accordance with law",
    ],
    evidence: [
      { type: "Legal", description: "Multiple CrPC violations documented", confidence: 98 },
      { type: "Procedural", description: "PECA compliance failures", confidence: 94 },
      { type: "Judicial", description: "Court acknowledgment in acquittal order", confidence: 100 },
    ],
    timeline: [
      { date: "2019-07-18", event: "CrPC §103/§342 violations during raid" },
      { date: "2019-07-20", event: "PECA §33 evidence handling violations" },
      { date: "2024-10-15", event: "Sessions Court applies Falsus in Uno doctrine" },
      { date: "2025-05-20", event: "Full acquittal citing procedural violations" },
    ],
    recommendations: [
      "File departmental complaint against investigating officers",
      "Document all violations for potential malicious prosecution claim",
      "Submit case study to law reform commissions",
    ],
  },
];

const severityColors = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-orange-500/10 text-orange-700 border-orange-300",
  medium: "bg-amber-500/10 text-amber-700 border-amber-300",
  low: "bg-blue-500/10 text-blue-700 border-blue-300",
};

const statusIcons = {
  confirmed: CheckCircle2,
  investigating: Clock,
  pending: XCircle,
};

const statusColors = {
  confirmed: "text-emerald-600",
  investigating: "text-amber-600",
  pending: "text-muted-foreground",
};

export const IntelReports = () => {
  const [expandedReports, setExpandedReports] = useState<string[]>([]);

  const toggleReport = (id: string) => {
    setExpandedReports(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          In-Depth Intelligence Reports
        </h2>
        <Badge variant="outline" className="bg-primary/10 border-primary/30">
          {reports.length} ACTIVE REPORTS
        </Badge>
      </div>

      <div className="space-y-3">
        {reports.map((report) => {
          const Icon = report.icon;
          const StatusIcon = statusIcons[report.status];
          const isExpanded = expandedReports.includes(report.id);

          return (
            <Collapsible key={report.id} open={isExpanded} onOpenChange={() => toggleReport(report.id)}>
              <Card className="glass-card">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-full bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {report.title}
                            <StatusIcon className={`w-4 h-4 ${statusColors[report.status]}`} />
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={severityColors[report.severity]}>
                          {report.severity.toUpperCase()}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-6">
                    <Separator />

                    {/* Key Findings */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Key Findings
                      </h4>
                      <ul className="space-y-2">
                        {report.keyFindings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="pill-stat h-1.5 w-1.5 mt-2 bg-primary rounded-full flex-shrink-0" />
                            <span className="text-muted-foreground">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evidence with Confidence */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        Evidence Confidence
                      </h4>
                      <div className="space-y-3">
                        {report.evidence.map((ev, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                <Badge variant="secondary" className="mr-2 text-xs">{ev.type}</Badge>
                                {ev.description}
                              </span>
                              <span className="font-medium">{ev.confidence}%</span>
                            </div>
                            <Progress value={ev.confidence} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Event Timeline
                      </h4>
                      <div className="space-y-2 border-l-2 border-primary/20 pl-4 ml-2">
                        {report.timeline.map((item, i) => (
                          <div key={i} className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                            <p className="text-sm">{item.event}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <FileWarning className="w-4 h-4 text-purple-500" />
                        Recommendations
                      </h4>
                      <div className="grid md:grid-cols-3 gap-2">
                        {report.recommendations.map((rec, i) => (
                          <div key={i} className="p-2 rounded-md bg-accent/30 text-sm text-muted-foreground">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};
