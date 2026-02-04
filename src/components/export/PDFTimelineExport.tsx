import { PDFCoverPage } from "./PDFCoverPage";
import { TimelineCard } from "@/components/TimelineCard";
import { CombinedTimelineEvent } from "@/hooks/useCombinedTimeline";
import { TimelineEvent } from "@/data/timelineData";

interface PDFTimelineExportProps {
  events: (TimelineEvent | CombinedTimelineEvent)[];
  stats: {
    total: number;
    static: number;
    extracted: number;
    byCategory: Record<string, number>;
  };
}

export const PDFTimelineExport = ({ events, stats }: PDFTimelineExportProps) => {
  // Calculate date range
  const dates = events.map(e => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());
  const startYear = dates[0]?.getFullYear() || 2015;
  const endYear = dates[dates.length - 1]?.getFullYear() || 2025;
  const dateRange = `${startYear} – ${endYear}`;

  // Group events by year for better organization
  const eventsByYear: Record<string, (TimelineEvent | CombinedTimelineEvent)[]> = {};
  events.forEach(event => {
    const year = event.date.split("-")[0];
    if (!eventsByYear[year]) eventsByYear[year] = [];
    eventsByYear[year].push(event);
  });

  const years = Object.keys(eventsByYear).sort();

  return (
    <div className="print-only hidden" id="pdf-export-content">
      {/* Cover Page */}
      <PDFCoverPage 
        totalEvents={stats.total}
        dateRange={dateRange}
        caseTitle="Danish Thanvi vs. State Agencies"
      />

      {/* Table of Contents */}
      <div 
        className="bg-white min-h-screen p-12"
        style={{ 
          pageBreakAfter: "always",
          backgroundColor: "#ffffff",
          color: "#1a1a1a"
        }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: "#0087C1" }}>
          Table of Contents
        </h2>
        <div className="space-y-3">
          {years.map((year, index) => (
            <div 
              key={year} 
              className="flex items-center justify-between py-2 border-b border-gray-100"
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm w-8">{index + 1}.</span>
                <span className="font-medium text-gray-900">{year}</span>
                <span className="text-gray-500">
                  {getYearSummary(year)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {eventsByYear[year].length} event{eventsByYear[year].length !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Summary Statistics</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Events</p>
              <p className="text-2xl font-bold" style={{ color: "#0087C1" }}>{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timeline Span</p>
              <p className="text-2xl font-bold text-gray-900">{endYear - startYear + 1} Years</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 mb-2">Events by Category</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <span 
                    key={category}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
                  >
                    {category}: <strong>{count}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Events by Year */}
      {years.map((year) => (
        <div key={year}>
          {/* Year Header Page */}
          <div 
            className="bg-white p-12"
            style={{ backgroundColor: "#ffffff", color: "#1a1a1a" }}
          >
            <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-[#0087C1]">
              <div 
                className="flex items-center justify-center w-20 h-20 rounded-xl text-white font-bold text-3xl"
                style={{ backgroundColor: "#0087C1" }}
              >
                {year}
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Year</p>
                <p className="text-xl font-medium text-gray-700">{getYearSummary(year)}</p>
                <p className="text-sm text-gray-500">{eventsByYear[year].length} documented events</p>
              </div>
            </div>

            {/* Events for this year */}
            <div className="space-y-6">
              {eventsByYear[year].map((event, index) => {
                const globalIndex = events.indexOf(event);
                return (
                  <div 
                    key={`${event.date}-${index}`} 
                    className="pdf-timeline-card"
                    style={{ pageBreakInside: "avoid" }}
                  >
                    <TimelineCard 
                      event={event} 
                      index={globalIndex}
                      forceExpanded={true}
                      isPrintMode={true}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Footer Page */}
      <div 
        className="bg-white min-h-screen p-12 flex flex-col justify-center items-center"
        style={{ 
          backgroundColor: "#ffffff",
          color: "#1a1a1a"
        }}
      >
        <div className="text-center max-w-lg">
          <div className="w-16 h-1 bg-[#0087C1] mx-auto mb-8 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            End of Report
          </h2>
          <p className="text-gray-600 mb-8">
            This document contains {stats.total} documented events spanning {endYear - startYear + 1} years 
            of case history, compiled from 117 verified sources.
          </p>
          <div className="text-sm text-gray-500">
            <p className="font-medium mb-2">For updates and additional information:</p>
            <p style={{ color: "#0087C1" }}>https://hrpm.lovable.app</p>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Human Rights Protection Movement
            </p>
            <p className="text-xs mt-1" style={{ color: "#0087C1" }}>
              Documenting injustice. Demanding accountability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate year summaries
function getYearSummary(year: string): string {
  const summaries: Record<string, string> = {
    "2015": "Genesis of the professional relationship",
    "2016": "Escalation of harassment and first legal attacks",
    "2017": "FIR registration and FIA involvement begins",
    "2018": "Investigation deepens with witness intimidation",
    "2019": "Midnight raid and arrest phase",
    "2021": "FIA corruption exposed internally",
    "2022": "Forensic analysis reveals chain of custody failures",
    "2023": "Handwriting expert confirms forgeries",
    "2024": "Trial conviction and subsequent bail granted",
    "2025": "Full acquittal and ongoing regulatory battles"
  };
  return summaries[year] || "Key case developments";
}
