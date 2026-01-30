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
  FileText,
  Gavel,
  ClipboardCheck
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
      "Prosecution alleged Danish installed 'Spy Bug Monitoring Software' on victim's Samsung J5",
      "Claim: Software enabled GPS tracking, call interception, and data extraction for blackmail",
      "Reality: 'Couple App' was consensual relationship app twisted into criminal allegation",
      "Auto Call Recorder (ACR/AAR) was actually on victim's phone—installed by husband Tayyab",
      "App auto-uploaded to cloud, inadvertently recording November 11, 2016 abduction conspiracy",
      "Forensic analysis found zero spyware on any examined device",
      "Device discrepancy: FIR mentioned Samsung J5, FIA analyzed Samsung J7",
      "Victim admitted in court she provided no evidence of any spyware"
    ],
    details: [
      {
        heading: "The Spyware Allegation",
        content: "Major Mumtaz alleged Danish installed 'Spy Bug Monitoring Software' or 'spyware' on Mehwish's Samsung J5 mobile phone without her knowledge. The prosecution claimed this software allowed Danish to monitor GPS location, listen to calls, and extract private data/pictures for blackmail purposes.",
        evidence: "FIR 04/2019, Sources 157, 257, 260, 275"
      },
      {
        heading: "The 'Couple App' Twist",
        content: "In family proceedings, it was revealed Danish had installed an app called 'Couple App' (com.bettertomorrowapps.spyyourlovefree) on his own and his wife's phones to share locations during a domestic dispute. The opposing party twisted this consensual relationship app into a criminal allegation of 'spyware' installation on employees' phones.",
        evidence: "Family court records, Sources 1, 219, 222"
      },
      {
        heading: "The Auto Call Recorder Reality",
        content: "The specific application identified was 'Auto Call Recorder' (ACR) or 'Automatic Audio Recorder' (AAR). This app was installed on Mehwish's phone—crucially, configured to automatically record audio and upload data to a cloud server. The phone was in custody of her husband, Syed Tayyab Ali Shah.",
        evidence: "Device analysis, Sources 492, 494, 496, 718"
      },
      {
        heading: "The Smoking Gun (Nov 11, 2016)",
        content: "The app recorded a conversation between Tayyab and Lt. Col. Saqib conspiring to use 'contacts in Military Intelligence Karachi' (a 'lower cadre' operative) to have Danish 'picked up' and disappear for days. Because the software auto-uploaded to cloud, the defense retrieved this audio file proving the Cybercrime case was a cover for a failed abduction plot.",
        evidence: "Audio Transcript Annex 7, Sources 717, 720, 724, 762"
      },
      {
        heading: "Forensic Collapse",
        content: "The FIR alleged spyware on a Samsung J5, but FIA seized and analyzed a Samsung J7. FIA Forensic Experts Nauman Ali and Aamir Zaib admitted: 'No spyware software was detected during forensic tests of devices.' The victim herself admitted: 'I did not provide any evidence of any spyware software installed in the cell phone.'",
        evidence: "Forensic Reports, Sources 22, 96, 112, 121, 160, 169, 263, 300, 314"
      },
      {
        heading: "Weaponization for Sabotage",
        content: "While the spyware legal case failed, the opposing network utilized data extraction from 16 stolen devices (handed to Col. Saqib Mumtaz) to facilitate the LinkedIn hack (June 2024) and provide intelligence needed to terminate NADRA VeriSys access (October 2024), causing $2 million in losses.",
        evidence: "Sources 6, 7, 280, 303, 486"
      }
    ],
    connections: [
      "First FIR Phase: Opponents used Auto Call Recorder to plot abduction—recording intercepted by defense",
      "Cybercrime Case: Opponents falsely accused Danish of using 'Spyware' (twisting 'Couple App' usage)",
      "Acquittal: Forensics proved zero spyware existed",
      "Financial Sabotage: Physical theft of devices under guise of raid used to extract data when legal narrative failed"
    ],
    sources: "Sources 1, 6, 7, 14, 22, 26, 28, 40, 41, 54, 96, 104, 112, 121, 157, 160, 169, 219, 222, 257, 260, 263, 275, 280, 300, 303, 314, 486, 492, 494, 496, 503, 563, 717, 718, 720, 724, 762"
  },
  {
    id: "quashment-of-fir",
    title: "Quashment of FIR Proceedings",
    icon: Gavel,
    summary: "Central legal remedy sought to halt systematic persecution through the 'extraordinary remedy' of FIR quashment, with mixed results revealing how process itself becomes punishment.",
    keyPoints: [
      "Writ Petition No. 3376/2025 filed in Islamabad High Court to quash Mobina Sohail FIR",
      "FIR initially charged Section 420 (Cheating); Section 406 added later to convert to non-bailable",
      "3-month delay between alleged incident (April 14, 2025) and FIR registration (July 3, 2025)",
      "Video evidence: Complainant visited Danish's apartment amicably on May 25, 2025—after alleged theft",
      "High Court dismissed quashment petition on December 13, 2025",
      "Court ruled factual disputes must be decided by trial court—directing accused to trial",
      "First FIR (25/2017) effectively quashed via 'C' Class police cancellation and April 2017 acquittal"
    ],
    details: [
      {
        heading: "The Current Battle: Mobina Sohail FIR (2025)",
        content: "Danish filed Writ Petition No. 3376/2025 in Islamabad High Court under Article 199 read with Section 561-A CrPC to quash FIR No. 673/25. The FIR initially charged Section 420 (Cheating) PPC, but police added Section 406 (Criminal Breach of Trust) via zimni later—defense argued this was mala fide intent to convert bailable to non-bailable offense.",
        evidence: "Writ Petition No. 3376/2025, Source 4, 5, 418"
      },
      {
        heading: "Grounds for Quashment",
        content: "Delay: Alleged incident on April 14, 2025, but FIR registered July 3, 2025 (nearly 3 months delay) with no explanation. Contradictory Evidence: Complainant visited Danish's apartment amicably on May 25, 2025 (captured on video)—weeks after alleged theft. Civil Nature: Defense argued dispute was civil, not criminal, as complainant sought monetary compensation.",
        evidence: "Source 4, 420, 1176"
      },
      {
        heading: "The Court's Dismissal (December 2025)",
        content: "On December 13, 2025, Justice Muhammad Asif of Islamabad High Court dismissed the quashment petition. The court ruled quashment is an 'extraordinary remedy' used only when complaint discloses no offense on its face. Factual disputes (was bag entrusted or stolen?) must be decided by trial court after evidence. Directed Danish to seek remedy under Section 249-A or 265-K CrPC instead.",
        evidence: "IHC Order dated 2025-12-13, Source 4, 6"
      },
      {
        heading: "The Precedent: First FIR (2017)",
        content: "First FIR No. 25/2017 registered January 16, 2017 alleging robbery and kidnapping. Police investigation found no evidence—submitted 'C' Class (cancellation) report. On April 14, 2017, Magistrate accepted cancellation and acquitted Danish. This failure forced opponents to shift from physical crime to cybercrime allegations.",
        evidence: "FIR 25/2017, Source 163, 166, 1150"
      },
      {
        heading: "Cybercrime Case: Process as Punishment",
        content: "Had FIR 04/2019 been quashed on grounds of Section 33 PECA violation (illegal warrantless raid), Danish would have been spared 6 years of litigation. Sessions Court Judgment (May 22, 2025) eventually validated grounds that should have led to earlier quashment—ruling raid was illegal and evidence 'planted and concocted.' Effect of quashment achieved only after wrongful conviction and years of suffering.",
        evidence: "Sessions Court Judgment, Source 191, 572, 573, 1272"
      },
      {
        heading: "Quashment Strategy vs. Financial Sabotage",
        content: "Dismissal of quashment petition keeps case 'pending.' Opponents use this status to justify NADRA VeriSys termination and SECP notices. If FIRs were quashed immediately, there would be no 'criminal record' to cite for regulatory failures. Dismissal directly fuels the $2 million financial loss by keeping Danish entangled in legal system.",
        evidence: "Source 288, 421"
      }
    ],
    connections: [
      "2017: Police cancel First FIR (de facto quashment) → Opponents pivot to Cybercrime",
      "2019-2025: Cybercrime case proceeds (quashment not obtained) → 6 years harassment before acquittal",
      "2025: High Court dismisses quashment for Mobina Sohail FIR → Forces Danish back into trial cycle",
      "Pattern ensures systematic persecution continues into 2026, enabling further financial sabotage"
    ],
    sources: "Sources 4, 5, 6, 91, 163, 166, 191, 253, 288, 418, 420, 421, 572, 573, 1150, 1272"
  },
  {
    id: "compliance-audit-report",
    title: "Compliance Audit: Procedural Failures (Criminal Appeal No. 16/2024)",
    icon: ClipboardCheck,
    summary: "Based on 123 sources: In high-stakes cybercrime litigation, statutory compliance is the strategic foundation of sustainable prosecution. When PECA 2016 protocols are bypassed, the resulting 'investigative collapse' renders the entire state case an evidentiary nullity.",
    keyPoints: [
      "Section 33 PECA 2016: Mandatory search warrant NOT obtained for March 22, 2019 raid at Flat No. B-2, Clifton Garden 1",
      "No Gazetted Officer present—violation of Section 10 proviso for warrantless entries",
      "No 24-hour judicial notice after seizure—no court record of notification",
      "No independent private witnesses in 'densely populated' residential setting—violates CrPC 103 and Daim vs. The State precedent",
      "No Roznamcha (departure/daily diary) entries produced—'cuts case from its roots'",
      "Inventory discrepancy: 16 devices seized but 21 items received by forensics (3 on April 10 + 18 on May 20, 2019)",
      "Devices 'not in a sealed condition' when handed to forensics—physical and logical integrity compromised",
      "3-year delay in forensic reports with no chain of custody form included",
      "Section 342 CrPC violation: Accused not questioned about specific seized items during statement",
      "Victim PW-07 admitted she 'never provided her mobile phone or laptop to FIA'—systemic evidentiary nullity"
    ],
    details: [
      {
        heading: "1. Statutory Compliance Framework: Section 33 PECA 2016",
        content: "Under Section 33 of PECA 2016, the Federal Investigation Agency (FIA) is mandated to obtain a search warrant from a competent court to enter a specified place and seize digital systems. The testimony of PW-01 Inspector Shagufta Ahmed (Exh-03) admitted that no search warrant was available at the time of the raid on March 22, 2019 at Flat No. B-2, Clifton Garden 1. The operation was conducted without a Gazetted Officer—a violation of the Section 10 proviso for warrantless entries—and the FIA failed to notify the court within the statutory 24-hour window. Despite the 'densely populated' nature of the Clifton Garden complex, the raiding team failed to associate independent private witnesses, a fatal omission cited under the judicial precedent of Daim vs. The State (2021 PCrLJ 1061, Karachi High Court Sindh).",
        evidence: "PW-01 Admission (Exh-03); PECA Sec 33(1); CrPC 103; Daim vs. The State (2021 PCrLJ 1061)"
      },
      {
        heading: "Procedural Deficiency Matrix",
        content: "FAIL: Mandatory Search Warrant—raid conducted without judicial authorization (Contravention of PECA Sec 33(1)). FAIL: Gazetted Officer Presence—operation led by Inspector, no Gazetted Officer present (Violation of Sec 10 Proviso). FAIL: 24-Hour Judicial Notice—no record of court being informed post-seizure (Absence of record in Case Diary). FAIL: Independent Witness Protocol—no private witnesses associated in residential setting (Violation of CrPC 103 / Daim vs. The State). FAIL: Documentation of Departure—failure to produce Roznamcha (daily diary) entries (PW-01 Admission; 'cuts case from its roots'). The appellate court accurately characterized these actions as a 'mockery of legal procedure.' These jurisdictional errors created a 'fruit of the poisonous tree' effect, where the infra-legal nature of the initial search vitiated all subsequent recoveries.",
        evidence: "Case Diary, PW-01 Cross-examination, CrPC 103"
      },
      {
        heading: "2. Forensic Chain of Custody and Evidence Integrity",
        content: "The integrity of digital devices depends entirely on a continuous, documented chain of custody. Any 'dark period' in the custodial timeline justifies an adverse inference regarding evidence tampering. In this matter, the breakdown of custody was not merely a lapse but suggested malicious diversion of case property. The IO PW-08 SI Imran Saad recorded seizure of 16 digital devices on March 22, 2019. However, forensic expert PW-06 Nauman Ali testified to an inexplicable intake timeline: April 10, 2019 received 3 items (Samsung mobile, iPhone, Tablet); May 20, 2019 received 18 items. The submission of three items before the bulk batch—and total count reaching 21 items despite only 16 seized—remains a systemic anomaly the prosecution failed to resolve.",
        evidence: "Seizure records vs. Forensic intake records, PW-08/PW-06 testimony discrepancy"
      },
      {
        heading: "Custodial Breakdown and Third-Party Influence",
        content: "The audit identifies a critical 'mystery of disappeared articles.' The defense asserted that the 16 seized devices were never placed in the official Malkhana but were unlawfully handed over to the complainant's son, Col. Saqib Mumtaz (a Signal Corps officer with technical training). This allegation is corroborated by the prosecution's failure to: (1) Produce the Malkhana in-charge as a witness; (2) Present Register No. XIX entries to prove safe storage; (3) Document the interim custody between March seizure and May forensic submission. PW-04 Tariq Hussain Arbab admitted the digital gadgets were 'not in a sealed condition' when handed to him. In absence of on-site sealing in a residential complex, the physical and logical integrity of the devices was compromised. This custodial vacuum renders any subsequent data extraction legally moot.",
        evidence: "Missing Malkhana records, PW-04 Cross-examination, Defense pleadings"
      },
      {
        heading: "3. Technical Forensic Analysis and Expert Testimony",
        content: "To meet the 'beyond reasonable doubt' standard, forensic experts must provide an empirical link between the accused and the digital actus reus. The forensic reports (Exh 7/A, 8/A, 8/B) and testimonies of PW-06 Nauman Ali and PW-05 Muhammad Amir Zaib confirmed: (1) Lack of Hacking Evidence—experts admitted no proof of unauthorized access to victim's email or social media; (2) Absence of Spyware—no surveillance software detected on seized devices, directly contradicting FIR allegations; (3) Unproven Identity Creation—no technical link established between appellant and 'Maya Ali' or 'Kazim Khan' Facebook profiles. The final forensic report was submitted after a three-year delay, violating the requirement for 'expeditious disposal' of digital evidence. PW-05 admitted no chain of custody form was included in the report.",
        evidence: "Forensic Reports Exh 7/A, 8/A, 8/B; PW-06/PW-05 testimony"
      },
      {
        heading: "Systemic Evidentiary Nullity",
        content: "A material contradiction emerged regarding source devices. While the IO (PW-08) claimed to have seized the victim's Samsung J7 via memo (Exh-9/B), the victim (PW-07) explicitly admitted she 'never provided her mobile phone or laptop to FIA for analysis.' This creates a 'Systemic Evidentiary Nullity': if the victim never provided the source device, the forensic reports regarding her WhatsApp and Email are effectively fraudulent or based on foisted hardware.",
        evidence: "PW-07 vs. PW-08 testimony contradiction, Exh-9/B"
      },
      {
        heading: "4. Judicial Review and 'Falsus in Uno, Falsus in Omnibus' Application",
        content: "The appellate court identified fatal failures in treatment of case property. During trial, actual gadgets were never properly exhibited. A 'khaki box' was produced by PW-08 SI Imran Saad, but individual items were not marked, listed, or shown to witnesses. Furthermore, the trial court committed a procedural nullity by failing to question the accused about specific seized items during the Section 342 CrPC statement—this mandatory requirement is essential to allow the accused to explain incriminating evidence; its omission vitiates the entire trial. Applying the doctrine of Saghir Ahmad vs. The State (2023 SCMR 241), the appellate court ruled 'a single doubt' is sufficient for acquittal. The cumulative effect of warrantless raid, broken chain of custody involving Col. Saqib Mumtaz, and forensic contradictions established a mountain of reasonable doubt.",
        evidence: "Trial record, Section 342 CrPC violation, Saghir Ahmad vs. The State (2023 SCMR 241)"
      },
      {
        heading: "5. Remedial Recommendations for Professional Standards",
        content: "This case serves as a benchmark for institutional learning regarding prevention of 'process as punishment.' Strategic Takeaways: (1) Warrant-First Protocols—residential raids must strictly adhere to Section 33 PECA; warrantless entries must result in disciplinary action; (2) Chain-of-Custody Digital Ledger—implement automated, tamper-proof digital log for Malkhana; (3) Mandatory On-Site Sealing—all digital media must be sealed in tamper-evident packaging at point of recovery with independent witness signatures; (4) Anti-Influence Protocols—independent audit wing must review cases where complainants hold high-ranking official positions; (5) Technical Pre-Trial Audit—forensic reports and testimonies must be audited for consistency prior to trial.",
        evidence: "Professional standards recommendations based on case analysis"
      },
      {
        heading: "Conclusion: Total Exoneration",
        content: "The total exoneration of the appellant in Criminal Appeal No. 16 of 2024 was the inevitable result of an investigation that was not merely failed, but maliciously structured. In the digital domain, technical evidence is only as strong as the procedural integrity of its handling. Procedural discipline remains the only safeguard against institutional abuse and the prerequisite for digital justice.",
        evidence: "Criminal Appeal No. 16/2024 Judgment dated May 22, 2025"
      }
    ],
    connections: [
      "Warrantless raid → 'Fruit of the poisonous tree' effect vitiating all subsequent recoveries",
      "No Roznamcha entries → Lack of legal authorization for raiding party's movement",
      "Broken chain of custody → Evidence tampering cannot be excluded",
      "Device discrepancy (16 seized vs. 21 analyzed) → Unexplained systemic anomaly",
      "Unsealed devices to Col. Saqib → Enabled data theft and financial sabotage",
      "Section 342 CrPC violation → Trial nullified for failure to question accused",
      "Falsus in Uno, Falsus in Omnibus → Total rejection of prosecution's core evidence"
    ],
    sources: "Based on 123 sources: Criminal Appeal No. 16/2024, PECA 2016 Section 33, CrPC Sections 103, 342, 249-A, 265-K, Saghir Ahmad vs. The State (2023 SCMR 241), Daim vs. The State (2021 PCrLJ 1061, Karachi High Court Sindh)"
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
  totalSections: 10,
  yearsDocumented: "2015-2025",
  sourcesReferenced: 123,
  keyThemes: [
    "Evidence Fabrication",
    "State Surveillance Misuse",
    "Regulatory Weaponization",
    "Witness Coercion",
    "Document Forgery",
    "Financial Sabotage",
    "Procedural Violations",
    "Chain of Custody Failures"
  ],
  caseStatus: "Acquitted - May 2025",
  ongoingThreats: [
    "State Appeal No. 449/2025",
    "New FIR (Mobina Sohail) July 2025",
    "SECP proceedings (stayed)",
    "Quashment petition dismissed Dec 2025"
  ]
};
