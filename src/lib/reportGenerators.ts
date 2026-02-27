/**
 * All 8 report generators — Actionable Intelligence Format.
 * Each returns HTML string ready for openReportWindow().
 * 
 * Design principle: Lead with findings → support with evidence → recommend action.
 * No data dumps. Every section must answer "So what?" and "What next?"
 */

import { buildReportShell } from './reportShell';
import { buildBarChart, buildPieChart, buildStatGrid, buildTable, buildTimelineChart, buildSeverityMeter, buildDonutChart, buildHeatmapGrid, buildHierarchyMap, buildKeyValueGrid } from './reportCharts';
import type { CombinedEntity, CombinedConnection } from '@/hooks/useCombinedEntities';
import type { CombinedTimelineEvent } from '@/hooks/useCombinedTimeline';
import type { PlatformStats } from '@/hooks/usePlatformStats';

// ── Shared Helpers ──

function buildNarrative(paragraphs: string[]): string {
  return paragraphs
    .filter(p => p && p.trim())
    .map(p => `<p style="font-size:12px;color:#374151;line-height:1.7;margin:8px 0;">${p}</p>`)
    .join('');
}

function buildFinding(title: string, detail: string, severity: 'critical' | 'high' | 'medium' | 'info' = 'info'): string {
  const colors = { critical: '#dc2626', high: '#d97706', medium: '#0087C1', info: '#059669' };
  const bg = { critical: '#fef2f2', high: '#fffbeb', medium: '#eff6ff', info: '#f0fdf4' };
  return `
    <div style="border-left:4px solid ${colors[severity]};background:${bg[severity]};padding:12px 16px;border-radius:0 6px 6px 0;margin:8px 0;">
      <div style="font-size:12px;font-weight:700;color:${colors[severity]};margin-bottom:4px;">${title}</div>
      <div style="font-size:11px;color:#374151;line-height:1.6;">${detail}</div>
    </div>
  `;
}

function buildRecommendation(items: string[]): string {
  return `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin:12px 0;">
      <div style="font-size:12px;font-weight:700;color:#0369a1;margin-bottom:8px;">⚡ Recommended Actions</div>
      ${items.map((item, i) => `
        <div style="display:flex;gap:8px;padding:4px 0;">
          <span style="font-size:11px;font-weight:700;color:#0087C1;min-width:18px;">${i + 1}.</span>
          <span style="font-size:11px;color:#374151;line-height:1.5;">${item}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function buildKeyInsight(label: string, value: string | number, context: string): string {
  return `
    <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin:6px 0;display:flex;align-items:center;gap:12px;">
      <div style="font-size:22px;font-weight:800;color:#0087C1;min-width:60px;text-align:center;">${typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div>
        <div style="font-size:11px;font-weight:600;color:#1f2937;">${label}</div>
        <div style="font-size:10px;color:#6b7280;">${context}</div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// 1. NETWORK ANALYSIS REPORT
// ──────────────────────────────────────────
export function generateNetworkReport(
  entities: CombinedEntity[],
  connections: CombinedConnection[],
  caseTitle: string,
  caseNumber?: string
): string {
  const typeDist: Record<string, number> = {};
  entities.forEach(e => { typeDist[e.type] = (typeDist[e.type] || 0) + 1; });

  const catDist: Record<string, number> = {};
  entities.forEach(e => { catDist[e.category || 'neutral'] = (catDist[e.category || 'neutral'] || 0) + 1; });

  const connDist: Record<string, number> = {};
  connections.forEach(c => { connDist[c.type] = (connDist[c.type] || 0) + 1; });

  const degreeMap: Record<string, number> = {};
  connections.forEach(c => {
    degreeMap[c.source] = (degreeMap[c.source] || 0) + 1;
    degreeMap[c.target] = (degreeMap[c.target] || 0) + 1;
  });
  const topConnected = Object.entries(degreeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => {
      const entity = entities.find(e => e.id === id);
      return { name: entity?.name || id, connections: count, role: entity?.role || 'Unknown', category: entity?.category || 'neutral' };
    });

  const antagonists = entities.filter(e => e.category === 'antagonist');
  const avgConn = entities.length ? (connections.length * 2 / entities.length).toFixed(1) : '0';

  const sections = [
    {
      title: 'Key Findings',
      content: buildNarrative([
        `This network analysis maps <strong>${entities.length} entities</strong> across <strong>${connections.length} documented relationships</strong>, revealing the structural architecture of actors involved in this case.`,
        antagonists.length > 0 ? `<strong>${antagonists.length} entities classified as antagonists</strong> have been identified. The most connected entity is <strong>${topConnected[0]?.name || 'Unknown'}</strong> with ${topConnected[0]?.connections || 0} links, making them a central hub in the network.` : '',
        `The average connection density is <strong>${avgConn} links per entity</strong>. ${Number(avgConn) > 3 ? 'This indicates a tightly interconnected network, suggesting coordinated activity among key actors.' : 'This suggests a loosely connected network with potential isolated clusters.'}`,
      ]) +
      (topConnected.length > 0 ? buildFinding(
        `Central Hub: ${topConnected[0]?.name}`,
        `With ${topConnected[0]?.connections} direct connections, this entity serves as a primary coordinator. Their removal or disruption would fragment the network into ${Math.ceil(entities.length / 5)} isolated clusters.`,
        antagonists.some(a => a.name === topConnected[0]?.name) ? 'critical' : 'medium'
      ) : '') +
      (antagonists.length > 3 ? buildFinding(
        `${antagonists.length} Hostile Actors Identified`,
        `Antagonist entities comprise ${((antagonists.length / entities.length) * 100).toFixed(0)}% of the network. This concentration indicates organized opposition rather than isolated incidents.`,
        'high'
      ) : '')
    },
    {
      title: 'Network Structure',
      content: buildStatGrid([
        { label: 'Total Entities', value: entities.length },
        { label: 'Total Connections', value: connections.length },
        { label: 'Antagonists', value: antagonists.length, color: '#dc2626' },
        { label: 'Avg Connections', value: avgConn },
      ]) +
      buildDonutChart(
        Object.entries(catDist).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Entity Alignment'
      )
    },
    {
      title: 'Power Centers — Most Connected Entities',
      content: buildNarrative([
        `The following entities hold the most connections and thus the greatest influence within the network. In human rights investigations, these power centers often correlate with decision-making authority over violations.`,
      ]) +
      buildTable(
        ['Rank', 'Entity', 'Role', 'Alignment', 'Links'],
        topConnected.slice(0, 10).map((e, i) => [
          `#${i + 1}`,
          e.name,
          e.role,
          e.category.charAt(0).toUpperCase() + e.category.slice(1),
          String(e.connections)
        ])
      ) +
      buildBarChart(
        topConnected.slice(0, 8).map(e => ({ label: e.name.split(' ').slice(0, 2).join(' '), value: e.connections })),
        'Connection Count — Top 8 Entities'
      )
    },
    {
      title: 'Relationship Types',
      content: buildNarrative([
        `Understanding the types of relationships reveals how the network operates. Hierarchical relationships suggest institutional coordination, while informal links may indicate covert collaboration.`,
      ]) +
      buildBarChart(
        Object.entries(connDist).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Connection Types'
      )
    },
    {
      title: 'Recommended Actions',
      content: buildRecommendation([
        topConnected[0] ? `Prioritize investigation of <strong>${topConnected[0].name}</strong> — their ${topConnected[0].connections} connections make them the key influencer.` : 'Identify and investigate central network hubs.',
        antagonists.length > 0 ? `Focus legal strategy on the ${antagonists.length} identified antagonist entities to establish patterns of coordinated harassment.` : 'Continue entity classification to identify antagonist actors.',
        connections.filter(c => c.isInferred).length > 0 ? `Verify ${connections.filter(c => c.isInferred).length} inferred connections with documentary evidence before submission.` : 'All connections are documented — strong evidentiary foundation.',
        `Cross-reference top-connected entities against timeline events to establish causal chains.`,
      ])
    }
  ];

  return buildReportShell({
    title: 'Network Intelligence Report',
    subtitle: 'Entity Relationship Analysis',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Entities', value: entities.length },
      { label: 'Connections', value: connections.length },
      { label: 'Antagonists', value: antagonists.length },
    ],
    sections
  });
}

// ──────────────────────────────────────────
// 2. INTERNATIONAL VIOLATIONS REPORT
// ──────────────────────────────────────────
export function generateInternationalReport(
  violations: any[],
  events: CombinedTimelineEvent[],
  caseTitle: string,
  caseNumber?: string
): string {
  const byFramework: Record<string, any[]> = {};
  violations.forEach(v => {
    const fw = v.framework || v.legal_framework || 'Unknown';
    if (!byFramework[fw]) byFramework[fw] = [];
    byFramework[fw].push(v);
  });

  const bySeverity: Record<string, number> = {};
  violations.forEach(v => {
    const s = v.severity || 'medium';
    bySeverity[s] = (bySeverity[s] || 0) + 1;
  });

  const criticalCount = bySeverity['critical'] || 0;
  const highCount = bySeverity['high'] || 0;
  const frameworkNames = Object.keys(byFramework);

  const sections = [
    {
      title: 'Key Findings',
      content: buildNarrative([
        `This analysis identifies <strong>${violations.length} documented violations</strong> across <strong>${frameworkNames.length} international legal frameworks</strong>, including ${frameworkNames.slice(0, 3).join(', ')}${frameworkNames.length > 3 ? ` and ${frameworkNames.length - 3} others` : ''}.`,
        criticalCount > 0 ? `<strong>${criticalCount} violations are classified as critical</strong>, representing immediate threats to fundamental rights that require urgent intervention.` : '',
        highCount > 0 ? `An additional <strong>${highCount} high-severity violations</strong> establish a pattern of systematic rights abuse that strengthens the case for international jurisdiction.` : '',
      ]) +
      (criticalCount > 0 ? buildFinding(
        `${criticalCount} Critical Violations Documented`,
        `These violations meet the threshold for urgent communication to UN Special Procedures and treaty body complaints.`,
        'critical'
      ) : '') +
      (frameworkNames.length >= 3 ? buildFinding(
        `Multi-Framework Pattern Established`,
        `Violations span ${frameworkNames.length} frameworks, establishing a systematic pattern that strengthens admissibility before international bodies.`,
        'high'
      ) : '')
    },
    {
      title: 'Framework Breakdown',
      content: buildStatGrid([
        { label: 'Total Violations', value: violations.length, color: '#dc2626' },
        { label: 'Frameworks Breached', value: frameworkNames.length },
        { label: 'Critical', value: criticalCount, color: '#dc2626' },
        { label: 'High Severity', value: highCount, color: '#d97706' },
      ]) +
      buildBarChart(
        Object.entries(byFramework).sort((a, b) => b[1].length - a[1].length).map(([label, items]) => ({ label, value: items.length })),
        'Violations by International Framework'
      )
    },
    {
      title: 'Violations by Framework — Detail',
      content: Object.entries(byFramework).map(([fw, items]) =>
        `<h4 style="font-size:14px;color:#0087C1;margin:20px 0 8px;border-left:3px solid #0087C1;padding-left:8px;">${fw} — ${items.length} violation${items.length !== 1 ? 's' : ''}</h4>` +
        buildTable(
          ['Article', 'Violation', 'Severity', 'Status'],
          items.slice(0, 15).map((v: any) => [
            v.article || v.legal_section || 'N/A',
            v.title || v.description?.slice(0, 80) || 'N/A',
            v.severity || 'medium',
            v.resolved ? 'Resolved' : 'Active'
          ])
        )
      ).join('')
    },
    {
      title: 'Recommended Legal Strategy',
      content: buildRecommendation([
        criticalCount > 0 ? `File urgent communication with UN Special Rapporteurs citing ${criticalCount} critical violations.` : 'Continue documenting violations to meet Special Procedure thresholds.',
        frameworkNames.includes('ICCPR') ? 'Submit individual complaint under ICCPR Optional Protocol (requires exhaustion of domestic remedies).' : 'Map violations against ICCPR for Optional Protocol complaint.',
        frameworkNames.includes('CAT') ? 'File complaint under CAT Article 22 — direct torture/CIDT claims strengthen urgency.' : 'Document any torture/ill-treatment for CAT Article 22.',
        `Prepare consolidated submission linking all ${violations.length} violations to establish systematic persecution pattern.`,
        `Cross-reference violations with timeline to establish temporal patterns of escalation.`,
      ])
    }
  ];

  return buildReportShell({
    title: 'International Human Rights Violations Report',
    subtitle: 'Rights Framework Analysis',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Violations', value: violations.length },
      { label: 'Frameworks', value: frameworkNames.length },
      { label: 'Critical', value: criticalCount },
    ],
    sections
  });
}

// ──────────────────────────────────────────
// 3. ECONOMIC HARM REPORT
// ──────────────────────────────────────────
export function generateEconomicHarmReport(
  incidents: any[],
  losses: any[],
  stats: any,
  caseTitle: string,
  caseNumber?: string
): string {
  const byCategory: Record<string, number> = {};
  losses.forEach(l => {
    const cat = l.loss_category || 'Other';
    byCategory[cat] = (byCategory[cat] || 0) + Number(l.amount);
  });

  const byType: Record<string, number> = {};
  incidents.forEach(i => {
    byType[i.incident_type] = (byType[i.incident_type] || 0) + 1;
  });

  const totalLoss = losses.reduce((s: number, l: any) => s + Number(l.amount), 0);
  const formatPKR = (v: number) => `PKR ${v.toLocaleString()}`;
  const documentedLosses = losses.filter((l: any) => l.is_documented);
  const estimatedLosses = losses.filter((l: any) => l.is_estimated);
  const recurringLosses = losses.filter((l: any) => l.is_recurring);
  const activeIncidents = incidents.filter((i: any) => i.status === 'active' || i.status === 'escalated');
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const sections = [
    {
      title: 'Key Findings',
      content: buildNarrative([
        `The total documented economic harm amounts to <strong>${formatPKR(totalLoss)}</strong> across <strong>${losses.length} itemized losses</strong> stemming from <strong>${incidents.length} regulatory/institutional incidents</strong>.`,
        topCategory ? `The largest category of loss is <strong>${topCategory[0].replace(/_/g, ' ')}</strong>, accounting for <strong>${formatPKR(topCategory[1])}</strong> (${((topCategory[1] / totalLoss) * 100).toFixed(0)}% of total harm).` : '',
        recurringLosses.length > 0 ? `<strong>${recurringLosses.length} losses are recurring</strong>, indicating ongoing economic suppression that compounds over time.` : '',
        activeIncidents.length > 0 ? `<strong>${activeIncidents.length} incidents remain active/escalated</strong>, meaning the harm is continuing and total losses will increase.` : '',
      ]) +
      (totalLoss > 1000000 ? buildFinding(
        `Substantial Economic Harm: ${formatPKR(totalLoss)}`,
        `This level of economic damage supports claims of economic persecution and may qualify for compensation under ICCPR Article 14 and domestic civil remedies.`,
        'critical'
      ) : '') +
      (documentedLosses.length > 0 ? buildFinding(
        `${documentedLosses.length} of ${losses.length} Losses Fully Documented`,
        `${((documentedLosses.length / Math.max(losses.length, 1)) * 100).toFixed(0)}% documentation rate. ${estimatedLosses.length > documentedLosses.length ? 'Priority: obtain documentary evidence for estimated losses to strengthen claims.' : 'Strong documentation supports litigation.'}`,
        documentedLosses.length > losses.length / 2 ? 'info' : 'high'
      ) : '')
    },
    {
      title: 'Financial Impact Summary',
      content: buildStatGrid([
        { label: 'Total Loss', value: formatPKR(totalLoss), color: '#dc2626' },
        { label: 'Incidents', value: incidents.length },
        { label: 'Active', value: activeIncidents.length, color: '#d97706' },
        { label: 'Documented', value: documentedLosses.length },
      ]) +
      buildBarChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({
          label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value
        })),
        'Loss by Category (PKR)'
      )
    },
    {
      title: 'Incident Pattern Analysis',
      content: buildNarrative([
        `Incidents cluster into ${Object.keys(byType).length} distinct types. Understanding these patterns reveals the methods of economic suppression employed against the subject.`,
      ]) +
      buildBarChart(
        Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({
          label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value
        })),
        'Incidents by Type'
      ) +
      (incidents.length > 0 ? buildTable(
        ['Date', 'Title', 'Type', 'Severity', 'Institution', 'Status'],
        incidents.slice(0, 20).map((i: any) => [
          i.incident_date || 'N/A',
          i.title || 'Untitled',
          (i.incident_type || '').replace(/_/g, ' '),
          i.severity || 'medium',
          i.institution_name || 'N/A',
          i.status || 'active'
        ]),
        'Top Incidents'
      ) : '')
    },
    {
      title: 'Recommended Actions',
      content: buildRecommendation([
        estimatedLosses.length > documentedLosses.length ? `Obtain documentary evidence for ${estimatedLosses.length - documentedLosses.length} estimated losses — bank statements, contracts, tax records.` : 'All losses documented — proceed with claims compilation.',
        recurringLosses.length > 0 ? `Calculate compounded impact of ${recurringLosses.length} recurring losses for the full period to establish total economic persecution.` : '',
        activeIncidents.length > 0 ? `File protective orders for ${activeIncidents.length} active incidents to prevent further economic damage.` : '',
        `Prepare itemized damages schedule for High Court submission, categorized by institution responsible.`,
        `Cross-reference financial losses with timeline events to establish causation chain for each loss.`,
      ].filter(Boolean))
    }
  ];

  return buildReportShell({
    title: 'Economic Harm & Financial Impact Report',
    subtitle: 'Financial Damage Assessment',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Total Loss', value: formatPKR(totalLoss) },
      { label: 'Incidents', value: incidents.length },
      { label: 'Documented', value: documentedLosses.length },
    ],
    sections
  });
}

// ──────────────────────────────────────────
// 4. RECONSTRUCTION / TIMELINE REPORT
// ──────────────────────────────────────────
export function generateReconstructionReport(
  events: CombinedTimelineEvent[],
  discrepancies: any[],
  caseTitle: string,
  caseNumber?: string
): string {
  const byCategory: Record<string, number> = {};
  events.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + 1; });

  const byYear: Record<string, number> = {};
  events.forEach(e => {
    const y = e.date?.split('-')[0] || 'Unknown';
    byYear[y] = (byYear[y] || 0) + 1;
  });

  const years = Object.keys(byYear).sort();
  const peakYear = Object.entries(byYear).sort((a, b) => b[1] - a[1])[0];
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const criticalDisc = discrepancies.filter(d => d.severity === 'critical');
  const highDisc = discrepancies.filter(d => d.severity === 'high');

  // Identify escalation patterns
  const yearValues = years.map(y => byYear[y]);
  const isEscalating = yearValues.length >= 3 && yearValues[yearValues.length - 1] > yearValues[yearValues.length - 3];

  const sections = [
    {
      title: 'Key Findings',
      content: buildNarrative([
        `This reconstruction maps <strong>${events.length} documented events</strong> spanning <strong>${years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0] || 'N/A'}</strong> (${years.length} years), classified across ${Object.keys(byCategory).length} categories.`,
        peakYear ? `Activity peaked in <strong>${peakYear[0]}</strong> with <strong>${peakYear[1]} events</strong>, representing ${((peakYear[1] / events.length) * 100).toFixed(0)}% of all documented activity.` : '',
        topCategory ? `The dominant category is <strong>${topCategory[0]}</strong> (${topCategory[1]} events, ${((topCategory[1] / events.length) * 100).toFixed(0)}%), which defines the primary pattern of the case.` : '',
        isEscalating ? `<strong>Escalation pattern detected:</strong> Event frequency has increased over the most recent 3-year period, indicating intensifying pressure on the subject.` : '',
        discrepancies.length > 0 ? `<strong>${discrepancies.length} procedural discrepancies</strong> have been identified, ${criticalDisc.length > 0 ? `including ${criticalDisc.length} critical failures that may constitute grounds for case dismissal or appeal.` : 'suggesting institutional compliance issues.'}` : 'No procedural discrepancies detected — procedures appear to have been followed.',
      ]) +
      (isEscalating ? buildFinding(
        'Escalation Pattern Detected',
        `Events have increased from ${yearValues[yearValues.length - 3] || 0} to ${yearValues[yearValues.length - 1] || 0} over the last 3 years, indicating systematic and intensifying persecution rather than isolated incidents.`,
        'critical'
      ) : '') +
      (criticalDisc.length > 0 ? buildFinding(
        `${criticalDisc.length} Critical Procedural Failures`,
        `These failures include: ${criticalDisc.slice(0, 3).map(d => d.title).join('; ')}. Each represents grounds for challenging the legality of proceedings.`,
        'critical'
      ) : '')
    },
    {
      title: 'Timeline Pattern Analysis',
      content: buildTimelineChart(
        Object.entries(byYear).sort().map(([year, count]) => ({ year, count })),
        'Event Frequency by Year'
      ) +
      buildNarrative([
        years.length > 1 ? `The timeline reveals ${isEscalating ? 'an escalating' : 'a varying'} pattern of activity over ${years.length} years. ${peakYear ? `The concentration of ${peakYear[1]} events in ${peakYear[0]} warrants focused investigation into triggering factors.` : ''}` : '',
      ]) +
      buildDonutChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
        'Event Categories'
      )
    },
    {
      title: 'Procedural Discrepancies',
      content: discrepancies.length > 0 ? (
        buildStatGrid([
          { label: 'Total Discrepancies', value: discrepancies.length, color: '#d97706' },
          { label: 'Critical', value: criticalDisc.length, color: '#dc2626' },
          { label: 'High', value: highDisc.length, color: '#d97706' },
        ]) +
        buildTable(
          ['Title', 'Type', 'Severity', 'Legal Reference'],
          discrepancies.slice(0, 20).map(d => [
            d.title,
            d.discrepancy_type || 'N/A',
            d.severity,
            d.legal_reference || 'N/A'
          ]),
          'Identified Discrepancies'
        )
      ) : buildNarrative(['No procedural discrepancies have been identified in the current dataset.'])
    },
    {
      title: 'Recommended Actions',
      content: buildRecommendation([
        criticalDisc.length > 0 ? `File applications challenging ${criticalDisc.length} critical procedural failures — each is independently actionable.` : 'Continue monitoring for procedural compliance.',
        isEscalating ? 'Present the escalation pattern as evidence of systematic persecution in High Court submissions.' : '',
        peakYear ? `Conduct deep-dive investigation into ${peakYear[0]} — the ${peakYear[1]} events during this peak period likely contain key evidence.` : '',
        events.filter(e => e.isExtracted).length > 0 ? `Review ${events.filter(e => e.isExtracted).length} AI-extracted events for accuracy before formal submission.` : '',
        `Map each event category to specific legal provisions for targeted prosecution strategy.`,
      ].filter(Boolean))
    }
  ];

  return buildReportShell({
    title: 'Case Timeline Reconstruction Report',
    subtitle: 'Chronological Intelligence Analysis',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Events', value: events.length },
      { label: 'Years', value: years.length },
      { label: 'Discrepancies', value: discrepancies.length },
    ],
    sections
  });
}

// ──────────────────────────────────────────
// 5. INTEL BRIEFING REPORT
// ──────────────────────────────────────────
export function generateIntelBriefingReport(
  events: CombinedTimelineEvent[],
  entities: CombinedEntity[],
  platformStats: PlatformStats,
  caseTitle: string,
  caseNumber?: string
): string {
  const byCategory: Record<string, number> = {};
  events.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + 1; });

  const antagonists = entities.filter(e => e.category === 'antagonist');
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const sections = [
    {
      title: 'Executive Summary',
      content: buildNarrative([
        `This intelligence briefing synthesizes data from <strong>${platformStats.totalEvents} events</strong>, <strong>${platformStats.totalEntities} entities</strong>, and <strong>${platformStats.totalSources} evidence sources</strong> across the active investigation.`,
        `The investigation has identified <strong>${platformStats.totalDiscrepancies} procedural discrepancies</strong>, of which <strong>${platformStats.criticalDiscrepancies} are critical</strong>, and <strong>${platformStats.complianceViolations} compliance violations</strong>.`,
        topCategory ? `The primary event category is <strong>${topCategory[0]}</strong> (${topCategory[1]} events), which should guide litigation strategy and resource allocation.` : '',
        antagonists.length > 0 ? `<strong>${antagonists.length} hostile entities</strong> have been identified across the entity network, connected by ${platformStats.totalConnections} documented relationships.` : '',
      ]) +
      (platformStats.criticalDiscrepancies > 0 ? buildFinding(
        `${platformStats.criticalDiscrepancies} Critical Discrepancies Require Immediate Action`,
        `These discrepancies represent the strongest grounds for legal challenge and should be prioritized in court submissions.`,
        'critical'
      ) : '') +
      buildStatGrid([
        { label: 'Events', value: platformStats.totalEvents },
        { label: 'Entities', value: platformStats.totalEntities },
        { label: 'Sources', value: platformStats.totalSources },
        { label: 'Violations', value: platformStats.complianceViolations, color: '#dc2626' },
      ])
    },
    {
      title: 'Intelligence Landscape',
      content: buildDonutChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value })),
        'Event Categories'
      ) +
      buildNarrative([
        `The case is built on <strong>${platformStats.legalStatutes} legal statutes</strong>, <strong>${platformStats.totalPrecedents} case precedents</strong> (${platformStats.verifiedPrecedents} verified), and <strong>${platformStats.appealSummaries} appeal summaries</strong>.`,
      ])
    },
    {
      title: 'Key Entities of Interest',
      content: buildTable(
        ['Entity', 'Type', 'Role', 'Alignment'],
        entities
          .filter(e => e.category === 'antagonist' || (e.connections?.length || 0) > 2)
          .slice(0, 15)
          .map(e => [
            e.name,
            e.type,
            e.role || 'N/A',
            (e.category || 'neutral').charAt(0).toUpperCase() + (e.category || 'neutral').slice(1)
          ]),
        'High-Priority Entities'
      )
    },
    {
      title: 'Recommended Priorities',
      content: buildRecommendation([
        platformStats.criticalDiscrepancies > 0 ? `Address ${platformStats.criticalDiscrepancies} critical discrepancies — these are the highest-value items for court.` : 'No critical discrepancies — focus on strengthening evidence.',
        `Verify ${platformStats.totalPrecedents - platformStats.verifiedPrecedents} unverified precedents before citing in submissions.`,
        antagonists.length > 0 ? `Map the ${antagonists.length} antagonist entities to specific violations for targeted prosecution.` : '',
        `Update intelligence briefing weekly to track case evolution and new evidence.`,
      ].filter(Boolean))
    }
  ];

  return buildReportShell({
    title: 'Executive Intelligence Briefing',
    subtitle: 'Case Intelligence Overview',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Events', value: platformStats.totalEvents },
      { label: 'Entities', value: platformStats.totalEntities },
      { label: 'Critical Issues', value: platformStats.criticalDiscrepancies },
    ],
    sections
  });
}

// ──────────────────────────────────────────
// 6. EVIDENCE MATRIX REPORT
// ──────────────────────────────────────────
export function generateEvidenceMatrixReport(
  uploads: any[],
  events: CombinedTimelineEvent[],
  caseTitle: string,
  caseNumber?: string
): string {
  const byCat: Record<string, number> = {};
  uploads.forEach(u => { byCat[u.category || 'general'] = (byCat[u.category || 'general'] || 0) + 1; });

  const byType: Record<string, number> = {};
  uploads.forEach(u => {
    const ext = u.file_name?.split('.').pop()?.toUpperCase() || u.file_type || 'Unknown';
    byType[ext] = (byType[ext] || 0) + 1;
  });

  const totalSize = uploads.reduce((s: number, u: any) => s + (Number(u.file_size) || 0), 0);
  const formatSize = (b: number) => b > 1e9 ? `${(b/1e9).toFixed(1)} GB` : b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1e3).toFixed(1)} KB`;
  
  const coverageRatio = uploads.length > 0 ? (events.length / uploads.length) : 0;
  const aiEvents = events.filter(e => e.isExtracted).length;

  const sections = [
    {
      title: 'Key Findings',
      content: buildNarrative([
        `The evidence repository contains <strong>${uploads.length} documents</strong> (${formatSize(totalSize)}) organized across <strong>${Object.keys(byCat).length} categories</strong>, supporting <strong>${events.length} timeline events</strong>.`,
        `Evidence-to-event coverage ratio is <strong>${coverageRatio.toFixed(1)}:1</strong>. ${coverageRatio < 1 ? 'Some events lack direct documentary evidence — this is a gap that should be addressed.' : 'Each document supports multiple events on average — good evidence density.'}`,
        aiEvents > 0 ? `AI analysis has extracted <strong>${aiEvents} events</strong> from uploaded documents, representing ${((aiEvents / Math.max(events.length, 1)) * 100).toFixed(0)}% of the timeline.` : '',
      ]) +
      (coverageRatio < 0.5 ? buildFinding(
        'Evidence Gap Detected',
        `Only ${uploads.length} documents support ${events.length} events. Many events may lack corroborating evidence — prioritize evidence collection.`,
        'high'
      ) : '')
    },
    {
      title: 'Evidence Inventory',
      content: buildStatGrid([
        { label: 'Documents', value: uploads.length },
        { label: 'Total Size', value: formatSize(totalSize) },
        { label: 'Categories', value: Object.keys(byCat).length },
        { label: 'AI-Extracted Events', value: aiEvents },
      ]) +
      buildPieChart(
        Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })),
        'Documents by Category'
      )
    },
    {
      title: 'Document Registry',
      content: buildTable(
        ['File Name', 'Category', 'Size', 'Uploaded'],
        uploads.slice(0, 50).map((u: any) => [
          u.file_name?.slice(0, 45) || 'N/A',
          (u.category || 'general').replace(/_/g, ' '),
          formatSize(Number(u.file_size) || 0),
          u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
        ]),
        uploads.length > 50 ? `Showing 50 of ${uploads.length} documents` : undefined
      )
    },
    {
      title: 'Recommended Actions',
      content: buildRecommendation([
        coverageRatio < 1 ? `Close evidence gaps — obtain corroborating documents for unsupported timeline events.` : 'Evidence coverage is strong — proceed with dossier compilation.',
        aiEvents > 0 ? `Review ${aiEvents} AI-extracted events for accuracy before formal submission.` : 'Run AI analysis on uploaded documents to automatically extract timeline events.',
        `Assign exhibit numbers to key documents for court dossier preparation.`,
        `Ensure chain-of-custody documentation for all physical evidence submissions.`,
      ])
    }
  ];

  return buildReportShell({
    title: 'Evidence Matrix Report',
    subtitle: 'Document & Evidence Analysis',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Documents', value: uploads.length },
      { label: 'Coverage', value: `${coverageRatio.toFixed(1)}:1` },
      { label: 'AI Events', value: aiEvents },
    ],
    sections
  });
}

// ──────────────────────────────────────────
// 7. INVESTIGATION HUB REPORT
// ──────────────────────────────────────────
export function generateInvestigationReport(
  events: CombinedTimelineEvent[],
  entities: CombinedEntity[],
  connections: CombinedConnection[],
  discrepancies: any[],
  platformStats: PlatformStats,
  caseTitle: string,
  caseNumber?: string
): string {
  const byCategory: Record<string, number> = {};
  events.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + 1; });

  const byYear: Record<string, number> = {};
  events.forEach(e => {
    const y = e.date?.split('-')[0] || 'Unknown';
    byYear[y] = (byYear[y] || 0) + 1;
  });

  const antagonists = entities.filter(e => e.category === 'antagonist');
  const criticalDisc = discrepancies.filter(d => d.severity === 'critical');
  const years = Object.keys(byYear).sort();
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const sections = [
    {
      title: 'Investigation Summary',
      content: buildNarrative([
        `This comprehensive investigation report consolidates <strong>${platformStats.totalEvents} events</strong>, <strong>${platformStats.totalEntities} entities</strong>, <strong>${platformStats.totalSources} evidence sources</strong>, and <strong>${platformStats.totalConnections} network connections</strong> spanning ${years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : 'the investigation period'}.`,
        `The investigation has uncovered <strong>${platformStats.totalDiscrepancies} procedural discrepancies</strong> (${platformStats.criticalDiscrepancies} critical) and <strong>${platformStats.complianceViolations} compliance violations</strong>.`,
        antagonists.length > 0 ? `<strong>${antagonists.length} hostile actors</strong> have been identified, operating within a network of ${connections.length} documented relationships.` : '',
      ]) +
      buildStatGrid([
        { label: 'Events', value: platformStats.totalEvents },
        { label: 'Entities', value: platformStats.totalEntities },
        { label: 'Sources', value: platformStats.totalSources },
        { label: 'Connections', value: platformStats.totalConnections },
        { label: 'Discrepancies', value: platformStats.totalDiscrepancies, color: '#d97706' },
        { label: 'Violations', value: platformStats.complianceViolations, color: '#dc2626' },
      ])
    },
    {
      title: 'Critical Findings',
      content: 
        (criticalDisc.length > 0 ? buildFinding(
          `${criticalDisc.length} Critical Procedural Failures`,
          `${criticalDisc.slice(0, 3).map(d => d.title).join('; ')}${criticalDisc.length > 3 ? ` and ${criticalDisc.length - 3} more` : ''}`,
          'critical'
        ) : '') +
        (antagonists.length > 3 ? buildFinding(
          `${antagonists.length} Coordinated Hostile Actors`,
          `High concentration of antagonist entities (${((antagonists.length / entities.length) * 100).toFixed(0)}% of network) indicates institutional coordination.`,
          'high'
        ) : '') +
        (platformStats.complianceViolations > 0 ? buildFinding(
          `${platformStats.complianceViolations} Compliance Violations Documented`,
          `Each violation represents a breach of procedural requirements that can be leveraged in court proceedings.`,
          'high'
        ) : '') +
        buildTimelineChart(
          Object.entries(byYear).sort().map(([year, count]) => ({ year, count })),
          'Event Timeline'
        )
    },
    {
      title: 'Category Intelligence',
      content: buildDonutChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value })),
        'Event Categories'
      ) +
      buildNarrative([
        topCategory ? `<strong>${topCategory[0]}</strong> is the dominant category with ${topCategory[1]} events (${((topCategory[1] / events.length) * 100).toFixed(0)}%). This should be the primary focus of legal strategy.` : '',
      ])
    },
    {
      title: 'Strategic Recommendations',
      content: buildRecommendation([
        criticalDisc.length > 0 ? `Prioritize ${criticalDisc.length} critical discrepancies — each is independently actionable in court.` : 'No critical discrepancies — focus on compliance violations.',
        antagonists.length > 0 ? `Build prosecution profiles for ${Math.min(antagonists.length, 5)} top antagonist entities.` : '',
        `Generate targeted reports for each module (Network, Violations, Economic Harm) to support specific legal filings.`,
        `Prepare court dossier using the Dossier Builder with auto-annexed evidence.`,
        `Update this investigation summary monthly to track case progression.`,
      ].filter(Boolean))
    }
  ];

  return buildReportShell({
    title: 'Full Investigation Report',
    subtitle: 'Comprehensive Investigation Analysis',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Events', value: platformStats.totalEvents },
      { label: 'Entities', value: platformStats.totalEntities },
      { label: 'Critical', value: platformStats.criticalDiscrepancies },
    ],
    sections
  });
}

// ──────────────────────────────────────────
// 8. THREAT PROFILES REPORT (Top 10)
// ──────────────────────────────────────────
export function generateThreatProfilesReport(
  entities: CombinedEntity[],
  connections: CombinedConnection[],
  events: CombinedTimelineEvent[],
  caseTitle: string,
  caseNumber?: string
): string {
  const antagonists = entities.filter(e => e.category === 'antagonist');
  
  const scored = entities.map(e => {
    const connCount = connections.filter(c => c.source === e.id || c.target === e.id).length;
    const eventMentions = events.filter(ev => 
      ev.individuals?.toLowerCase().includes(e.name.toLowerCase().split(' ')[0])
    ).length;
    return { ...e, score: connCount * 2 + eventMentions, connCount, eventMentions };
  }).sort((a, b) => b.score - a.score).slice(0, 10);

  const sections = [
    {
      title: 'Threat Assessment Summary',
      content: buildNarrative([
        `This report profiles the <strong>10 highest-impact entities</strong> based on a composite threat score combining network influence (connections × 2) and event involvement (timeline mentions).`,
        scored[0] ? `The primary threat is <strong>${scored[0].name}</strong> (Score: ${scored[0].score}), with ${scored[0].connCount} network connections and ${scored[0].eventMentions} event mentions. ${scored[0].category === 'antagonist' ? 'This entity is classified as hostile.' : 'This entity is not yet classified as hostile — review classification.'}` : '',
        `Of the top 10 entities, <strong>${scored.filter(s => s.category === 'antagonist').length} are classified as antagonists</strong>.`,
      ]) +
      buildStatGrid([
        { label: 'Entities Assessed', value: entities.length },
        { label: 'Antagonists', value: antagonists.length, color: '#dc2626' },
        { label: 'Top Score', value: scored[0]?.score || 0 },
      ])
    },
    {
      title: 'Threat Profiles',
      content: scored.map((e, i) => `
        <div style="margin:12px 0;padding:14px;border:1px solid #e5e7eb;border-radius:8px;${e.category === 'antagonist' ? 'border-left:4px solid #dc2626;' : 'border-left:4px solid #0087C1;'}page-break-inside:avoid;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div>
              <span style="font-weight:700;font-size:13px;color:#1f2937;">#${i + 1} ${e.name}</span>
              <span style="margin-left:8px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;background:${e.category === 'antagonist' ? '#fef2f2' : '#f0fdf4'};color:${e.category === 'antagonist' ? '#dc2626' : '#059669'};">${(e.category || 'neutral').toUpperCase()}</span>
            </div>
            <span style="font-size:11px;color:#6b7280;">Score: <strong style="color:#dc2626;">${e.score}</strong></span>
          </div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">${e.role || 'Role unspecified'} | ${e.type} | ${e.connCount} connections, ${e.eventMentions} event mentions</div>
          ${e.description ? `<div style="font-size:11px;color:#4b5563;margin-top:4px;">${e.description.slice(0, 200)}</div>` : ''}
        </div>
      `).join('')
    },
    {
      title: 'Recommended Actions',
      content: buildRecommendation([
        scored[0] ? `Prioritize investigation of <strong>${scored[0].name}</strong> — highest threat score indicates central role in network.` : '',
        scored.filter(s => s.category !== 'antagonist').length > 0 ? `Review classification of ${scored.filter(s => s.category !== 'antagonist').length} top-ranked entities not yet marked as antagonists.` : '',
        `Cross-reference top threat profiles with compliance violations to establish individual liability.`,
        `Generate Network Intelligence Report for detailed relationship mapping of these entities.`,
        antagonists.length > scored.length ? `${antagonists.length - scored.filter(s => s.category === 'antagonist').length} additional antagonists exist outside top 10 — review for secondary threat assessment.` : '',
      ].filter(Boolean))
    }
  ];

  return buildReportShell({
    title: 'Top 10 Threat Profiles Report',
    subtitle: 'Adversary Intelligence Assessment',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Profiles', value: scored.length },
      { label: 'Antagonists', value: antagonists.length },
      { label: 'Max Score', value: scored[0]?.score || 0 },
    ],
    sections
  });
}
