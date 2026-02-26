import { useMemo } from "react";
import { useCombinedTimeline, CombinedTimelineEvent } from "./useCombinedTimeline";

/**
 * Single source of truth for report-ready timeline events.
 * Used by ALL PDF export paths (Timeline page, Case Profile, etc.)
 * Filters: hidden events excluded, sorted chronologically, non-admin view.
 */
export function useReportTimeline() {
  const { events, stats, isLoading } = useCombinedTimeline(false); // never include hidden

  const reportEvents = useMemo(() => {
    return events.filter((e) => !e.isHidden);
  }, [events]);

  const reportStats = useMemo(() => {
    const byCategory: Record<string, number> = {};
    reportEvents.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    });
    return {
      total: reportEvents.length,
      extracted: reportEvents.filter((e) => e.isExtracted).length,
      static: reportEvents.filter((e) => !e.isExtracted).length,
      byCategory,
    };
  }, [reportEvents]);

  return { events: reportEvents, stats: reportStats, isLoading };
}

/**
 * Helper: filter placeholder/empty values from report fields
 */
export function isEmptyValue(val: string | null | undefined): boolean {
  if (!val) return true;
  const lower = val.trim().toLowerCase();
  return ["none", "n/a", "none noted", "na", "nil", "—", "-", ""].includes(lower);
}

/**
 * Generates HTML for timeline events in a compact table format.
 * This is the SINGLE rendering engine used by all PDF exports.
 */
export function buildTimelineHTML(events: CombinedTimelineEvent[]): string {
  const eventsByYear: Record<string, CombinedTimelineEvent[]> = {};
  events.forEach((e) => {
    const year = e.date?.split("-")[0] || "Unknown";
    if (!eventsByYear[year]) eventsByYear[year] = [];
    eventsByYear[year].push(e);
  });

  const sortedYears = Object.keys(eventsByYear).sort();

  return sortedYears
    .map((year) => {
      const yearEvents = eventsByYear[year];
      const eventsRows = yearEvents
        .map(
          (e) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;white-space:nowrap;vertical-align:top;font-family:monospace;font-size:11px;">${e.date || "N/A"}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
            <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#f0f9ff;color:#0369a1;margin-bottom:4px;">${e.category}</span>
            ${e.isExtracted ? '<span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600;background:#fef3c7;color:#92400e;margin-left:4px;">AI</span>' : ""}
            <div style="font-size:12px;color:#1f2937;margin-top:2px;">${e.description}</div>
            ${!isEmptyValue(e.individuals) ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;">Individuals: ${e.individuals}</div>` : ""}
            ${!isEmptyValue(e.legalAction) ? `<div style="font-size:11px;color:#6b7280;">Legal Action: ${e.legalAction}</div>` : ""}
            ${!isEmptyValue(e.outcome) ? `<div style="font-size:11px;color:#6b7280;">Outcome: ${e.outcome}</div>` : ""}
            ${!isEmptyValue(e.evidenceDiscrepancy) ? `<div style="font-size:11px;color:#dc2626;margin-top:4px;">⚠ ${e.evidenceDiscrepancy}</div>` : ""}
          </td>
        </tr>
      `
        )
        .join("");
      return `
        <h3 style="font-size:16px;color:#0087C1;margin:24px 0 8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${year} — ${yearEvents.length} events</h3>
        <table style="width:100%;border-collapse:collapse;">${eventsRows}</table>
      `;
    })
    .join("");
}

/**
 * Full report HTML shell with cover page, TOC, timeline, and closing.
 * Used by the Timeline page PDF export.
 */
export function buildFullTimelineReportHTML(
  events: CombinedTimelineEvent[],
  stats: { total: number; byCategory: Record<string, number> },
  caseTitle: string,
  caseNumber?: string
): string {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
  });

  const dates = events.map((e) => new Date(e.date)).filter((d) => !isNaN(d.getTime())).sort((a, b) => a.getTime() - b.getTime());
  const startYear = dates[0]?.getFullYear() || 2015;
  const endYear = dates[dates.length - 1]?.getFullYear() || 2025;

  const eventsByYear: Record<string, CombinedTimelineEvent[]> = {};
  events.forEach((e) => {
    const year = e.date?.split("-")[0] || "Unknown";
    if (!eventsByYear[year]) eventsByYear[year] = [];
    eventsByYear[year].push(e);
  });
  const sortedYears = Object.keys(eventsByYear).sort();

  const tocHTML = sortedYears
    .map(
      (year, i) =>
        `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;"><span>${i + 1}. <strong>${year}</strong> — Key case developments</span><span style="color:#6b7280;">${eventsByYear[year].length} events</span></div>`
    )
    .join("");

  const categoryStats = Object.entries(stats.byCategory)
    .map(([cat, count]) => `<span style="padding:4px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;font-size:12px;">${cat}: <strong>${count}</strong></span>`)
    .join(" ");

  const timelineHTML = buildTimelineHTML(events);

  return `<!DOCTYPE html>
<html><head><title>Timeline Report — ${caseTitle}</title>
<style>
  @media print { @page { margin: 1cm; size: A4; } .page-break { page-break-after: always; } }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #fff; }
</style></head><body>

<!-- COVER -->
<div style="min-height:95vh;display:flex;flex-direction:column;justify-content:space-between;padding:48px;">
  <div style="text-align:center;">
    <img src="https://hrpm.lovable.app/favicon.png" alt="HRPM Logo" style="height:96px;width:auto;margin:0 auto 16px;display:block;" />
    <h1 style="font-size:36px;color:#0087C1;margin:0;">HRPM.org</h1>
    <p style="font-size:18px;color:#6b7280;">Human Rights Protection & Monitoring</p>
    <div style="width:120px;height:4px;background:#0087C1;margin:16px auto;border-radius:4px;"></div>
  </div>
  <div style="text-align:center;margin:48px 0;">
    <p style="font-size:12px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;">Case Timeline Report</p>
    <h2 style="font-size:28px;margin:12px 0;">${caseTitle}</h2>
    ${caseNumber ? `<p style="font-family:monospace;color:#6b7280;font-size:16px;">${caseNumber}</p>` : ""}
    <div style="margin-top:24px;display:inline-flex;gap:32px;padding:16px 32px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
      <div><span style="font-size:24px;font-weight:700;color:#0087C1;">${stats.total}</span> <span style="color:#6b7280;">Events</span></div>
      <div style="color:#d1d5db;">|</div>
      <div><span style="font-size:24px;font-weight:700;color:#0087C1;">${endYear - startYear + 1}</span> <span style="color:#6b7280;">Years</span></div>
    </div>
  </div>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
    <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;margin-bottom:12px;">Report Generation Details</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
      <div><span style="color:#9ca3af;">Generated On:</span> ${formattedDate}</div>
      <div><span style="color:#9ca3af;">Time:</span> ${formattedTime}</div>
      <div><span style="color:#9ca3af;">Timeline Span:</span> ${startYear} – ${endYear}</div>
      <div><span style="color:#9ca3af;">Total Events:</span> ${stats.total}</div>
    </div>
  </div>
  <div style="text-align:center;margin-top:24px;">
    <p style="font-weight:600;color:#1f2937;font-size:13px;">Human Rights Protection & Monitoring</p>
    <p style="font-size:12px;color:#6b7280;">36 Robinson Road, #20-01 City House, Singapore 068877</p>
    <p style="font-size:12px;color:#6b7280;">Tel: +6531 290 390 | Email: info@hrpm.org</p>
  </div>
  <div style="text-align:center;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;">
    <p style="font-size:10px;color:#6b7280;line-height:1.5;">This document is prepared by HRPM for informational and legal reference purposes only.</p>
    <p style="font-weight:600;color:#dc2626;">Strictly Confidential – Only for Advocacy Work</p>
    <p style="color:#6b7280;">© ${now.getFullYear()} Human Rights Protection & Monitoring. All rights reserved.</p>
  </div>
</div>

<div class="page-break"></div>

<!-- TABLE OF CONTENTS -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #0087C1;">
    <h2 style="font-size:22px;margin:0;">Table of Contents</h2>
  </div>
  ${tocHTML}
  <div style="margin-top:32px;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
    <h3 style="font-size:14px;margin:0 0 12px;">Summary Statistics</h3>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">${categoryStats}</div>
  </div>
</div>

<div class="page-break"></div>

<!-- TIMELINE -->
<div style="padding:48px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #0087C1;">
    <h2 style="font-size:22px;margin:0;">Complete Timeline (${stats.total} events)</h2>
  </div>
  ${timelineHTML}
</div>

<div class="page-break"></div>

<!-- CLOSING -->
<div style="min-height:60vh;display:flex;align-items:center;justify-content:center;padding:48px;">
  <div style="text-align:center;max-width:480px;">
    <div style="width:60px;height:4px;background:#0087C1;margin:0 auto 24px;border-radius:4px;"></div>
    <h2 style="font-size:22px;">End of Report</h2>
    <p style="color:#6b7280;font-size:13px;margin:16px 0;">
      This report contains ${stats.total} documented events spanning ${endYear - startYear + 1} years of case history.
    </p>
    <div style="margin-top:16px;font-size:12px;color:#6b7280;">
      <p style="font-weight:600;color:#1f2937;">Human Rights Protection & Monitoring</p>
      <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
      <p>Tel: +6531 290 390 | Email: info@hrpm.org</p>
    </div>
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:16px;font-size:11px;">
      <p style="font-weight:600;color:#dc2626;">Strictly Confidential – Only for Advocacy Work</p>
      <p style="color:#6b7280;">© ${now.getFullYear()} Human Rights Protection & Monitoring. All rights reserved.</p>
      <p style="color:#0087C1;">Documenting injustice. Demanding accountability.</p>
    </div>
  </div>
</div>

<script>window.onload=function(){window.print();}</script>
</body></html>`;
}
