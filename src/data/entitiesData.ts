// Entity types for the network graph
export type EntityType = "person" | "organization" | "agency" | "legal" | "evidence";

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  role: string;
  description: string;
  connections: string[];
  category?: "protagonist" | "antagonist" | "neutral" | "official";
}

export interface EntityConnection {
  source: string;
  target: string;
  relationship: string;
  type: "professional" | "family" | "legal" | "adversarial" | "official";
  strength: number; // 1-5
}

export const entities: Entity[] = [
  // Key Protagonists
  {
    id: "danish-thanvi",
    name: "Danish Farrukh Thanvi",
    type: "person",
    role: "CEO, Background Check Group",
    description: "CEO of BCG, primary target of harassment campaign. Fully acquitted in May 2025.",
    connections: ["bcg", "mehwish-ali", "mumtaz-shah", "saqib-mumtaz", "fia"],
    category: "protagonist"
  },
  {
    id: "mehwish-ali",
    name: "Syeda Mehwish Ali",
    type: "person",
    role: "Former GM at BCG / Daughter of Major Mumtaz",
    description: "Initially an employee, became caught between employer and family. Victim of domestic violence.",
    connections: ["danish-thanvi", "bcg", "mumtaz-shah", "tayyab-shah"],
    category: "neutral"
  },
  
  // Key Antagonists
  {
    id: "mumtaz-shah",
    name: "Major (R) Mumtaz Hussain Shah",
    type: "person",
    role: "Primary Complainant",
    description: "Father of Mehwish Ali, filed multiple false FIRs. Admitted lacking evidence for key allegations.",
    connections: ["mehwish-ali", "saqib-mumtaz", "danish-thanvi", "fia"],
    category: "antagonist"
  },
  {
    id: "saqib-mumtaz",
    name: "Lt. Col. (R) Saqib Mumtaz",
    type: "person",
    role: "Military Intelligence / Facilitator",
    description: "Used military connections for surveillance and intimidation. Sent GPS coordinates as threats.",
    connections: ["mumtaz-shah", "danish-thanvi", "tayyab-shah", "nadra"],
    category: "antagonist"
  },
  {
    id: "tayyab-shah",
    name: "Syed Tayyab Ali Shah",
    type: "person",
    role: "Husband of Mehwish Ali / Conspirator",
    description: "Domestic violence perpetrator. Recorded conspiring to abduct Danish Thanvi.",
    connections: ["mehwish-ali", "saqib-mumtaz"],
    category: "antagonist"
  },
  
  // Organizations
  {
    id: "bcg",
    name: "Background Check Group (BCG)",
    type: "organization",
    role: "Verification Services Company",
    description: "Danish Thanvi's company, suffered 78% revenue loss after NADRA termination.",
    connections: ["danish-thanvi", "mehwish-ali", "nadra", "secp"],
    category: "protagonist"
  },
  
  // Government Agencies
  {
    id: "fia",
    name: "FIA Cyber Crime Wing",
    type: "agency",
    role: "Federal Investigation Agency",
    description: "Conducted illegal raid, fabricated evidence. Internal probe found corruption racket.",
    connections: ["danish-thanvi", "mumtaz-shah", "imran-saad", "ghaffar"],
    category: "official"
  },
  {
    id: "nadra",
    name: "NADRA",
    type: "agency",
    role: "National Database & Registration Authority",
    description: "Terminated BCG's VeriSys access without notice, violating 30-day clause.",
    connections: ["bcg", "saqib-mumtaz", "secp"],
    category: "official"
  },
  {
    id: "secp",
    name: "SECP",
    type: "agency",
    role: "Securities & Exchange Commission",
    description: "Issued show cause notice for company winding up, later stayed by High Court.",
    connections: ["bcg", "nadra"],
    category: "official"
  },
  
  // FIA Officials
  {
    id: "imran-saad",
    name: "SI Imran Saad",
    type: "person",
    role: "FIA Investigating Officer",
    description: "Lead IO on the case. Signatures on recovery memos confirmed as forged.",
    connections: ["fia", "danish-thanvi", "arbab"],
    category: "antagonist"
  },
  {
    id: "arbab",
    name: "Tariq Hussain Arbab",
    type: "person",
    role: "FIA Technical Officer",
    description: "Produced 'initial technical report' in 25-35 minutes for 16+ devices. Admitted not a forensic expert.",
    connections: ["fia", "imran-saad"],
    category: "antagonist"
  },
  {
    id: "ghaffar",
    name: "Abdul Ghaffar",
    type: "person",
    role: "FIA Official",
    description: "Exposed in internal probe for running extortion racket against IT CEOs.",
    connections: ["fia"],
    category: "antagonist"
  },
  
  // Judiciary
  {
    id: "suresh-kumar",
    name: "Sessions Judge Suresh Kumar",
    type: "person",
    role: "District & Sessions Judge, Karachi South",
    description: "Granted bail in 2024, then full acquittal in May 2025 applying 'Falsus in Uno'.",
    connections: ["danish-thanvi"],
    category: "neutral"
  },
  {
    id: "kashif-bhatti",
    name: "Judicial Magistrate Kashif Bhatti",
    type: "person",
    role: "Trial Court Magistrate",
    description: "Initial conviction in May 2024, later overturned on appeal.",
    connections: ["danish-thanvi"],
    category: "neutral"
  }
];

export const connections: EntityConnection[] = [
  // Family relationships
  { source: "mumtaz-shah", target: "mehwish-ali", relationship: "Father-Daughter", type: "family", strength: 5 },
  { source: "tayyab-shah", target: "mehwish-ali", relationship: "Husband-Wife", type: "family", strength: 4 },
  { source: "mumtaz-shah", target: "saqib-mumtaz", relationship: "Brothers/Relatives", type: "family", strength: 5 },
  
  // Professional relationships
  { source: "danish-thanvi", target: "bcg", relationship: "CEO", type: "professional", strength: 5 },
  { source: "mehwish-ali", target: "bcg", relationship: "Former Employee (GM)", type: "professional", strength: 3 },
  { source: "bcg", target: "nadra", relationship: "VeriSys Partner (Terminated)", type: "professional", strength: 4 },
  
  // Adversarial relationships
  { source: "mumtaz-shah", target: "danish-thanvi", relationship: "Filed Multiple FIRs", type: "adversarial", strength: 5 },
  { source: "saqib-mumtaz", target: "danish-thanvi", relationship: "Surveillance & Threats", type: "adversarial", strength: 5 },
  { source: "tayyab-shah", target: "danish-thanvi", relationship: "Conspiracy to Abduct", type: "adversarial", strength: 5 },
  { source: "fia", target: "danish-thanvi", relationship: "Illegal Raid & Arrest", type: "adversarial", strength: 4 },
  
  // Official/Legal relationships
  { source: "imran-saad", target: "fia", relationship: "Investigating Officer", type: "official", strength: 4 },
  { source: "arbab", target: "fia", relationship: "Technical Officer", type: "official", strength: 3 },
  { source: "ghaffar", target: "fia", relationship: "Corrupt Official", type: "official", strength: 3 },
  { source: "nadra", target: "secp", relationship: "Coordinated Action", type: "official", strength: 3 },
  { source: "suresh-kumar", target: "danish-thanvi", relationship: "Granted Acquittal", type: "legal", strength: 5 },
  
  // Conspiracy network
  { source: "saqib-mumtaz", target: "tayyab-shah", relationship: "Recorded Conspiracy", type: "adversarial", strength: 5 },
  { source: "mumtaz-shah", target: "fia", relationship: "Filed Complaints", type: "legal", strength: 4 },
  { source: "saqib-mumtaz", target: "nadra", relationship: "Influenced Termination", type: "adversarial", strength: 4 }
];

export const entityTypeColors: Record<EntityType, string> = {
  person: "hsl(var(--chart-1))",
  organization: "hsl(var(--chart-2))",
  agency: "hsl(var(--chart-3))",
  legal: "hsl(var(--chart-4))",
  evidence: "hsl(var(--chart-5))"
};

export const categoryColors: Record<string, string> = {
  protagonist: "hsl(142, 76%, 36%)",
  antagonist: "hsl(0, 84%, 60%)",
  neutral: "hsl(217, 91%, 60%)",
  official: "hsl(280, 65%, 60%)"
};
