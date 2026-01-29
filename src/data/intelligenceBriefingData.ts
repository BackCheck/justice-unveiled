import { 
  Fingerprint, 
  Users, 
  FileWarning, 
  Eye, 
  Shield, 
  Phone,
  Scale,
  Building2,
  AlertTriangle,
  FileText
} from "lucide-react";

export interface BriefingSection {
  id: string;
  title: string;
  icon: typeof Fingerprint;
  summary: string;
  keyPoints: string[];
  details: BriefingDetail[];
  connections: string[];
  sources: string;
}

export interface BriefingDetail {
  heading: string;
  content: string;
  evidence?: string;
}

export const intelligenceBriefing: BriefingSection[] = [
  {
    id: "forensic-digital-evidence",
    title: "Forensic Digital Evidence Analysis",
    icon: Fingerprint,
    summary: "The forensic digital evidence was not merely flawed—it was fabricated, forged, and weaponized as the primary mechanism of systematic persecution.",
    keyPoints: [
      "Device swap: FIR mentioned Samsung J5, but Samsung J7 was analyzed",
      "Victim denied providing any devices to FIA for forensic analysis",
      "Technical report on 16-21 devices generated in 20-25 minutes—physically impossible",
      "Screenshots allegedly from 'deactivated' Facebook profiles—technically impossible",
      "No Malkhana entry for 16 seized devices—broken chain of custody",
      "Forensic experts admitted: No spyware, no hacking, no pornography upload proof",
      "3-year delay between seizure (2019) and forensic reports (2022)",
      "Handwriting expert confirmed signatures on recovery memos were forged"
    ],
    details: [
      {
        heading: "The Device Swap",
        content: "The FIR alleged the victim was given a Samsung J5 Core Duo, but forensic analysis was conducted on a Samsung J7. The victim stated under oath: 'I did not provide my laptop and cell phone to FIA for forensic analysis.' This confirms the defense argument that the Samsung J7 was 'foisted and planted.'",
        evidence: "FIR vs. Forensic Report Exhibit 7/A discrepancy"
      },
      {
        heading: "The 20-Minute Miracle",
        content: "Inspector Tariq Arbab claimed to analyze 16-21 digital devices and generate a 30-page technical report in just 20-25 minutes. He admitted in court: 'I am not a forensic expert' and could not cite any law authorizing him to generate such a report.",
        evidence: "Initial Technical Report Exhibit 6/A"
      },
      {
        heading: "The Black Hole of Custody",
        content: "IO Imran Saad admitted he did not make an entry in Register No. 19 regarding the 16 seized devices. Devices were not sealed at recovery. The 3-year gap between seizure and forensic reports allowed potential tampering and data theft.",
        evidence: "Missing Malkhana Register entries"
      },
      {
        heading: "Experts' Admission of No Evidence",
        content: "FIA forensic experts Nauman Ali and Aamir Zaib admitted: 'No spyware software was detected,' 'No evidence of hacking was unearthed,' 'No proof that accused uploaded any video to Pornhub,' and 'No obnoxious messages were found.'",
        evidence: "Forensic Reports Ex-7/A, Ex-8/A, Ex-8/B"
      },
      {
        heading: "Document Forgery Proven",
        content: "Handwriting expert Mehmood Ahmed Malik testified that signatures of Deputy Director Abdul Ghaffar on the Letter for Forensic Analysis (Exhibit 9/C) and Seizure Memo (Exhibit 9/B) were forged. This led to application of 'Falsus in Uno, Falsus in Omnibus' doctrine.",
        evidence: "DW-01 Expert Opinion"
      }
    ],
    connections: [
      "First FIR failed → Cybercrime case manufactured with planted phone",
      "Unsealed devices → Data stolen → LinkedIn hack (June 2024)",
      "Stolen data → NADRA VeriSys termination (October 2024)",
      "Forensic collapse → Full acquittal (May 2025)"
    ],
    sources: "Sources 2, 3, 5-7, 11-14, 26-28, 40-46, 52, 54, 85, 87, 104, 128, 335, 904, 1092, 1135"
  },
  {
    id: "prosecution-witnesses",
    title: "Prosecution Witness Statement Analysis",
    icon: Users,
    summary: "Under cross-examination, prosecution witnesses dismantled their own case, admitted to procedural illegalities, and provided evidence proving the defense's systematic persecution theory.",
    keyPoints: [
      "Complainant admitted he had no direct technical knowledge of hacking or spyware",
      "Victim testified she did not provide her devices to FIA—exposing planted evidence",
      "Raid witnesses confirmed no search warrant was available",
      "No independent private witnesses associated with the residential raid",
      "Forensic experts negated every core allegation in the FIR",
      "IO admitted no Malkhana entry and reliance on forged documents",
      "Employee witness was detained 9 hours and forced to sign blank documents"
    ],
    details: [
      {
        heading: "PW-03 Major (R) Mumtaz Hussain Shah (Complainant)",
        content: "Admitted he had no direct technical knowledge of hacking or spyware. Conceded: 'No obscene picture of my daughter was in her laptop and mobile.' He claimed Danish installed spyware but admitted he did not know whether Danish actually installed it.",
        evidence: "Cross-examination transcript"
      },
      {
        heading: "PW-07 Mehwish Mumtaz (Victim)",
        content: "Made the devastating admission: 'I did not provide my laptop and cell phone to FIA for forensic analysis.' This proved the Samsung J7 analyzed by FIA did not come from her, confirming the device was planted.",
        evidence: "Cross-examination transcript"
      },
      {
        heading: "PW-01 Inspector Shagufta Shahzad",
        content: "Admitted regarding the raid: 'No search warrant was available to IO of the case during such raid.' Confirmed no independent witnesses from the Clifton residential area were associated with the raid.",
        evidence: "Raid witness testimony"
      },
      {
        heading: "PW-05 Tariq Hussain Arbab",
        content: "Admitted: 'I am not a forensic expert.' Claimed to analyze 16-21 devices in 20-25 minutes. Crucially admitted devices were not in sealed condition when handed to him—confirming broken chain of custody.",
        evidence: "Technical report author testimony"
      },
      {
        heading: "PW-06 Nauman Ali & PW-08 Aamir Zaib (Forensic Experts)",
        content: "Both admitted: 'No spyware detected,' 'No evidence of hacking,' 'No proof of Pornhub upload.' Nauman Ali admitted receiving devices in 2019 but submitting report in 2022, conceding tampering 'cannot be ruled out' without Chain of Custody form.",
        evidence: "Expert testimony and forensic reports"
      },
      {
        heading: "PW-08 Sub-Inspector Imran Saad (IO)",
        content: "Admitted no entry in Register No. 19 for seized devices. Relied on documents proven forged by handwriting expert. Could not explain why FIR mentioned Samsung J5 but he 'recovered' Samsung J7.",
        evidence: "IO testimony and forged document evidence"
      },
      {
        heading: "PW-02 Irfan-ul-Haq (Coerced Witness)",
        content: "Employee of Danish's company testified he was detained at FIA from 2:00 PM to 11:30 PM and forced to sign blank documents. His testimony confirmed unknown persons visited the office to harass staff.",
        evidence: "Witness coercion testimony"
      }
    ],
    connections: [
      "Forensics failed → Proved no crime occurred",
      "IO exposed → Proved forgery and illegal custody",
      "Victim admitted → Proved evidence was planted",
      "Witnesses collapsed → Led to full acquittal May 2025",
      "Post-acquittal → New FIR (Mobina Sohail) and State Appeal filed"
    ],
    sources: "Sources 2, 7, 11, 14, 26-28, 40-46, 54, 69, 87, 95, 104, 128, 137, 177, 213, 418"
  },
  {
    id: "formal-misconduct-complaints",
    title: "Formal Misconduct Complaints",
    icon: FileWarning,
    summary: "A decade-long legal effort to expose abuse of state authority, involving formal actions against a serving military officer and FIA officials who weaponized their positions for a personal vendetta.",
    keyPoints: [
      "January 2017: Formal complaint to IG FC against Lt. Col. Saqib Mumtaz for misusing official resources",
      "Danish's FIA complaint (Jan 2017) ignored for 11 months while opposing party's complaint acted upon immediately",
      "Handwriting analysis proved forgery of official documents",
      "Employee illegally detained 9 hours and forced to sign blank documents",
      "16 seized devices never entered in Malkhana—handed over to Col. Saqib",
      "Deputy Director Abdul Ghaffar later arrested (2021) as ringleader of FIA extortion racket"
    ],
    details: [
      {
        heading: "Complaint Against Lt. Col. Saqib Mumtaz (Jan 2017)",
        content: "On January 21, 2017, Danish sent formal complaint to Inspector General Frontier Corps (IG FC) KPK. Alleged Saqib was tracking Danish's real-time location and travel history using official IBMS data, and coordinating harassment through 'lower cadre' intelligence contacts.",
        evidence: "Email to IG FC dated 2017-01-21"
      },
      {
        heading: "Ignored FIA Complaint (2017)",
        content: "On January 7, 2017, Danish submitted complaint to Director NR3C-FIA under PECA Sections 18, 19, 20 & 24 against Lt. Col. Saqib and Syed Tayyab Ali Shah for cyber-stalking and threats. FIA delayed acknowledging for 11 months. No action taken on Danish's complaint while opposing party's complaint was acted upon immediately.",
        evidence: "FIA Complaint and 11-month delay record"
      },
      {
        heading: "Forgery of Official Documents (2019-2025)",
        content: "Defense filed application for forensics on Seizure Memo (Ex 9/B) and Forensic Request Letter (Ex 9/C). Handwriting expert proved Deputy Director Abdul Ghaffar's signatures were forged by the investigation team to cover up the planting of Samsung J7.",
        evidence: "Criminal Misc. Application, DW-01 testimony"
      },
      {
        heading: "Illegal Detention and Coercion",
        content: "Criminal Misc. Application No. 424/2019 filed against FIA inspector for illegally detaining witness Irfan-ul-Haq from 2:00 PM to 11:30 PM and forcing him to sign blank documents.",
        evidence: "Criminal Misc. Application No. 424/2019"
      },
      {
        heading: "Missing Case Property (Theft)",
        content: "Application under Section 516-A CrPC accused FIA of failing to deposit 16 seized devices in Malkhana (Register 19). Defense asserted devices were handed over to Col. Saqib, constituting theft of business assets by state officials.",
        evidence: "Section 516-A CrPC Application"
      },
      {
        heading: "The Ghaffar Scandal Validation",
        content: "Deputy Director Abdul Ghaffar, whose signature was forged in Danish's case, was arrested in 2021 by FIA Anti-Corruption Circle as ringleader of an 'official gang' extorting IT companies in Karachi for millions of rupees.",
        evidence: "FIA Anti-Corruption investigation 2021"
      }
    ],
    connections: [
      "2017: Danish reports Military Misconduct → Retaliation: First FIR",
      "2018: Danish reports FIA Inaction → Retaliation: Cybercrime Case",
      "2023-2025: Danish exposes FIA Forgery/Theft → Acquittal follows",
      "Post-Acquittal: Financial Sabotage (NADRA/SECP) and Mobina Sohail FIR launched"
    ],
    sources: "Sources 145-147, 257, 408, 409, 807, 808, 1001, 1053, 1059, 1060, 1122"
  },
  {
    id: "state-surveillance-misuse",
    title: "State Surveillance Misuse",
    icon: Eye,
    summary: "Severe breach of public trust where restricted state surveillance apparatuses—designed for national security and border control—were weaponized to settle a private family vendetta.",
    keyPoints: [
      "Lt. Col. Saqib sent Danish his 4-year international travel history (IBMS data) as threat",
      "Real-time GPS coordinates sent via WhatsApp demonstrating active tracking",
      "Explicit threats: 'Run Lola run, u can run but can't hide'",
      "Audio transcript reveals plot using Military Intelligence contact to 'pick up' Danish",
      "Individuals claiming MI affiliation visited BCG offices without warrants",
      "Unsealed seized devices enabled 2024 LinkedIn hack and NADRA termination"
    ],
    details: [
      {
        heading: "Unauthorized Access to Border Control Data (IBMS)",
        content: "In December 2016, Lt. Col. Saqib Mumtaz sent Danish a screenshot of his international travel history for the preceding 3-4 years. This data from the Integrated Border Management System (IBMS) is accessible only to FIA and specific intelligence branches. The transmission was intended to demonstrate Danish was under 'total observation.'",
        evidence: "WhatsApp screenshots with IBMS travel data"
      },
      {
        heading: "Real-Time Geolocation Tracking (LIMS/GSM)",
        content: "Lt. Col. Saqib sent WhatsApp messages containing specific GPS coordinates (e.g., 24.8133, 67.03535) of Danish's real-time location. Accompanied by threatening messages: 'Run Lola run, u can run but can't hide.' This suggests unauthorized use of Lawful Intercept Management Systems (LIMS) or GSM triangulation.",
        evidence: "WhatsApp messages with GPS coordinates"
      },
      {
        heading: "The 'Lower Cadre' Intelligence Nexus",
        content: "Audio transcript from November 11, 2016 between Syed Tayyab Ali Shah and Lt. Col. Saqib records them discussing use of a contact in Military Intelligence (MI) Karachi—a 'lower cadre' operative—to have Danish 'picked up' and made to disappear for days.",
        evidence: "Audio Transcript Annex 7"
      },
      {
        heading: "Office Raids Without Warrants",
        content: "Individuals claiming to be from Military Intelligence and Special Branch visited BCG offices without warrants. They demanded sensitive employee data and instructed staff to tell Danish to appear at the 'Military Intelligence office at 3 Talwar.'",
        evidence: "Witness statements from BCG staff"
      },
      {
        heading: "Digital Extraction via Seized Devices",
        content: "During the March 2019 raid, FIA seized 16 digital devices containing proprietary business data and passwords. Devices were never sealed and no Malkhana entry made. Defense established these were physically handed over to Col. Saqib Mumtaz (Signal Corps, described as 'trained hacker').",
        evidence: "Missing Malkhana entries, unsealed devices testimony"
      },
      {
        heading: "Consequences of Data Theft",
        content: "Possession of unsealed devices allowed opponents to: (1) Hack Danish's LinkedIn in June 2024, deleting his 28-year professional profile; (2) Identify NADRA VeriSys as company's 'oxygen' and orchestrate termination in October 2024; (3) Trigger SECP winding-up notice using stolen operational data.",
        evidence: "LinkedIn deletion, NADRA termination, SECP notice timeline"
      }
    ],
    connections: [
      "2016: Intimidation phase (travel history/GPS tracking)",
      "2019-2024: Data theft phase (unsealed devices to Col. Saqib)",
      "June 2024: LinkedIn hack using stolen credentials",
      "October 2024: NADRA VeriSys termination",
      "2025: Financial sabotage and identity erasure"
    ],
    sources: "Sources 8, 9, 14, 141, 145-147, 354, 355, 359, 360, 385, 408, 464, 1101, 1140, 1184"
  },
  {
    id: "life-protection-requests",
    title: "Life Protection Requests",
    icon: Shield,
    summary: "A decade-long series of desperate appeals to save a citizen from 'extra-legal abduction' and 'state-backed vendetta,' eventually validated by Federal Government intervention.",
    keyPoints: [
      "Audio evidence of abduction conspiracy (November 2016)",
      "Formal complaint to IG FC (January 2017) largely ignored",
      "Licensed defense weapons seized (January 2017) and never returned",
      "Post-bail extortion calls impersonating ISI/MI officials (May 2024)",
      "Sindh Home Department approved personal protection (October 2024)",
      "Federal Ministry of Interior directed IGP Islamabad to take action (October 2024)"
    ],
    details: [
      {
        heading: "The Abduction Defense (2016-2017)",
        content: "Audio recording from November 11, 2016 captured Syed Tayyab Ali Shah and Lt. Col. Saqib conspiring to use 'lower cadre' MI contacts to make Danish 'disappear for two or three days.' On January 21, 2017, Danish submitted formal complaint to IG FC KPK. Instead of protection, First FIR (25/2017) was registered against him.",
        evidence: "Audio Transcript Annex 7, Email to IG FC"
      },
      {
        heading: "Disarmament",
        content: "In January 2017, Danish's licensed personal defense weapons (Walther .22 and Glock 19) were seized during a confrontation and never returned, leaving him physically defenseless against subsequent threats.",
        evidence: "Weapon seizure records"
      },
      {
        heading: "The Raid as Threat (2019)",
        content: "The March 2019 FIA raid was conducted without warrant and without private witnesses. Danish was taken into custody, effectively 'disappearing' into the FIA system—mirroring the 2016 abduction plot but under guise of legal process.",
        evidence: "Raid documentation, witness statements"
      },
      {
        heading: "Post-Bail Extortion (2024)",
        content: "After bail was granted in May 2024, CEO Imran Haroon began receiving calls from private numbers. Callers impersonated ISI and Military Intelligence officials, demanding 'ransom money' and ordering him to cease supporting Danish.",
        evidence: "Call records, witness statements"
      },
      {
        heading: "Government Validation",
        content: "October 14, 2024: Sindh Home Department approved personal protection request. October 30, 2024: Federal Ministry of Interior directed IGP Islamabad to review Danish's harassment complaint and take necessary action.",
        evidence: "Official correspondence from Home Department and Ministry of Interior"
      },
      {
        heading: "Protection Against New Case (2025)",
        content: "When the new FIR (Mobina Sohail) was registered in July 2025, Danish's legal team immediately leveraged the 2024 protection orders. On July 19, 2025, complaint to IGP attached Ministry of Interior and Home Department letters, arguing the new FIR was continuation of the same harassment pattern acknowledged by Federal Government.",
        evidence: "Complaint to IGP dated 2025-07-19"
      }
    ],
    connections: [
      "2016: Threat of abduction → Request to Military Command (Ignored)",
      "2019: Threat of imprisonment → Legal Defense (Acquittal)",
      "2024: Threat of extortion → Request to Interior Ministry (Approved)",
      "2025: Threat of new arrest → Use of 2024 protection orders"
    ],
    sources: "Sources 145-147, 177, 354, 355, 359, 360, 408, 409, 418, 464, 807, 808, 1001, 1053, 1122"
  },
  {
    id: "call-recording-software",
    title: "Call Recording Software Analysis",
    icon: Phone,
    summary: "The 'spyware' allegation was the fabricated basis for the Cybercrime case, yet call recordings ultimately became exculpatory evidence exposing the abduction conspiracy.",
    keyPoints: [
      "Prosecution alleged Danish installed 'spyware' on victim's device",
      "Forensic analysis found no spyware on any examined device",
      "The actual recording app was 'Auto Call Recorder' on victim's phone",
      "This app was installed by the victim's husband (Tayyab) for surveillance",
      "Ironically, this app recorded the conspirators' own abduction planning calls",
      "The recordings became evidence against the conspirators, not Danish"
    ],
    details: [
      {
        heading: "The Allegation",
        content: "The complainant Major Mumtaz alleged that Danish installed malicious 'spyware' on the victim's phone, enabling unauthorized surveillance and recording of private communications. This became the foundation of the Cybercrime Case (FIR 04/2019).",
        evidence: "FIR 04/2019, Complainant statement"
      },
      {
        heading: "The Forensic Reality",
        content: "FIA forensic experts Nauman Ali and Aamir Zaib admitted under oath: 'No spyware software was detected during forensic tests of devices.' The entire spyware narrative was unsupported by any technical evidence.",
        evidence: "Forensic Reports Ex-7/A, Ex-8/A, Expert testimony"
      },
      {
        heading: "The Auto Call Recorder",
        content: "Investigation revealed the victim's phone (which was in custody of her husband Tayyab) had an 'Auto Call Recorder' app installed. This app was used by Tayyab to record calls—not installed by Danish.",
        evidence: "Device analysis, App installation records"
      },
      {
        heading: "The Ironic Evidence",
        content: "The Auto Call Recorder installed by the conspirators inadvertently recorded their own calls regarding the abduction plot. These recordings of the November 11, 2016 conspiracy between Tayyab and Saqib became evidence against them.",
        evidence: "Audio Transcript Annex 7"
      }
    ],
    connections: [
      "Spyware allegation → Foundation of Cybercrime case",
      "Forensic analysis → Proved no spyware existed",
      "Auto Call Recorder → Actually installed by conspirators",
      "Recorded abduction plot → Became evidence against them"
    ],
    sources: "Sources 14, 26, 28, 40, 41, 54, 104"
  },
  {
    id: "financial-sabotage",
    title: "Financial Sabotage Through Stolen Data",
    icon: Building2,
    summary: "A calculated operation enabled by theft of digital infrastructure during the Cybercrime case, weaponized to destroy Danish's business after the criminal case collapsed.",
    keyPoints: [
      "16 digital devices seized March 2019—never sealed, no Malkhana entry",
      "Devices contained banking passwords, client data, proprietary business information",
      "Data theft enabled LinkedIn hack (June 2024)—28-year profile deleted",
      "NADRA VeriSys termination (October 2024)—78% revenue loss",
      "SECP winding-up notice (April 2025)—regulatory strangulation",
      "Affidavit of Irreparable Loss documents $2 million in damages"
    ],
    details: [
      {
        heading: "The Acquisition (March 2019)",
        content: "FIA seized 16 digital devices including MacBooks, iPhones, and high-capacity hard drives containing proprietary client lists, foreign bank account access, and core operational data of Background Check Group (BCG). Devices were never sealed and no Malkhana entry was made.",
        evidence: "Raid documentation, Missing Malkhana entries"
      },
      {
        heading: "Transfer to Opponent",
        content: "Defense established that unsealed devices were physically handed over to Col. Saqib Mumtaz (Signal Corps officer with technical expertise). This granted the opposing network 'admin access' to Danish's business and personal life for over five years.",
        evidence: "Defense pleadings, Chain of custody gaps"
      },
      {
        heading: "Digital Identity Erasure (June 2024)",
        content: "Using credentials stored on seized devices, opponents compromised Danish's digital identity. On June 8, 2024, his LinkedIn profile hosting 28 years of professional history and client connections was hijacked and permanently deleted overnight.",
        evidence: "LinkedIn deletion records"
      },
      {
        heading: "The Kill Switch: NADRA VeriSys (October 2024)",
        content: "Stolen business data revealed NADRA VeriSys (CNIC verification) was the 'oxygen' and mandatory requirement for BCG's client contracts. On October 1, 2024, BCG's VeriSys access was abruptly terminated without notice or cause, causing immediate 78% revenue loss.",
        evidence: "NADRA termination letter, Financial records"
      },
      {
        heading: "Regulatory Strangulation: SECP (April 2025)",
        content: "Following NADRA termination, SECP issued winding-up notice in April 2025, questioning company viability without NADRA access—essentially punishing the company for sabotage inflicted upon it. Defense argued this was coordinated by same network.",
        evidence: "SECP Show Cause Notice"
      },
      {
        heading: "Quantified Damages: $2 Million",
        content: "Affidavit of Irreparable Loss filed in Islamabad High Court (June 2025) documents losses exceeding $2 million USD due to client attrition, operational paralysis, and destruction of digital assets. High Court suspended SECP notice on May 21, 2025.",
        evidence: "Affidavit of Irreparable Loss, IHC Order"
      }
    ],
    connections: [
      "First FIR (2017): Failed to frame physically",
      "Cybercrime Case (2019): Used to seize data needed for financial destruction",
      "Financial Sabotage (2024): Executed using stolen data after bail",
      "New Case (July 2025): Opened when financial attacks stayed by High Court"
    ],
    sources: "Sources 2-4, 6, 8, 11, 16, 20, 27, 36, 39-44, 128, 141, 359, 360, 385, 408, 1101, 1140, 1184"
  },
  {
    id: "acquittal-influence",
    title: "2017 Acquittal Influence on Cybercrime Charges",
    icon: Scale,
    summary: "The 2017 acquittal forced the opposing network to abandon 'traditional' criminal charges and pivot to state-backed persecution using Cybercrime laws and regulatory sabotage.",
    keyPoints: [
      "First FIR (25/2017) alleged robbery, kidnapping, assault—all failed",
      "Police investigation found no evidence—'C' Class cancellation",
      "Acquittal on April 14, 2017 proved physical crime narrative unsustainable",
      "Pivot to Cybercrime laws (PECA 2016)—harder to disprove, greater stigma",
      "FIA acted swiftly on opponent's 2018 complaint after ignoring Danish's 2017 complaint",
      "2017 acquittal established 'previous enmity' and mala fide intent for defense"
    ],
    details: [
      {
        heading: "The First FIR Failure",
        content: "On January 16, 2017, false FIR No. 25/2017 was registered at PS Boat Basin accusing Danish of robbery (Section 392 PPC), criminal intimidation (506-B), and wrongful confinement (342). Police investigation found no evidence, filing 'C' Class cancellation report.",
        evidence: "FIR 25/2017, Police cancellation report"
      },
      {
        heading: "The Acquittal",
        content: "On April 14, 2017, the court acquitted Danish Thanvi. This proved the accusers could not sustain a case based on physical crimes (robbery/assault). They needed a new legal avenue harder to disprove—Cybercrime.",
        evidence: "Acquittal order dated 2017-04-14"
      },
      {
        heading: "Strategic Pivot to FIA/PECA",
        content: "Unable to prove Danish 'robbed' a phone, the narrative changed to claiming he 'hacked' the phone. The 2017 acquittal forced opponents to use FIA's Cybercrime Wing and fabricate evidence (the 'planted' Samsung J7) because physical evidence had failed.",
        evidence: "FIR 04/2019, PECA charges"
      },
      {
        heading: "Discriminatory FIA Procedure",
        content: "While FIA ignored Danish's January 2017 harassment complaint for 11 months, they swiftly acted on Major Mumtaz's July 2018 complaint (Inquiry 154/2018). This selective enforcement proved discriminatory procedure and malafide intent.",
        evidence: "FIA complaint records, 11-month delay"
      },
      {
        heading: "Legal Defense Weapon",
        content: "The 2017 acquittal record became the defense's strongest weapon. It proved 'previous enmity' and mala fide intent. The Sessions Court applied 'Falsus in Uno, Falsus in Omnibus' doctrine partly based on this history of false allegations.",
        evidence: "Sessions Court Judgment May 2025"
      }
    ],
    connections: [
      "2017 Acquittal (Police Case) → 2019 Cybercrime FIR",
      "2024 Bail (Cybercrime Case) → Financial Sabotage (NADRA/SECP)",
      "2025 Acquittal (Cybercrime Case) → New FIR (Mobina Sohail) and State Appeal"
    ],
    sources: "Sources 12, 67, 85, 91, 253, 257, 497, 768, 790, 1059, 1060, 1122, 1147, 1153, 1219, 1223, 1284"
  }
];

// Summary statistics for the briefing
export const briefingStats = {
  totalSections: 8,
  yearsDocumented: "2015-2025",
  sourcesReferenced: 123,
  keyThemes: [
    "Evidence Fabrication",
    "State Surveillance Misuse",
    "Regulatory Weaponization",
    "Witness Coercion",
    "Document Forgery",
    "Financial Sabotage"
  ],
  caseStatus: "Acquitted - May 2025",
  ongoingThreats: [
    "State Appeal No. 449/2025",
    "New FIR (Mobina Sohail) July 2025",
    "SECP proceedings (stayed)"
  ]
};
