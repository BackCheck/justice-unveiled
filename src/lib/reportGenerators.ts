/**
 * All 8 report generators. Each returns HTML string ready for openReportWindow().
 */

import { buildReportShell } from './reportShell';
import { buildBarChart, buildPieChart, buildStatGrid, buildTable, buildTimelineChart, buildSeverityMeter } from './reportCharts';
import type { CombinedEntity, CombinedConnection } from '@/hooks/useCombinedEntities';
import type { CombinedTimelineEvent } from '@/hooks/useCombinedTimeline';
import type { PlatformStats } from '@/hooks/usePlatformStats';

// ──────────────────────────────────────────
// 1. NETWORK ANALYSIS REPORT
// ──────────────────────────────────────────
export function generateNetworkReport(
  entities: CombinedEntity[],
  connections: CombinedConnection[],
  caseTitle: string,
  caseNumber?: string
): string {
  // Entity type distribution
  const typeDist: Record<string, number> = {};
  entities.forEach(e => { typeDist[e.type] = (typeDist[e.type] || 0) + 1; });

  // Category distribution
  const catDist: Record<string, number> = {};
  entities.forEach(e => { catDist[e.category || 'neutral'] = (catDist[e.category || 'neutral'] || 0) + 1; });

  // Connection type distribution
  const connDist: Record<string, number> = {};
  connections.forEach(c => { connDist[c.type] = (connDist[c.type] || 0) + 1; });

  // Top connected entities (degree centrality)
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

  const sections = [
    {
      title: 'Network Overview',
      content: buildStatGrid([
        { label: 'Total Entities', value: entities.length },
        { label: 'Total Connections', value: connections.length },
        { label: 'AI-Extracted', value: entities.filter(e => e.isAIExtracted).length },
        { label: 'Inferred Links', value: connections.filter(c => c.isInferred).length },
        { label: 'Entity Types', value: Object.keys(typeDist).length },
        { label: 'Avg Connections', value: entities.length ? (connections.length * 2 / entities.length).toFixed(1) : '0' },
      ])
    },
    {
      title: 'Entity Type Distribution',
      content: buildPieChart(
        Object.entries(typeDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Entity Types'
      ) + buildBarChart(
        Object.entries(typeDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Entities by Type'
      )
    },
    {
      title: 'Category Analysis',
      content: buildPieChart(
        Object.entries(catDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Entity Categories (Protagonist / Antagonist / Official / Neutral)'
      )
    },
    {
      title: 'Connection Analysis',
      content: buildBarChart(
        Object.entries(connDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Connection Types'
      )
    },
    {
      title: 'Top 10 Most Connected Entities (Centrality)',
      content: buildTable(
        ['Rank', 'Entity', 'Role', 'Category', 'Connections'],
        topConnected.map((e, i) => [
          `#${i + 1}`,
          e.name,
          e.role,
          e.category.charAt(0).toUpperCase() + e.category.slice(1),
          String(e.connections)
        ])
      )
    },
    {
      title: 'Complete Entity Registry',
      content: buildTable(
        ['Name', 'Type', 'Role', 'Category', 'AI-Extracted'],
        entities.slice(0, 100).map(e => [
          e.name,
          e.type,
          e.role || 'N/A',
          (e.category || 'neutral').charAt(0).toUpperCase() + (e.category || 'neutral').slice(1),
          e.isAIExtracted ? '✓ AI' : 'Manual'
        ])
      ) + (entities.length > 100 ? `<p style="color:#9ca3af;font-size:11px;text-align:center;">Showing 100 of ${entities.length} entities</p>` : '')
    },
    {
      title: 'Connection Registry',
      content: buildTable(
        ['Source', 'Target', 'Type', 'Strength', 'Source'],
        connections.slice(0, 80).map(c => {
          const src = entities.find(e => e.id === c.source);
          const tgt = entities.find(e => e.id === c.target);
          return [
            src?.name || c.source,
            tgt?.name || c.target,
            c.type,
            String(c.strength),
            c.isInferred ? 'Inferred' : 'Documented'
          ];
        })
      )
    }
  ];

  return buildReportShell({
    title: 'Network Analysis Report',
    subtitle: 'Entity Relationship Intelligence',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Entities', value: entities.length },
      { label: 'Connections', value: connections.length },
      { label: 'AI-Extracted', value: entities.filter(e => e.isAIExtracted).length },
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
  // Group violations by framework
  const byFramework: Record<string, any[]> = {};
  violations.forEach(v => {
    const fw = v.framework || v.legal_framework || 'Unknown';
    if (!byFramework[fw]) byFramework[fw] = [];
    byFramework[fw].push(v);
  });

  // Severity distribution
  const bySeverity: Record<string, number> = {};
  violations.forEach(v => {
    const s = v.severity || 'medium';
    bySeverity[s] = (bySeverity[s] || 0) + 1;
  });

  const sections = [
    {
      title: 'Violations Overview',
      content: buildStatGrid([
        { label: 'Total Violations', value: violations.length, color: '#dc2626' },
        { label: 'Frameworks Breached', value: Object.keys(byFramework).length },
        { label: 'Critical', value: bySeverity['critical'] || 0, color: '#dc2626' },
        { label: 'High Severity', value: bySeverity['high'] || 0, color: '#d97706' },
      ])
    },
    {
      title: 'Violations by International Framework',
      content: buildBarChart(
        Object.entries(byFramework).map(([label, items]) => ({ label, value: items.length })),
        'Framework Breakdown'
      )
    },
    {
      title: 'Severity Distribution',
      content: buildPieChart(
        Object.entries(bySeverity).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Violation Severity Levels'
      )
    },
    {
      title: 'Detailed Violations Registry',
      content: Object.entries(byFramework).map(([fw, items]) =>
        `<h4 style="font-size:14px;color:#0087C1;margin:20px 0 8px;border-left:3px solid #0087C1;padding-left:8px;">${fw} (${items.length} violations)</h4>` +
        buildTable(
          ['Article', 'Violation', 'Severity', 'Status'],
          items.map((v: any) => [
            v.article || v.legal_section || 'N/A',
            v.title || v.description?.slice(0, 80) || 'N/A',
            v.severity || 'medium',
            v.status || v.resolved ? 'Resolved' : 'Active'
          ])
        )
      ).join('')
    },
    {
      title: 'Timeline of Violations',
      content: (() => {
        const byYear: Record<string, number> = {};
        events.forEach(e => {
          const y = e.date?.split('-')[0] || 'Unknown';
          byYear[y] = (byYear[y] || 0) + 1;
        });
        return buildTimelineChart(
          Object.entries(byYear).sort().map(([year, count]) => ({ year, count })),
          'Events by Year'
        );
      })()
    }
  ];

  return buildReportShell({
    title: 'International Human Rights Violations Report',
    subtitle: 'Rights Framework Analysis',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Violations', value: violations.length },
      { label: 'Frameworks', value: Object.keys(byFramework).length },
      { label: 'Critical', value: bySeverity['critical'] || 0 },
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
  // Loss by category
  const byCategory: Record<string, number> = {};
  losses.forEach(l => {
    const cat = l.loss_category || 'Other';
    byCategory[cat] = (byCategory[cat] || 0) + Number(l.amount);
  });

  // Incident types
  const byType: Record<string, number> = {};
  incidents.forEach(i => {
    byType[i.incident_type] = (byType[i.incident_type] || 0) + 1;
  });

  // Severity breakdown
  const bySeverity: Record<string, number> = {};
  incidents.forEach(i => {
    bySeverity[i.severity || 'medium'] = (bySeverity[i.severity || 'medium'] || 0) + 1;
  });

  const totalLoss = losses.reduce((s: number, l: any) => s + Number(l.amount), 0);
  const formatPKR = (v: number) => `PKR ${v.toLocaleString()}`;

  const sections = [
    {
      title: 'Financial Impact Summary',
      content: buildStatGrid([
        { label: 'Total Financial Loss', value: formatPKR(totalLoss), color: '#dc2626' },
        { label: 'Total Incidents', value: incidents.length },
        { label: 'Active Incidents', value: incidents.filter((i: any) => i.status === 'active' || i.status === 'escalated').length, color: '#d97706' },
        { label: 'Loss Categories', value: Object.keys(byCategory).length },
        { label: 'Time Cost', value: stats?.totalTimeCost ? formatPKR(stats.totalTimeCost) : 'N/A' },
        { label: 'Hours Spent', value: stats?.totalTimeSpent?.toLocaleString() || '0' },
      ])
    },
    {
      title: 'Financial Loss by Category',
      content: buildBarChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({
          label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value
        })),
        'Loss Distribution (PKR)', { suffix: '' }
      ) + buildPieChart(
        Object.entries(byCategory).map(([label, value]) => ({
          label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value
        })),
        'Proportional Loss Breakdown'
      )
    },
    {
      title: 'Incident Type Analysis',
      content: buildBarChart(
        Object.entries(byType).map(([label, value]) => ({
          label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value
        })),
        'Incidents by Type'
      )
    },
    {
      title: 'Severity Assessment',
      content: buildPieChart(
        Object.entries(bySeverity).map(([label, value]) => ({
          label: label.charAt(0).toUpperCase() + label.slice(1),
          value
        })),
        'Incident Severity Distribution'
      )
    },
    {
      title: 'Detailed Incident Registry',
      content: buildTable(
        ['Date', 'Title', 'Type', 'Severity', 'Institution', 'Status'],
        incidents.map((i: any) => [
          i.incident_date || 'N/A',
          i.title || 'Untitled',
          (i.incident_type || '').replace(/_/g, ' '),
          i.severity || 'medium',
          i.institution_name || 'N/A',
          i.status || 'active'
        ])
      )
    },
    {
      title: 'Itemized Financial Losses',
      content: buildTable(
        ['Description', 'Category', 'Amount (PKR)', 'Documented', 'Recurring'],
        losses.map((l: any) => [
          l.description?.slice(0, 60) || 'N/A',
          (l.loss_category || '').replace(/_/g, ' '),
          Number(l.amount).toLocaleString(),
          l.is_documented ? '✓' : '✗',
          l.is_recurring ? `Yes (${l.recurring_frequency || 'periodic'})` : 'No'
        ])
      )
    }
  ];

  return buildReportShell({
    title: 'Economic Harm & Regulatory Impact Report',
    subtitle: 'Financial Damage Assessment',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Total Loss', value: formatPKR(totalLoss) },
      { label: 'Incidents', value: incidents.length },
      { label: 'Categories', value: Object.keys(byCategory).length },
    ],
    sections
  });
}

// ──────────────────────────────────────────
// 4. RECONSTRUCTION REPORT
// ──────────────────────────────────────────
export function generateReconstructionReport(
  events: CombinedTimelineEvent[],
  discrepancies: any[],
  caseTitle: string,
  caseNumber?: string
): string {
  // Events by category
  const byCategory: Record<string, number> = {};
  events.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + 1; });

  // Events by year
  const byYear: Record<string, number> = {};
  events.forEach(e => {
    const y = e.date?.split('-')[0] || 'Unknown';
    byYear[y] = (byYear[y] || 0) + 1;
  });

  // Discrepancy severity
  const discBySeverity: Record<string, number> = {};
  discrepancies.forEach(d => { discBySeverity[d.severity] = (discBySeverity[d.severity] || 0) + 1; });

  const sections = [
    {
      title: 'Reconstruction Overview',
      content: buildStatGrid([
        { label: 'Total Events', value: events.length },
        { label: 'AI-Extracted', value: events.filter(e => e.isExtracted).length },
        { label: 'Categories', value: Object.keys(byCategory).length },
        { label: 'Discrepancies', value: discrepancies.length, color: '#dc2626' },
        { label: 'Critical Issues', value: discrepancies.filter(d => d.severity === 'critical').length, color: '#dc2626' },
        { label: 'Years Covered', value: Object.keys(byYear).length },
      ])
    },
    {
      title: 'Temporal Distribution',
      content: buildTimelineChart(
        Object.entries(byYear).sort().map(([year, count]) => ({ year, count })),
        'Events per Year'
      )
    },
    {
      title: 'Category Breakdown',
      content: buildPieChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
        'Event Categories'
      ) + buildBarChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
        'Events by Category'
      )
    },
    {
      title: 'Procedural Discrepancies & Failures',
      content: buildPieChart(
        Object.entries(discBySeverity).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Discrepancy Severity Distribution'
      ) + buildTable(
        ['Title', 'Type', 'Severity', 'Legal Reference'],
        discrepancies.map(d => [
          d.title,
          d.discrepancy_type || 'N/A',
          d.severity,
          d.legal_reference || 'N/A'
        ])
      )
    },
    {
      title: 'Chronological Event Registry',
      content: buildTable(
        ['Date', 'Category', 'Description', 'Individuals', 'Source'],
        events.slice(0, 150).map(e => [
          e.date || 'N/A',
          e.category,
          e.description.slice(0, 100) + (e.description.length > 100 ? '...' : ''),
          e.individuals?.slice(0, 50) || 'N/A',
          e.isExtracted ? 'AI' : 'Manual'
        ])
      ) + (events.length > 150 ? `<p style="color:#9ca3af;font-size:11px;text-align:center;">Showing 150 of ${events.length} events</p>` : '')
    }
  ];

  return buildReportShell({
    title: 'Timeline Reconstruction & Analysis Report',
    subtitle: 'Event Reconstruction Intelligence',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Events', value: events.length },
      { label: 'Discrepancies', value: discrepancies.length },
      { label: 'Categories', value: Object.keys(byCategory).length },
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

  const topEntities = entities
    .filter(e => e.connections?.length || 0 > 0)
    .slice(0, 15);

  const sections = [
    {
      title: 'Executive Intelligence Summary',
      content: buildStatGrid([
        { label: 'Total Events', value: platformStats.totalEvents },
        { label: 'Total Entities', value: platformStats.totalEntities },
        { label: 'Evidence Sources', value: platformStats.totalSources },
        { label: 'Network Links', value: platformStats.totalConnections },
        { label: 'Discrepancies', value: platformStats.totalDiscrepancies, color: '#d97706' },
        { label: 'Critical Issues', value: platformStats.criticalDiscrepancies, color: '#dc2626' },
        { label: 'Legal Statutes', value: platformStats.legalStatutes },
        { label: 'Compliance Violations', value: platformStats.complianceViolations },
      ])
    },
    {
      title: 'Event Category Intelligence',
      content: buildPieChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
        'Events by Category'
      ) + buildBarChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value })),
        'Top Event Categories'
      )
    },
    {
      title: 'Key Entities of Interest',
      content: buildTable(
        ['Entity', 'Type', 'Role', 'Category'],
        topEntities.map(e => [
          e.name,
          e.type,
          e.role || 'N/A',
          (e.category || 'neutral').charAt(0).toUpperCase() + (e.category || 'neutral').slice(1)
        ])
      )
    },
    {
      title: 'Legal Framework Coverage',
      content: buildStatGrid([
        { label: 'Case Precedents', value: platformStats.totalPrecedents },
        { label: 'Verified Precedents', value: platformStats.verifiedPrecedents },
        { label: 'Legal Statutes', value: platformStats.legalStatutes },
        { label: 'Appeal Summaries', value: platformStats.appealSummaries },
      ])
    },
    {
      title: 'Growth & Activity Metrics',
      content: buildStatGrid([
        { label: 'Events Growth (WoW)', value: platformStats.eventsGrowth !== null ? `${platformStats.eventsGrowth}%` : 'N/A' },
        { label: 'Entities Growth (WoW)', value: platformStats.entitiesGrowth !== null ? `${platformStats.entitiesGrowth}%` : 'N/A' },
        { label: 'Sources Growth (WoW)', value: platformStats.sourcesGrowth !== null ? `${platformStats.sourcesGrowth}%` : 'N/A' },
        { label: 'Connections Growth (WoW)', value: platformStats.connectionsGrowth !== null ? `${platformStats.connectionsGrowth}%` : 'N/A' },
      ])
    }
  ];

  return buildReportShell({
    title: 'Intelligence Briefing Report',
    subtitle: 'Case Intelligence Overview',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Events', value: platformStats.totalEvents },
      { label: 'Entities', value: platformStats.totalEntities },
      { label: 'Sources', value: platformStats.totalSources },
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
  // By category
  const byCat: Record<string, number> = {};
  uploads.forEach(u => { byCat[u.category || 'general'] = (byCat[u.category || 'general'] || 0) + 1; });

  // By file type
  const byType: Record<string, number> = {};
  uploads.forEach(u => {
    const ext = u.file_name?.split('.').pop()?.toUpperCase() || u.file_type || 'Unknown';
    byType[ext] = (byType[ext] || 0) + 1;
  });

  // Total size
  const totalSize = uploads.reduce((s: number, u: any) => s + (Number(u.file_size) || 0), 0);
  const formatSize = (b: number) => b > 1e9 ? `${(b/1e9).toFixed(1)} GB` : b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1e3).toFixed(1)} KB`;

  const sections = [
    {
      title: 'Evidence Overview',
      content: buildStatGrid([
        { label: 'Total Documents', value: uploads.length },
        { label: 'Total Size', value: formatSize(totalSize) },
        { label: 'Categories', value: Object.keys(byCat).length },
        { label: 'Linked Events', value: events.length },
      ])
    },
    {
      title: 'Evidence by Category',
      content: buildPieChart(
        Object.entries(byCat).map(([label, value]) => ({ label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })),
        'Document Categories'
      )
    },
    {
      title: 'File Type Distribution',
      content: buildBarChart(
        Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
        'File Types'
      )
    },
    {
      title: 'Evidence-to-Event Coverage',
      content: (() => {
        const eventCoverage = events.filter(e => !e.isExtracted).length;
        const aiEvents = events.filter(e => e.isExtracted).length;
        return buildStatGrid([
          { label: 'Manual Events', value: eventCoverage },
          { label: 'AI-Extracted Events', value: aiEvents },
          { label: 'Coverage Ratio', value: uploads.length > 0 ? `${((events.length / uploads.length) * 100).toFixed(0)}%` : 'N/A' },
        ]);
      })()
    },
    {
      title: 'Complete Evidence Registry',
      content: buildTable(
        ['File Name', 'Type', 'Category', 'Size', 'Uploaded'],
        uploads.slice(0, 100).map((u: any) => [
          u.file_name?.slice(0, 40) || 'N/A',
          u.file_type || 'N/A',
          u.category || 'general',
          formatSize(Number(u.file_size) || 0),
          u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
        ])
      )
    }
  ];

  return buildReportShell({
    title: 'Evidence Matrix Report',
    subtitle: 'Document & Evidence Analysis',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Documents', value: uploads.length },
      { label: 'Total Size', value: formatSize(totalSize) },
      { label: 'Categories', value: Object.keys(byCat).length },
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

  const entityCategories: Record<string, number> = {};
  entities.forEach(e => { entityCategories[e.category || 'neutral'] = (entityCategories[e.category || 'neutral'] || 0) + 1; });

  const sections = [
    {
      title: 'Investigation Dashboard',
      content: buildStatGrid([
        { label: 'Total Events', value: platformStats.totalEvents },
        { label: 'Total Entities', value: platformStats.totalEntities },
        { label: 'Evidence Sources', value: platformStats.totalSources },
        { label: 'Network Links', value: platformStats.totalConnections },
        { label: 'Discrepancies', value: platformStats.totalDiscrepancies, color: '#d97706' },
        { label: 'Compliance Violations', value: platformStats.complianceViolations, color: '#dc2626' },
      ])
    },
    {
      title: 'Event Distribution Over Time',
      content: buildTimelineChart(
        Object.entries(byYear).sort().map(([year, count]) => ({ year, count })),
        'Events Timeline'
      )
    },
    {
      title: 'Category Intelligence',
      content: buildPieChart(
        Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
        'Event Categories'
      )
    },
    {
      title: 'Entity Intelligence',
      content: buildPieChart(
        Object.entries(entityCategories).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Entity Alignment'
      ) + buildBarChart(
        Object.entries(entityCategories).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
        'Entity Distribution'
      )
    },
    {
      title: 'Network Summary',
      content: buildStatGrid([
        { label: 'Entity Network Size', value: entities.length },
        { label: 'Connection Density', value: entities.length > 1 ? ((connections.length * 2) / (entities.length * (entities.length - 1)) * 100).toFixed(2) + '%' : 'N/A' },
        { label: 'Inferred Links', value: connections.filter(c => c.isInferred).length },
        { label: 'Documented Links', value: connections.filter(c => !c.isInferred).length },
      ])
    },
    {
      title: 'Discrepancy Analysis',
      content: (() => {
        const bySeverity: Record<string, number> = {};
        discrepancies.forEach(d => { bySeverity[d.severity] = (bySeverity[d.severity] || 0) + 1; });
        return buildPieChart(
          Object.entries(bySeverity).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
          'Discrepancy Severity'
        ) + buildTable(
          ['Title', 'Type', 'Severity', 'Legal Ref'],
          discrepancies.slice(0, 20).map(d => [d.title, d.discrepancy_type || 'N/A', d.severity, d.legal_reference || 'N/A'])
        );
      })()
    }
  ];

  return buildReportShell({
    title: 'Investigation Hub Report',
    subtitle: 'Comprehensive Investigation Analysis',
    caseTitle,
    caseNumber,
    stats: [
      { label: 'Events', value: platformStats.totalEvents },
      { label: 'Entities', value: platformStats.totalEntities },
      { label: 'Discrepancies', value: platformStats.totalDiscrepancies },
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
  // Find antagonist entities with most connections
  const antagonists = entities.filter(e => e.category === 'antagonist');
  
  // Score entities by connections + event mentions
  const scored = entities.map(e => {
    const connCount = connections.filter(c => c.source === e.id || c.target === e.id).length;
    const eventMentions = events.filter(ev => 
      ev.individuals?.toLowerCase().includes(e.name.toLowerCase().split(' ')[0])
    ).length;
    return { ...e, score: connCount * 2 + eventMentions, connCount, eventMentions };
  }).sort((a, b) => b.score - a.score).slice(0, 10);

  const sections = [
    {
      title: 'Threat Assessment Overview',
      content: buildStatGrid([
        { label: 'Entities Assessed', value: entities.length },
        { label: 'Antagonists Identified', value: antagonists.length, color: '#dc2626' },
        { label: 'Top Threat Score', value: scored[0]?.score || 0 },
        { label: 'Total Connections', value: connections.length },
      ])
    },
    {
      title: 'Top 10 Threat Profiles',
      content: scored.map((e, i) => `
        <div style="margin:16px 0;padding:16px;border:1px solid #e5e7eb;border-radius:8px;${e.category === 'antagonist' ? 'border-left:4px solid #dc2626;' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <span style="font-weight:700;font-size:14px;color:#1f2937;">#${i + 1} ${e.name}</span>
              <span style="margin-left:8px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;background:${e.category === 'antagonist' ? '#fef2f2' : '#f0fdf4'};color:${e.category === 'antagonist' ? '#dc2626' : '#059669'};">${(e.category || 'neutral').toUpperCase()}</span>
            </div>
            <div style="font-size:12px;color:#6b7280;">Threat Score: <strong style="color:#dc2626;">${e.score}</strong></div>
          </div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">${e.role || 'Role unspecified'} | ${e.type}</div>
          <div style="font-size:11px;color:#4b5563;">${e.description || 'No description available'}</div>
          ${buildSeverityMeter('Network Influence', Math.min(e.connCount, 10), 10)}
          ${buildSeverityMeter('Event Mentions', Math.min(e.eventMentions, 20), 20)}
        </div>
      `).join('')
    },
    {
      title: 'Threat Category Distribution',
      content: (() => {
        const catDist: Record<string, number> = {};
        scored.forEach(e => { catDist[e.category || 'neutral'] = (catDist[e.category || 'neutral'] || 0) + 1; });
        return buildPieChart(
          Object.entries(catDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
          'Top 10 by Category'
        );
      })()
    },
    {
      title: 'Threat Score Ranking',
      content: buildBarChart(
        scored.map(e => ({ label: e.name, value: e.score })),
        'Composite Threat Score (Connections × 2 + Event Mentions)'
      )
    },
    {
      title: 'Connection Analysis',
      content: buildTable(
        ['Entity', 'Connections', 'Event Mentions', 'Score', 'Category', 'Type'],
        scored.map(e => [
          e.name,
          String(e.connCount),
          String(e.eventMentions),
          String(e.score),
          (e.category || 'neutral').charAt(0).toUpperCase() + (e.category || 'neutral').slice(1),
          e.type
        ])
      )
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
