import { 
  Shield, 
  Scale, 
  Gavel, 
  FileWarning, 
  Eye, 
  Users, 
  Building2, 
  AlertOctagon,
  BookOpen,
  Lock,
  Home,
  FileText,
  Ban,
  UserX,
  Handshake
} from "lucide-react";

// Local Pakistani Law Violations
export interface LocalViolation {
  id: string;
  statute: string;
  section: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  incidents: string[];
  eventDates: string[];
  icon: typeof Shield;
}

export const localViolations: LocalViolation[] = [
  {
    id: "peca-33",
    statute: "PECA 2016",
    section: "Section 33",
    title: "Illegal Search Without Warrant",
    description: "FIA conducted midnight raid without obtaining proper search warrant as mandated under PECA",
    severity: "critical",
    incidents: [
      "Midnight raid on 2019-03-22 without search warrant",
      "16-21 digital devices seized without legal authority",
      "No independent witnesses present during search"
    ],
    eventDates: ["2019-03-22"],
    icon: Shield
  },
  {
    id: "crpc-103",
    statute: "CrPC",
    section: "Section 103",
    title: "Absence of Independent Witnesses",
    description: "Search conducted without independent witnesses from the locality as required by law",
    severity: "critical",
    incidents: [
      "No mashirs (witnesses) from the locality present",
      "Only FIA officials participated in the raid",
      "Violation of mandatory witness requirement"
    ],
    eventDates: ["2019-03-22"],
    icon: FileWarning
  },
  {
    id: "crpc-342",
    statute: "CrPC",
    section: "Section 342",
    title: "Right to Be Heard Violated",
    description: "Accused was not given proper opportunity to be heard before adverse decisions",
    severity: "high",
    incidents: [
      "Statements recorded without proper legal representation",
      "Cross-examination rights hindered",
      "Defense submissions ignored in judgment"
    ],
    eventDates: ["2024-05-08"],
    icon: Gavel
  },
  {
    id: "qso-117",
    statute: "Qanun-e-Shahadat",
    section: "Article 117",
    title: "Forged Documentary Evidence",
    description: "Recovery memos and official documents contained forged signatures",
    severity: "critical",
    incidents: [
      "Handwriting expert confirmed forged signatures on recovery memos",
      "Ex-9/B and Ex-9/C found to be fabricated",
      "Chain of custody documentation falsified"
    ],
    eventDates: ["2023-03-01"],
    icon: FileText
  },
  {
    id: "ppc-182",
    statute: "PPC",
    section: "Section 182",
    title: "False Information to Public Servant",
    description: "Complainant provided false information in FIR and official complaints",
    severity: "high",
    incidents: [
      "FIR specified Samsung J5 but J7 was produced",
      "Complainant admitted no obscene pictures were annexed",
      "Maligning letter contained admitted falsehoods"
    ],
    eventDates: ["2019-02-18", "2016-12-22"],
    icon: Ban
  },
  {
    id: "ppc-211",
    statute: "PPC",
    section: "Section 211",
    title: "False Charge of Offence",
    description: "Filing of false criminal case with fabricated allegations",
    severity: "critical",
    incidents: [
      "First FIR (25/2017) disposed as C-Class for lack of evidence",
      "Multiple false allegations including kidnapping and robbery",
      "Weapons never returned despite licensed ownership"
    ],
    eventDates: ["2017-01-16"],
    icon: UserX
  },
  {
    id: "constitution-4",
    statute: "Constitution",
    section: "Article 4",
    title: "Right of Due Process",
    description: "Fundamental right to be dealt with in accordance with law violated",
    severity: "critical",
    incidents: [
      "Illegal midnight raid without warrant",
      "NADRA terminated contract without 30-day notice",
      "Regulatory action without proper hearing"
    ],
    eventDates: ["2019-03-22", "2024-10-01"],
    icon: Scale
  },
  {
    id: "constitution-10a",
    statute: "Constitution",
    section: "Article 10-A",
    title: "Right to Fair Trial",
    description: "Constitutional guarantee of fair trial and due process violated",
    severity: "critical",
    incidents: [
      "Evidence tampering and forgery",
      "Witness intimidation",
      "Biased investigation by officials running extortion racket"
    ],
    eventDates: ["2024-05-08", "2018-03-21"],
    icon: Gavel
  },
  {
    id: "constitution-14",
    statute: "Constitution",
    section: "Article 14",
    title: "Dignity of Person Violated",
    description: "Inviolability of dignity of man and privacy of home violated",
    severity: "high",
    incidents: [
      "Midnight raid on family residence",
      "Public defamation through maligning letter",
      "Surveillance and tracking of civilian"
    ],
    eventDates: ["2019-03-22", "2016-12-22", "2016-12-31"],
    icon: Home
  },
  {
    id: "constitution-18",
    statute: "Constitution",
    section: "Article 18",
    title: "Freedom of Trade/Business",
    description: "Right to conduct lawful trade and business systematically undermined",
    severity: "critical",
    incidents: [
      "NADRA access terminated causing 78% revenue loss",
      "SECP show cause notice based on vendetta",
      "Maligning letter sent to 300 employees and clients"
    ],
    eventDates: ["2024-10-01", "2025-04-01", "2016-12-22"],
    icon: Building2
  }
];

// International Human Rights Violations
export interface InternationalViolation {
  id: string;
  framework: "UN" | "OIC" | "EU" | "Regional";
  instrument: string;
  article: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  incidents: string[];
  eventDates: string[];
  icon: typeof Shield;
}

export const internationalViolations: InternationalViolation[] = [
  // UN Framework
  {
    id: "udhr-3",
    framework: "UN",
    instrument: "UDHR",
    article: "Article 3",
    title: "Right to Life, Liberty, Security",
    description: "Everyone has the right to life, liberty and security of person",
    severity: "critical",
    incidents: [
      "Recorded conspiracy to 'disappear' the accused",
      "Threats to life communicated via WhatsApp",
      "Extra-legal planning between military and family members"
    ],
    eventDates: ["2016-11-11"],
    icon: Shield
  },
  {
    id: "udhr-9",
    framework: "UN",
    instrument: "UDHR",
    article: "Article 9",
    title: "Freedom from Arbitrary Arrest",
    description: "No one shall be subjected to arbitrary arrest, detention or exile",
    severity: "critical",
    incidents: [
      "Midnight arrest without proper warrant",
      "Detention based on fabricated evidence",
      "11-month delay before formal enquiry registration"
    ],
    eventDates: ["2019-03-22", "2018-04-01"],
    icon: Lock
  },
  {
    id: "udhr-10",
    framework: "UN",
    instrument: "UDHR",
    article: "Article 10",
    title: "Right to Fair Public Hearing",
    description: "Right to a fair and public hearing by an independent tribunal",
    severity: "critical",
    incidents: [
      "Trial judge ignored forensic evidence contradictions",
      "Prosecution evidence from officer running extortion racket",
      "Judgment based on 'summersaulted' testimony"
    ],
    eventDates: ["2024-05-08"],
    icon: Scale
  },
  {
    id: "udhr-11",
    framework: "UN",
    instrument: "UDHR",
    article: "Article 11",
    title: "Presumption of Innocence",
    description: "Everyone charged is presumed innocent until proved guilty",
    severity: "high",
    incidents: [
      "Conviction based on disputed forensic evidence",
      "Burden of proof shifted to accused",
      "Exculpatory evidence ignored"
    ],
    eventDates: ["2024-05-08"],
    icon: Gavel
  },
  {
    id: "udhr-12",
    framework: "UN",
    instrument: "UDHR",
    article: "Article 12",
    title: "Privacy Violations",
    description: "No arbitrary interference with privacy, family, home or correspondence",
    severity: "high",
    incidents: [
      "4-year travel history tracked via IBMS",
      "Location coordinates shared as threats",
      "Unauthorized surveillance using military resources"
    ],
    eventDates: ["2016-12-31"],
    icon: Eye
  },
  {
    id: "udhr-17",
    framework: "UN",
    instrument: "UDHR",
    article: "Article 17",
    title: "Right to Property",
    description: "No one shall be arbitrarily deprived of property",
    severity: "high",
    incidents: [
      "Licensed weapons never returned after acquittal",
      "Business assets destroyed through regulatory abuse",
      "NADRA termination caused 78% revenue loss"
    ],
    eventDates: ["2017-01-16", "2024-10-01"],
    icon: Building2
  },
  {
    id: "iccpr-7",
    framework: "UN",
    instrument: "ICCPR",
    article: "Article 7",
    title: "Prohibition of Cruel Treatment",
    description: "No cruel, inhuman or degrading treatment or punishment",
    severity: "critical",
    incidents: [
      "Witness detained until midnight and forced to sign blank papers",
      "Systematic intimidation of family members",
      "Mental torture through prolonged legal harassment"
    ],
    eventDates: ["2018-03-21", "2016-11-08"],
    icon: AlertOctagon
  },
  {
    id: "iccpr-14",
    framework: "UN",
    instrument: "ICCPR",
    article: "Article 14",
    title: "Fair Trial Rights",
    description: "Right to a fair and public hearing by competent, independent tribunal",
    severity: "critical",
    incidents: [
      "Chain of custody completely broken",
      "Forged recovery memos used as evidence",
      "IO was part of extortion racket"
    ],
    eventDates: ["2024-05-08", "2021-03-01"],
    icon: FileText
  },
  {
    id: "iccpr-17",
    framework: "UN",
    instrument: "ICCPR",
    article: "Article 17",
    title: "Unlawful Interference",
    description: "No arbitrary or unlawful interference with privacy",
    severity: "high",
    incidents: [
      "Misuse of official IBMS travel database",
      "Military intelligence resources used for private vendetta",
      "Personal devices seized without proper authority"
    ],
    eventDates: ["2016-12-31", "2019-03-22"],
    icon: Users
  },
  {
    id: "cat-15",
    framework: "UN",
    instrument: "CAT",
    article: "Article 15",
    title: "Evidence Obtained by Torture",
    description: "Evidence obtained as a result of torture shall not be invoked",
    severity: "critical",
    incidents: [
      "Witness coerced to sign blank papers",
      "Statements obtained under duress",
      "Testimony extracted through intimidation"
    ],
    eventDates: ["2018-03-21"],
    icon: Ban
  },
  // OIC Framework
  {
    id: "cdhri-2",
    framework: "OIC",
    instrument: "Cairo Declaration",
    article: "Article 2",
    title: "Right to Life",
    description: "Life is a God-given gift; it is prohibited to take life except for Shari'ah prescribed reason",
    severity: "critical",
    incidents: [
      "Conspiracy to abduct and 'disappear' victim",
      "Life threats via official channels",
      "Abuse of state power to endanger life"
    ],
    eventDates: ["2016-11-11"],
    icon: Shield
  },
  {
    id: "cdhri-19",
    framework: "OIC",
    instrument: "Cairo Declaration",
    article: "Article 19",
    title: "Equality Before the Law",
    description: "All individuals are equal before the law without distinction",
    severity: "high",
    incidents: [
      "Military officials received preferential treatment",
      "Civilian complaints ignored while counter-allegations acted upon",
      "Unequal application of legal procedures"
    ],
    eventDates: ["2017-12-06"],
    icon: Scale
  },
  {
    id: "cdhri-20",
    framework: "OIC",
    instrument: "Cairo Declaration",
    article: "Article 20",
    title: "Freedom from Arbitrary Arrest",
    description: "No arrest without legitimate reason",
    severity: "critical",
    incidents: [
      "Arrest based on fabricated evidence",
      "Detention without proper warrant",
      "False charges filed to facilitate arrest"
    ],
    eventDates: ["2019-03-22", "2017-01-16"],
    icon: Lock
  },
  // EU Framework
  {
    id: "echr-3",
    framework: "EU",
    instrument: "ECHR",
    article: "Article 3",
    title: "Prohibition of Torture",
    description: "No one shall be subjected to torture or inhuman treatment",
    severity: "critical",
    incidents: [
      "Mental torture through 8+ years of legal harassment",
      "Witness coercion and intimidation",
      "Systematic persecution of family"
    ],
    eventDates: ["2016-11-08", "2018-03-21"],
    icon: AlertOctagon
  },
  {
    id: "echr-5",
    framework: "EU",
    instrument: "ECHR",
    article: "Article 5",
    title: "Right to Liberty and Security",
    description: "Everyone has the right to liberty and security of person",
    severity: "critical",
    incidents: [
      "Unlawful detention following illegal raid",
      "3-year imprisonment based on forged evidence",
      "Security threats from state officials"
    ],
    eventDates: ["2019-03-22", "2024-05-08"],
    icon: Shield
  },
  {
    id: "echr-6",
    framework: "EU",
    instrument: "ECHR",
    article: "Article 6",
    title: "Right to Fair Trial",
    description: "Fair and public hearing within reasonable time",
    severity: "critical",
    incidents: [
      "5-year delay from FIR to trial judgment",
      "Evidence tampering throughout proceedings",
      "Biased judicial approach ignoring exculpatory evidence"
    ],
    eventDates: ["2019-03-22", "2024-05-08"],
    icon: Gavel
  },
  {
    id: "echr-8",
    framework: "EU",
    instrument: "ECHR",
    article: "Article 8",
    title: "Right to Private Life",
    description: "Everyone has the right to respect for private and family life",
    severity: "high",
    incidents: [
      "Home raided at midnight",
      "Personal devices seized and examined",
      "Surveillance of private movements"
    ],
    eventDates: ["2019-03-22", "2016-12-31"],
    icon: Home
  },
  {
    id: "echr-13",
    framework: "EU",
    instrument: "ECHR",
    article: "Article 13",
    title: "Right to Effective Remedy",
    description: "Right to an effective remedy before a national authority",
    severity: "high",
    incidents: [
      "FIA complaint ignored for 11 months",
      "Counter-allegations prioritized over victim complaints",
      "Remedies frustrated through procedural abuse"
    ],
    eventDates: ["2017-12-06"],
    icon: Handshake
  },
  // Regional
  {
    id: "achpr-5",
    framework: "Regional",
    instrument: "Banjul Charter",
    article: "Article 5",
    title: "Dignity and Prohibition of Torture",
    description: "Every individual shall have the right to respect of dignity",
    severity: "critical",
    incidents: [
      "Public defamation campaign",
      "Witness humiliation and coercion",
      "Degrading treatment during detention"
    ],
    eventDates: ["2016-12-22", "2018-03-21"],
    icon: Users
  },
  {
    id: "achr-7",
    framework: "Regional",
    instrument: "Pact of San José",
    article: "Article 7",
    title: "Right to Personal Liberty",
    description: "Every person has the right to personal liberty and security",
    severity: "critical",
    incidents: [
      "Arbitrary arrest without proper process",
      "Detention based on fabricated charges",
      "Liberty deprived through malicious prosecution"
    ],
    eventDates: ["2019-03-22"],
    icon: Lock
  }
];

// Map timeline events to violations
export interface IncidentMapping {
  eventDate: string;
  eventDescription: string;
  localViolations: string[];
  internationalViolations: string[];
}

export const incidentMappings: IncidentMapping[] = [
  {
    eventDate: "2016-11-08",
    eventDescription: "Domestic violence incident and humanitarian shelter",
    localViolations: ["constitution-14"],
    internationalViolations: ["iccpr-7", "echr-3"]
  },
  {
    eventDate: "2016-11-11",
    eventDescription: "Recorded conspiracy to abduct and disappear target",
    localViolations: [],
    internationalViolations: ["udhr-3", "cdhri-2"]
  },
  {
    eventDate: "2016-12-22",
    eventDescription: "Maligning letter with false allegations distributed",
    localViolations: ["constitution-14", "ppc-182"],
    internationalViolations: ["achpr-5"]
  },
  {
    eventDate: "2016-12-31",
    eventDescription: "Unauthorized surveillance and location tracking",
    localViolations: ["constitution-14"],
    internationalViolations: ["udhr-12", "iccpr-17", "echr-8"]
  },
  {
    eventDate: "2017-01-16",
    eventDescription: "First false FIR registered",
    localViolations: ["ppc-211"],
    internationalViolations: ["udhr-17"]
  },
  {
    eventDate: "2017-12-06",
    eventDescription: "FIA complaint ignored for 11 months",
    localViolations: [],
    internationalViolations: ["cdhri-19", "echr-13"]
  },
  {
    eventDate: "2018-03-21",
    eventDescription: "Witness detained and forced to sign blank papers",
    localViolations: [],
    internationalViolations: ["iccpr-7", "cat-15", "echr-3", "achpr-5"]
  },
  {
    eventDate: "2019-02-18",
    eventDescription: "Device switching - J5 to J7",
    localViolations: ["ppc-182"],
    internationalViolations: []
  },
  {
    eventDate: "2019-03-22",
    eventDescription: "Illegal midnight raid and arrest",
    localViolations: ["peca-33", "crpc-103", "constitution-4", "constitution-14"],
    internationalViolations: ["udhr-9", "cdhri-20", "echr-5", "echr-8", "achr-7"]
  },
  {
    eventDate: "2021-03-01",
    eventDescription: "IO exposed as part of extortion racket",
    localViolations: ["constitution-10a"],
    internationalViolations: ["iccpr-14"]
  },
  {
    eventDate: "2023-03-01",
    eventDescription: "Forged signatures confirmed on recovery memos",
    localViolations: ["qso-117"],
    internationalViolations: []
  },
  {
    eventDate: "2024-05-08",
    eventDescription: "Conviction based on disputed evidence",
    localViolations: ["crpc-342", "constitution-10a"],
    internationalViolations: ["udhr-10", "udhr-11", "iccpr-14", "echr-6"]
  },
  {
    eventDate: "2024-10-01",
    eventDescription: "NADRA terminates access without notice",
    localViolations: ["constitution-4", "constitution-18"],
    internationalViolations: ["udhr-17"]
  },
  {
    eventDate: "2025-04-01",
    eventDescription: "SECP show cause notice issued",
    localViolations: ["constitution-18"],
    internationalViolations: []
  }
];

// Summary statistics
export const violationStats = {
  local: {
    total: localViolations.length,
    critical: localViolations.filter(v => v.severity === "critical").length,
    high: localViolations.filter(v => v.severity === "high").length,
    medium: localViolations.filter(v => v.severity === "medium").length
  },
  international: {
    total: internationalViolations.length,
    critical: internationalViolations.filter(v => v.severity === "critical").length,
    high: internationalViolations.filter(v => v.severity === "high").length,
    medium: internationalViolations.filter(v => v.severity === "medium").length
  },
  frameworks: {
    UN: internationalViolations.filter(v => v.framework === "UN").length,
    OIC: internationalViolations.filter(v => v.framework === "OIC").length,
    EU: internationalViolations.filter(v => v.framework === "EU").length,
    Regional: internationalViolations.filter(v => v.framework === "Regional").length
  }
};
