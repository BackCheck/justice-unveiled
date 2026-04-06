/**
 * Unified report shell — premium cover page, sections, closing for all report types.
 * Logo is fetched and embedded as base64 to ensure visibility in popup windows.
 */

interface ReportShellOptions {
  title: string;
  subtitle: string;
  caseTitle: string;
  caseNumber?: string;
  sections: { title: string; content: string }[];
  stats?: { label: string; value: string | number }[];
  frontMatterHTML?: string;
  appendicesHTML?: string;
  courtMode?: boolean;
  disclaimerHTML?: string;
  distributionHTML?: string;
  severity?: string | null;
  leadInvestigator?: string | null;
}

const LOGO_PLACEHOLDER = '%%LOGO_BASE64%%';

export function buildReportShell(opts: ReportShellOptions): string {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const formattedTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });

  const severityColor = opts.severity === 'critical' ? '#dc2626' : opts.severity === 'high' ? '#ea580c' : '#d97706';
  const severityBg = opts.severity === 'critical' ? '#fef2f2' : opts.severity === 'high' ? '#fff7ed' : '#fefce8';

  const tocHTML = opts.sections.map((s, i) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f3f4f6;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="background:#0087C1;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">${i + 1}</span>
        <span style="font-size:12px;color:#374151;font-weight:500;">${s.title}</span>
      </div>
    </div>`
  ).join('');

  const statsRow = opts.stats?.length ? `
    <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
      ${opts.stats.map(s => `
        <div style="padding:14px 24px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;text-align:center;min-width:100px;">
          <div style="font-size:24px;font-weight:800;color:#0087C1;">${typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
          <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">${s.label}</div>
        </div>
      `).join('')}
    </div>` : '';

  const sectionsHTML = opts.sections.map((s, i) => `
    <div style="padding:28px 48px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #0087C1;">
        <span style="background:#0087C1;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">${i + 1}</span>
        <h2 style="font-size:17px;margin:0;color:#111827;font-weight:700;">${s.title}</h2>
      </div>
      ${s.content}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html><head><title>${opts.title} — ${opts.caseTitle}</title>
<style>
  @media print { @page { margin: 0.8cm; size: A4; } .page-break { page-break-after: always; } }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #fff; line-height: 1.5; font-size: 12px; }
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  h4 { page-break-after: avoid; }
</style></head><body>

<!-- COVER PAGE -->
<div style="min-height:95vh;display:flex;flex-direction:column;justify-content:space-between;padding:48px;background:linear-gradient(180deg,#fff 0%,#f8fafc 100%);">
  <div style="text-align:center;">
    <img src="${LOGO_PLACEHOLDER}" alt="HRPM Logo" style="height:72px;width:auto;margin:0 auto 10px;display:block;" />
    <h1 style="font-size:28px;color:#0087C1;margin:0;letter-spacing:-0.5px;">HRPM.org</h1>
    <p style="font-size:14px;color:#6b7280;margin:4px 0 0;">Human Rights Protection &amp; Monitoring</p>
    <div style="width:80px;height:3px;background:#0087C1;margin:12px auto;border-radius:4px;"></div>
  </div>

  <div style="text-align:center;margin:32px 0;">
    <p style="font-size:10px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;margin-bottom:12px;">${opts.subtitle}</p>
    <h2 style="font-size:24px;margin:0 0 6px;color:#111827;font-weight:800;">${opts.title}</h2>
    ${opts.caseNumber ? `<p style="font-family:monospace;color:#6b7280;font-size:13px;margin:4px 0;">${opts.caseNumber}</p>` : ''}
    
    ${opts.severity ? `
    <div style="margin-top:16px;display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:${severityBg};border:1px solid ${severityColor}40;border-radius:20px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${severityColor};"></span>
      <span style="font-size:11px;font-weight:700;color:${severityColor};text-transform:uppercase;letter-spacing:1px;">${opts.severity} Risk</span>
    </div>` : ''}
    
    ${statsRow}
    
    <p style="max-width:500px;margin:20px auto 0;font-size:11px;color:#6b7280;line-height:1.6;">
      This report presents analytical findings from systematic investigation of case evidence, actor networks, and procedural records. Generated ${formattedDate}.
    </p>
  </div>

  <div style="background:#1e293b;color:#e2e8f0;border-radius:10px;padding:20px 28px;">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:12px;text-align:center;">
      <div><span style="color:#94a3b8;font-size:10px;display:block;">Generated</span><strong>${formattedTime}</strong></div>
      ${opts.severity ? `<div><span style="color:#94a3b8;font-size:10px;display:block;">Severity</span><strong style="color:${severityColor};text-transform:uppercase;">${opts.severity}</strong></div>` : '<div></div>'}
      ${opts.leadInvestigator ? `<div><span style="color:#94a3b8;font-size:10px;display:block;">Lead</span><strong style="color:#60a5fa;">${opts.leadInvestigator}</strong></div>` : '<div></div>'}
    </div>
  </div>

  <div style="text-align:center;font-size:11px;color:#6b7280;">
    <p style="font-weight:600;color:#374151;">Human Rights Protection &amp; Monitoring</p>
    <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
    <p>Tel: +6531 290 390 | Email: info@hrpm.org</p>
  </div>

  <div style="text-align:center;border-top:1px solid #e5e7eb;padding-top:10px;">
    <p style="font-weight:700;color:#dc2626;font-size:10px;margin:0 0 4px;">Strictly Confidential – Only for Advocacy Work</p>
    <p style="font-size:9px;color:#9ca3af;margin:0;">© ${now.getFullYear()} HRPM. All rights reserved. | Documenting injustice. Demanding accountability.</p>
  </div>
</div>

<div class="page-break"></div>

${opts.disclaimerHTML || ''}

<!-- TABLE OF CONTENTS -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #0087C1;">
    <h2 style="font-size:18px;margin:0;color:#111827;">Table of Contents</h2>
  </div>
  ${tocHTML}
</div>

${opts.frontMatterHTML ? `<div class="page-break"></div>${opts.frontMatterHTML}` : ''}

<div class="page-break"></div>

${sectionsHTML}

${opts.appendicesHTML || ''}
${opts.distributionHTML || ''}

<!-- CLOSING -->
<div style="padding:48px;margin-top:24px;">
  <div style="text-align:center;max-width:440px;margin:0 auto;">
    <div style="width:60px;height:3px;background:#0087C1;margin:0 auto 20px;border-radius:4px;"></div>
    <h2 style="font-size:18px;color:#111827;">End of Report</h2>
    <p style="color:#6b7280;font-size:11px;margin:10px 0;">
      This ${opts.subtitle.toLowerCase()} contains ${opts.sections.length} analytical sections for case: ${opts.caseTitle}.
    </p>
    <div style="margin-top:12px;font-size:10px;color:#6b7280;">
      <p style="font-weight:600;color:#374151;">Human Rights Protection &amp; Monitoring</p>
      <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
    </div>
    <div style="border-top:1px solid #e5e7eb;padding-top:10px;margin-top:10px;">
      <p style="font-weight:700;color:#dc2626;font-size:10px;">Strictly Confidential – Only for Advocacy Work</p>
      <p style="font-size:9px;color:#9ca3af;">© ${now.getFullYear()} HRPM. All rights reserved.</p>
    </div>
  </div>
</div>

<script>window.onload=function(){window.print();}</script>
</body></html>`;
}

async function fetchLogoBase64(): Promise<string> {
  try {
    const response = await fetch('/human-rights-logo-blue.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

let cachedLogoBase64: string | null = null;

export async function openReportWindow(html: string) {
  if (!cachedLogoBase64) {
    cachedLogoBase64 = await fetchLogoBase64();
  }

  const finalHtml = html.replace(new RegExp(LOGO_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), cachedLogoBase64 || '/human-rights-logo-blue.png');

  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow popups to generate reports.');
    return;
  }
  w.document.write(finalHtml);
  w.document.close();
}
