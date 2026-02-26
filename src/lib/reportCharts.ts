/**
 * CSS-based chart generators for PDF reports.
 * These render as pure HTML/CSS — no JS dependencies needed in print windows.
 */

const CHART_COLORS = [
  '#0087C1', '#059669', '#d97706', '#dc2626', '#7c3aed',
  '#0891b2', '#be185d', '#4f46e5', '#ea580c', '#16a34a'
];

export function buildBarChart(
  data: { label: string; value: number }[],
  title: string,
  options?: { maxWidth?: string; showValues?: boolean; suffix?: string }
): string {
  if (!data.length) return `<div style="text-align:center;padding:24px;color:#9ca3af;">No data available for ${title}</div>`;
  const max = Math.max(...data.map(d => d.value), 1);
  const suffix = options?.suffix || '';

  return `
    <div style="margin:16px 0;">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#374151;">${title}</h4>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${data.map((d, i) => `
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="width:140px;font-size:11px;text-align:right;color:#6b7280;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${d.label}</span>
            <div style="flex:1;height:20px;background:#f3f4f6;border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${(d.value / max) * 100}%;background:${CHART_COLORS[i % CHART_COLORS.length]};border-radius:4px;transition:width 0.3s;"></div>
            </div>
            <span style="width:60px;font-size:11px;font-weight:600;color:#374151;">${d.value.toLocaleString()}${suffix}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function buildPieChart(
  data: { label: string; value: number }[],
  title: string
): string {
  if (!data.length) return '';
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return '';

  // Build conic gradient
  let gradientParts: string[] = [];
  let cumulative = 0;
  data.forEach((d, i) => {
    const pct = (d.value / total) * 100;
    gradientParts.push(`${CHART_COLORS[i % CHART_COLORS.length]} ${cumulative}% ${cumulative + pct}%`);
    cumulative += pct;
  });

  return `
    <div style="margin:16px 0;">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#374151;">${title}</h4>
      <div style="display:flex;align-items:center;gap:24px;">
        <div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(${gradientParts.join(', ')});flex-shrink:0;"></div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${data.map((d, i) => `
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:10px;height:10px;border-radius:2px;background:${CHART_COLORS[i % CHART_COLORS.length]};flex-shrink:0;"></div>
              <span style="font-size:11px;color:#374151;">${d.label}: <strong>${d.value.toLocaleString()}</strong> (${((d.value/total)*100).toFixed(1)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function buildStatGrid(
  stats: { label: string; value: string | number; color?: string }[]
): string {
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:12px;margin:16px 0;">
      ${stats.map(s => `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:${s.color || '#0087C1'};">${typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">${s.label}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export function buildTable(
  headers: string[],
  rows: string[][],
  title?: string
): string {
  if (!rows.length) return title ? `<div style="text-align:center;padding:16px;color:#9ca3af;">No data for ${title}</div>` : '';

  return `
    ${title ? `<h4 style="font-size:13px;font-weight:600;margin:16px 0 8px;color:#374151;">${title}</h4>` : ''}
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin:8px 0;">
      <thead>
        <tr style="background:#f9fafb;">
          ${headers.map(h => `<th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600;color:#374151;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row, i) => `
          <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
            ${row.map(cell => `<td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#4b5563;">${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

export function buildTimelineChart(
  data: { year: string; count: number }[],
  title: string
): string {
  if (!data.length) return '';
  const max = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 160;

  return `
    <div style="margin:16px 0;">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#374151;">${title}</h4>
      <div style="display:flex;align-items:flex-end;gap:4px;height:${chartHeight}px;border-bottom:2px solid #e5e7eb;padding-bottom:4px;">
        ${data.map((d, i) => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
            <span style="font-size:9px;font-weight:600;color:#374151;margin-bottom:2px;">${d.count}</span>
            <div style="width:100%;max-width:40px;height:${(d.count / max) * (chartHeight - 30)}px;background:${CHART_COLORS[i % CHART_COLORS.length]};border-radius:3px 3px 0 0;min-height:2px;"></div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:4px;margin-top:4px;">
        ${data.map(d => `
          <div style="flex:1;text-align:center;font-size:9px;color:#9ca3af;">${d.year}</div>
        `).join('')}
      </div>
    </div>
  `;
}

export function buildSeverityMeter(label: string, value: number, max: number = 10): string {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? '#dc2626' : pct >= 40 ? '#d97706' : '#059669';
  return `
    <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
      <span style="width:120px;font-size:11px;color:#6b7280;">${label}</span>
      <div style="flex:1;height:12px;background:#f3f4f6;border-radius:6px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:6px;"></div>
      </div>
      <span style="font-size:11px;font-weight:600;color:${color};">${value}/${max}</span>
    </div>
  `;
}

export function buildDonutChart(
  data: { label: string; value: number }[],
  title: string
): string {
  if (!data.length) return '';
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return '';
  let gradientParts: string[] = [];
  let cumulative = 0;
  data.forEach((d, i) => {
    const pct = (d.value / total) * 100;
    gradientParts.push(`${CHART_COLORS[i % CHART_COLORS.length]} ${cumulative}% ${cumulative + pct}%`);
    cumulative += pct;
  });
  return `
    <div style="margin:16px 0;">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#374151;">${title}</h4>
      <div style="display:flex;align-items:center;gap:24px;">
        <div style="width:130px;height:130px;border-radius:50%;background:conic-gradient(${gradientParts.join(', ')});flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <div style="width:65px;height:65px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:18px;font-weight:700;color:#374151;">${total.toLocaleString()}</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${data.map((d, i) => `
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:10px;height:10px;border-radius:2px;background:${CHART_COLORS[i % CHART_COLORS.length]};flex-shrink:0;"></div>
              <span style="font-size:11px;color:#374151;">${d.label}: <strong>${d.value.toLocaleString()}</strong> (${((d.value/total)*100).toFixed(1)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function buildHierarchyMap(
  nodes: { name: string; children?: { name: string; value?: string }[] }[],
  title: string
): string {
  if (!nodes.length) return '';
  return `
    <div style="margin:16px 0;">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#374151;">${title}</h4>
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fafafa;">
        ${nodes.map((node, i) => `
          <div style="margin-bottom:${i < nodes.length - 1 ? '16px' : '0'};">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${CHART_COLORS[i % CHART_COLORS.length]};flex-shrink:0;"></div>
              <span style="font-weight:700;font-size:12px;color:#1f2937;">${node.name}</span>
            </div>
            ${node.children?.length ? `
              <div style="margin-left:20px;border-left:2px solid ${CHART_COLORS[i % CHART_COLORS.length]}40;padding-left:12px;">
                ${node.children.map(c => `
                  <div style="display:flex;align-items:center;gap:6px;padding:3px 0;">
                    <div style="width:5px;height:5px;border-radius:50%;background:${CHART_COLORS[i % CHART_COLORS.length]};opacity:0.6;"></div>
                    <span style="font-size:11px;color:#4b5563;">${c.name}${c.value ? ` <span style="color:#9ca3af;">— ${c.value}</span>` : ''}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function buildHeatmapGrid(
  data: { row: string; col: string; value: number }[],
  title: string
): string {
  if (!data.length) return '';
  const rows = [...new Set(data.map(d => d.row))];
  const cols = [...new Set(data.map(d => d.col))];
  const max = Math.max(...data.map(d => d.value), 1);

  return `
    <div style="margin:16px 0;">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#374151;">${title}</h4>
      <div style="overflow-x:auto;">
        <table style="border-collapse:collapse;font-size:10px;width:100%;">
          <thead>
            <tr>
              <th style="padding:6px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600;color:#6b7280;min-width:100px;"></th>
              ${cols.map(c => `<th style="padding:6px;text-align:center;border-bottom:2px solid #e5e7eb;font-weight:600;color:#6b7280;min-width:50px;">${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td style="padding:6px;font-weight:500;color:#374151;border-bottom:1px solid #f3f4f6;">${r}</td>
                ${cols.map(c => {
                  const cell = data.find(d => d.row === r && d.col === c);
                  const v = cell?.value || 0;
                  const intensity = Math.round((v / max) * 255);
                  const bg = v > 0 ? `rgba(0,135,193,${(v / max * 0.8 + 0.1).toFixed(2)})` : '#f9fafb';
                  const textColor = v / max > 0.5 ? '#fff' : '#374151';
                  return `<td style="padding:6px;text-align:center;background:${bg};color:${textColor};font-weight:${v > 0 ? '600' : '400'};border:1px solid #e5e7eb;">${v || '—'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function buildProgressList(
  items: { label: string; value: number; max: number; status?: string }[],
  title: string
): string {
  if (!items.length) return '';
  return `
    <div style="margin:16px 0;">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#374151;">${title}</h4>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${items.map(item => {
          const pct = Math.min((item.value / item.max) * 100, 100);
          const color = pct >= 70 ? '#059669' : pct >= 40 ? '#d97706' : '#dc2626';
          return `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;">
              <span style="width:160px;font-size:11px;color:#374151;font-weight:500;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.label}</span>
              <div style="flex:1;height:14px;background:#f3f4f6;border-radius:7px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${color};border-radius:7px;"></div>
              </div>
              <span style="font-size:11px;font-weight:600;color:${color};min-width:40px;text-align:right;">${item.value}/${item.max}</span>
              ${item.status ? `<span style="font-size:9px;padding:2px 6px;border-radius:10px;background:${item.status === 'compliant' ? '#f0fdf4' : '#fef2f2'};color:${item.status === 'compliant' ? '#059669' : '#dc2626'};font-weight:600;">${item.status.toUpperCase()}</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function buildKeyValueGrid(
  items: { key: string; value: string; highlight?: boolean }[],
  title?: string
): string {
  if (!items.length) return '';
  return `
    ${title ? `<h4 style="font-size:13px;font-weight:600;margin:16px 0 8px;color:#374151;">${title}</h4>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0;">
      ${items.map(item => `
        <div style="display:flex;justify-content:space-between;padding:8px 12px;background:${item.highlight ? '#eff6ff' : '#f9fafb'};border:1px solid ${item.highlight ? '#bfdbfe' : '#e5e7eb'};border-radius:6px;">
          <span style="font-size:11px;color:#6b7280;">${item.key}</span>
          <span style="font-size:11px;font-weight:600;color:${item.highlight ? '#1d4ed8' : '#374151'};">${item.value}</span>
        </div>
      `).join('')}
    </div>
  `;
}
