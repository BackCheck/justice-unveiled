/**
 * Issue Framing Engine — Builds structured legal issues from case data.
 * Does NOT hallucinate statutes or case law. If anchors not present, states so.
 */

export interface LegalIssue {
  issueId: string;
  title: string;
  category: string;
  legalAnchors: string[];
  evidenceStrength: number; // 0-100
  vulnerabilityScore: number; // 0-100
  relatedAnnexures: string[];
  narrative: string;
}

interface IssueInput {
  violations: Array<{ title?: string; description?: string; severity?: string; framework?: string; article?: string }>;
  discrepancies: Array<{ title?: string; description?: string; severity?: string; discrepancy_type?: string; legal_reference?: string }>;
  entities: Array<{ name: string; category?: string; role?: string }>;
  events: Array<{ date?: string; category?: string; description?: string }>;
  evidence: Array<{ id: string; fileName?: string; category?: string }>;
}

export function buildKeyIssues(input: IssueInput): LegalIssue[] {
  const issues: LegalIssue[] = [];
  let id = 0;

  // Group critical discrepancies by type
  const criticalDisc = input.discrepancies.filter(d => d.severity === 'critical' || d.severity === 'high');
  const discByType: Record<string, typeof criticalDisc> = {};
  criticalDisc.forEach(d => {
    const type = d.discrepancy_type || 'procedural';
    if (!discByType[type]) discByType[type] = [];
    discByType[type].push(d);
  });

  // Issue from discrepancy clusters
  Object.entries(discByType).slice(0, 3).forEach(([type, items]) => {
    const anchors = items
      .map(d => d.legal_reference)
      .filter((r): r is string => !!r && r.trim() !== '');
    
    const evidenceLinked = input.evidence.length > 0;
    
    issues.push({
      issueId: `ISS-${++id}`,
      title: `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} — ${items.length} Instance${items.length > 1 ? 's' : ''}`,
      category: 'Procedural Failure',
      legalAnchors: anchors.length > 0 ? [...new Set(anchors)] : [],
      evidenceStrength: Math.min(90, items.length * 15 + (evidenceLinked ? 30 : 0)),
      vulnerabilityScore: Math.max(10, 100 - items.length * 10),
      relatedAnnexures: [],
      narrative: `${items.length} documented instances of ${type.replace(/_/g, ' ')} have been identified. ${items.slice(0, 2).map(d => d.title).join('; ')}. ${anchors.length > 0 ? `Legal basis: ${anchors.slice(0, 3).join(', ')}.` : 'Legal anchors: Not linked (requires counsel review).'}`,
    });
  });

  // Issue from violations by framework
  const byFramework: Record<string, typeof input.violations> = {};
  input.violations.forEach(v => {
    const fw = v.framework || 'General';
    if (!byFramework[fw]) byFramework[fw] = [];
    byFramework[fw].push(v);
  });

  Object.entries(byFramework).slice(0, 2).forEach(([fw, items]) => {
    const anchors = items
      .map(v => v.article ? `${fw} ${v.article}` : null)
      .filter((a): a is string => !!a);

    issues.push({
      issueId: `ISS-${++id}`,
      title: `${fw} Violations — ${items.length} Breach${items.length > 1 ? 'es' : ''}`,
      category: 'Rights Violation',
      legalAnchors: anchors.length > 0 ? [...new Set(anchors)] : [],
      evidenceStrength: Math.min(85, items.length * 12 + 20),
      vulnerabilityScore: Math.max(15, 90 - items.length * 8),
      relatedAnnexures: [],
      narrative: `${items.length} violations under ${fw} framework have been documented. ${items.filter(v => v.severity === 'critical').length > 0 ? `${items.filter(v => v.severity === 'critical').length} are of critical severity.` : ''} ${anchors.length > 0 ? `Relevant provisions: ${anchors.slice(0, 3).join(', ')}.` : 'Legal anchors: Not linked (requires counsel review).'}`,
    });
  });

  // Issue from hostile entity concentration
  const hostileEntities = input.entities.filter(e => e.category === 'antagonist');
  if (hostileEntities.length > 3) {
    issues.push({
      issueId: `ISS-${++id}`,
      title: `Alleged Coordinated Institutional Action — ${hostileEntities.length} Adversarial Actors`,
      category: 'Pattern of Alleged Targeting',
      legalAnchors: [],
      evidenceStrength: Math.min(80, hostileEntities.length * 8 + 20),
      vulnerabilityScore: 30,
      relatedAnnexures: [],
      narrative: `${hostileEntities.length} entities classified as adversarial (${((hostileEntities.length / Math.max(input.entities.length, 1)) * 100).toFixed(0)}% of ${input.entities.length} total entities). This concentration indicates alleged coordinated institutional action rather than isolated incidents. Legal anchors: Not linked (requires counsel review).`,
    });
  }

  return issues.slice(0, 6);
}

/**
 * Render issues as HTML for report appendix.
 */
export function renderKeyIssuesHTML(issues: LegalIssue[]): string {
  if (issues.length === 0) {
    return '<p style="font-size:12px;color:#6b7280;">No key issues identified from available data.</p>';
  }

  const table = `
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin:12px 0;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600;">ID</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600;">Issue</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600;">Category</th>
          <th style="padding:8px;text-align:center;border-bottom:2px solid #e5e7eb;font-weight:600;">Evidence</th>
          <th style="padding:8px;text-align:center;border-bottom:2px solid #e5e7eb;font-weight:600;">Vulnerability</th>
        </tr>
      </thead>
      <tbody>
        ${issues.map(iss => `
          <tr style="page-break-inside:avoid;">
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-family:monospace;color:#0087C1;font-weight:700;">${iss.issueId}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;font-weight:500;">${iss.title}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">${iss.category}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:center;">
              <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${iss.evidenceStrength >= 70 ? '#f0fdf4' : iss.evidenceStrength >= 40 ? '#fffbeb' : '#fef2f2'};color:${iss.evidenceStrength >= 70 ? '#15803d' : iss.evidenceStrength >= 40 ? '#92400e' : '#dc2626'};">${iss.evidenceStrength}%</span>
            </td>
            <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:center;">
              <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${iss.vulnerabilityScore <= 30 ? '#f0fdf4' : iss.vulnerabilityScore <= 60 ? '#fffbeb' : '#fef2f2'};color:${iss.vulnerabilityScore <= 30 ? '#15803d' : iss.vulnerabilityScore <= 60 ? '#92400e' : '#dc2626'};">${iss.vulnerabilityScore}%</span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const narratives = issues.map((iss, i) => `
    <div style="margin:16px 0;padding:12px 16px;border-left:3px solid #0087C1;background:#f9fafb;border-radius:0 6px 6px 0;page-break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:12px;font-weight:700;color:#1f2937;">${iss.issueId}: ${iss.title}</span>
      </div>
      <p style="font-size:11px;color:#374151;line-height:1.7;margin:4px 0;">${iss.narrative}</p>
      ${iss.legalAnchors.length > 0
        ? `<p style="font-size:10px;color:#0087C1;margin-top:4px;"><strong>Legal Basis:</strong> ${iss.legalAnchors.join(', ')}</p>`
        : `<p style="font-size:10px;color:#d97706;margin-top:4px;font-style:italic;">Legal anchors: Not linked (requires counsel review)</p>`
      }
    </div>
  `).join('');

  return table + narratives;
}
