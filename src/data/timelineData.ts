export interface TimelineEvent {
  date: string;
  category: "Business Interference" | "Harassment" | "Legal Proceeding" | "Criminal Allegation";
  description: string;
  individuals: string;
  legalAction: string;
  outcome: string;
  evidenceDiscrepancy: string;
  sources: string;
}

export const timelineData: TimelineEvent[] = [
  {
    date: "2015-01-01",
    category: "Business Interference",
    description: "Genesis of the conflict; Syeda Mehwish Ali (daughter of Major Mumtaz) is hired by Background Check Group (BCG) under CEO Danish Thanvi.",
    individuals: "Danish Thanvi (CEO/Accused), Syeda Mehwish Ali (Employee/Victim)",
    legalAction: "Employment Contract",
    outcome: "Initial professional relationship established",
    evidenceDiscrepancy: "Later testimony regarding the professional relationship contradicted documented corporate records and promotions.",
    sources: "[1-7]"
  },
  {
    date: "2016-09-30",
    category: "Business Interference",
    description: "Mehwish Ali promoted to General Manager; assigned HR restructuring tasks which allegedly sparked jealousy within the Mumtaz family.",
    individuals: "Danish Thanvi (CEO), Syeda Mehwish Ali (GM)",
    legalAction: "Offer Letter dated 2016-09-30",
    outcome: "Professional advancement",
    evidenceDiscrepancy: "Conflict of interest and family jealousy cited as motivation for subsequent legal attacks.",
    sources: "[7-10]"
  },
  {
    date: "2016-11-08",
    category: "Harassment",
    description: "Domestic violence incident: Syed Tayyab Ali Shah (husband) assaults Mehwish Ali. She seeks humanitarian shelter at Danish Thanvi's home. Mumtaz family begins threatening Thanvi's family.",
    individuals: "Syeda Mehwish Ali (Victim), Syed Tayyab Ali Shah (Assailant), Danish Thanvi (Provider of Shelter), Col (R) Saqib Mumtaz (Official)",
    legalAction: "CPLC Complaint 992610",
    outcome: "Retaliation triggered by Mumtaz family",
    evidenceDiscrepancy: "Police initially resisted registering the victim's complaint against her husband; Mumtaz family utilized military influence to pressure local police.",
    sources: "[2, 3, 7, 9-13]"
  },
  {
    date: "2016-11-11",
    category: "Harassment",
    description: "Recorded phone calls reveal a conspiracy between Tayyab Ali Shah and Lt. Col. Saqib Mumtaz to abduct Danish Thanvi and \"disappear\" him.",
    individuals: "Syed Tayyab Ali Shah (Conspirator), Lt. Col. Saqib Mumtaz (Conspirator), Danish Thanvi (Target)",
    legalAction: "Audio Transcript Annex 7",
    outcome: "Extra-legal planning phase",
    evidenceDiscrepancy: "Evidence suggests coordination through lower-cadre military intelligence contacts to plant evidence.",
    sources: "[14-16]"
  },
  {
    date: "2016-11-23",
    category: "Harassment",
    description: "Unauthorized individuals claiming Military Intelligence affiliation visit BCG office to demand documents without warrants.",
    individuals: "Rehan Ali (Impersonator), Mohd. Iqbal (Impersonator), Danish Thanvi (Accused)",
    legalAction: "Illegal Office Visit",
    outcome: "Intimidation of staff",
    evidenceDiscrepancy: "No official search warrants were produced during these visits.",
    sources: "[14]"
  },
  {
    date: "2016-12-22",
    category: "Business Interference",
    description: "Major Mumtaz Shah circulates a \"maligning letter\" containing false allegations of drug addiction and immorality to 300 BCG employees and clients.",
    individuals: "Major (R) Mumtaz Hussain Shah (Complainant), Danish Thanvi (Target)",
    legalAction: "Defamation Notice issued by BCG",
    outcome: "Severe reputational damage",
    evidenceDiscrepancy: "Complainant later admitted in cross-examination that he lacked proof for the drug addiction and scandalous allegations.",
    sources: "[2-5, 7, 9, 11, 15-18]"
  },
  {
    date: "2016-12-31",
    category: "Harassment",
    description: "Lt. Col. Saqib Mumtaz tracks Danish Thanvi's location and sends coordinates and 4-year travel history via WhatsApp as a threat.",
    individuals: "Lt. Col. Saqib Mumtaz (Official), Danish Thanvi (Accused)",
    legalAction: "Unauthorized surveillance",
    outcome: "Privacy violation and life threats",
    evidenceDiscrepancy: "Misuse of official IBMS travel data and military resources to track a civilian in a private dispute.",
    sources: "[8, 9, 14]"
  },
  {
    date: "2017-01-16",
    category: "Legal Proceeding",
    description: "Registration of first false FIR alleging assault, kidnapping, robbery, and theft of licensed weapons (Walther .22 and Glock 19).",
    individuals: "Danish Thanvi (Accused), Major (R) Mumtaz Hussain Shah (Complainant), Col (R) Saqib Mumtaz (Official)",
    legalAction: "FIR No. 25/2017 (PS Boat Basin)",
    outcome: "Acquittal 2017-04-14",
    evidenceDiscrepancy: "Case disposed of as \"C\" Class (Cancellation) due to lack of evidence; weapons never returned despite being licensed.",
    sources: "[2-7, 9, 11, 19-21]"
  },
  {
    date: "2017-12-06",
    category: "Legal Proceeding",
    description: "Danish Thanvi files a complaint with FIA Cybercrime regarding harassment by Saqib Mumtaz; Mehwish Ali resigns and returns to Islamabad.",
    individuals: "Danish Thanvi (Complainant), Lt. Col. Saqib Mumtaz (Accused), Syeda Mehwish Ali (Victim)",
    legalAction: "Inquiry 186/2017",
    outcome: "Ignored by FIA for 11 months",
    evidenceDiscrepancy: "Agency failed to act on Thanvi's complaint while simultaneously acting on counter-allegations from the Mumtaz family.",
    sources: "[2, 19, 20]"
  },
  {
    date: "2018-03-21",
    category: "Legal Proceeding",
    description: "BCG employee Irfan-ul-Haq is detained at FIA office until midnight and forced to sign blank papers.",
    individuals: "Irfan-ul-Haq (Witness), SI Imran Saad (Official)",
    legalAction: "Unauthorized interrogation",
    outcome: "Witness intimidation",
    evidenceDiscrepancy: "Witness was summoned 9 months before an official enquiry number was assigned, suggesting pre-planned fabrication.",
    sources: "[19, 22]"
  },
  {
    date: "2018-04-01",
    category: "Legal Proceeding",
    description: "Major Mumtaz Shah files a complaint with FIA NR3C Islamabad alleging hacking and distribution of obscene pictures.",
    individuals: "Major (R) Mumtaz Hussain Shah (Complainant), Danish Thanvi (Accused)",
    legalAction: "Enquiry No. 1584/2019 (Islamabad)",
    outcome: "Inquiry initiated",
    evidenceDiscrepancy: "11-month unexplained delay; Complainant admitted no obscene pictures were actually annexed to the initial complaint.",
    sources: "[1, 19, 20, 23-25]"
  },
  {
    date: "2019-01-11",
    category: "Legal Proceeding",
    description: "Enquiry officially registered at FIA Cyber Crime Circle Karachi after transfer from Islamabad.",
    individuals: "SI Imran Saad (Official)",
    legalAction: "Enquiry No. 19/2019 (Karachi)",
    outcome: "Investigation active",
    evidenceDiscrepancy: "Jurisdictional transfer utilized to maintain pressure; defense noted a call to staff occurred nearly a year prior to registration.",
    sources: "[1, 19, 20, 23, 24]"
  },
  {
    date: "2019-02-18",
    category: "Criminal Allegation",
    description: "Alleged recovery of a Samsung Galaxy J7 phone from the complainant for forensic analysis.",
    individuals: "Major (R) Mumtaz Hussain Shah (Complainant), SI Imran Saad (IO)",
    legalAction: "Recovery Memo Ex-9/B",
    outcome: "Item seized",
    evidenceDiscrepancy: "Device switching: FIR specified a Samsung J5, but a J7 was produced; Victim denied handing over any devices to FIA.",
    sources: "[1, 19, 20, 23, 24]"
  },
  {
    date: "2019-03-22",
    category: "Harassment",
    description: "FIA conducts a midnight raid on Danish Thanvi's residence, seizing 16-21 digital devices.",
    individuals: "Inspector Shagufta Ahmed (Official), SI Imran Saad (IO), Danish Thanvi (Accused)",
    legalAction: "FIR No. 04/2019 (FIA Cyber Crime)",
    outcome: "Accused arrested",
    evidenceDiscrepancy: "Violation of Section 33 PECA (no search warrant) and Section 103 CrPC (no independent witnesses); devices were not sealed at the spot.",
    sources: "[1-7, 11, 19-21, 23, 24, 26-29]"
  },
  {
    date: "2019-03-22",
    category: "Legal Proceeding",
    description: "Initial Technical Report generated by Tariq Arbab within 25-35 minutes of returning to the station.",
    individuals: "Tariq Hussain Arbab (Official), SI Imran Saad (IO)",
    legalAction: "Exhibit 6/A",
    outcome: "Foundation for conviction",
    evidenceDiscrepancy: "Physical impossibility of examining 16+ devices in under 35 minutes; author admitted he was not a forensic expert.",
    sources: "[24, 28, 30-32]"
  },
  {
    date: "2021-03-01",
    category: "Legal Proceeding",
    description: "FIA internal investigation exposes an extortion racket in Karachi Cybercrime Circle involving the officer overseeing the case.",
    individuals: "Abdul Ghaffar (Official)",
    legalAction: "Internal FIA probe",
    outcome: "Official found patronizing corruption",
    evidenceDiscrepancy: "Officer overseeing Thanvi's case was simultaneously running a shakedown operation against other IT CEOs.",
    sources: "[8, 33, 34]"
  },
  {
    date: "2022-01-01",
    category: "Legal Proceeding",
    description: "Forensic reports submitted after a 3-year delay; experts admit findings do not support hacking or account creation.",
    individuals: "Nauman Ali (Forensic Expert), Muhammad Amir Zaib (Forensic Expert)",
    legalAction: "Forensic Reports Ex-7/A, Ex-8/A",
    outcome: "Negative forensic findings",
    evidenceDiscrepancy: "Chain of custody broken; devices were handed over in unsealed condition; no proof connecting accused to fake IDs.",
    sources: "[1, 4, 6, 19, 20, 27, 31, 35]"
  },
  {
    date: "2023-03-01",
    category: "Legal Proceeding",
    description: "Handwriting expert analysis of FIA seizure memos for the digital devices.",
    individuals: "Handwriting Expert, SI Imran Saad (IO)",
    legalAction: "Exhibit 9-B and 9-C verification",
    outcome: "Forgery confirmed",
    evidenceDiscrepancy: "Handwriting expert confirmed signatures of officials on recovery memos were forged to provide legal cover for planted devices.",
    sources: "[6]"
  },
  {
    date: "2024-05-08",
    category: "Legal Proceeding",
    description: "Trial court (Judicial Magistrate Karachi South) convicts Danish Thanvi based on disputed forensic evidence.",
    individuals: "Kashif Bhatti (Magistrate), Danish Thanvi (Convict)",
    legalAction: "Criminal Case No. 5709/2019",
    outcome: "3 years imprisonment and fine",
    evidenceDiscrepancy: "Judgment relied on \"summersaulted\" testimony and screenshots of deactivated accounts, while ignoring procedural failures and forgeries.",
    sources: "[1-4, 6, 7, 11, 20, 21, 24, 25, 27-29, 36-38]"
  },
  {
    date: "2024-05-30",
    category: "Legal Proceeding",
    description: "District & Sessions Judge Karachi South grants bail and suspends Danish Thanvi's sentence pending appeal.",
    individuals: "Suresh Kumar (Sessions Judge), Danish Thanvi (Appellant)",
    legalAction: "Order u/s 426 CrPC",
    outcome: "Bail Granted",
    evidenceDiscrepancy: "Court identified substantial questions about the legality of the conviction warranting immediate release.",
    sources: "[20, 25]"
  },
  {
    date: "2024-10-01",
    category: "Business Interference",
    description: "NADRA abruptly terminates BCG's VeriSys access (core business tool) without notice, causing 78% revenue loss.",
    individuals: "Danish Thanvi (CEO), Lt. Col. Saqib Mumtaz (Influencer), NADRA (Official Body)",
    legalAction: "Regulatory Termination",
    outcome: "Business operations crippled",
    evidenceDiscrepancy: "Violation of 30-day notice clause and due process; termination linked to personal vendetta after Thanvi's release on bail.",
    sources: "[2-4, 6, 8, 11, 16, 20, 36, 39-44]"
  },
  {
    date: "2025-04-01",
    category: "Business Interference",
    description: "SECP issues a Show Cause Notice to BCG for company winding up based on the NADRA termination.",
    individuals: "SECP (Regulatory Body), Danish Thanvi (Accused)",
    legalAction: "SECP Show Cause Notice",
    outcome: "Challenged in High Court",
    evidenceDiscrepancy: "Targeted regulatory action followed the failure of the criminal case; SECP lacked jurisdiction over NADRA contract performance.",
    sources: "[5-7, 41-43]"
  },
  {
    date: "2025-05-21",
    category: "Legal Proceeding",
    description: "Islamabad High Court intervenes against regulatory overreach by SECP and NADRA.",
    individuals: "Justice Khadim Hussain Soomro",
    legalAction: "Writ Petition No. 2009/2025",
    outcome: "Stay granted; SECP notice suspended",
    evidenceDiscrepancy: "Court recognized prima facie violations of Articles 4 and 10A (Due Process) and abuse of process.",
    sources: "[2, 4, 7, 8, 11, 36, 42, 45, 46]"
  },
  {
    date: "2025-05-22",
    category: "Legal Proceeding",
    description: "Sessions Judge Suresh Kumar overturns the conviction and grants full acquittal to Danish Thanvi.",
    individuals: "Sessions Judge Suresh Kumar (Official), Danish Thanvi (Appellant)",
    legalAction: "Criminal Appeal No. 16 of 2024",
    outcome: "Full Acquittal; Exoneration",
    evidenceDiscrepancy: "Applied the doctrine of \"Falsus in Uno, Falsus in Omnibus\" due to forged recovery memos, illegal raid, and total collapse of chain of custody.",
    sources: "[1-4, 6-8, 11, 20, 21, 24, 25, 27, 29, 35, 36, 41, 47, 48]"
  },
  {
    date: "2025-07-03",
    category: "Criminal Allegation",
    description: "Fresh FIR registered by Mobina Sohail regarding an alleged misappropriation of a bag in April 2025.",
    individuals: "Mobina Sohail (Complainant), Danish Thanvi (Accused)",
    legalAction: "FIR No. 673/25 (PPC 420/406)",
    outcome: "Pending investigation",
    evidenceDiscrepancy: "2-month delay; Section 406 added mala fide to block bail; video evidence shows complainant in friendly contact after the alleged incident.",
    sources: "[2, 3, 5, 6, 11, 29, 39, 41]"
  }
];

export const categoryColors: Record<TimelineEvent["category"], string> = {
  "Business Interference": "bg-chart-1",
  "Harassment": "bg-chart-4",
  "Legal Proceeding": "bg-chart-2",
  "Criminal Allegation": "bg-chart-3"
};

export const categoryBorderColors: Record<TimelineEvent["category"], string> = {
  "Business Interference": "border-chart-1",
  "Harassment": "border-chart-4",
  "Legal Proceeding": "border-chart-2",
  "Criminal Allegation": "border-chart-3"
};
