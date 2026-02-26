/**
 * Court Dossier / Investigation Dossier PDF generator.
 * Produces a fully formatted HTML document with cover, index, sections, and numbered annexures.
 */

import type { DossierSection, DossierAnnexure } from "@/components/reports/DossierBuilder";

interface DossierOpts {
  template: "court" | "investigation";
  title: string;
  subtitle: string;
  caseTitle: string;
  caseNumber?: string;
  sections: DossierSection[];
  annexures: DossierAnnexure[];
}

export function generateDossierReport(opts: DossierOpts): string {
  const now = new Date();
  const date = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });
  const selectedAnnexures = opts.annexures.filter(a => a.selected);
  const isCourt = opts.template === "court";

  // ── TOC ──
  const tocItems = opts.sections.map((s, i) =>
    `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#374151;">${i + 1}.</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;font-weight:500;">${s.title}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#6b7280;text-align:right;">Section ${i + 1}</td>
    </tr>`
  );
  if (selectedAnnexures.length > 0) {
    tocItems.push(
      `<tr style="background:#fef2f2;">
        <td style="padding:6px 8px;font-size:12px;color:#374151;" colspan="2"><strong>ANNEXURES</strong> (${selectedAnnexures.length} documents)</td>
        <td style="padding:6px 8px;font-size:12px;color:#6b7280;text-align:right;">Annexed</td>
      </tr>`
    );
    selectedAnnexures.forEach((a, i) => {
      tocItems.push(
        `<tr>
          <td style="padding:4px 8px 4px 24px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;">Annex-${String.fromCharCode(65 + i)}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;">${a.label}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;text-align:right;">${a.source === "affidavit" ? "Affidavit" : "Evidence"}</td>
        </tr>`
      );
    });
  }

  // ── Sections ──
  const sectionsHTML = opts.sections.map((s, i) => `
    <div class="page-break"></div>
    <div style="padding:48px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:12px;border-bottom:3px solid ${isCourt ? '#1e3a5f' : '#0087C1'};">
        <div style="background:${isCourt ? '#1e3a5f' : '#0087C1'};color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">${i + 1}</div>
        <h2 style="font-size:20px;margin:0;color:#1f2937;text-transform:${isCourt ? 'uppercase' : 'none'};letter-spacing:${isCourt ? '1px' : '0'};">${s.title}</h2>
      </div>
      <div style="font-size:13px;line-height:1.8;color:#374151;white-space:pre-wrap;">
        ${s.content || `<p style="color:#9ca3af;font-style:italic;">[This section requires content to be provided by the legal team.]</p>`}
      </div>
    </div>
  `).join('');

  // ── Annexures section ──
  const annexuresHTML = selectedAnnexures.length > 0 ? `
    <div class="page-break"></div>
    <div style="padding:48px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:12px;border-bottom:3px solid ${isCourt ? '#1e3a5f' : '#0087C1'};">
        <h2 style="font-size:20px;margin:0;color:#1f2937;text-transform:uppercase;letter-spacing:1px;">ANNEXURES</h2>
      </div>
      <p style="font-size:12px;color:#6b7280;margin-bottom:16px;">
        The following ${selectedAnnexures.length} documents are annexed herewith and form an integral part of this ${isCourt ? 'filing' : 'dossier'}.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:700;width:80px;">Mark</th>
            <th style="padding:10px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:700;">Document Title</th>
            <th style="padding:10px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:700;width:100px;">Type</th>
            <th style="padding:10px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:700;width:100px;">File</th>
          </tr>
        </thead>
        <tbody>
          ${selectedAnnexures.map((a, i) => `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
              <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-weight:700;color:${isCourt ? '#1e3a5f' : '#0087C1'};">Annex-${String.fromCharCode(65 + i)}</td>
              <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;">${a.label}</td>
              <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;color:#6b7280;">${a.source === "affidavit" ? "Sworn Affidavit" : "Documentary Evidence"}</td>
              <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:10px;color:#6b7280;">${a.fileName}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${selectedAnnexures.map((a, i) => `
        <div class="page-break"></div>
        <div style="padding:48px;">
          <div style="border:2px solid ${isCourt ? '#1e3a5f' : '#0087C1'};border-radius:8px;padding:32px;text-align:center;min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-size:14px;font-weight:700;color:${isCourt ? '#1e3a5f' : '#0087C1'};letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">ANNEXURE</div>
            <div style="font-size:48px;font-weight:800;color:${isCourt ? '#1e3a5f' : '#0087C1'};margin:16px 0;">${String.fromCharCode(65 + i)}</div>
            <div style="width:60px;height:3px;background:${isCourt ? '#1e3a5f' : '#0087C1'};border-radius:4px;margin:16px auto;"></div>
            <h3 style="font-size:18px;margin:12px 0;color:#1f2937;">${a.label}</h3>
            <p style="font-size:12px;color:#6b7280;max-width:400px;">
              ${a.source === "affidavit" ? "Sworn affidavit" : "Documentary evidence"} filed as part of ${opts.title} in the matter of ${opts.caseTitle}.
            </p>
            <div style="margin-top:24px;padding:12px 20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:11px;color:#6b7280;">
              <strong>File:</strong> ${a.fileName}<br/>
              <strong>Source URL:</strong> <span style="color:#0087C1;word-break:break-all;">${a.fileUrl}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  // ── Full document ──
  return `<!DOCTYPE html>
<html><head><title>${opts.title} — ${opts.caseTitle}</title>
<style>
  @media print { @page { margin: 1cm; size: A4; } .page-break { page-break-after: always; } }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #fff; line-height: 1.5; }
  table { page-break-inside: auto; } tr { page-break-inside: avoid; }
</style></head><body>

<!-- COVER PAGE -->
<div style="min-height:95vh;display:flex;flex-direction:column;justify-content:space-between;padding:48px;${isCourt ? 'border:3px double #1e3a5f;margin:12px;' : ''}">
  <div style="text-align:center;">
    <img src="https://hrpm.lovable.app/favicon.png" alt="HRPM Logo" style="height:70px;width:auto;margin:0 auto 8px;display:block;" />
    <h1 style="font-size:28px;color:${isCourt ? '#1e3a5f' : '#0087C1'};margin:0;">HRPM.org</h1>
    <p style="font-size:14px;color:#6b7280;">Human Rights Protection & Monitoring</p>
  </div>
  
  <div style="text-align:center;margin:40px 0;">
    ${isCourt ? `<p style="font-size:13px;letter-spacing:4px;color:#9ca3af;text-transform:uppercase;margin-bottom:8px;">IN THE MATTER OF</p>` : ''}
    <p style="font-size:11px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;">${opts.subtitle}</p>
    <h2 style="font-size:28px;margin:16px 0;color:#1f2937;${isCourt ? 'text-transform:uppercase;letter-spacing:1px;' : ''}">${opts.title}</h2>
    ${opts.caseNumber ? `<p style="font-family:monospace;color:#6b7280;font-size:14px;">${opts.caseNumber}</p>` : ''}
    <p style="color:#6b7280;font-size:14px;margin-top:8px;">Case: ${opts.caseTitle}</p>
    
    <div style="margin-top:32px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;">
      <div style="padding:12px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:${isCourt ? '#1e3a5f' : '#0087C1'};">${opts.sections.length}</div>
        <div style="font-size:11px;color:#6b7280;">Sections</div>
      </div>
      <div style="padding:12px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:${isCourt ? '#1e3a5f' : '#0087C1'};">${selectedAnnexures.length}</div>
        <div style="font-size:11px;color:#6b7280;">Annexures</div>
      </div>
    </div>
  </div>
  
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
    <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;margin-bottom:8px;">Document Details</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
      <div><span style="color:#9ca3af;">Generated:</span> ${date}</div>
      <div><span style="color:#9ca3af;">Time:</span> ${time}</div>
      <div><span style="color:#9ca3af;">Format:</span> ${isCourt ? 'Court Filing' : 'Investigation Dossier'}</div>
      <div><span style="color:#9ca3af;">Total Pages:</span> ${opts.sections.length + selectedAnnexures.length + 3} (est.)</div>
    </div>
  </div>
  
  <div style="text-align:center;">
    <p style="font-weight:600;color:#1f2937;font-size:12px;">Human Rights Protection & Monitoring</p>
    <p style="font-size:11px;color:#6b7280;">36 Robinson Road, #20-01 City House, Singapore 068877</p>
    <p style="font-size:11px;color:#6b7280;">Tel: +6531 290 390 | Email: info@hrpm.org</p>
  </div>
  <div style="text-align:center;border-top:1px solid #e5e7eb;padding-top:12px;font-size:10px;">
    <p style="font-weight:600;color:#dc2626;">Strictly Confidential – Only for Advocacy Work</p>
    <p style="color:#6b7280;">© ${now.getFullYear()} Human Rights Protection & Monitoring. All rights reserved.</p>
  </div>
</div>

<div class="page-break"></div>

<!-- INDEX / TABLE OF CONTENTS -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:3px solid ${isCourt ? '#1e3a5f' : '#0087C1'};">
    <h2 style="font-size:20px;margin:0;text-transform:uppercase;letter-spacing:1px;">Index</h2>
  </div>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="background:#f9fafb;">
        <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-size:11px;width:40px;">No.</th>
        <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-size:11px;">Particulars</th>
        <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb;font-size:11px;">Reference</th>
      </tr>
    </thead>
    <tbody>${tocItems.join('')}</tbody>
  </table>
</div>

${sectionsHTML}

${annexuresHTML}

<div class="page-break"></div>

<!-- CLOSING / VERIFICATION -->
<div style="min-height:50vh;display:flex;align-items:center;justify-content:center;padding:48px;">
  <div style="text-align:center;max-width:480px;">
    <div style="width:60px;height:3px;background:${isCourt ? '#1e3a5f' : '#0087C1'};margin:0 auto 24px;border-radius:4px;"></div>
    ${isCourt ? `
      <h2 style="font-size:18px;text-transform:uppercase;letter-spacing:1px;">VERIFICATION</h2>
      <p style="font-size:12px;color:#374151;line-height:1.8;margin:16px 0;">
        I, the undersigned, do hereby verify that the contents of the above ${opts.title.toLowerCase()} are true and correct to the best of my knowledge, 
        information, and belief, and nothing material has been concealed therefrom.
      </p>
      <div style="margin-top:48px;display:flex;justify-content:space-between;">
        <div style="text-align:center;">
          <div style="border-top:1px solid #374151;padding-top:4px;min-width:150px;font-size:11px;">Date</div>
        </div>
        <div style="text-align:center;">
          <div style="border-top:1px solid #374151;padding-top:4px;min-width:150px;font-size:11px;">Signature</div>
        </div>
      </div>
    ` : `
      <h2 style="font-size:18px;">End of Dossier</h2>
      <p style="color:#6b7280;font-size:12px;margin:12px 0;">
        This dossier contains ${opts.sections.length} analytical sections and ${selectedAnnexures.length} annexed source documents.
      </p>
    `}
    <div style="margin-top:32px;font-size:11px;color:#6b7280;">
      <p style="font-weight:600;color:#1f2937;">Human Rights Protection & Monitoring</p>
      <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
    </div>
    <div style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;font-size:10px;">
      <p style="font-weight:600;color:#dc2626;">Strictly Confidential – Only for Advocacy Work</p>
      <p style="color:#6b7280;">© ${now.getFullYear()} HRPM. All rights reserved.</p>
    </div>
  </div>
</div>

<script>window.onload=function(){window.print();}</script>
</body></html>`;
}
