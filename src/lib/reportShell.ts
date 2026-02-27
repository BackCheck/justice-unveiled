/**
 * Unified report shell — cover page, sections, closing for all report types.
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
}

// Logo placeholder that gets replaced with base64 at runtime
const LOGO_PLACEHOLDER = '%%LOGO_BASE64%%';

export function buildReportShell(opts: ReportShellOptions): string {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const formattedTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });

  const tocHTML = opts.sections.map((s, i) =>
    `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;">
      <span>${i + 1}. <strong>${s.title}</strong></span>
    </div>`
  ).join('');

  const statsRow = opts.stats?.length ? `
    <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;">
      ${opts.stats.map(s => `
        <div style="padding:12px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#0087C1;">${typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
          <div style="font-size:11px;color:#6b7280;">${s.label}</div>
        </div>
      `).join('')}
    </div>` : '';

  // Sections flow continuously — NO forced page breaks between every section
  const sectionsHTML = opts.sections.map((s, i) => `
    <div style="padding:32px 48px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #0087C1;">
        <span style="background:#0087C1;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">${i + 1}</span>
        <h2 style="font-size:18px;margin:0;color:#1f2937;">${s.title}</h2>
      </div>
      ${s.content}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html><head><title>${opts.title} — ${opts.caseTitle}</title>
<style>
  @media print { @page { margin: 0.8cm; size: A4; } .page-break { page-break-after: always; } }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #fff; line-height: 1.5; }
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  h4 { page-break-after: avoid; }
</style></head><body>

<!-- COVER PAGE -->
<div style="min-height:95vh;display:flex;flex-direction:column;justify-content:space-between;padding:48px;">
  <div style="text-align:center;">
    <img src="${LOGO_PLACEHOLDER}" alt="HRPM Logo" style="height:80px;width:auto;margin:0 auto 12px;display:block;" />
    <h1 style="font-size:32px;color:#0087C1;margin:0;">HRPM.org</h1>
    <p style="font-size:16px;color:#6b7280;">Human Rights Protection & Monitoring</p>
    <div style="width:100px;height:3px;background:#0087C1;margin:12px auto;border-radius:4px;"></div>
  </div>
  <div style="text-align:center;margin:40px 0;">
    <p style="font-size:11px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;">${opts.subtitle}</p>
    <h2 style="font-size:26px;margin:12px 0;">${opts.title}</h2>
    ${opts.caseNumber ? `<p style="font-family:monospace;color:#6b7280;font-size:14px;">${opts.caseNumber}</p>` : ''}
    <p style="color:#6b7280;font-size:14px;">Case: ${opts.caseTitle}</p>
    ${statsRow}
  </div>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
    <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;margin-bottom:8px;">Report Details</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
      <div><span style="color:#9ca3af;">Generated:</span> ${formattedDate}</div>
      <div><span style="color:#9ca3af;">Time:</span> ${formattedTime}</div>
      <div><span style="color:#9ca3af;">Report Type:</span> ${opts.subtitle}</div>
      <div><span style="color:#9ca3af;">Sections:</span> ${opts.sections.length}</div>
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

${opts.disclaimerHTML || ''}

<!-- TABLE OF CONTENTS -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #0087C1;">
    <h2 style="font-size:20px;margin:0;">Table of Contents</h2>
  </div>
  ${tocHTML}
</div>

${opts.frontMatterHTML ? `
<div class="page-break"></div>
${opts.frontMatterHTML}
` : ''}

<div class="page-break"></div>

${sectionsHTML}

${opts.appendicesHTML || ''}

${opts.distributionHTML || ''}

<!-- CLOSING -->
<div style="padding:48px;margin-top:32px;">
  <div style="text-align:center;max-width:440px;margin:0 auto;">
    <div style="width:60px;height:3px;background:#0087C1;margin:0 auto 24px;border-radius:4px;"></div>
    <h2 style="font-size:20px;">End of Report</h2>
    <p style="color:#6b7280;font-size:12px;margin:12px 0;">
      This ${opts.subtitle.toLowerCase()} contains ${opts.sections.length} analytical sections for case: ${opts.caseTitle}.
    </p>
    <div style="margin-top:16px;font-size:11px;color:#6b7280;">
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

/**
 * Fetches the logo image and converts to base64 data URI.
 */
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
  // Fetch logo as base64 (cached after first call)
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
