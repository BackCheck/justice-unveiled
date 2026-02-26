/**
 * Data-rich Case Intelligence Report generator.
 * Pulls actual DB data and renders charts, tables, heatmaps, hierarchy maps etc.
 */

import { supabase } from '@/integrations/supabase/client';
import { buildReportShell, openReportWindow } from './reportShell';
import {
  buildBarChart, buildPieChart, buildStatGrid, buildTable,
  buildTimelineChart, buildSeverityMeter, buildDonutChart,
  buildHierarchyMap, buildHeatmapGrid, buildProgressList, buildKeyValueGrid
} from './reportCharts';
import type { Case } from '@/hooks/useCases';

export async function generateFullCaseReport(caseItem: Case, userIP: string = 'N/A') {
  const caseId = caseItem.id;

  // Fetch all data in parallel
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
    supabase.from('extracted_events').select('*').eq('case_id', caseId).eq('is_hidden', false).order('date'),
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
  const ev = events || [];
  const conn = connections || [];
  const disc = discrepancies || [];
  const viol = violations || [];
  const upl = uploads || [];
  const checks = complianceChecks || [];
  const cl = claims || [];
  const inc = incidents || [];
  const lo = losses || [];

  // ── Derived analytics ──
  const entityTypeDist: Record<string, number> = {};
  const entityCatDist: Record<string, number> = {};
  const entityRoleDist: Record<string, number> = {};
  e.forEach(ent => {
    entityTypeDist[ent.entity_type] = (entityTypeDist[ent.entity_type] || 0) + 1;
    entityCatDist[ent.category || 'neutral'] = (entityCatDist[ent.category || 'neutral'] || 0) + 1;
    if (ent.role) entityRoleDist[ent.role] = (entityRoleDist[ent.role] || 0) + 1;
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
  const topEntities = Object.entries(degreeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([id, count]) => {
      const ent = e.find(x => x.id === id);
      return { name: ent?.name || id, type: ent?.entity_type || '?', role: ent?.role || 'N/A', category: ent?.category || 'neutral', connections: count };
    });

  // Event-entity heatmap (top categories x top years)
  const topCats = Object.entries(eventCatDist).sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => x[0]);
  const topYears = Object.keys(eventYearDist).sort().slice(-8);
  const heatmapData: { row: string; col: string; value: number }[] = [];
  topCats.forEach(cat => {
    topYears.forEach(year => {
      const count = ev.filter(event => event.category === cat && event.date?.startsWith(year)).length;
      heatmapData.push({ row: cat, col: year, value: count });
    });
  });

  // Entity hierarchy by type → top names
  const hierarchyNodes = Object.entries(entityTypeDist).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([type]) => ({
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} (${entityTypeDist[type]})`,
    children: e.filter(x => x.entity_type === type).slice(0, 5).map(x => ({
      name: x.name,
      value: x.role || x.position_title || undefined
    }))
  }));

  // Discrepancy severity
  const discSeverity: Record<string, number> = {};
  disc.forEach(d => { discSeverity[d.severity] = (discSeverity[d.severity] || 0) + 1; });

  // Violation severity
  const violSeverity: Record<string, number> = {};
  viol.forEach(v => { violSeverity[v.severity] = (violSeverity[v.severity] || 0) + 1; });

  // Evidence categories
  const evidCatDist: Record<string, number> = {};
  upl.forEach(u => { evidCatDist[u.category || 'general'] = (evidCatDist[u.category || 'general'] || 0) + 1; });

  // Financial totals
  const totalLoss = lo.reduce((s, l) => s + Number(l.amount || 0), 0);

  // Compliance status
  const compStatus: Record<string, number> = {};
  checks.forEach(c => { compStatus[c.status] = (compStatus[c.status] || 0) + 1; });

  // ── Build Sections ──
  const sections = [
    {
      title: 'Executive Intelligence Summary',
      content:
        `<p style="font-size:13px;color:#374151;line-height:1.8;margin-bottom:16px;">${caseItem.description || 'No description available.'}</p>` +
        buildStatGrid([
          { label: 'Total Events', value: ev.length },
          { label: 'Entities Mapped', value: e.length },
          { label: 'Evidence Sources', value: upl.length },
          { label: 'Network Links', value: conn.length },
          { label: 'Discrepancies', value: disc.length, color: '#d97706' },
          { label: 'Violations', value: viol.length, color: '#dc2626' },
          { label: 'Legal Claims', value: cl.length },
          { label: 'Financial Loss', value: totalLoss > 0 ? `PKR ${totalLoss.toLocaleString()}` : 'N/A', color: '#dc2626' },
        ]) +
        buildKeyValueGrid([
          { key: 'Case Number', value: caseItem.case_number },
          { key: 'Status', value: (caseItem.status || 'N/A').toUpperCase(), highlight: true },
          { key: 'Severity', value: (caseItem.severity || 'N/A').toUpperCase(), highlight: caseItem.severity === 'critical' },
          { key: 'Location', value: caseItem.location || 'N/A' },
          { key: 'Lead Investigator', value: caseItem.lead_investigator || 'N/A' },
          { key: 'Date Opened', value: caseItem.date_opened || 'N/A' },
        ])
    },
    {
      title: 'Intelligence Overview',
      content:
        `<p style="font-size:12px;color:#374151;line-height:1.8;margin-bottom:16px;">This investigation has processed raw documentary evidence from <strong>${upl.length}</strong> source documents. Through systematic AI-assisted analysis, <strong>${ev.length}</strong> discrete timeline events have been reconstructed. A total of <strong>${e.length}</strong> entities have been identified and mapped into a relationship network with <strong>${conn.length}</strong> documented connections.</p>` +
        buildDonutChart(
          Object.entries(eventCatDist).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
          'Events by Category'
        ) +
        buildBarChart(
          Object.entries(eventCatDist).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value })),
          'Top Event Categories'
        )
    },
    {
      title: 'Network & Entity Analysis',
      content:
        buildPieChart(
          Object.entries(entityTypeDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
          'Entity Type Distribution'
        ) +
        buildBarChart(
          Object.entries(entityCatDist).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
          'Entity Alignment (Protagonist / Antagonist / Official / Neutral)'
        ) +
        (Object.keys(entityRoleDist).length > 0 ? buildBarChart(
          Object.entries(entityRoleDist).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([label, value]) => ({ label, value })),
          'Top Roles in Entity Network'
        ) : '') +
        buildHierarchyMap(hierarchyNodes, 'Entity Network Hierarchy (by Type → Key Entities)') +
        (topEntities.length > 0 ? buildTable(
          ['Rank', 'Entity', 'Type', 'Role', 'Category', 'Connections'],
          topEntities.map((t, i) => [
            `#${i + 1}`, t.name, t.type, t.role,
            t.category.charAt(0).toUpperCase() + t.category.slice(1),
            String(t.connections)
          ]),
          'Most Connected Entities (Centrality Ranking)'
        ) : '') +
        (conn.length > 0 ? buildDonutChart(
          Object.entries(connTypeDist).map(([label, value]) => ({ label: label.replace(/_/g, ' '), value })),
          'Connection Types'
        ) : '')
    },
    {
      title: 'Timeline Reconstruction',
      content:
        `<p style="font-size:12px;color:#374151;line-height:1.8;margin-bottom:16px;">The reconstructed timeline spans <strong>${ev.length}</strong> events across <strong>${Object.keys(eventYearDist).length}</strong> years.</p>` +
        buildTimelineChart(
          Object.entries(eventYearDist).sort().map(([year, count]) => ({ year, count })),
          'Event Distribution Over Time'
        ) +
        buildHeatmapGrid(heatmapData, 'Category × Year Activity Heatmap') +
        buildTable(
          ['Date', 'Category', 'Description', 'Individuals', 'Source'],
          ev.slice(0, 50).map(event => [
            event.date || 'N/A',
            event.category,
            (event.description || '').slice(0, 80) + ((event.description || '').length > 80 ? '...' : ''),
            (event.individuals || '').slice(0, 40),
            event.extraction_method === 'ai' ? 'AI' : 'Manual'
          ]),
          `Chronological Event Registry (${ev.length > 50 ? `showing 50 of ${ev.length}` : `${ev.length} events`})`
        )
    },
    {
      title: 'Legal Framework Assessment',
      content:
        (viol.length > 0 ? (
          buildStatGrid([
            { label: 'Total Violations', value: viol.length, color: '#dc2626' },
            { label: 'Critical', value: violSeverity['critical'] || 0, color: '#dc2626' },
            { label: 'High', value: violSeverity['high'] || 0, color: '#d97706' },
            { label: 'Medium', value: violSeverity['medium'] || 0 },
          ]) +
          buildPieChart(
            Object.entries(violSeverity).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
            'Violation Severity Distribution'
          ) +
          buildTable(
            ['Title', 'Type', 'Severity', 'Status', 'Consequence'],
            viol.slice(0, 30).map((v: any) => [
              v.title || 'N/A',
              v.violation_type || 'N/A',
              v.severity || 'N/A',
              v.resolved ? 'Resolved' : 'Active',
              (v.legal_consequence || 'N/A').slice(0, 60)
            ]),
            'Compliance Violations Registry'
          )
        ) : '<p style="color:#059669;font-size:12px;">No compliance violations identified for this case.</p>') +
        (checks.length > 0 ? (
          buildDonutChart(
            Object.entries(compStatus).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
            'Compliance Check Status'
          ) +
          buildProgressList(
            [
              { label: 'Compliant', value: compStatus['compliant'] || 0, max: checks.length, status: 'compliant' },
              { label: 'Non-Compliant', value: compStatus['non_compliant'] || 0, max: checks.length, status: 'violation' },
              { label: 'Pending Review', value: compStatus['pending'] || 0, max: checks.length },
            ],
            'Compliance Overview'
          )
        ) : '')
    },
    {
      title: 'Evidence Correlation & Claims',
      content:
        buildStatGrid([
          { label: 'Evidence Documents', value: upl.length },
          { label: 'Legal Claims', value: cl.length },
          { label: 'Linked Events', value: ev.filter(event => event.source_upload_id).length },
        ]) +
        (upl.length > 0 ? (
          buildPieChart(
            Object.entries(evidCatDist).map(([label, value]) => ({ label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })),
            'Evidence by Category'
          ) +
          buildTable(
            ['File Name', 'Category', 'Type', 'Uploaded'],
            upl.slice(0, 40).map((u: any) => [
              (u.file_name || 'N/A').slice(0, 50),
              (u.category || 'general').replace(/_/g, ' '),
              u.file_type || 'N/A',
              u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
            ]),
            `Evidence Registry (${upl.length > 40 ? `showing 40 of ${upl.length}` : `${upl.length} documents`})`
          )
        ) : '<p style="color:#9ca3af;font-size:12px;">No evidence documents uploaded for this case.</p>') +
        (cl.length > 0 ? buildTable(
          ['Claim', 'Category', 'Status', 'Strength'],
          cl.slice(0, 20).map((c: any) => [
            (c.title || c.claim_text || 'N/A').slice(0, 60),
            c.category || 'N/A',
            c.status || 'N/A',
            c.evidence_strength || 'N/A'
          ]),
          'Legal Claims Matrix'
        ) : '')
    },
    {
      title: 'Discrepancy & Procedural Failures',
      content:
        (disc.length > 0 ? (
          buildStatGrid([
            { label: 'Total Discrepancies', value: disc.length, color: '#d97706' },
            { label: 'Critical', value: discSeverity['critical'] || 0, color: '#dc2626' },
            { label: 'High', value: discSeverity['high'] || 0, color: '#d97706' },
            { label: 'Medium', value: discSeverity['medium'] || 0 },
          ]) +
          buildPieChart(
            Object.entries(discSeverity).map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value })),
            'Discrepancy Severity Breakdown'
          ) +
          buildTable(
            ['Title', 'Type', 'Severity', 'Legal Reference', 'Description'],
            disc.slice(0, 30).map(d => [
              d.title,
              d.discrepancy_type || 'N/A',
              d.severity,
              d.legal_reference || 'N/A',
              (d.description || '').slice(0, 60)
            ]),
            'Procedural Discrepancies Registry'
          )
        ) : '<p style="color:#059669;font-size:12px;">No discrepancies identified.</p>')
    },
    {
      title: 'Regulatory Harm & Financial Impact',
      content:
        (inc.length > 0 || lo.length > 0 ? (
          buildStatGrid([
            { label: 'Harm Incidents', value: inc.length },
            { label: 'Financial Losses', value: lo.length },
            { label: 'Total Loss (PKR)', value: totalLoss > 0 ? `PKR ${totalLoss.toLocaleString()}` : 'N/A', color: '#dc2626' },
          ]) +
          (() => {
            const lossByCat: Record<string, number> = {};
            lo.forEach(l => { lossByCat[l.loss_category || 'Other'] = (lossByCat[l.loss_category || 'Other'] || 0) + Number(l.amount || 0); });
            return Object.keys(lossByCat).length > 0 ? buildBarChart(
              Object.entries(lossByCat).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({
                label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value
              })),
              'Financial Loss by Category (PKR)'
            ) : '';
          })() +
          (inc.length > 0 ? buildTable(
            ['Date', 'Title', 'Type', 'Severity', 'Institution', 'Status'],
            inc.slice(0, 20).map((i: any) => [
              i.incident_date || 'N/A',
              (i.title || 'N/A').slice(0, 40),
              (i.incident_type || '').replace(/_/g, ' '),
              i.severity || 'medium',
              (i.institution_name || 'N/A').slice(0, 30),
              i.status || 'active'
            ]),
            'Regulatory Harm Incidents'
          ) : '')
        ) : '<p style="color:#9ca3af;font-size:12px;">No regulatory harm incidents documented for this case.</p>')
    },
    {
      title: 'Findings & Recommendations',
      content:
        `<div style="margin-bottom:16px;">` +
        buildSeverityMeter('Case Severity', caseItem.severity === 'critical' ? 9 : caseItem.severity === 'high' ? 7 : caseItem.severity === 'medium' ? 5 : 3, 10) +
        buildSeverityMeter('Evidence Coverage', Math.min(upl.length, 10), 10) +
        buildSeverityMeter('Discrepancy Level', Math.min(disc.length, 10), 10) +
        buildSeverityMeter('Violation Severity', Math.min(viol.length, 10), 10) +
        `</div>` +
        buildStatGrid([
          { label: 'Total Events Documented', value: ev.length },
          { label: 'Entities Identified', value: e.length },
          { label: 'Evidence Documents', value: upl.length },
          { label: 'Violations Found', value: viol.length, color: '#dc2626' },
          { label: 'Discrepancies Flagged', value: disc.length, color: '#d97706' },
          { label: 'Active Investigations', value: inc.filter((i: any) => i.status === 'active' || i.status === 'escalated').length },
        ]) +
        `<div style="margin-top:16px;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
          <h4 style="font-size:13px;font-weight:600;color:#1d4ed8;margin-bottom:8px;">Key Findings</h4>
          <ul style="font-size:12px;color:#374151;line-height:1.8;padding-left:16px;">
            ${ev.length > 0 ? `<li>Documented <strong>${ev.length}</strong> events across <strong>${Object.keys(eventYearDist).length}</strong> years, establishing a comprehensive chronological record.</li>` : ''}
            ${e.length > 0 ? `<li>Mapped <strong>${e.length}</strong> entities with <strong>${conn.length}</strong> relationships, revealing network structures and influence patterns.</li>` : ''}
            ${disc.length > 0 ? `<li>Identified <strong>${disc.length}</strong> procedural discrepancies, including <strong>${discSeverity['critical'] || 0}</strong> critical-level issues requiring immediate attention.</li>` : ''}
            ${viol.length > 0 ? `<li>Flagged <strong>${viol.length}</strong> compliance violations against domestic and international legal frameworks.</li>` : ''}
            ${totalLoss > 0 ? `<li>Quantified total financial harm of <strong>PKR ${totalLoss.toLocaleString()}</strong> across <strong>${lo.length}</strong> documented loss categories.</li>` : ''}
            ${upl.length > 0 ? `<li>Preserved <strong>${upl.length}</strong> evidence documents establishing an evidentiary foundation for potential legal proceedings.</li>` : ''}
          </ul>
        </div>`
    }
  ];

  const html = buildReportShell({
    title: 'Official Case Intelligence Report',
    subtitle: caseItem.title,
    caseTitle: caseItem.title,
    caseNumber: caseItem.case_number,
    stats: [
      { label: 'Sources', value: caseItem.total_sources ?? upl.length },
      { label: 'Events', value: caseItem.total_events ?? ev.length },
      { label: 'Entities', value: caseItem.total_entities ?? e.length },
    ],
    sections
  });

  openReportWindow(html);
}
