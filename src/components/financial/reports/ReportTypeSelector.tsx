import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileBarChart, FileText, Scale, Clock, Users, Shield,
  ArrowRight,
} from "lucide-react";

export type ReportType =
  | "executive" | "full" | "legal" | "timeline" | "actor_risk" | "evidence_summary" | "board";

interface ReportTypeDef {
  id: ReportType;
  title: string;
  desc: string;
  icon: typeof FileBarChart;
  sections: string[];
  badge?: string;
}

export const reportTypes: ReportTypeDef[] = [
  {
    id: "executive",
    title: "Executive Investigation Report",
    desc: "Leadership-ready briefing with key findings, risk assessment, and recommendations.",
    icon: FileBarChart,
    badge: "Recommended",
    sections: ["Case Summary", "Risk Level", "Key Actors", "Key Findings", "Investigation Phases", "Major Patterns", "Top Evidence", "Conclusion"],
  },
  {
    id: "full",
    title: "Full Investigation Report",
    desc: "Comprehensive forensic analysis — actors, timeline, patterns, evidence chain, and AI insights.",
    icon: FileText,
    sections: ["Executive Summary", "Case Metadata", "Actor Profiles", "Timeline", "Pattern Analysis", "Control Map", "Discrepancies", "Evidence Chain", "AI Insights", "Risk Assessment", "Legal Exposure", "Recommendations"],
  },
  {
    id: "legal",
    title: "Legal Brief",
    desc: "Court-ready summary with parties, key events, violations, and supporting evidence.",
    icon: Scale,
    sections: ["Case Background", "Parties", "Key Events", "Legal Exposure", "Violations", "Evidence", "Summary of Findings"],
  },
  {
    id: "timeline",
    title: "Timeline Report",
    desc: "Chronological case narrative with phase breakdown and escalation notes.",
    icon: Clock,
    sections: ["Year Grouped Events", "Phase Breakdown", "Linked Actors", "Linked Evidence", "Escalation Notes"],
  },
  {
    id: "actor_risk",
    title: "Actor Risk Report",
    desc: "Individual threat profiles with risk scores, findings, and linked evidence.",
    icon: Users,
    sections: ["Actor Profiles", "Risk Rankings", "Timeline Events", "Patterns", "Linked Evidence"],
  },
  {
    id: "evidence_summary",
    title: "Evidence Summary Report",
    desc: "Document inventory with analysis status, linked actors, and evidentiary value.",
    icon: Shield,
    sections: ["File List", "Evidence Types", "Linked Actors", "Linked Events", "Analysis Status"],
  },
  {
    id: "board",
    title: "Board Summary Report",
    desc: "One-page executive-level briefing for board members — clean, concise, decision-ready.",
    icon: FileBarChart,
    badge: "New",
    sections: ["Case Snapshot", "Risk Assessment", "Key Findings", "Recommended Actions"],
  },
];

interface Props {
  onSelect: (type: ReportType) => void;
  generating?: boolean;
}

export const ReportTypeSelector = ({ onSelect, generating }: Props) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold mb-1">Select Report Type</h3>
      <p className="text-xs text-muted-foreground">
        Reports are auto-generated from ingested case data — no manual drafting required.
      </p>
    </div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
      {reportTypes.map(rt => (
        <Card
          key={rt.id}
          className="cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          onClick={() => !generating && onSelect(rt.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <rt.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold leading-tight">{rt.title}</h4>
                  {rt.badge && <Badge variant="default" className="text-[9px] px-1.5 py-0">{rt.badge}</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{rt.desc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {rt.sections.slice(0, 4).map(s => (
                <Badge key={s} variant="outline" className="text-[9px] py-0">{s}</Badge>
              ))}
              {rt.sections.length > 4 && (
                <Badge variant="outline" className="text-[9px] py-0">+{rt.sections.length - 4} more</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Generate Report <ArrowRight className="w-3 h-3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
