/**
 * Jurisdiction-Aware Court Profiles — Pakistan High Courts
 * Configures formatting, section requirements, and terminology per court.
 */

import type { CourtProfile, CourtId, CourtTemplateConfig, CourtFilingTemplate } from '@/types/reports';

// ── Court Profiles ──

export const COURT_PROFILES: Record<CourtId, CourtProfile> = {
  IHC: {
    id: 'IHC',
    name: 'Islamabad High Court',
    fullName: 'IN THE ISLAMABAD HIGH COURT, ISLAMABAD\n(Judicial Department)',
    seatCities: ['Islamabad'],
    language: 'EN',
    preferredFonts: { body: 'Georgia, "Times New Roman", serif', headings: 'Georgia, "Times New Roman", serif' },
    filingStyle: {
      headingFormat: 'IN THE ISLAMABAD HIGH COURT, ISLAMABAD',
      numbering: '1.',
      affidavitStyle: 'verification',
      annexLabel: 'Annex-A',
    },
    requiredSections: ['cover', 'parties', 'facts', 'questions', 'grounds', 'prayer', 'verification', 'index', 'annexures'],
    optionalSections: ['synopsis', 'interimRelief', 'maintainability', 'jurisdiction', 'precedents'],
    disclaimers: ['Filed through counsel under Article 199 of the Constitution of Pakistan, 1973.'],
    citationsStyle: 'footnote',
  },
  SHC: {
    id: 'SHC',
    name: 'Sindh High Court',
    fullName: 'IN THE HIGH COURT OF SINDH AT KARACHI\n(Constitutional Jurisdiction)',
    seatCities: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'],
    language: 'EN',
    preferredFonts: { body: 'Georgia, "Times New Roman", serif', headings: 'Georgia, "Times New Roman", serif' },
    filingStyle: {
      headingFormat: 'IN THE HIGH COURT OF SINDH AT KARACHI',
      numbering: '1.',
      affidavitStyle: 'affidavit',
      annexLabel: 'Annexure-A',
    },
    requiredSections: ['cover', 'parties', 'synopsis', 'facts', 'questions', 'grounds', 'prayer', 'verification', 'index', 'annexures'],
    optionalSections: ['interimRelief', 'maintainability', 'limitation', 'jurisdiction', 'precedents'],
    disclaimers: ['Filed through counsel under Article 199 of the Constitution of Pakistan, 1973.'],
    citationsStyle: 'footnote',
  },
  LHC: {
    id: 'LHC',
    name: 'Lahore High Court',
    fullName: 'IN THE LAHORE HIGH COURT, LAHORE\n(Judicial Department)',
    seatCities: ['Lahore', 'Rawalpindi', 'Multan', 'Bahawalpur'],
    language: 'EN',
    preferredFonts: { body: 'Georgia, "Times New Roman", serif', headings: 'Georgia, "Times New Roman", serif' },
    filingStyle: {
      headingFormat: 'IN THE LAHORE HIGH COURT, LAHORE',
      numbering: '1.',
      affidavitStyle: 'verification',
      annexLabel: 'Annexure-A',
    },
    requiredSections: ['cover', 'parties', 'facts', 'questions', 'grounds', 'prayer', 'verification', 'index', 'annexures'],
    optionalSections: ['synopsis', 'interimRelief', 'maintainability', 'jurisdiction', 'precedents'],
    disclaimers: ['Filed through counsel under Article 199 of the Constitution of Pakistan, 1973.'],
    citationsStyle: 'footnote',
  },
  BHC: {
    id: 'BHC',
    name: 'Balochistan High Court',
    fullName: 'IN THE HIGH COURT OF BALOCHISTAN AT QUETTA',
    seatCities: ['Quetta'],
    language: 'EN',
    preferredFonts: { body: 'Georgia, "Times New Roman", serif', headings: 'Georgia, "Times New Roman", serif' },
    filingStyle: {
      headingFormat: 'IN THE HIGH COURT OF BALOCHISTAN AT QUETTA',
      numbering: '1.',
      affidavitStyle: 'verification',
      annexLabel: 'Annexure-A',
    },
    requiredSections: ['cover', 'parties', 'facts', 'grounds', 'prayer', 'verification', 'index', 'annexures'],
    optionalSections: ['synopsis', 'questions', 'interimRelief', 'jurisdiction', 'precedents'],
    disclaimers: ['Filed through counsel under Article 199 of the Constitution of Pakistan, 1973.'],
    citationsStyle: 'footnote',
  },
  PHC: {
    id: 'PHC',
    name: 'Peshawar High Court',
    fullName: 'IN THE PESHAWAR HIGH COURT, PESHAWAR\n(Judicial Department)',
    seatCities: ['Peshawar', 'Abbottabad', 'Mingora', 'D.I. Khan'],
    language: 'EN',
    preferredFonts: { body: 'Georgia, "Times New Roman", serif', headings: 'Georgia, "Times New Roman", serif' },
    filingStyle: {
      headingFormat: 'IN THE PESHAWAR HIGH COURT, PESHAWAR',
      numbering: '1.',
      affidavitStyle: 'verification',
      annexLabel: 'Annexure-A',
    },
    requiredSections: ['cover', 'parties', 'facts', 'grounds', 'prayer', 'verification', 'index', 'annexures'],
    optionalSections: ['synopsis', 'questions', 'interimRelief', 'jurisdiction', 'precedents'],
    disclaimers: ['Filed through counsel under Article 199 of the Constitution of Pakistan, 1973.'],
    citationsStyle: 'footnote',
  },
  AJKHC: {
    id: 'AJKHC',
    name: 'AJK High Court',
    fullName: 'IN THE HIGH COURT OF AZAD JAMMU & KASHMIR AT MUZAFFARABAD',
    seatCities: ['Muzaffarabad'],
    language: 'EN',
    preferredFonts: { body: 'Georgia, "Times New Roman", serif', headings: 'Georgia, "Times New Roman", serif' },
    filingStyle: {
      headingFormat: 'IN THE HIGH COURT OF AZAD JAMMU & KASHMIR AT MUZAFFARABAD',
      numbering: '1.',
      affidavitStyle: 'verification',
      annexLabel: 'Annexure-A',
    },
    requiredSections: ['cover', 'parties', 'facts', 'grounds', 'prayer', 'verification', 'index', 'annexures'],
    optionalSections: ['synopsis', 'questions', 'interimRelief', 'jurisdiction'],
    disclaimers: [],
    citationsStyle: 'footnote',
  },
  GBCC: {
    id: 'GBCC',
    name: 'GB Chief Court',
    fullName: 'IN THE CHIEF COURT OF GILGIT-BALTISTAN',
    seatCities: ['Gilgit'],
    language: 'EN',
    preferredFonts: { body: 'Georgia, "Times New Roman", serif', headings: 'Georgia, "Times New Roman", serif' },
    filingStyle: {
      headingFormat: 'IN THE CHIEF COURT OF GILGIT-BALTISTAN',
      numbering: '1.',
      affidavitStyle: 'verification',
      annexLabel: 'Annexure-A',
    },
    requiredSections: ['cover', 'parties', 'facts', 'grounds', 'prayer', 'verification', 'index', 'annexures'],
    optionalSections: ['synopsis', 'questions', 'interimRelief'],
    disclaimers: [],
    citationsStyle: 'footnote',
  },
  SC: {
    id: 'SC',
    name: 'Supreme Court',
    fullName: 'IN THE SUPREME COURT OF PAKISTAN\n(Appellate / Original Jurisdiction)',
    seatCities: ['Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Quetta'],
    language: 'EN',
    preferredFonts: { body: 'Georgia, "Times New Roman", serif', headings: 'Georgia, "Times New Roman", serif' },
    filingStyle: {
      headingFormat: 'IN THE SUPREME COURT OF PAKISTAN',
      numbering: '1.',
      affidavitStyle: 'affidavit',
      annexLabel: 'Annexure-A',
    },
    requiredSections: ['cover', 'parties', 'synopsis', 'facts', 'questions', 'grounds', 'arguments', 'prayer', 'verification', 'index', 'annexures'],
    optionalSections: ['interimRelief', 'maintainability', 'limitation', 'jurisdiction', 'precedents'],
    disclaimers: ['Filed under Article 184(3) / Article 185 of the Constitution of Pakistan, 1973.'],
    citationsStyle: 'footnote',
  },
};

// ── Filing Templates ──

export const COURT_FILING_TEMPLATES: Record<CourtFilingTemplate, CourtTemplateConfig> = {
  writ_petition: {
    id: 'writ_petition',
    label: 'Writ Petition / Constitutional Petition',
    description: 'Constitutional petition under Article 199 challenging fundamental rights violations.',
    sections: [
      { type: 'parties', title: 'Parties', required: true },
      { type: 'synopsis', title: 'Synopsis & List of Dates', required: false },
      { type: 'facts', title: 'Statement of Facts', required: true },
      { type: 'questions', title: 'Questions of Law', required: true },
      { type: 'grounds', title: 'Grounds', required: true },
      { type: 'maintainability', title: 'Maintainability & Jurisdiction', required: false },
      { type: 'interimRelief', title: 'Interim Relief', required: false },
      { type: 'prayer', title: 'Prayer', required: true },
      { type: 'verification', title: 'Verification', required: true },
    ],
  },
  criminal_misc: {
    id: 'criminal_misc',
    label: 'Criminal Misc / Quashment / Bail',
    description: 'Criminal miscellaneous application for quashment of FIR, bail, or protective relief.',
    sections: [
      { type: 'parties', title: 'Parties', required: true },
      { type: 'facts', title: 'Statement of Facts & FIR Details', required: true },
      { type: 'grounds', title: 'Grounds for Quashment / Relief', required: true },
      { type: 'precedents', title: 'Relied Upon Precedents', required: false },
      { type: 'interimRelief', title: 'Interim Protective Relief', required: false },
      { type: 'prayer', title: 'Prayer', required: true },
      { type: 'verification', title: 'Verification', required: true },
    ],
  },
  complaint: {
    id: 'complaint',
    label: 'Complaint / Representation',
    description: 'Formal complaint or representation to authority or oversight body.',
    sections: [
      { type: 'parties', title: 'Complainant & Respondent Details', required: true },
      { type: 'facts', title: 'Statement of Facts', required: true },
      { type: 'grounds', title: 'Legal Basis & Violations', required: true },
      { type: 'prayer', title: 'Relief Sought', required: true },
    ],
  },
  appeal: {
    id: 'appeal',
    label: 'Appeal / Leave to Appeal',
    description: 'Appeal against a lower court/tribunal decision or application for leave to appeal.',
    sections: [
      { type: 'parties', title: 'Parties', required: true },
      { type: 'synopsis', title: 'Synopsis of Impugned Order', required: true },
      { type: 'facts', title: 'Statement of Facts', required: true },
      { type: 'questions', title: 'Questions of Law', required: true },
      { type: 'grounds', title: 'Grounds for Appeal', required: true },
      { type: 'precedents', title: 'Relied Upon Precedents', required: false },
      { type: 'prayer', title: 'Prayer', required: true },
      { type: 'verification', title: 'Verification', required: true },
    ],
  },
};

// ── Helpers ──

export function getCourtProfile(courtId: CourtId): CourtProfile {
  return COURT_PROFILES[courtId];
}

export function getCourtsList(): { id: CourtId; name: string }[] {
  return Object.values(COURT_PROFILES).map(c => ({ id: c.id, name: c.name }));
}

export function getFilingTemplates(): CourtTemplateConfig[] {
  return Object.values(COURT_FILING_TEMPLATES);
}

export function getAnnexLabel(index: number, court: CourtProfile): string {
  const prefix = court.filingStyle.annexLabel.replace(/[A-Z0-9]$/, '');
  if (court.filingStyle.annexLabel.endsWith('1')) {
    return `${prefix}${index + 1}`;
  }
  return `${prefix}${String.fromCharCode(65 + index)}`;
}

export function getCourtCSS(court: CourtProfile): string {
  return `
    body { font-family: ${court.preferredFonts.body}; line-height: 1.3; }
    h1, h2, h3, h4 { font-family: ${court.preferredFonts.headings}; }
  `;
}
