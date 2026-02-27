/**
 * Report Front-Matter + Disclaimer builders for Safety Gate.
 */

import type { DistributionMode } from "@/types/safety";
import { getCourtSafePhrases, type CourtStyle, type FilingType } from "./courtSafeLanguagePK";

export function buildSafetyFrontMatter(opts: {
  mode: DistributionMode;
  courtStyle?: CourtStyle;
  filingType?: FilingType;
  caseTitle?: string;
  eventCount?: number;
  sourceCount?: number;
}): string {
  const { mode, courtStyle, filingType, caseTitle, eventCount = 0, sourceCount = 0 } = opts;
  const isCourtMode = mode === "court_mode" && courtStyle && filingType;
  const phrases = isCourtMode ? getCourtSafePhrases(courtStyle!, filingType!) : null;

  return `
    <div style="padding:32px 48px;page-break-inside:avoid;">
      <div style="border-bottom:2px solid #0087C1;padding-bottom:10px;margin-bottom:16px;">
        <h2 style="font-size:18px;margin:0;color:#1f2937;">Methodology & Scope</h2>
      </div>
      <div style="font-size:12px;color:#374151;line-height:1.8;">
        <p>This report is generated from the HRPM case database${caseTitle ? ` for <strong>${caseTitle}</strong>` : ''}, covering ${eventCount.toLocaleString()} events and ${sourceCount.toLocaleString()} evidence sources.</p>
        <p><strong>Processing Applied:</strong></p>
        <ul style="padding-left:20px;margin:4px 0;">
          <li>Entity canonicalization (name variant consolidation)</li>
          <li>Event deduplication (85% similarity threshold)</li>
          <li>Neutral language enforcement (court-safe allegation framing)</li>
          <li>Sensitive data redaction (CNIC, phone, address patterns)</li>
          <li>Reputation risk filtering (defamation/privacy signal detection)</li>
        </ul>
        ${isCourtMode && phrases ? `<p style="margin-top:8px;padding:8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;font-size:11px;color:#1e40af;"><strong>Court Filing Note:</strong> ${phrases.no_judicial_determination}</p>` : ''}
      </div>
    </div>

    <div style="padding:16px 48px;page-break-inside:avoid;">
      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:14px;background:#f9fafb;font-size:10px;color:#6b7280;line-height:1.7;">
        <strong style="color:#374151;">Distribution:</strong>
        ${mode === 'court_mode' ? 'Restricted — Court Filing Only' : mode === 'controlled_legal' ? 'Controlled Legal Distribution' : mode === 'research_only' ? 'Research Only' : 'Public'}
      </div>
    </div>
  `;
}

export function buildSafetyDisclaimers(mode: DistributionMode): string {
  return `
    <div style="padding:32px 48px;page-break-inside:avoid;">
      <div style="border:2px solid #d97706;border-radius:8px;padding:20px;background:#fffbeb;">
        <h3 style="font-size:14px;font-weight:700;color:#92400e;margin:0 0 12px;">Legal Disclaimer & Safety Notice</h3>
        <div style="font-size:11px;color:#78350f;line-height:1.8;">
          <p><strong>1.</strong> This report presents analytical findings only. It does not constitute a judicial determination or adjudication of any allegation.</p>
          <p><strong>2.</strong> All allegations remain subject to due process. No person named herein is deemed guilty unless adjudicated by a court of competent jurisdiction.</p>
          <p><strong>3.</strong> This report does not constitute legal advice. Independent counsel is recommended before reliance.</p>
          <p><strong>4.</strong> HRPM accepts no liability for consequences arising from use or misuse of this report.</p>
          <p><strong>5.</strong> Sensitive personal data has been redacted where detected. If any remains, it is inadvertent and should not be further disseminated.</p>
          ${mode === 'court_mode' ? '<p><strong>6.</strong> Court filings must be reviewed by qualified counsel before submission. This document is a draft analytical product, not a final legal filing.</p>' : ''}
        </div>
      </div>
    </div>
  `;
}
