import { AlertTriangle, FileWarning, Shield, Gavel, Building2, Users, Eye, Phone, Banknote } from "lucide-react";

export interface KeyFinding {
  id: string;
  title: string;
  category: "procedural" | "forensic" | "corruption" | "judicial" | "regulatory" | "conspiracy" | "surveillance" | "financial";
  severity: "critical" | "high" | "medium";
  summary: string;
  details: string[];
  relatedEvents: number[];
  sources: string;
  icon: typeof AlertTriangle;
}

export const keyFindings: KeyFinding[] = [
  {
    id: "illegal-raid",
    title: "Illegal Midnight Raid",
    category: "procedural",
    severity: "critical",
    summary: "FIA raid conducted without search warrant, violating Section 33 PECA and Section 103 CrPC.",
    details: [
      "No search warrant produced during midnight raid",
      "No independent witnesses present",
      "16-21 digital devices seized without proper protocols",
      "Devices not sealed at the spot - chain of custody broken from start"
    ],
    relatedEvents: [13],
    sources: "[1-7, 11, 19-21, 23, 24, 26-29]",
    icon: Shield
  },
  {
    id: "forged-memos",
    title: "Recovery Memo Forgery",
    category: "forensic",
    severity: "critical",
    summary: "Handwriting expert confirmed signatures on FIA recovery memos were forged.",
    details: [
      "Official signatures on recovery memos confirmed as forgeries",
      "Documents fabricated to provide legal cover for planted evidence",
      "Chain of custody documentation falsified",
      "Court applied 'Falsus in Uno, Falsus in Omnibus' doctrine"
    ],
    relatedEvents: [17, 23],
    sources: "[6, 47]",
    icon: FileWarning
  },
  {
    id: "impossible-report",
    title: "Impossible Technical Report",
    category: "forensic",
    severity: "critical",
    summary: "Technical report on 16+ devices generated in 25-35 minutes - physically impossible.",
    details: [
      "Tariq Arbab admitted he was not a forensic expert",
      "Report generated within minutes of returning to station",
      "No proper forensic methodology followed",
      "Report became foundation for wrongful conviction"
    ],
    relatedEvents: [14],
    sources: "[24, 28, 30-32]",
    icon: AlertTriangle
  },
  {
    id: "device-switching",
    title: "Evidence Tampering - Device Switch",
    category: "forensic",
    severity: "high",
    summary: "FIR specified Samsung J5, but Samsung J7 was produced for forensic analysis.",
    details: [
      "Complainant's FIR mentioned Samsung Galaxy J5",
      "Different device (J7) presented as evidence",
      "Victim denied handing over any devices to FIA",
      "Clear indication of evidence planting"
    ],
    relatedEvents: [12],
    sources: "[1, 19, 20, 23, 24]",
    icon: AlertTriangle
  },
  {
    id: "fia-corruption",
    title: "FIA Extortion Racket Exposed",
    category: "corruption",
    severity: "high",
    summary: "Internal FIA probe exposed extortion operation targeting IT CEOs, including case officer.",
    details: [
      "Abdul Ghaffar found running shakedown operation",
      "Multiple IT CEOs targeted for extortion",
      "Same circle handling Thanvi case",
      "Systemic corruption in Karachi Cybercrime Wing"
    ],
    relatedEvents: [15],
    sources: "[8, 33, 34]",
    icon: Building2
  },
  {
    id: "abduction-conspiracy",
    title: "Recorded Abduction Conspiracy",
    category: "conspiracy",
    severity: "critical",
    summary: "Audio recordings captured conspiracy between Lt. Col. Saqib Mumtaz and Tayyab Shah to abduct Danish Thanvi.",
    details: [
      "Phone calls recorded discussing 'disappearing' the target",
      "Coordination through military intelligence contacts",
      "Plans to plant evidence discussed",
      "Evidence of premeditated persecution"
    ],
    relatedEvents: [3],
    sources: "[14-16]",
    icon: Users
  },
  {
    id: "regulatory-abuse",
    title: "Coordinated Regulatory Attack",
    category: "regulatory",
    severity: "high",
    summary: "NADRA and SECP actions appear coordinated after criminal case failed.",
    details: [
      "NADRA terminated VeriSys access without 30-day notice",
      "Termination caused 78% revenue loss",
      "SECP issued winding up notice immediately after",
      "High Court found prima facie due process violations"
    ],
    relatedEvents: [20, 21, 22],
    sources: "[2-4, 6, 8, 11, 16, 20, 36, 39-44]",
    icon: Gavel
  },
  {
    id: "state-surveillance",
    title: "State Surveillance Weaponization",
    category: "surveillance",
    severity: "critical",
    summary: "Military officer sent victim's IBMS travel history and real-time GPS coordinates as threats.",
    details: [
      "4-year international travel history accessed from IBMS",
      "Real-time GPS coordinates sent via WhatsApp",
      "Threatening messages: 'Run Lola run, u can't hide'",
      "Use of LIMS/GSM triangulation for civilian stalking"
    ],
    relatedEvents: [6],
    sources: "[8, 9, 14]",
    icon: Eye
  },
  {
    id: "witness-coercion",
    title: "Witness Coercion & Blank Document Signing",
    category: "procedural",
    severity: "high",
    summary: "BCG employee detained 9 hours and forced to sign blank documents by FIA.",
    details: [
      "Irfan-ul-Haq detained from 2:00 PM to 11:30 PM",
      "Forced to sign blank papers without knowledge of contents",
      "Summoned 9 months before official enquiry number assigned",
      "Evidence of pre-planned fabrication"
    ],
    relatedEvents: [9],
    sources: "[19, 22]",
    icon: Users
  },
  {
    id: "financial-sabotage",
    title: "Financial Sabotage via Stolen Data",
    category: "financial",
    severity: "critical",
    summary: "Unsealed seized devices enabled LinkedIn hack and NADRA termination after criminal case collapsed.",
    details: [
      "16 devices never entered in Malkhana—handed to Col. Saqib",
      "LinkedIn profile (28 years) deleted in June 2024",
      "NADRA VeriSys identified as 'kill switch' from stolen data",
      "Affidavit documents $2 million in damages"
    ],
    relatedEvents: [20, 21],
    sources: "[2-4, 6, 8, 11, 16, 20, 36, 39-44]",
    icon: Banknote
  }
];

export const findingCategoryColors: Record<KeyFinding["category"], string> = {
  procedural: "bg-red-500/10 text-red-700 border-red-200",
  forensic: "bg-amber-500/10 text-amber-700 border-amber-200",
  corruption: "bg-purple-500/10 text-purple-700 border-purple-200",
  judicial: "bg-blue-500/10 text-blue-700 border-blue-200",
  regulatory: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  conspiracy: "bg-rose-500/10 text-rose-700 border-rose-200",
  surveillance: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  financial: "bg-orange-500/10 text-orange-700 border-orange-200"
};

export const severityColors: Record<KeyFinding["severity"], string> = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-500 text-white",
  medium: "bg-blue-500 text-white"
};
