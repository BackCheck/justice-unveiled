/**
 * Upgraded report block renderers:
 * - CriticalFindingsBlock: structured tables + exemplar events
 * - TimelineSummaryBlock: labeled bar chart + spike callouts + LOD
 * - FrontMatterBlocks: methodology, definitions, data quality
 * - CourtAppendices: LOD + Key Issues
 */

import { buildTable, buildBarChart } from './reportCharts';
import { fmtNum } from './reportQA';
import { buildKeyIssues, renderKeyIssuesHTML, type LegalIssue } from './issueFramingEngine';

// ── Front-Matter Blocks ──

export function buildMethodologyBlock(caseTitle: string, eventCount: number, sourceCount: number, filters: { hiddenExcluded: boolean; approvedOnly: boolean; caseScoped: boolean }): string {
  return `
    <div style="padding:32px 48px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #0087C1;">
        <h2 style="font-size:18px;margin:0;color:#1f2937;">Methodology & Scope</h2>
      </div>
      <div style="font-size:12px;color:#374151;line-height:1.8;">
        <p>This report is generated from the HRPM case database for <strong>${caseTitle}</strong>, using ${fmtNum(eventCount)} approved and visible events, and ${fmtNum(sourceCount)} associated evidence records.</p>
        <p style="margin-top:8px;"><strong>Data Filters Applied:</strong></p>
        <ul style="padding-left:20px;margin:4px 0;">
          ${filters.hiddenExcluded ? '<li>Hidden events excluded from analysis</li>' : ''}
          ${filters.approvedOnly ? '<li>Only approved events included</li>' : ''}
          ${filters.caseScoped ? '<li>Data scoped to selected case only</li>' : '<li>Platform-wide data included</li>'}
        </ul>
        <p style="margin-top:8px;">All analytical conclusions are derived from documented evidence and structured data. AI-extracted events are marked accordingly. This report is intended for advocacy and legal reference purposes.</p>
      </div>
    </div>
  `;
}

export function buildDefinitionsBlock(): string {
  const definitions = [
    ['Event', 'A documented incident, proceeding, or action with a date, category, and description, sourced from case records or AI extraction.'],
    ['Entity', 'A person, organization, or agency identified as relevant to the investigation, classified by role and alignment.'],
    ['Evidence Source', 'A document, recording, or artifact uploaded to the case repository, with metadata including file type, size, and category.'],
    ['Discrepancy', 'A procedural or evidentiary inconsistency identified through analysis, classified by severity (critical, high, medium, low).'],
    ['Violation', 'A breach of a legal framework, statute, or procedural requirement, linked to specific events or entities.'],
    ['Hostile Entity', 'An entity classified as "antagonist" based on documented adverse actions. Classification is rule-based, not subjective.'],
    ['Relationship', 'A documented link between two entities stored in the database, with type, direction, and evidence sources.'],
    ['Connection', 'A graph edge rendered in the network visualization, which may differ from database relationships due to filtering.'],
  ];

  return `
    <div style="padding:32px 48px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #0087C1;">
        <h2 style="font-size:18px;margin:0;color:#1f2937;">Definitions</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tbody>
          ${definitions.map(([term, def]) => `
            <tr style="page-break-inside:avoid;">
              <td style="padding:6px 10px;border-bottom:1px solid #f3f4f6;font-weight:700;width:140px;vertical-align:top;color:#0087C1;">${term}</td>
              <td style="padding:6px 10px;border-bottom:1px solid #f3f4f6;color:#374151;line-height:1.6;">${def}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function buildDataQualityBlock(stats: { totalEvents: number; totalEntities: number; totalSources: number; aiExtracted: number; discrepancies: number }): string {
  const coverage = stats.totalSources > 0 ? 'High' : 'Low';
  const confidence = stats.totalSources > 10 && stats.totalEvents > 50 ? 'High' : stats.totalSources > 3 ? 'Medium' : 'Low';
  const confColor = confidence === 'High' ? '#059669' : confidence === 'Medium' ? '#d97706' : '#dc2626';

  return `
    <div style="padding:32px 48px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #0087C1;">
        <h2 style="font-size:18px;margin:0;color:#1f2937;">Data Quality & Limitations</h2>
      </div>
      <div style="font-size:12px;color:#374151;line-height:1.8;">
        <div style="display:flex;gap:16px;margin-bottom:12px;">
          <div style="padding:10px 20px;border:1px solid #e5e7eb;border-radius:8px;text-align:center;">
            <div style="font-size:16px;font-weight:700;color:${confColor};">${confidence}</div>
            <div style="font-size:10px;color:#6b7280;">Confidence Level</div>
          </div>
          <div style="padding:10px 20px;border:1px solid #e5e7eb;border-radius:8px;text-align:center;">
            <div style="font-size:16px;font-weight:700;color:#0087C1;">${coverage}</div>
            <div style="font-size:10px;color:#6b7280;">Evidence Coverage</div>
          </div>
        </div>
        <p><strong>Known Limitations:</strong></p>
        <ul style="padding-left:20px;margin:4px 0;">
          ${stats.aiExtracted > 0 ? `<li>${fmtNum(stats.aiExtracted)} events were AI-extracted and may require manual verification.</li>` : ''}
          <li>Network graph edges may not reflect all database relationships due to filtering and visualization constraints.</li>
          <li>Evidence coverage may be partial — not all events have linked documentary evidence.</li>
          ${stats.discrepancies > 0 ? `<li>${fmtNum(stats.discrepancies)} procedural discrepancies identified — some may overlap.</li>` : ''}
        </ul>
        <p style="margin-top:12px;padding:8px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:11px;color:#92400e;">
          <strong>Disclaimer:</strong> This is an analytical advocacy report prepared for informational purposes. It does not constitute legal advice and requires independent counsel review before any legal submission.
        </p>
      </div>
    </div>
  `;
}

// ── Critical Findings Block ──

export function buildCriticalFindingsBlock(
  discrepancies: Array<{ title?: string; severity?: string; discrepancy_type?: string; description?: string; legal_reference?: string }>,
  entities: Array<{ name: string; category?: string; role?: string; type?: string }>,
  events: Array<{ date?: string; description?: string; category?: string; evidenceDiscrepancy?: string; sources?: string }>,
): string {
  const critical = discrepancies.filter(d => d.severity === 'critical');
  
  // A) Top critical discrepancy types
  const byType: Record<string, number> = {};
  critical.forEach(d => {
    const type = d.discrepancy_type || 'Other';
    byType[type] = (byType[type] || 0) + 1;
  });
  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const criticalTotal = critical.length || 1;

  const typesTable = topTypes.length > 0 ? buildTable(
    ['Type', 'Count', '% of Critical'],
    topTypes.map(([type, count]) => [
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      fmtNum(count),
      `${((count / criticalTotal) * 100).toFixed(1)}%`,
    ]),
    'Top Critical Discrepancy Types'
  ) : '<p style="font-size:11px;color:#6b7280;">No critical discrepancies found.</p>';

  // B) Top hostile entities
  const hostileEntities = entities.filter(e => e.category === 'antagonist').slice(0, 10);
  const hostileTable = hostileEntities.length > 0 ? buildTable(
    ['Entity', 'Role/Type', 'Category'],
    hostileEntities.map(e => [
      e.name,
      e.role || e.type || 'N/A',
      'Antagonist',
    ]),
    'Top Hostile Entities'
  ) : '<p style="font-size:11px;color:#6b7280;">No hostile entities classified.</p>';

  // C) Exemplar events (top 5 critical)
  const criticalEvents = events
    .filter(e => e.evidenceDiscrepancy && e.evidenceDiscrepancy.trim() && e.evidenceDiscrepancy.toLowerCase() !== 'none' && e.evidenceDiscrepancy.toLowerCase() !== 'n/a')
    .slice(0, 5);

  const exemplars = criticalEvents.length > 0 ? criticalEvents.map(e => `
    <div style="border-left:3px solid #dc2626;padding:8px 12px;margin:8px 0;background:#fef2f2;border-radius:0 6px 6px 0;page-break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;font-weight:700;color:#1f2937;">${e.date || 'Date N/A'} — ${e.category || 'Event'}</span>
      </div>
      <p style="font-size:11px;color:#374151;margin:4px 0;line-height:1.5;">${(e.description || '').slice(0, 200)}</p>
      <p style="font-size:10px;color:#dc2626;margin:2px 0;">⚠ ${e.evidenceDiscrepancy}</p>
      <p style="font-size:10px;color:#6b7280;">Evidence: ${e.sources ? `Ref [${e.sources}]` : 'Not linked'}</p>
    </div>
  `).join('') : '<p style="font-size:11px;color:#6b7280;">No exemplar critical events available.</p>';

  return `
    <div style="font-size:12px;color:#374151;">
      ${typesTable}
      <div style="margin-top:20px;">${hostileTable}</div>
      <h4 style="font-size:13px;font-weight:600;margin:20px 0 8px;color:#374151;">Exemplar Critical Events (Top 5)</h4>
      ${exemplars}
    </div>
  `;
}

// ── Timeline Summary Block ──

export function buildTimelineSummaryBlock(
  byYear: Record<string, number>,
  totalEvents: number,
): string {
  const sorted = Object.entries(byYear).sort((a, b) => a[0].localeCompare(b[0]));
  if (sorted.length === 0) return '<p style="font-size:11px;color:#6b7280;">No timeline data available.</p>';

  const max = Math.max(...sorted.map(([, c]) => c), 1);
  
  // Spike callouts: top 3 years
  const topYears = [...sorted].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const peakYear = topYears[0];

  // Labeled bar chart with year labels every 2-3 years
  const showLabel = (idx: number) => sorted.length <= 10 || idx % 2 === 0 || idx === sorted.length - 1;

  const barChart = `
    <div style="margin:16px 0;">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:12px;color:#374151;">Event Distribution by Year</h4>
      <div style="display:flex;align-items:flex-end;gap:3px;height:140px;border-bottom:2px solid #e5e7eb;padding-bottom:4px;">
        ${sorted.map(([year, count], i) => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
            <span style="font-size:9px;font-weight:600;color:#374151;margin-bottom:2px;">${fmtNum(count)}</span>
            <div style="width:100%;max-width:36px;height:${(count / max) * 110}px;background:${year === peakYear[0] ? '#dc2626' : '#0087C1'};border-radius:3px 3px 0 0;min-height:2px;"></div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:3px;margin-top:4px;">
        ${sorted.map(([year], i) => `
          <div style="flex:1;text-align:center;font-size:${showLabel(i) ? '9' : '0'}px;color:#6b7280;">${showLabel(i) ? year : ''}</div>
        `).join('')}
      </div>
    </div>
  `;

  // Spike callouts
  const spikeCallouts = `
    <div style="margin:16px 0;padding:12px 16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
      <h4 style="font-size:12px;font-weight:700;color:#0369a1;margin-bottom:8px;">📊 Timeline Spikes</h4>
      ${topYears.map(([year, count], i) => `
        <p style="font-size:11px;color:#374151;margin:4px 0;">
          ${i === 0 ? '🔴 <strong>Peak year</strong>' : `#${i + 1}`}: <strong>${year}</strong> — ${fmtNum(count)} events (${((count / totalEvents) * 100).toFixed(1)}% of total)
        </p>
      `).join('')}
    </div>
  `;

  return barChart + spikeCallouts;
}

// ── Court Appendix: List of Dates (LOD) ──

export function buildLODAppendix(
  events: Array<{ date?: string; description?: string; category?: string; individuals?: string; sources?: string; evidenceDiscrepancy?: string }>,
  maxRows: number = 50,
): string {
  // Prioritize: critical discrepancies first, then evidence-linked, then chronological
  const scored = events.map(e => ({
    ...e,
    priority: (e.evidenceDiscrepancy && e.evidenceDiscrepancy.toLowerCase() !== 'none' ? 20 : 0) +
      (e.sources && e.sources.trim() ? 10 : 0),
  }));

  const selected = scored
    .sort((a, b) => b.priority - a.priority || (a.date || '').localeCompare(b.date || ''))
    .slice(0, maxRows)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const rows = selected.map(e => `
    <tr style="page-break-inside:avoid;">
      <td style="padding:5px 8px;border:1px solid #e5e7eb;font-family:monospace;font-size:10px;white-space:nowrap;vertical-align:top;">${e.date || 'N/A'}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;vertical-align:top;max-width:300px;">${(e.description || '').slice(0, 120)}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;vertical-align:top;">${(e.individuals || '').slice(0, 60)}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;vertical-align:top;color:#6b7280;">${e.sources ? `Ref [${e.sources}]` : '—'}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;vertical-align:top;color:#dc2626;">${e.evidenceDiscrepancy && e.evidenceDiscrepancy.toLowerCase() !== 'none' ? '⚠' : ''}</td>
    </tr>
  `).join('');

  return `
    <div class="page-break"></div>
    <div style="padding:48px;">
      <h2 style="font-size:18px;margin:0 0 4px;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1e3a5f;padding-bottom:8px;">
        APPENDIX A — LIST OF DATES
      </h2>
      <p style="font-size:11px;color:#6b7280;margin:8px 0 16px;">
        Chronological record of ${fmtNum(selected.length)} key events${events.length > maxRows ? ` (of ${fmtNum(events.length)} total, prioritized by evidentiary significance)` : ''}.
      </p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="padding:6px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px;font-weight:700;width:90px;">Date</th>
            <th style="padding:6px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px;font-weight:700;">Event</th>
            <th style="padding:6px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px;font-weight:700;width:120px;">Actor/Entity</th>
            <th style="padding:6px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px;font-weight:700;width:80px;">Evidence</th>
            <th style="padding:6px 8px;text-align:center;border:1px solid #d1d5db;font-size:10px;font-weight:700;width:30px;">⚠</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// ── Court Appendix: Key Issues ──

export function buildKeyIssuesAppendix(
  violations: Array<{ title?: string; description?: string; severity?: string; framework?: string; article?: string }>,
  discrepancies: Array<{ title?: string; description?: string; severity?: string; discrepancy_type?: string; legal_reference?: string }>,
  entities: Array<{ name: string; category?: string; role?: string }>,
  events: Array<{ date?: string; category?: string; description?: string }>,
  evidence: Array<{ id: string; fileName?: string; category?: string }>,
): string {
  const issues = buildKeyIssues({ violations, discrepancies, entities, events, evidence });
  const issuesHTML = renderKeyIssuesHTML(issues);

  return `
    <div class="page-break"></div>
    <div style="padding:48px;">
      <h2 style="font-size:18px;margin:0 0 4px;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1e3a5f;padding-bottom:8px;">
        APPENDIX B — KEY ISSUES FOR DETERMINATION
      </h2>
      <p style="font-size:11px;color:#6b7280;margin:8px 0 16px;">
        ${issues.length} key legal issues identified from case data. Evidence strength and vulnerability scores are computed from available data density.
      </p>
      ${issuesHTML}
      <p style="font-size:10px;color:#d97706;margin-top:16px;font-style:italic;padding:8px;border:1px solid #fed7aa;border-radius:4px;background:#fff7ed;">
        Note: Issues without linked legal anchors require independent counsel review before citation in any legal filing. HRPM does not generate or infer statutory references.
      </p>
    </div>
  `;
}
