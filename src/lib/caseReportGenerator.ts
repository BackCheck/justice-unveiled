/**
 * Professional Case Intelligence Report Generator
 * Produces investigation-grade reports with actor intelligence, risk domains,
 * timeline phases, evidence strength, and control analysis.
 */

import { supabase } from '@/integrations/supabase/client';
import { buildReportShell, openReportWindow } from './reportShell';
import {
  buildBarChart, buildPieChart, buildStatGrid, buildTable,
  buildTimelineChart, buildSeverityMeter, buildDonutChart,
  buildHierarchyMap, buildHeatmapGrid, buildProgressList, buildKeyValueGrid
} from './reportCharts';
import type { Case } from '@/hooks/useCases';

/* ─── helper builders ─── */

function buildRiskBadge(level: string): string {
  const colors: Record<string, string> = {
    critical: 'background:#dc2626;color:#fff;',
    high: 'background:#ea580c;color:#fff;',
    medium: 'background:#d97706;color:#fff;',
    low: 'background:#059669;color:#fff;',
  };
  return `<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;${colors[level] || colors.medium}">${level}</span>`;
}

function buildScoreCard(label: string, score: number, maxScore: number, level: string): string {
  const pct = Math.round((score / maxScore) * 100);
  const color = pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : pct >= 25 ? '#ea580c' : '#dc2626';
  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${label}</div>
      <div style="font-size:28px;font-weight:700;color:${color};">${pct}%</div>
      <div style="font-size:10px;color:${color};font-weight:600;">${level}</div>
      <div style="height:6px;background:#f3f4f6;border-radius:3px;margin-top:8px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;"></div>
      </div>
    </div>
  `;
}

function buildActorCard(actor: { name: string; type: string; role: string; category: string; connections: number; events: number; evidence: number; riskScore: number }): string {
  const riskColor = actor.riskScore >= 75 ? '#dc2626' : actor.riskScore >= 50 ? '#d97706' : '#059669';
  return `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px;background:#fff;page-break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
        <div>
          <div style="font-size:14px;font-weight:700;color:#1f2937;">${actor.name}</div>
          <div style="font-size:11px;color:#6b7280;">${actor.role || actor.type}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:18px;font-weight:700;color:${riskColor};">${actor.riskScore}%</div>
          <div style="font-size:9px;color:${riskColor};font-weight:600;">RISK</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;font-size:10px;color:#6b7280;">
        <span>${actor.connections} connections</span>
        <span>${actor.events} events</span>
        <span>${actor.evidence} evidence</span>
        <span style="padding:2px 6px;border-radius:4px;background:${actor.category === 'antagonist' ? '#fef2f2' : '#f0fdf4'};color:${actor.category === 'antagonist' ? '#dc2626' : '#059669'};font-weight:600;">${actor.category}</span>
      </div>
    </div>
  `;
}

function buildRiskDomainCard(domain: string, score: number, explanation: string, actors: string[], evidence: string): string {
  const color = score >= 75 ? '#dc2626' : score >= 50 ? '#d97706' : score >= 25 ? '#ea580c' : '#059669';
  return `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fff;page-break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h4 style="font-size:14px;font-weight:700;color:#1f2937;margin:0;">${domain}</h4>
        <div style="font-size:20px;font-weight:700;color:${color};">${score}/100</div>
      </div>
      <div style="height:6px;background:#f3f4f6;border-radius:3px;margin-bottom:10px;overflow:hidden;">
        <div style="height:100%;width:${score}%;background:${color};border-radius:3px;"></div>
      </div>
      <p style="font-size:11px;color:#374151;margin-bottom:6px;">${explanation}</p>
      ${actors.length > 0 ? `<div style="font-size:10px;color:#6b7280;">Key Actors: <strong>${actors.join(', ')}</strong></div>` : ''}
      ${evidence ? `<div style="font-size:10px;color:#6b7280;margin-top:2px;">Evidence: ${evidence}</div>` : ''}
    </div>
  `;
}

function buildFindingsGlance(findings: { category: string; finding: string; severity: string; actors: string; evidenceCount: number }[]): string {
  if (!findings.length) return '<p style="color:#9ca3af;font-size:12px;">No findings to display.</p>';
  return `
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin:8px 0;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600;">Category</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600;">Finding</th>
          <th style="padding:8px;text-align:center;border-bottom:2px solid #e5e7eb;font-weight:600;">Severity</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600;">Actors</th>
          <th style="padding:8px;text-align:center;border-bottom:2px solid #e5e7eb;font-weight:600;">Evidence</th>
        </tr>
      </thead>
      <tbody>
        ${findings.map((f, i) => `
          <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#4b5563;font-weight:500;">${f.category}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#374151;">${f.finding}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:center;">${buildRiskBadge(f.severity)}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:10px;">${f.actors}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:center;font-weight:600;color:#0087C1;">${f.evidenceCount}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/* ─── Phase detection helpers ─── */

function detectTimelinePhases(events: any[]): { phase: string; period: string; eventCount: number; keyEvents: string[] }[] {
  const phases: { phase: string; keywords: string[]; events: any[] }[] = [
    { phase: 'Initial Access & Setup', keywords: ['access', 'login', 'device', 'setup', 'account', 'created', 'registered'], events: [] },
    { phase: 'Exclusion & Control', keywords: ['exclusion', 'removed', 'excluded', 'denied', 'blocked', 'unauthorized', 'control', 'governance'], events: [] },
    { phase: 'Financial Manipulation', keywords: ['salary', 'payment', 'financial', 'expense', 'fraud', 'money', 'bank', 'transfer', 'cash'], events: [] },
    { phase: 'Legal Escalation', keywords: ['legal', 'court', 'fir', 'petition', 'complaint', 'notice', 'hearing', 'filing', 'order', 'judgment'], events: [] },
    { phase: 'Exposure & Investigation', keywords: ['investigation', 'report', 'audit', 'expose', 'discovery', 'evidence', 'forensic', 'analysis'], events: [] },
  ];

  events.forEach(ev => {
    const text = `${ev.description || ''} ${ev.category || ''} ${ev.outcome || ''}`.toLowerCase();
    let assigned = false;
    for (const p of phases) {
      if (p.keywords.some(k => text.includes(k))) {
        p.events.push(ev);
        assigned = true;
        break;
      }
    }
    if (!assigned) phases[0].events.push(ev);
  });

  return phases
    .filter(p => p.events.length > 0)
    .map(p => {
      const dates = p.events.filter(e => e.date).map(e => e.date).sort();
      return {
        phase: p.phase,
        period: dates.length > 0 ? `${dates[0]} — ${dates[dates.length - 1]}` : 'Unknown',
        eventCount: p.events.length,
        keyEvents: p.events.slice(0, 3).map(e => (e.description || '').slice(0, 80)),
      };
    });
}

/* ─── Main generator ─── */

export async function generateFullCaseReport(caseItem: Case, userIP: string = 'N/A') {
  const caseId = caseItem.id;

  const [
    { data: entities },
    { data: events },
    { data: connections },
    { data: discrepancies },
    { data: violations },
    { data: uploads },
    { data: complianceChecks },
    { data: claims },
    { data: incidents },
    { data: losses },
  ] = await Promise.all([
    supabase.from('extracted_entities').select('*').eq('case_id', caseId),
    supabase.from('extracted_events').select('*').eq('case_id', caseId).eq('is_hidden', false).eq('is_approved', true).order('date'),
    supabase.from('entity_relationships').select('*').eq('case_id', caseId),
    supabase.from('extracted_discrepancies').select('*').eq('case_id', caseId),
    supabase.from('compliance_violations').select('*').eq('case_id', caseId),
    supabase.from('evidence_uploads').select('*').eq('case_id', caseId),
    supabase.from('compliance_checks').select('*').eq('case_id', caseId),
    supabase.from('legal_claims').select('*').eq('case_id', caseId),
    supabase.from('regulatory_harm_incidents').select('*').eq('case_id', caseId),
    supabase.from('financial_losses').select('*').eq('case_id', caseId),
  ]);

  const e = entities || [];
  const evAll = events || [];
  const conn = connections || [];
  const viol = violations || [];

  // ── Filter timeline to case-relevant incidents only ──
  const incidentKeywords = ['fir', 'fraud', 'unauthorized', 'violation', 'breach', 'harassment', 'threat', 'court', 'petition', 'notice', 'complaint', 'exclusion', 'manipulation', 'forgery', 'illegal', 'attack', 'incident', 'arrest', 'raid', 'seizure', 'tampering', 'misappropriation', 'embezzlement', 'theft', 'assault', 'detention', 'fired', 'terminated', 'removed', 'blocked', 'denied', 'transfer', 'salary', 'payment', 'loss'];
  const violIds = viol.map(v => v.id);
  const violationEventIds = new Set<string>(
    violIds.length
      ? ((await supabase.from('event_violations').select('event_id').in('violation_id', violIds)).data?.map((r: any) => r.event_id) || [])
      : []
  );
  const ev = evAll.filter((event: any) => {
    if (event.source_upload_id) return true;
    if (violationEventIds.has(event.id)) return true;
    const sev = (event.severity || '').toLowerCase();
    if (sev === 'critical' || sev === 'high') return true;
    const text = `${event.description || ''} ${event.category || ''} ${event.outcome || ''}`.toLowerCase();
    if (incidentKeywords.some(k => text.includes(k))) return true;
    return false;
  });
  const disc = discrepancies || [];
  // viol declared above for filtering
  const upl = uploads || [];
  const checks = complianceChecks || [];
  const cl = claims || [];
  const inc = incidents || [];
  const lo = losses || [];

  // ── Analytics ──
  const entityTypeDist: Record<string, number> = {};
  const entityCatDist: Record<string, number> = {};
  e.forEach(ent => {
    entityTypeDist[ent.entity_type] = (entityTypeDist[ent.entity_type] || 0) + 1;
    entityCatDist[ent.category || 'neutral'] = (entityCatDist[ent.category || 'neutral'] || 0) + 1;
  });

  const eventCatDist: Record<string, number> = {};
  const eventYearDist: Record<string, number> = {};
  ev.forEach(event => {
    eventCatDist[event.category] = (eventCatDist[event.category] || 0) + 1;
    const y = event.date?.split('-')[0] || 'Unknown';
    eventYearDist[y] = (eventYearDist[y] || 0) + 1;
  });

  const connTypeDist: Record<string, number> = {};
  conn.forEach(c => { connTypeDist[c.relationship_type] = (connTypeDist[c.relationship_type] || 0) + 1; });

  // Degree centrality
  const degreeMap: Record<string, number> = {};
  conn.forEach(c => {
    degreeMap[c.source_entity_id] = (degreeMap[c.source_entity_id] || 0) + 1;
    degreeMap[c.target_entity_id] = (degreeMap[c.target_entity_id] || 0) + 1;
  });

  // Event-entity count
  const entityEventCount: Record<string, number> = {};
  ev.forEach(event => {
    const names = (event.individuals || '').split(',').map((n: string) => n.trim().toLowerCase());
    names.forEach(n => { if (n) entityEventCount[n] = (entityEventCount[n] || 0) + 1; });
  });

  const topActors = Object.entries(degreeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => {
      const ent = e.find(x => x.id === id);
      const name = ent?.name || id;
      const eventCount = entityEventCount[name.toLowerCase()] || 0;
      const evidenceCount = upl.filter(u => (u.description || '').toLowerCase().includes(name.toLowerCase())).length;
      const riskScore = Math.min(Math.round((count * 10 + eventCount * 5 + (ent?.category === 'antagonist' ? 25 : 0)) * 1.2), 100);
      return { name, type: ent?.entity_type || '?', role: ent?.role || 'N/A', category: ent?.category || 'neutral', connections: count, events: eventCount, evidence: evidenceCount, riskScore };
    });

  // Financial
  const totalLoss = lo.reduce((s, l) => s + Number(l.amount || 0), 0);

  // Compliance
  const compStatus: Record<string, number> = {};
  checks.forEach(c => { compStatus[c.status] = (compStatus[c.status] || 0) + 1; });

  // Discrepancy severity
  const discSeverity: Record<string, number> = {};
  disc.forEach(d => { discSeverity[d.severity] = (discSeverity[d.severity] || 0) + 1; });

  // Violation severity
  const violSeverity: Record<string, number> = {};
  viol.forEach(v => { violSeverity[v.severity] = (violSeverity[v.severity] || 0) + 1; });

  // Evidence categories
  const evidCatDist: Record<string, number> = {};
  upl.forEach(u => { evidCatDist[u.category || 'general'] = (evidCatDist[u.category || 'general'] || 0) + 1; });

  // ── Intelligence Scores ──
  const evidenceStrengthRaw = Math.min(upl.length * 4 + conn.length * 2, 100);
  const evidenceStrength = evidenceStrengthRaw >= 80 ? 'Very Strong' : evidenceStrengthRaw >= 60 ? 'Strong' : evidenceStrengthRaw >= 35 ? 'Moderate' : 'Weak';
  const confidenceScore = Math.min(Math.round((upl.length * 3 + ev.length * 2 + conn.length * 4 + disc.length * 3) / 4), 100);
  const caseStrengthRaw = Math.min(upl.length * 5 + topActors.filter(a => a.riskScore > 50).length * 10 + disc.length * 3 + viol.length * 5, 100);
  const caseStrength = caseStrengthRaw >= 80 ? 'Very Strong' : caseStrengthRaw >= 60 ? 'Strong' : caseStrengthRaw >= 35 ? 'Moderate' : 'Weak';

  // ── Timeline phases ──
  const phases = detectTimelinePhases(ev);

  // ── Risk Domains ──
  const financialRisk = Math.min((lo.length * 10 + inc.filter((i: any) => i.incident_type?.includes('financial')).length * 15 + totalLoss > 0 ? 30 : 0), 100);
  const governanceRisk = Math.min(e.filter(ent => ent.category === 'antagonist').length * 12 + disc.filter(d => d.discrepancy_type === 'governance_failure').length * 10, 100);
  const accessRisk = Math.min(ev.filter(event => (event.category || '').toLowerCase().includes('access') || (event.description || '').toLowerCase().includes('unauthorized')).length * 12, 100);
  const legalRisk = Math.min(viol.length * 8 + cl.length * 5 + inc.filter((i: any) => i.status === 'escalated').length * 10, 100);

  // ── Key Findings auto-generation ──
  const keyFindings: { category: string; finding: string; severity: string; actors: string; evidenceCount: number }[] = [];
  if (topActors.length > 2) keyFindings.push({ category: 'Network', finding: `${topActors.length} high-connectivity actors identified with coordinated relationship patterns`, severity: 'high', actors: topActors.slice(0, 3).map(a => a.name).join(', '), evidenceCount: conn.length });
  if (disc.filter(d => d.severity === 'critical').length > 0) keyFindings.push({ category: 'Compliance', finding: `${discSeverity['critical'] || 0} critical procedural discrepancies requiring immediate attention`, severity: 'critical', actors: '', evidenceCount: disc.length });
  if (viol.length > 0) keyFindings.push({ category: 'Legal', finding: `${viol.length} compliance violations identified across domestic and international frameworks`, severity: viol.some(v => v.severity === 'critical') ? 'critical' : 'high', actors: '', evidenceCount: viol.length });
  if (totalLoss > 0) keyFindings.push({ category: 'Financial', finding: `Total quantified financial harm of PKR ${totalLoss.toLocaleString()}`, severity: 'high', actors: '', evidenceCount: lo.length });
  if (ev.length > 20) keyFindings.push({ category: 'Timeline', finding: `${ev.length} events across ${Object.keys(eventYearDist).length} years — systematic pattern detected`, severity: 'medium', actors: '', evidenceCount: ev.length });
  if (e.filter(ent => ent.category === 'antagonist').length > 0) keyFindings.push({ category: 'Actors', finding: `${e.filter(ent => ent.category === 'antagonist').length} antagonist entities identified in network`, severity: 'high', actors: e.filter(ent => ent.category === 'antagonist').slice(0, 3).map(ent => ent.name).join(', '), evidenceCount: 0 });

  // Heatmap
  const topCats = Object.entries(eventCatDist).sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => x[0]);
  const topYears = Object.keys(eventYearDist).sort().slice(-8);
  const heatmapData: { row: string; col: string; value: number }[] = [];
  topCats.forEach(cat => {
    topYears.forEach(year => {
      const count = ev.filter(event => event.category === cat && event.date?.startsWith(year)).length;
      heatmapData.push({ row: cat, col: year, value: count });
    });
  });

  // ── Build sections ──
  const sections = [
    // 1. Executive Summary
    {
      title: 'Executive Summary',
      content:
        `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:16px;">
          <p style="font-size:13px;color:#1e40af;line-height:1.7;margin:0;">${caseItem.description || 'No description available.'}</p>
        </div>` +
        `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
          ${buildScoreCard('Risk Level', caseItem.severity === 'critical' ? 90 : caseItem.severity === 'high' ? 70 : 45, 100, (caseItem.severity || 'medium').toUpperCase())}
          ${buildScoreCard('Case Strength', caseStrengthRaw, 100, caseStrength)}
          ${buildScoreCard('Confidence', confidenceScore, 100, confidenceScore >= 75 ? 'High' : confidenceScore >= 50 ? 'Moderate' : 'Low')}
          ${buildScoreCard('Evidence', evidenceStrengthRaw, 100, evidenceStrength)}
        </div>` +
        buildStatGrid([
          { label: 'Total Events', value: ev.length },
          { label: 'Actors Mapped', value: e.length },
          { label: 'Evidence Files', value: upl.length },
          { label: 'Network Links', value: conn.length },
          { label: 'Discrepancies', value: disc.length, color: '#d97706' },
          { label: 'Violations', value: viol.length, color: '#dc2626' },
          { label: 'Legal Claims', value: cl.length },
          { label: 'Financial Loss', value: totalLoss > 0 ? `PKR ${totalLoss.toLocaleString()}` : '—', color: '#dc2626' },
        ]) +
        `<div style="margin-top:16px;padding:14px;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;">
          <h4 style="font-size:12px;font-weight:700;color:#374151;margin:0 0 8px;">Top Risk Actors</h4>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${topActors.slice(0, 5).map(a => `<span style="padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;background:${a.riskScore >= 70 ? '#fef2f2' : '#f9fafb'};color:${a.riskScore >= 70 ? '#dc2626' : '#374151'};border:1px solid ${a.riskScore >= 70 ? '#fecaca' : '#e5e7eb'};">${a.name} (${a.riskScore}%)</span>`).join('')}
          </div>
        </div>` +
        buildKeyValueGrid([
          { key: 'Case Number', value: caseItem.case_number },
          { key: 'Status', value: (caseItem.status || 'N/A').toUpperCase(), highlight: true },
          { key: 'Severity', value: (caseItem.severity || 'N/A').toUpperCase(), highlight: caseItem.severity === 'critical' },
          { key: 'Location', value: caseItem.location || 'N/A' },
          { key: 'Lead Investigator', value: caseItem.lead_investigator || 'N/A' },
          { key: 'Date Opened', value: caseItem.date_opened || 'N/A' },
          { key: 'Timeline Range', value: topYears.length > 0 ? `${topYears[0]} — ${topYears[topYears.length - 1]}` : 'N/A' },
          { key: 'Investigation Phase', value: phases.length > 0 ? phases[phases.length - 1].phase : 'N/A' },
        ])
    },

    // 2. Key Findings at a Glance
    {
      title: 'Key Findings at a Glance',
      content: buildFindingsGlance(keyFindings)
    },

    // 3. Case Overview
    {
      title: 'Case Overview',
      content:
        `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
            <h4 style="font-size:12px;font-weight:700;color:#374151;margin:0 0 8px;">Report Scope</h4>
            <ul style="font-size:11px;color:#4b5563;line-height:1.8;padding-left:16px;margin:0;">
              <li>${ev.length} timeline events analyzed</li>
              <li>${e.length} entities mapped and classified</li>
              <li>${conn.length} relationship connections documented</li>
              <li>${upl.length} evidence files catalogued</li>
            </ul>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
            <h4 style="font-size:12px;font-weight:700;color:#374151;margin:0 0 8px;">Data Sources</h4>
            <ul style="font-size:11px;color:#4b5563;line-height:1.8;padding-left:16px;margin:0;">
              <li>Court filings and judicial records</li>
              <li>Financial documents and bank records</li>
              <li>Digital forensic analysis outputs</li>
              <li>Open-source intelligence (OSINT)</li>
              <li>AI-assisted document extraction</li>
            </ul>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
            <h4 style="font-size:12px;font-weight:700;color:#374151;margin:0 0 8px;">Methodology</h4>
            <ul style="font-size:11px;color:#4b5563;line-height:1.8;padding-left:16px;margin:0;">
              <li>Entity canonicalization & deduplication</li>
              <li>Chronological event reconstruction</li>
              <li>Network centrality analysis</li>
              <li>Pattern detection (financial, governance)</li>
              <li>Compliance framework benchmarking</li>
            </ul>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
            <h4 style="font-size:12px;font-weight:700;color:#374151;margin:0 0 8px;">Limitations</h4>
            <ul style="font-size:11px;color:#4b5563;line-height:1.8;padding-left:16px;margin:0;">
              <li>Based on available documentation only</li>
              <li>AI extractions subject to verification</li>
              <li>Financial figures are estimates where noted</li>
              <li>Allegations subject to judicial determination</li>
            </ul>
          </div>
        </div>`
    },

    // 4. Actor Intelligence
    {
      title: 'Actor Intelligence',
      content:
        (topActors.length > 0 ?
          `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            ${topActors.map(a => buildActorCard(a)).join('')}
          </div>` +
          buildDonutChart(
            Object.entries(entityCatDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
            'Actor Alignment Distribution'
          ) +
          buildBarChart(
            topActors.slice(0, 8).map(a => ({ label: a.name, value: a.riskScore })),
            'Actor Risk Scores',
            { suffix: '%' }
          )
          : '<p style="color:#9ca3af;font-size:12px;">No actor data available.</p>')
    },

    // 5. Timeline Intelligence
    {
      title: 'Timeline Intelligence',
      content:
        (phases.length > 0 ?
          `<div style="margin-bottom:16px;">
            ${phases.map((p, i) => `
              <div style="display:flex;gap:12px;margin-bottom:12px;page-break-inside:avoid;">
                <div style="width:32px;height:32px;background:#0087C1;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">${i + 1}</div>
                <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <h4 style="font-size:13px;font-weight:700;color:#1f2937;margin:0;">${p.phase}</h4>
                    <span style="font-size:10px;color:#6b7280;background:#f3f4f6;padding:2px 8px;border-radius:4px;">${p.eventCount} events</span>
                  </div>
                  <div style="font-size:10px;color:#6b7280;margin-bottom:6px;">${p.period}</div>
                  ${p.keyEvents.map(ke => `<div style="font-size:11px;color:#4b5563;padding:2px 0;">• ${ke}</div>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>`
          : '') +
        buildTimelineChart(
          Object.entries(eventYearDist).sort().map(([year, count]) => ({ year, count })),
          'Event Distribution Over Time'
        ) +
        buildHeatmapGrid(heatmapData, 'Category × Year Activity Heatmap') +
        buildTable(
          ['Date', 'Category', 'Description', 'Actors', 'Source'],
          ev.slice(0, 40).map(event => [
            event.date || 'N/A',
            event.category,
            (event.description || '').slice(0, 70) + ((event.description || '').length > 70 ? '…' : ''),
            (event.individuals || '').slice(0, 30),
            event.extraction_method === 'ai' ? 'AI' : 'Manual'
          ]),
          `Event Registry (${ev.length > 40 ? `top 40 of ${ev.length}` : `${ev.length} events`})`
        )
    },

    // 6. Risk Domains
    {
      title: 'Risk Domains',
      content:
        `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${buildRiskDomainCard('Financial Risk', financialRisk, 'Exposure from financial manipulation, unauthorized transactions, and quantified losses.', topActors.filter(a => a.riskScore >= 60).slice(0, 3).map(a => a.name), totalLoss > 0 ? `PKR ${totalLoss.toLocaleString()} documented` : 'Under investigation')}
          ${buildRiskDomainCard('Governance Risk', governanceRisk, 'Risk from unauthorized decision-making, control concentration, and institutional manipulation.', e.filter(ent => ent.category === 'antagonist').slice(0, 3).map(ent => ent.name), `${disc.length} discrepancies flagged`)}
          ${buildRiskDomainCard('Access / Infrastructure Risk', accessRisk, 'Risk from unauthorized system access, device monitoring, and data manipulation.', [], `${ev.filter(event => (event.description || '').toLowerCase().includes('access')).length} access events`)}
          ${buildRiskDomainCard('Legal Risk', legalRisk, 'Exposure from active proceedings, regulatory violations, and compliance failures.', [], `${viol.length} violations, ${cl.length} claims`)}
        </div>`
    },

    // 7. Evidence Strength Summary
    {
      title: 'Evidence Strength Summary',
      content:
        `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
          ${buildScoreCard('Evidence Strength', evidenceStrengthRaw, 100, evidenceStrength)}
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Total Files</div>
            <div style="font-size:28px;font-weight:700;color:#0087C1;">${upl.length}</div>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Linked Events</div>
            <div style="font-size:28px;font-weight:700;color:#0087C1;">${ev.filter(event => event.source_upload_id).length}</div>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Coverage</div>
            <div style="font-size:28px;font-weight:700;color:#0087C1;">${ev.length > 0 ? Math.round((ev.filter(event => event.source_upload_id).length / ev.length) * 100) : 0}%</div>
          </div>
        </div>` +
        (upl.length > 0 ?
          buildPieChart(
            Object.entries(evidCatDist).map(([label, value]) => ({ label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })),
            'Evidence by Category'
          ) +
          `<div style="margin-top:12px;padding:12px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;">
            <h4 style="font-size:12px;font-weight:700;color:#92400e;margin:0 0 6px;">Gaps & Weak Spots</h4>
            <ul style="font-size:11px;color:#78350f;line-height:1.7;padding-left:16px;margin:0;">
              ${ev.filter(event => !event.source_upload_id).length > 0 ? `<li>${ev.filter(event => !event.source_upload_id).length} events lack linked evidence documents</li>` : ''}
              ${cl.filter((c: any) => c.evidence_strength === 'weak').length > 0 ? `<li>${cl.filter((c: any) => c.evidence_strength === 'weak').length} claims have weak evidence support</li>` : ''}
              ${upl.length < 10 ? '<li>Evidence base is below recommended threshold for litigation readiness</li>' : ''}
            </ul>
          </div>`
          : '<p style="color:#9ca3af;font-size:12px;">No evidence files uploaded.</p>')
    },

    // 8. Legal Exposure
    {
      title: 'Legal Exposure',
      content:
        (viol.length > 0 || cl.length > 0 ?
          buildStatGrid([
            { label: 'Total Violations', value: viol.length, color: '#dc2626' },
            { label: 'Critical', value: violSeverity['critical'] || 0, color: '#dc2626' },
            { label: 'High', value: violSeverity['high'] || 0, color: '#d97706' },
            { label: 'Legal Claims', value: cl.length },
          ]) +
          (viol.length > 0 ? buildTable(
            ['Title', 'Type', 'Severity', 'Status', 'Consequence'],
            viol.slice(0, 25).map((v: any) => [
              v.title || 'N/A',
              v.violation_type || 'N/A',
              v.severity || 'N/A',
              v.resolved ? 'Resolved' : 'Active',
              (v.legal_consequence || '—').slice(0, 50)
            ]),
            'Compliance Violations'
          ) : '') +
          (cl.length > 0 ? buildTable(
            ['Claim', 'Category', 'Status', 'Evidence Strength'],
            cl.slice(0, 15).map((c: any) => [
              (c.title || c.claim_text || 'N/A').slice(0, 50),
              c.category || 'N/A',
              c.status || 'N/A',
              c.evidence_strength || 'N/A'
            ]),
            'Legal Claims'
          ) : '') +
          (checks.length > 0 ? buildProgressList(
            [
              { label: 'Compliant', value: compStatus['compliant'] || 0, max: checks.length, status: 'compliant' },
              { label: 'Non-Compliant', value: compStatus['non_compliant'] || 0, max: checks.length, status: 'violation' },
              { label: 'Pending', value: compStatus['pending'] || 0, max: checks.length },
            ],
            'Compliance Status'
          ) : '')
          : '<p style="color:#059669;font-size:12px;">No legal exposure identified for this case.</p>')
    },

    // 9. Discrepancy & Procedural Analysis
    {
      title: 'Discrepancy & Procedural Analysis',
      content:
        (disc.length > 0 ?
          buildStatGrid([
            { label: 'Total Discrepancies', value: disc.length, color: '#d97706' },
            { label: 'Critical', value: discSeverity['critical'] || 0, color: '#dc2626' },
            { label: 'High', value: discSeverity['high'] || 0, color: '#d97706' },
            { label: 'Medium', value: discSeverity['medium'] || 0 },
          ]) +
          buildTable(
            ['Title', 'Type', 'Severity', 'Legal Ref', 'Description'],
            disc.slice(0, 25).map(d => [
              d.title,
              d.discrepancy_type || 'N/A',
              d.severity,
              d.legal_reference || '—',
              (d.description || '').slice(0, 50)
            ]),
            'Procedural Discrepancies'
          )
          : '<p style="color:#059669;font-size:12px;">No discrepancies identified.</p>')
    },

    // 10. Network Analysis
    {
      title: 'Network & Entity Analysis',
      content:
        buildPieChart(
          Object.entries(entityTypeDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
          'Entity Type Distribution'
        ) +
        (topActors.length > 0 ? buildTable(
          ['Rank', 'Entity', 'Type', 'Role', 'Category', 'Connections'],
          topActors.map((t, i) => [`#${i + 1}`, t.name, t.type, t.role, t.category.charAt(0).toUpperCase() + t.category.slice(1), String(t.connections)]),
          'Most Connected Entities'
        ) : '') +
        (conn.length > 0 ? buildDonutChart(
          Object.entries(connTypeDist).map(([label, value]) => ({ label: label.replace(/_/g, ' '), value })),
          'Connection Types'
        ) : '')
    },

    // 11. Financial Impact
    {
      title: 'Regulatory Harm & Financial Impact',
      content:
        (inc.length > 0 || lo.length > 0 ?
          buildStatGrid([
            { label: 'Harm Incidents', value: inc.length },
            { label: 'Financial Losses', value: lo.length },
            { label: 'Total Loss (PKR)', value: totalLoss > 0 ? `PKR ${totalLoss.toLocaleString()}` : '—', color: '#dc2626' },
          ]) +
          (() => {
            const lossByCat: Record<string, number> = {};
            lo.forEach(l => { lossByCat[l.loss_category || 'Other'] = (lossByCat[l.loss_category || 'Other'] || 0) + Number(l.amount || 0); });
            return Object.keys(lossByCat).length > 0 ? buildBarChart(
              Object.entries(lossByCat).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })),
              'Financial Loss by Category (PKR)'
            ) : '';
          })() +
          (inc.length > 0 ? buildTable(
            ['Date', 'Title', 'Type', 'Severity', 'Institution', 'Status'],
            inc.slice(0, 15).map((i: any) => [i.incident_date || 'N/A', (i.title || 'N/A').slice(0, 35), (i.incident_type || '').replace(/_/g, ' '), i.severity || 'medium', (i.institution_name || 'N/A').slice(0, 25), i.status || 'active']),
            'Harm Incidents'
          ) : '')
          : '<p style="color:#9ca3af;font-size:12px;">No financial impact data documented.</p>')
    },

    // 12. Open Questions & Next Actions
    {
      title: 'Open Questions & Next Actions',
      content:
        `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;">
            <h4 style="font-size:12px;font-weight:700;color:#dc2626;margin:0 0 8px;">Immediate Priority</h4>
            <ul style="font-size:11px;color:#7f1d1d;line-height:1.7;padding-left:14px;margin:0;">
              ${disc.filter(d => d.severity === 'critical').length > 0 ? '<li>Investigate critical procedural discrepancies</li>' : ''}
              ${topActors.filter(a => a.riskScore >= 80).length > 0 ? `<li>Verify identities of highest-risk actors: ${topActors.filter(a => a.riskScore >= 80).slice(0, 2).map(a => a.name).join(', ')}</li>` : ''}
              ${upl.length < 5 ? '<li>Upload additional supporting evidence documents</li>' : ''}
              <li>Preserve digital evidence and secure chain of custody</li>
            </ul>
          </div>
          <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;">
            <h4 style="font-size:12px;font-weight:700;color:#92400e;margin:0 0 8px;">Short-Term Actions</h4>
            <ul style="font-size:11px;color:#78350f;line-height:1.7;padding-left:14px;margin:0;">
              ${ev.filter(event => !event.source_upload_id).length > 0 ? '<li>Link unlinked events to evidence documents</li>' : ''}
              <li>Expand actor network mapping</li>
              <li>Verify financial transaction records</li>
              <li>Review compliance against applicable statutes</li>
            </ul>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;">
            <h4 style="font-size:12px;font-weight:700;color:#166534;margin:0 0 8px;">Follow-Up Questions</h4>
            <ul style="font-size:11px;color:#14532d;line-height:1.7;padding-left:14px;margin:0;">
              <li>Are there additional witnesses to interview?</li>
              <li>Are all relevant legal filings accounted for?</li>
              <li>Is the timeline reconstruction complete?</li>
              <li>Have all financial channels been traced?</li>
            </ul>
          </div>
        </div>`
    },
  ];

  // ── Build full report ──
  const html = buildReportShell({
    title: caseItem.title,
    subtitle: 'Official Case Intelligence Report',
    caseTitle: caseItem.title,
    caseNumber: caseItem.case_number,
    stats: [
      { label: 'Evidence', value: upl.length },
      { label: 'Events', value: ev.length },
      { label: 'Entities', value: e.length },
      { label: 'Findings', value: keyFindings.length },
    ],
    sections,
    severity: caseItem.severity,
    leadInvestigator: caseItem.lead_investigator,
  });

  await openReportWindow(html);
}
