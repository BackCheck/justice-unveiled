/**
 * Jurisdiction-Aware Court Dossier Generator
 * Produces formal High Court / Supreme Court filing PDFs
 * with proper court heading, section numbering, and verification.
 */

import type { CourtProfile, CourtId, CourtFilingTemplate } from '@/types/reports';
import { COURT_PROFILES, COURT_FILING_TEMPLATES, getAnnexLabel, getCourtCSS } from './courtProfiles';
import type { DossierSection, DossierAnnexure } from '@/components/reports/DossierBuilder';

interface CourtDossierOpts {
  courtId: CourtId;
  filingTemplate: CourtFilingTemplate;
  title: string;
  subtitle: string;
  caseTitle: string;
  caseNumber?: string;
  petitionerName?: string;
  respondentName?: string;
  sections: DossierSection[];
  annexures: DossierAnnexure[];
  includeSynopsis?: boolean;
  includeWatermark?: boolean;
}

export function generateCourtDossier(opts: CourtDossierOpts): string {
  const court = COURT_PROFILES[opts.courtId];
  const template = COURT_FILING_TEMPLATES[opts.filingTemplate];
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
  const selectedAnnexures = opts.annexures.filter(a => a.selected);
  const courtColor = '#1e3a5f';
  const watermarkCSS = opts.includeWatermark !== false ? `
    .watermark::before {
      content: 'DRAFT — REQUIRES LEGAL REVIEW';
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 60px; color: rgba(220, 38, 38, 0.07);
      font-weight: 900; z-index: -1; white-space: nowrap;
      pointer-events: none;
    }
  ` : '';

  // ── Section numbering helper ──
  const numberSection = (idx: number): string => {
    if (court.filingStyle.numbering === '(i)') {
      const roman = ['(i)', '(ii)', '(iii)', '(iv)', '(v)', '(vi)', '(vii)', '(viii)', '(ix)', '(x)', '(xi)', '(xii)'];
      return roman[idx] || `(${idx + 1})`;
    }
    return `${idx + 1}.`;
  };

  // ── TOC ──
  const tocItems = opts.sections.map((s, i) =>
    `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;font-family:${court.preferredFonts.body};">${numberSection(i)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:500;font-family:${court.preferredFonts.body};">${s.title}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:right;">Page —</td>
    </tr>`
  );
  if (selectedAnnexures.length > 0) {
    tocItems.push(
      `<tr style="background:#f8f9fa;">
        <td colspan="2" style="padding:6px 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Annexures (${selectedAnnexures.length} documents)</td>
        <td style="padding:6px 8px;font-size:12px;color:#6b7280;text-align:right;">Annexed</td>
      </tr>`
    );
    selectedAnnexures.forEach((a, i) => {
      tocItems.push(
        `<tr>
          <td style="padding:4px 8px 4px 24px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;">${getAnnexLabel(i, court)}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;">${a.label}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;text-align:right;">${a.source === 'affidavit' ? 'Affidavit' : 'Evidence'}</td>
        </tr>`
      );
    });
  }

  // ── Sections HTML ──
  const sectionsHTML = opts.sections.map((s, i) => `
    <div style="padding:24px 48px;page-break-inside:avoid;">
      <div style="margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid ${courtColor};">
        <h2 style="font-size:16px;margin:0;color:${courtColor};text-transform:uppercase;letter-spacing:1px;font-family:${court.preferredFonts.headings};">
          ${numberSection(i)} ${s.title}
        </h2>
      </div>
      <div style="font-size:13px;line-height:1.8;color:#1f2937;text-align:justify;font-family:${court.preferredFonts.body};white-space:pre-wrap;">
        ${s.content || `<p style="color:#9ca3af;font-style:italic;">[This section requires content to be provided by the legal team.]</p>`}
      </div>
    </div>
  `).join('');

  // ── Annexure Index + Cover Sheets ──
  const annexuresHTML = selectedAnnexures.length > 0 ? `
    <div class="page-break"></div>
    <div style="padding:48px;">
      <h2 style="font-size:16px;margin:0 0 20px;color:${courtColor};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${courtColor};padding-bottom:8px;font-family:${court.preferredFonts.headings};">
        INDEX OF ANNEXURES
      </h2>
      <p style="font-size:12px;color:#374151;margin-bottom:16px;font-family:${court.preferredFonts.body};line-height:1.6;">
        The following ${selectedAnnexures.length} documents are annexed herewith and form an integral part of this ${template.label.toLowerCase()}.
        Each annexure is referenced in the body of the petition by its designated mark.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:${court.preferredFonts.body};">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="padding:10px;text-align:left;border:1px solid #d1d5db;font-weight:700;width:100px;">Mark</th>
            <th style="padding:10px;text-align:left;border:1px solid #d1d5db;font-weight:700;">Document Description</th>
            <th style="padding:10px;text-align:left;border:1px solid #d1d5db;font-weight:700;width:120px;">Type</th>
            <th style="padding:10px;text-align:left;border:1px solid #d1d5db;font-weight:700;width:120px;">Relevance</th>
          </tr>
        </thead>
        <tbody>
          ${selectedAnnexures.map((a, i) => `
            <tr>
              <td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;color:${courtColor};">${getAnnexLabel(i, court)}</td>
              <td style="padding:8px 10px;border:1px solid #e5e7eb;">${a.label}</td>
              <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#6b7280;">${a.source === 'affidavit' ? 'Sworn Affidavit' : 'Documentary Evidence'}</td>
              <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#6b7280;">Supporting</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    ${selectedAnnexures.map((a, i) => `
      <div class="page-break"></div>
      <div style="padding:48px;min-height:85vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="border:3px double ${courtColor};padding:48px;text-align:center;max-width:480px;width:100%;">
          <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;font-family:${court.preferredFonts.headings};">ANNEXURE</div>
          <div style="font-size:64px;font-weight:800;color:${courtColor};margin:16px 0;font-family:${court.preferredFonts.headings};">${String.fromCharCode(65 + i)}</div>
          <div style="width:80px;height:2px;background:${courtColor};margin:16px auto;"></div>
          <h3 style="font-size:16px;margin:16px 0;color:#1f2937;font-family:${court.preferredFonts.headings};">${a.label}</h3>
          <p style="font-size:12px;color:#6b7280;line-height:1.6;font-family:${court.preferredFonts.body};">
            ${a.source === 'affidavit' ? 'Sworn affidavit' : 'Documentary evidence'} filed as <strong>${getAnnexLabel(i, court)}</strong>
            in the matter of <em>${opts.caseTitle}</em>.
          </p>
          <div style="margin-top:24px;padding:12px 16px;background:#f8f9fa;border:1px solid #e5e7eb;border-radius:4px;font-size:11px;color:#6b7280;text-align:left;">
            <strong>File:</strong> ${a.fileName}<br/>
            <strong>Source:</strong> <span style="color:${courtColor};word-break:break-all;">${a.fileUrl}</span>
          </div>
        </div>
      </div>
    `).join('')}
  ` : '';

  // ── Verification / Closing ──
  const verificationHTML = court.filingStyle.affidavitStyle === 'affidavit' ? `
    <div class="page-break"></div>
    <div style="padding:48px;font-family:${court.preferredFonts.body};">
      <h2 style="font-size:16px;color:${courtColor};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${courtColor};padding-bottom:8px;margin-bottom:24px;">
        AFFIDAVIT
      </h2>
      <p style="font-size:13px;line-height:2;color:#1f2937;text-align:justify;">
        I, <strong>${opts.petitionerName || '___________________'}</strong>, ${opts.petitionerName ? '' : '(Name of Deponent)'} do hereby solemnly affirm and state on oath as follows:
      </p>
      <ol style="font-size:13px;line-height:2;color:#1f2937;padding-left:24px;">
        <li>That I am the Petitioner in the above titled petition and am well conversant with the facts and circumstances of the case.</li>
        <li>That the contents of the above petition are true and correct to the best of my knowledge, information, and belief.</li>
        <li>That nothing material has been concealed therefrom.</li>
      </ol>
      <div style="margin-top:64px;display:flex;justify-content:space-between;font-size:12px;">
        <div style="text-align:center;"><div style="border-top:1px solid #1f2937;padding-top:8px;min-width:160px;">DEPONENT</div></div>
        <div style="text-align:center;"><div style="border-top:1px solid #1f2937;padding-top:8px;min-width:160px;">COMMISSIONER FOR OATHS</div></div>
      </div>
      <p style="margin-top:48px;font-size:12px;color:#6b7280;text-align:center;">
        Solemnly affirmed before me on this _____ day of _______________, ${now.getFullYear()}, at ${court.seatCities[0]}.
      </p>
    </div>
  ` : `
    <div class="page-break"></div>
    <div style="padding:48px;font-family:${court.preferredFonts.body};">
      <h2 style="font-size:16px;color:${courtColor};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${courtColor};padding-bottom:8px;margin-bottom:24px;">
        VERIFICATION
      </h2>
      <p style="font-size:13px;line-height:2;color:#1f2937;text-align:justify;">
        Verified at <strong>${court.seatCities[0]}</strong> on this _____ day of _______________, ${now.getFullYear()}, that the contents of the above 
        ${template.label.toLowerCase()} are true and correct to the best of my knowledge, information, and belief, and that nothing material has been concealed therefrom.
      </p>
      <div style="margin-top:64px;display:flex;justify-content:space-between;font-size:12px;">
        <div style="text-align:center;"><div style="border-top:1px solid #1f2937;padding-top:8px;min-width:160px;">Date</div></div>
        <div style="text-align:center;"><div style="border-top:1px solid #1f2937;padding-top:8px;min-width:160px;">PETITIONER</div></div>
      </div>
    </div>
  `;

  // ── Full Document ──
  return `<!DOCTYPE html>
<html><head><title>${opts.title} — ${court.name}</title>
<style>
  @media print { 
    @page { margin: 1cm; size: A4; } 
    .page-break { page-break-after: always; }
    .watermark::before { display: none; }
  }
  body { font-family: ${court.preferredFonts.body}; color: #1f2937; margin: 0; padding: 0; background: #fff; line-height: 1.5; }
  ${getCourtCSS(court)}
  ${watermarkCSS}
  table { page-break-inside: auto; } 
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
  h2 { page-break-after: avoid; }
</style></head><body class="${opts.includeWatermark !== false ? 'watermark' : ''}">

<!-- COVER PAGE -->
<div style="min-height:95vh;display:flex;flex-direction:column;justify-content:space-between;padding:48px;border:3px double ${courtColor};margin:12px;">
  <div style="text-align:center;">
    <img src="%%LOGO_BASE64%%" alt="HRPM Logo" style="height:60px;width:auto;margin:0 auto 8px;display:block;" />
    <p style="font-size:11px;color:#6b7280;margin-bottom:24px;">Human Rights Protection & Monitoring</p>
    <div style="border:2px solid ${courtColor};padding:20px;margin:0 auto;max-width:500px;">
      <pre style="font-size:14px;font-weight:700;color:${courtColor};text-align:center;white-space:pre-wrap;margin:0;font-family:${court.preferredFonts.headings};letter-spacing:1px;">${court.fullName}</pre>
    </div>
  </div>

  <div style="text-align:center;margin:32px 0;">
    <p style="font-size:11px;letter-spacing:3px;color:#6b7280;text-transform:uppercase;margin-bottom:4px;">${opts.subtitle}</p>
    <h2 style="font-size:24px;margin:12px 0;text-transform:uppercase;letter-spacing:1px;color:#1f2937;font-family:${court.preferredFonts.headings};">${opts.title}</h2>
    ${opts.caseNumber ? `<p style="font-family:monospace;color:#6b7280;font-size:13px;">${opts.caseNumber}</p>` : ''}
    <p style="font-size:13px;color:#374151;margin-top:8px;"><strong>Case:</strong> ${opts.caseTitle}</p>
    
    ${opts.petitionerName || opts.respondentName ? `
      <div style="margin-top:24px;text-align:center;font-size:13px;">
        ${opts.petitionerName ? `<p><strong>${opts.petitionerName}</strong><br/><span style="font-size:11px;color:#6b7280;">... Petitioner</span></p>` : ''}
        ${opts.petitionerName && opts.respondentName ? `<p style="font-size:18px;font-weight:700;margin:8px 0;">Versus</p>` : ''}
        ${opts.respondentName ? `<p><strong>${opts.respondentName}</strong><br/><span style="font-size:11px;color:#6b7280;">... Respondent(s)</span></p>` : ''}
      </div>
    ` : ''}
    
    <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
      <div style="padding:10px 20px;background:#f8f9fa;border:1px solid #e5e7eb;border-radius:4px;text-align:center;">
        <div style="font-size:18px;font-weight:700;color:${courtColor};">${opts.sections.length}</div>
        <div style="font-size:10px;color:#6b7280;">Sections</div>
      </div>
      <div style="padding:10px 20px;background:#f8f9fa;border:1px solid #e5e7eb;border-radius:4px;text-align:center;">
        <div style="font-size:18px;font-weight:700;color:${courtColor};">${selectedAnnexures.length}</div>
        <div style="font-size:10px;color:#6b7280;">Annexures</div>
      </div>
    </div>
  </div>

  <div style="background:#f8f9fa;border:1px solid #e5e7eb;padding:16px;font-size:11px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
      <div><span style="color:#6b7280;">Court:</span> ${court.name}</div>
      <div><span style="color:#6b7280;">Filing Type:</span> ${template.label}</div>
      <div><span style="color:#6b7280;">Generated:</span> ${date}</div>
      <div><span style="color:#6b7280;">Time:</span> ${time}</div>
    </div>
  </div>

  <div style="text-align:center;border-top:1px solid #e5e7eb;padding-top:12px;">
    <p style="font-weight:600;color:#1f2937;font-size:11px;">Human Rights Protection & Monitoring</p>
    <p style="font-size:10px;color:#6b7280;">36 Robinson Road, #20-01 City House, Singapore 068877</p>
    <p style="font-size:10px;color:#6b7280;">Tel: +6531 290 390 | Email: info@hrpm.org</p>
    <p style="font-size:9px;font-weight:600;color:#dc2626;margin-top:4px;">Strictly Confidential – Only for Advocacy Work</p>
  </div>
</div>

<div class="page-break"></div>

<!-- INDEX -->
<div style="padding:48px;">
  <h2 style="font-size:16px;margin:0 0 20px;color:${courtColor};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${courtColor};padding-bottom:8px;font-family:${court.preferredFonts.headings};">
    INDEX
  </h2>
  <table style="width:100%;border-collapse:collapse;font-family:${court.preferredFonts.body};">
    <thead>
      <tr style="background:#f8f9fa;">
        <th style="padding:8px;text-align:left;border:1px solid #d1d5db;font-size:11px;width:50px;">Sr.</th>
        <th style="padding:8px;text-align:left;border:1px solid #d1d5db;font-size:11px;">Particulars</th>
        <th style="padding:8px;text-align:right;border:1px solid #d1d5db;font-size:11px;width:80px;">Page</th>
      </tr>
    </thead>
    <tbody>${tocItems.join('')}</tbody>
  </table>
</div>

<div class="page-break"></div>

<!-- COURT HEADING (repeated on first section page) -->
<div style="padding:24px 48px 0;text-align:center;">
  <pre style="font-size:13px;font-weight:700;color:${courtColor};white-space:pre-wrap;margin:0;font-family:${court.preferredFonts.headings};letter-spacing:1px;">${court.fullName}</pre>
  <p style="font-size:12px;margin:8px 0;font-weight:600;">${opts.title}</p>
  ${opts.caseNumber ? `<p style="font-size:11px;color:#6b7280;font-family:monospace;">${opts.caseNumber}</p>` : ''}
  <div style="width:100px;height:2px;background:${courtColor};margin:12px auto;"></div>
</div>

${sectionsHTML}

${annexuresHTML}

${verificationHTML}

<!-- CLOSING -->
<div style="padding:48px;text-align:center;font-size:10px;">
  <div style="width:60px;height:2px;background:${courtColor};margin:0 auto 16px;"></div>
  <p style="font-weight:600;color:#1f2937;font-size:11px;">Human Rights Protection & Monitoring</p>
  <p style="color:#6b7280;">36 Robinson Road, #20-01 City House, Singapore 068877</p>
  <p style="font-weight:600;color:#dc2626;margin-top:8px;">Strictly Confidential – Only for Advocacy Work</p>
  <p style="color:#6b7280;">© ${now.getFullYear()} HRPM. All rights reserved.</p>
  ${court.disclaimers.map(d => `<p style="color:#6b7280;font-style:italic;margin-top:4px;">${d}</p>`).join('')}
</div>

<script>window.onload=function(){window.print();}</script>
</body></html>`;
}
