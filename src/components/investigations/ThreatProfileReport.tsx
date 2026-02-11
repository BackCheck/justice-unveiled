import { forwardRef, useEffect, useState } from "react";
import humanRightsLogo from "@/assets/human-rights-logo.png";

interface ThreatProfile {
  entityId: string;
  entityName: string;
  threatLevel: "critical" | "high" | "medium" | "low";
  summary: string;
  motivations: string[];
  tactics: string[];
  connections: string[];
  timeline: string[];
  vulnerabilities: string[];
  recommendations: string[];
}

interface ThreatProfileReportProps {
  profile: ThreatProfile;
}

export const ThreatProfileReport = forwardRef<HTMLDivElement, ThreatProfileReportProps>(
  ({ profile }, ref) => {
    const [userIP, setUserIP] = useState("Detecting...");
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
    });

    useEffect(() => {
      fetch("https://api.ipify.org?format=json")
        .then(r => r.json())
        .then(d => setUserIP(d.ip))
        .catch(() => setUserIP("Unable to detect"));
    }, []);

    const threatColors: Record<string, string> = {
      critical: "#dc2626",
      high: "#ea580c",
      medium: "#ca8a04",
      low: "#16a34a",
    };

    return (
      <div ref={ref} className="hidden print:block bg-white text-gray-900" style={{ fontSize: "12px" }}>
        {/* COVER PAGE */}
        <div className="min-h-screen flex flex-col justify-between p-12" style={{ pageBreakAfter: "always" }}>
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img src={humanRightsLogo} alt="HRPM Logo" className="h-24 w-auto" style={{ filter: "none" }} />
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#0087C1" }}>HRPM.org</h1>
            <p className="text-xl text-gray-600 font-medium">Human Rights Protection Movement</p>
            <div className="w-32 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: "#0087C1" }} />
          </div>

          <div className="text-center my-12">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">
              Threat Intelligence Profile Report
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{profile.entityName}</h2>
            <div
              className="inline-block px-6 py-2 rounded-full text-white font-bold text-lg uppercase tracking-wider"
              style={{ backgroundColor: threatColors[profile.threatLevel] }}
            >
              {profile.threatLevel} Threat Level
            </div>
            <div className="mt-8 inline-flex items-center gap-6 px-8 py-4 bg-gray-50 rounded-lg border border-gray-200">
              <Stat value={profile.motivations.length} label="Motivations" />
              <span className="text-gray-300">|</span>
              <Stat value={profile.tactics.length} label="Tactics" />
              <span className="text-gray-300">|</span>
              <Stat value={profile.connections.length} label="Connections" />
              <span className="text-gray-300">|</span>
              <Stat value={profile.vulnerabilities.length} label="Vulnerabilities" />
            </div>
          </div>

          {/* Generation details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Report Generation Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Generated On" value={formattedDate} />
              <Detail label="Generation Time" value={formattedTime} />
              <Detail label="Requester IP" value={userIP} mono />
              <Detail label="Source URL" value={typeof window !== "undefined" ? window.location.href : "https://hrpm.lovable.app"} />
            </div>
          </div>

          <CoverFooter year={now.getFullYear()} />
        </div>

        {/* EXECUTIVE SUMMARY */}
        <div className="p-12" style={{ pageBreakAfter: "always" }}>
          <SectionHeader title="Executive Summary" number={1} />
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
            <p>{profile.summary}</p>
            <div className="mt-6 p-4 rounded-lg border-l-4" style={{ borderColor: threatColors[profile.threatLevel], backgroundColor: "#fafafa" }}>
              <p className="font-semibold text-gray-900 mb-1">Threat Assessment</p>
              <p>
                This entity has been assessed at <strong style={{ color: threatColors[profile.threatLevel] }}>{profile.threatLevel.toUpperCase()}</strong> threat level
                based on analysis of {profile.motivations.length} suspected motivations, {profile.tactics.length} documented tactics,
                and {profile.connections.length} network connections.
              </p>
            </div>
          </div>
        </div>

        {/* MOTIVATIONS */}
        <div className="p-12" style={{ pageBreakAfter: "always" }}>
          <SectionHeader title="Suspected Motivations" number={2} />
          <div className="space-y-3">
            {profile.motivations.map((m, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-400 font-mono w-6 shrink-0">{i + 1}.</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TACTICS */}
        <div className="p-12" style={{ pageBreakAfter: "always" }}>
          <SectionHeader title="Known Tactics & Patterns" number={3} />
          <div className="space-y-3">
            {profile.tactics.map((t, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-400 font-mono w-6 shrink-0">{i + 1}.</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONNECTIONS */}
        <div className="p-12" style={{ pageBreakAfter: "always" }}>
          <SectionHeader title="Network Connections" number={4} />
          <p className="text-sm text-gray-600 mb-4">
            The following entities have been identified as connected to {profile.entityName} through documented interactions, relationships, or coordinated activities.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {profile.connections.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0087C1" }}>
                  {c.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-800">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VULNERABILITIES */}
        <div className="p-12" style={{ pageBreakAfter: "always" }}>
          <SectionHeader title="Exploitable Vulnerabilities" number={5} />
          <p className="text-sm text-gray-600 mb-4">
            The following vulnerabilities have been identified through analysis of documentary evidence, procedural records, and behavioral patterns.
          </p>
          <div className="space-y-3">
            {profile.vulnerabilities.map((v, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-700 p-3 rounded-lg border-l-4" style={{ borderColor: "#16a34a", backgroundColor: "#f0fdf4" }}>
                <span className="font-bold font-mono w-6 shrink-0" style={{ color: "#16a34a" }}>✓</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="p-12" style={{ pageBreakAfter: "always" }}>
          <SectionHeader title="Strategic Recommendations" number={6} />
          <p className="text-sm text-gray-600 mb-4">
            Based on the comprehensive threat assessment, the following strategic actions are recommended for investigators and legal advocates.
          </p>
          <div className="space-y-3">
            {profile.recommendations.map((r, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-700 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <span className="font-bold font-mono w-6 shrink-0" style={{ color: "#0087C1" }}>{i + 1}.</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CLOSING PAGE */}
        <div className="min-h-screen p-12 flex flex-col justify-center items-center">
          <div className="text-center max-w-lg">
            <div className="w-16 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: "#0087C1" }} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">End of Threat Profile Report</h2>
            <p className="text-gray-600 mb-8">
              This threat intelligence profile for <strong>{profile.entityName}</strong> was generated using
              AI-assisted analysis of case evidence, entity networks, and timeline data. All findings should
              be independently verified before use in legal proceedings.
            </p>
            <CoverFooter year={now.getFullYear()} />
          </div>
        </div>
      </div>
    );
  }
);

ThreatProfileReport.displayName = "ThreatProfileReport";

/* ─── Sub-components ─── */

const Stat = ({ value, label }: { value: number; label: string }) => (
  <div>
    <span className="text-2xl font-bold" style={{ color: "#0087C1" }}>{value}</span>
    <span className="text-gray-600 ml-2">{label}</span>
  </div>
);

const Detail = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className={`font-medium text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</p>
  </div>
);

const SectionHeader = ({ title, number }: { title: string; number: number }) => (
  <div className="flex items-center gap-4 mb-8 pb-4" style={{ borderBottom: "2px solid #0087C1" }}>
    <div className="flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-lg" style={{ backgroundColor: "#0087C1" }}>
      {number}
    </div>
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
  </div>
);

const CoverFooter = ({ year }: { year: number }) => (
  <div className="border-t border-gray-200 pt-6 text-xs text-gray-500 space-y-3">
    <div className="text-center">
      <p className="font-medium text-gray-800">Human Rights Protection Movement</p>
      <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
      <p>Tel: +6531 290 390 | Email: info@hrpm.org</p>
    </div>
    <div className="text-center pt-3 border-t border-gray-100">
      <p className="font-semibold text-red-700 mb-1">Strictly Confidential – Only for Advocacy Work</p>
      <p>© {year} Human Rights Protection Movement. All rights reserved.</p>
      <p className="mt-1" style={{ color: "#0087C1" }}>Documenting injustice. Demanding accountability.</p>
    </div>
  </div>
);
