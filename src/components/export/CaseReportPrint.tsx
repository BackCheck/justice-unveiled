import { forwardRef } from "react";
import humanRightsLogo from "@/assets/human-rights-logo.png";
import { Case } from "@/hooks/useCases";

interface CaseReportPrintProps {
  caseItem: Case;
  userIP?: string;
}

export const CaseReportPrint = forwardRef<HTMLDivElement, CaseReportPrintProps>(
  ({ caseItem, userIP = "Detecting..." }, ref) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
    });

    const sections = buildReportSections(caseItem);

    return (
      <div ref={ref} className="hidden print:block bg-white text-gray-900" style={{ fontSize: "12px" }}>
        {/* ===== COVER PAGE ===== */}
        <div className="min-h-screen flex flex-col justify-between p-12" style={{ pageBreakAfter: "always" }}>
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img src={humanRightsLogo} alt="HRPM Logo" className="h-24 w-auto" style={{ filter: "none" }} />
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#0087C1" }}>HRPM.org</h1>
            <p className="text-xl text-gray-600 font-medium">Human Rights Protection Movement</p>
            <div className="w-32 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: "#0087C1" }} />
          </div>

          <div className="text-center my-12">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">Official Case Intelligence Report</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{caseItem.title}</h2>
            <p className="text-lg text-gray-500 font-mono">{caseItem.case_number}</p>
            <div className="mt-8 inline-flex items-center gap-6 px-8 py-4 bg-gray-50 rounded-lg border border-gray-200">
              <ReportStat value={caseItem.total_sources} label="Sources" />
              <Divider />
              <ReportStat value={caseItem.total_events} label="Events" />
              <Divider />
              <ReportStat value={caseItem.total_entities} label="Entities" />
            </div>
          </div>

          {/* Generation details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Report Generation Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <DetailRow label="Generated On" value={formattedDate} />
              <DetailRow label="Generation Time" value={formattedTime} />
              <DetailRow label="Requester IP Address" value={userIP} mono />
              <DetailRow label="Source URL" value={typeof window !== "undefined" ? window.location.href : "https://hrpm.lovable.app"} />
            </div>
          </div>

          <CoverFooter year={now.getFullYear()} />
        </div>

        {/* ===== EXECUTIVE SUMMARY ===== */}
        <div className="p-12" style={{ pageBreakAfter: "always" }}>
          <SectionHeader title="Executive Summary" number={1} />
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
            <p>{caseItem.description}</p>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <InfoBlock label="Case Number" value={caseItem.case_number} />
              <InfoBlock label="Status" value={caseItem.status?.toUpperCase() || "N/A"} />
              <InfoBlock label="Severity" value={caseItem.severity?.toUpperCase() || "N/A"} />
              <InfoBlock label="Location" value={caseItem.location || "N/A"} />
              <InfoBlock label="Lead Investigator" value={caseItem.lead_investigator || "N/A"} />
              <InfoBlock label="Date Opened" value={caseItem.date_opened || "N/A"} />
            </div>
          </div>
        </div>

        {/* ===== REPORT SECTIONS ===== */}
        {sections.map((section, idx) => (
          <div key={section.title} className="p-12" style={{ pageBreakAfter: "always", pageBreakInside: "avoid" }}>
            <SectionHeader title={section.title} number={idx + 2} />
            <div className="space-y-4 text-sm leading-relaxed text-gray-700">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {section.stats && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {section.stats.map((s) => (
                    <div key={s.label} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-2xl font-bold block" style={{ color: "#0087C1" }}>{s.value}</span>
                      <span className="text-xs text-gray-500">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ===== CLOSING PAGE ===== */}
        <div className="min-h-screen p-12 flex flex-col justify-center items-center">
          <div className="text-center max-w-lg">
            <div className="w-16 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: "#0087C1" }} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">End of Report</h2>
            <p className="text-gray-600 mb-8">
              This report summarizes intelligence gathered from {caseItem.total_sources} verified sources
              covering {caseItem.total_events} documented events and {caseItem.total_entities} mapped entities
              for case {caseItem.case_number}.
            </p>
            <CoverFooter year={now.getFullYear()} />
          </div>
        </div>
      </div>
    );
  }
);

CaseReportPrint.displayName = "CaseReportPrint";

/* ─── Sub-components ─── */

const ReportStat = ({ value, label }: { value: number | null; label: string }) => (
  <div>
    <span className="text-2xl font-bold" style={{ color: "#0087C1" }}>{value ?? 0}</span>
    <span className="text-gray-600 ml-2">{label}</span>
  </div>
);

const Divider = () => <span className="text-gray-300">|</span>;

const DetailRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className={`font-medium text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</p>
  </div>
);

const SectionHeader = ({ title, number }: { title: string; number: number }) => (
  <div className="flex items-center gap-4 mb-8 pb-4" style={{ borderBottom: "2px solid #0087C1" }}>
    <div className="flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-lg" style={{ backgroundColor: "#0087C1" }}>
      {number}
    </div>
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
  </div>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

const CoverFooter = ({ year }: { year: number }) => (
  <div className="border-t border-gray-200 pt-6 text-xs text-gray-500 space-y-3">
    <div className="text-center">
      <p className="font-medium text-gray-800">Human Rights Protection Movement</p>
      <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
      <p>Tel: +6531 290 390 | Email: info@hrpm.org</p>
    </div>
    <div className="text-center pt-3 border-t border-gray-100">
      <p className="font-semibold text-red-700 mb-1">Strictly Confidential – Only for Advocacy Work</p>
      <p>© {year} Human Rights Protection Movement. All rights reserved.</p>
      <p className="mt-1" style={{ color: "#0087C1" }}>Documenting injustice. Demanding accountability.</p>
    </div>
  </div>
);

/* ─── Report content builder ─── */

function buildReportSections(caseItem: Case) {
  return [
    {
      title: "Intelligence Overview",
      paragraphs: [
        `This investigation has processed raw documentary evidence from ${caseItem.total_sources ?? 0} verified source documents. Through systematic AI-assisted analysis, ${caseItem.total_events ?? 0} discrete timeline events have been reconstructed and chronologically mapped.`,
        `A total of ${caseItem.total_entities ?? 0} entities—including individuals, organizations, government agencies, and legal instruments—have been identified, categorized, and mapped into an interactive network graph revealing influence patterns and power structures.`,
      ],
      stats: [
        { value: `${caseItem.total_sources ?? 0}`, label: "Source Documents" },
        { value: `${caseItem.total_events ?? 0}`, label: "Timeline Events" },
        { value: `${caseItem.total_entities ?? 0}`, label: "Entities Mapped" },
      ],
    },
    {
      title: "Network & Entity Analysis",
      paragraphs: [
        "Entity network analysis has mapped relationships across multiple categories including government officials, law enforcement personnel, legal practitioners, and institutional bodies. Influence scoring algorithms have quantified the relative power and connectivity of each actor within the network.",
        "Cluster detection has identified coordinated groups of entities acting in concert. Cross-referencing entity appearances across timeline events reveals patterns of involvement that may indicate systemic coordination or institutional bias.",
      ],
    },
    {
      title: "Timeline Reconstruction",
      paragraphs: [
        `The reconstructed timeline spans ${caseItem.total_events ?? 0} events extracted from documentary evidence including FIR records, court orders, witness statements, and official correspondence. Each event is tagged by category, involved individuals, and evidentiary sources.`,
        "AI-powered pattern detection has flagged procedural anomalies, contradictions in official records, and unexplained delays between procedural steps. These findings form the basis for compliance assessment against both domestic and international legal standards.",
      ],
    },
    {
      title: "Legal Framework Assessment",
      paragraphs: [
        "The investigation has been benchmarked against applicable domestic statutes (including PECA, CrPC, and the Constitution of Pakistan) and international human rights frameworks (UDHR, ICCPR, CAT, and ECHR). Each identified violation is cross-referenced with specific legal provisions.",
        "Compliance checks against procedural requirements under CrPC §103 (search and seizure protocols), CrPC §342 (right to be heard), and QSO Art. 117 (burden of proof) have identified gaps between statutory mandates and documented actions of investigating agencies.",
      ],
    },
    {
      title: "Evidence Correlation & Claims",
      paragraphs: [
        "Each legal claim has been systematically correlated with supporting evidence from the documentary record. An evidence matrix tracks the strength of support for individual allegations, identifying both well-supported claims and evidentiary gaps requiring further documentation.",
        "The hierarchical exhibit system organizes physical and digital evidence with chain-of-custody metadata, ensuring that the evidentiary foundation meets litigation-grade standards for potential legal proceedings.",
      ],
    },
    {
      title: "Findings & Recommendations",
      paragraphs: [
        "Based on the comprehensive analysis of all available evidence, this report identifies systemic procedural failures, potential rights violations, and patterns of institutional conduct that warrant further investigation or legal action.",
        "Recommendations include formal complaint filings with relevant oversight bodies, engagement with international human rights mechanisms, and continued evidence preservation for potential appellate or constitutional proceedings.",
      ],
    },
  ];
}
