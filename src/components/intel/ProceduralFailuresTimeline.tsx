import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  FileX, 
  UserX, 
  Clock, 
  Package, 
  Lock,
  Scale,
  FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProceduralFailure {
  id: string;
  date: string;
  title: string;
  description: string;
  violation: string;
  severity: "critical" | "high" | "medium";
  icon: React.ElementType;
}

const proceduralFailures: ProceduralFailure[] = [
  {
    id: "1",
    date: "March 22, 2019",
    title: "Warrantless Raid Conducted",
    description: "FIA conducted raid at Flat No. B-2, Clifton Garden 1 without judicial authorization",
    violation: "PECA Section 33(1) - Mandatory Search Warrant",
    severity: "critical",
    icon: FileX
  },
  {
    id: "2",
    date: "March 22, 2019",
    title: "No Gazetted Officer Present",
    description: "Operation led by an Inspector; no Gazetted Officer supervised the raid",
    violation: "PECA Section 10 Proviso",
    severity: "critical",
    icon: UserX
  },
  {
    id: "3",
    date: "March 22, 2019",
    title: "Independent Witness Protocol Violated",
    description: "No private witnesses associated despite residential setting in Clifton Garden complex",
    violation: "Cr.P.C. 103 / Daim vs. The State",
    severity: "high",
    icon: UserX
  },
  {
    id: "4",
    date: "March 22, 2019",
    title: "On-Site Sealing Failure",
    description: "Digital devices not sealed in tamper-evident packaging at point of recovery",
    violation: "Evidence Integrity Protocol",
    severity: "high",
    icon: Package
  },
  {
    id: "5",
    date: "March 23, 2019",
    title: "24-Hour Judicial Notice Missed",
    description: "No record of court being informed within statutory window post-seizure",
    violation: "PECA Section 33 - Judicial Notification",
    severity: "critical",
    icon: Clock
  },
  {
    id: "6",
    date: "March-April 2019",
    title: "Custodial Dark Period Begins",
    description: "16 seized devices allegedly handed to complainant's son Col. Saqib Mumtaz instead of Malkhana",
    violation: "Chain of Custody Protocol",
    severity: "critical",
    icon: Lock
  },
  {
    id: "7",
    date: "April 10, 2019",
    title: "Partial Forensic Submission",
    description: "Only 3 items (Samsung, iPhone, Tablet) submitted to forensic expert before bulk batch",
    violation: "Evidence Handling Protocol",
    severity: "high",
    icon: FileSearch
  },
  {
    id: "8",
    date: "May 20, 2019",
    title: "Inventory Discrepancy Discovered",
    description: "18 items submitted to forensics; total count 21 vs. 16 seized—5 unexplained items",
    violation: "Register No. XIX Documentation",
    severity: "critical",
    icon: AlertTriangle
  },
  {
    id: "9",
    date: "2022",
    title: "Section 342 CrPC Violation",
    description: "Trial court failed to question accused about specific seized items during statement",
    violation: "Section 342 Cr.P.C. - Procedural Nullity",
    severity: "critical",
    icon: Scale
  }
];

const severityConfig = {
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/50",
    text: "text-destructive",
    badge: "bg-destructive/20 text-destructive border-destructive/30"
  },
  high: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/50",
    text: "text-orange-600 dark:text-orange-400",
    badge: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30"
  },
  medium: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/50",
    text: "text-yellow-600 dark:text-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
  }
};

export const ProceduralFailuresTimeline = () => {
  return (
    <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 via-background to-orange-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Procedural Failures Timeline
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Chronological visualization of statutory violations in Criminal Appeal No. 16 of 2024
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={severityConfig.critical.badge}>
              Critical: {proceduralFailures.filter(f => f.severity === "critical").length}
            </Badge>
            <Badge variant="outline" className={severityConfig.high.badge}>
              High: {proceduralFailures.filter(f => f.severity === "high").length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-destructive via-orange-500 to-destructive/30" />
          
          {/* Timeline items */}
          <div className="space-y-6">
            {proceduralFailures.map((failure, index) => {
              const config = severityConfig[failure.severity];
              const Icon = failure.icon;
              
              return (
                <div 
                  key={failure.id}
                  className="relative pl-16 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Timeline node */}
                  <div className={cn(
                    "absolute left-3 w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-md",
                    config.bg,
                    config.border
                  )}>
                    <Icon className={cn("w-3.5 h-3.5", config.text)} />
                  </div>
                  
                  {/* Content card */}
                  <div className={cn(
                    "rounded-lg border p-4 transition-all duration-200 hover:shadow-md",
                    config.bg,
                    config.border
                  )}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {failure.date}
                          </span>
                          <Badge variant="outline" className={cn("text-xs", config.badge)}>
                            {failure.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-foreground">{failure.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{failure.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground">
                        <span className="text-destructive">Violation:</span> {failure.violation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Timeline end marker */}
          <div className="relative pl-16 mt-6">
            <div className="absolute left-3 w-7 h-7 rounded-full bg-muted border-2 border-muted-foreground/30 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  2024
                </span>
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
                  OUTCOME
                </Badge>
              </div>
              <h4 className="font-semibold text-foreground">Total Exoneration Granted</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Appellate court applied <em>Falsus in Uno, Falsus in Omnibus</em> doctrine, 
                ruling cumulative procedural failures established reasonable doubt
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
