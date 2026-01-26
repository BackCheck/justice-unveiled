export interface Source {
  id: number;
  title: string;
  type: "document" | "legal" | "audio" | "testimony" | "report" | "petition";
  category: "primary" | "secondary" | "judicial";
  reliability: "high" | "medium" | "low";
  events: number[]; // indices to timelineData
  summary: string;
}

export const sources: Source[] = [
  {
    id: 1,
    title: "The-Acquittal-of-Danish-Farrukh-Thanvi-A-Procedura.md",
    type: "document",
    category: "judicial",
    reliability: "high",
    events: [10, 12, 13, 14, 16, 18, 19, 23, 24],
    summary: "Procedural analysis of the acquittal judgment documenting chain of custody failures and forensic irregularities."
  },
  {
    id: 2,
    title: "The-Ordeal-of-Danish-Thanvi-Law-and-State-Malfeasa.md",
    type: "document",
    category: "primary",
    reliability: "high",
    events: [2, 5, 7, 8, 13, 17, 18, 20, 22, 23, 24],
    summary: "Comprehensive account of state malfeasance including illegal raids and regulatory overreach."
  },
  {
    id: 3,
    title: "Danish Complaint to FIA Cyber Crime with sign (Autosaved).pdf.docx",
    type: "legal",
    category: "primary",
    reliability: "high",
    events: [2, 5, 7, 13, 24],
    summary: "Original complaint filed by Danish Thanvi with FIA Cybercrime detailing harassment."
  },
  {
    id: 6,
    title: "Timeline and Case Records of Danish Thanvi vs. FIA",
    type: "document",
    category: "primary",
    reliability: "high",
    events: [5, 13, 16, 17, 18, 20, 22, 23, 24],
    summary: "Detailed timeline with case records, evidence of forgery and chain of custody breaks."
  },
  {
    id: 7,
    title: "Navigating the Abuse of Cybercrime Laws and Government Machinery: A Case Study",
    type: "report",
    category: "secondary",
    reliability: "high",
    events: [0, 1, 5, 7, 13, 18, 21, 22, 23],
    summary: "Academic-style case study on abuse of cybercrime laws in Pakistan."
  },
  {
    id: 14,
    title: "State Surveillance and Rogue Intelligence in the Thanvi Case",
    type: "document",
    category: "primary",
    reliability: "high",
    events: [3, 4, 6],
    summary: "Documenting misuse of military intelligence resources for personal vendettas."
  },
  {
    id: 19,
    title: "EVIDENCE FOR PRINT",
    type: "document",
    category: "primary",
    reliability: "high",
    events: [7, 8, 9, 10, 11, 12, 13, 16],
    summary: "Compiled evidence documentation for legal proceedings."
  },
  {
    id: 20,
    title: "The J7 Mystery and FIA Case Forensic Dossier",
    type: "report",
    category: "judicial",
    reliability: "high",
    events: [8, 10, 11, 12, 16, 18, 19, 20, 23],
    summary: "Forensic analysis of device switching (J5 to J7) and FIA procedural violations."
  },
  {
    id: 27,
    title: "JUDGMENT 22.05.2025 IN THE COURT OF SESSIONS JUDGE KARACHI SOUTH",
    type: "legal",
    category: "judicial",
    reliability: "high",
    events: [13, 16, 18, 23],
    summary: "Official acquittal judgment by Sessions Judge Suresh Kumar."
  },
  {
    id: 33,
    title: "The-Corruption-and-Forgery-Case-of-Abdul-Ghaffar.md",
    type: "document",
    category: "primary",
    reliability: "high",
    events: [15],
    summary: "Internal FIA investigation revealing extortion racket in Karachi Cybercrime Circle."
  },
  {
    id: 47,
    title: "The-Forensic-Exposure-of-FIA-Document-Forgery.md",
    type: "report",
    category: "judicial",
    reliability: "high",
    events: [23],
    summary: "Handwriting expert analysis confirming forged signatures on recovery memos."
  }
];

export const sourceTypeColors: Record<Source["type"], string> = {
  document: "bg-blue-500",
  legal: "bg-emerald-500",
  audio: "bg-purple-500",
  testimony: "bg-amber-500",
  report: "bg-cyan-500",
  petition: "bg-rose-500"
};

export const reliabilityColors: Record<Source["reliability"], string> = {
  high: "text-emerald-600 bg-emerald-100",
  medium: "text-amber-600 bg-amber-100",
  low: "text-red-600 bg-red-100"
};
