import { useEffect, useState } from "react";
import humanRightsLogo from "@/assets/human-rights-logo.png";

interface PDFCoverPageProps {
  totalEvents: number;
  dateRange: string;
  caseTitle: string;
}

export const PDFCoverPage = ({ totalEvents, dateRange, caseTitle }: PDFCoverPageProps) => {
  const [userIP, setUserIP] = useState<string>("Detecting...");
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  // Fetch user's IP address
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setUserIP(data.ip);
      } catch {
        setUserIP("Unable to detect");
      }
    };
    fetchIP();
  }, []);

  return (
    <div 
      className="print-only hidden bg-white min-h-screen flex flex-col justify-between p-12"
      style={{ 
        pageBreakAfter: "always",
        backgroundColor: "#ffffff",
        color: "#1a1a1a"
      }}
    >
      {/* Header with Logo */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img 
            src={humanRightsLogo} 
            alt="HRPM Logo" 
            className="h-24 w-auto"
            style={{ filter: "none" }}
          />
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#0087C1" }}>
          HRPM.org
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          Human Rights Protection & Monitoring
        </p>
        <div className="w-32 h-1 bg-[#0087C1] mx-auto mt-4 rounded-full" />
      </div>

      {/* Document Title */}
      <div className="text-center my-12">
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">
          Official Case Timeline Report
        </p>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {caseTitle}
        </h2>
        <p className="text-lg text-gray-600">
          Comprehensive Timeline Documentation
        </p>
        <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-2xl font-bold" style={{ color: "#0087C1" }}>
            {totalEvents}
          </span>
          <span className="text-gray-600">Documented Events</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">{dateRange}</span>
        </div>
      </div>

      {/* Report Generation Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Report Generation Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Generated On</p>
            <p className="font-medium text-gray-900">{formattedDate}</p>
          </div>
          <div>
            <p className="text-gray-500">Generation Time</p>
            <p className="font-medium text-gray-900">{formattedTime}</p>
          </div>
          <div>
            <p className="text-gray-500">Requester IP Address</p>
            <p className="font-medium text-gray-900 font-mono">{userIP}</p>
          </div>
          <div>
            <p className="text-gray-500">Source URL</p>
            <p className="font-medium text-gray-900 break-all">
              {typeof window !== "undefined" ? window.location.href : "https://hrpm.lovable.app"}
            </p>
          </div>
        </div>
      </div>

      {/* Organization Details */}
      <div className="text-center mb-8">
        <p className="text-gray-800 font-semibold">
          Human Rights Protection & Monitoring (HRPM.org)
        </p>
        <p className="text-gray-600 text-sm">
          Independent Public-Interest Documentation & Monitoring Platform
        </p>
        <p className="text-gray-600 mt-2">
          36 Robinson Road, #20-01 City House, Singapore 068877
        </p>
        <p className="text-gray-600">
          Email: info@hrpm.org &nbsp;|&nbsp; Tel: +65 31 290 390
        </p>
      </div>

      {/* Intelligence Classification Banner */}
      <div className="text-center py-3 border-y-2" style={{ borderColor: "#0087C1", backgroundColor: "#f0f9ff" }}>
        <p className="text-[11px] tracking-[3px] uppercase font-bold" style={{ color: "#0087C1" }}>
          PUBLIC INTEREST INTELLIGENCE DOCUMENT
        </p>
        <p className="text-[10px] text-gray-500 mt-1">
          Not Classified • Advocacy Use • Monitoring Record
        </p>
      </div>

      {/* Full Legal Disclaimer */}
      <div className="border-t border-gray-200 pt-6 text-xs text-gray-500 space-y-4">
        <div>
          <p className="font-semibold uppercase tracking-wider mb-2">Legal & Publication Disclaimer</p>
          <p className="leading-relaxed">
            This report has been prepared by Human Rights Protection & Monitoring (HRPM.org) as part of its
            public-interest mandate to document, analyze, and monitor human rights violations, procedural
            irregularities, and institutional misconduct. The contents are based on court filings and judicial
            records, witness statements, official correspondence, open-source intelligence (OSINT), digital
            forensic analysis, and regulatory and statutory frameworks. The findings represent analytical
            conclusions derived from the above sources at the time of publication.
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wider mb-2">Important Notice</p>
          <p className="leading-relaxed">
            Allegations referenced may remain subject to judicial review or appeal. Inclusion of an individual,
            organization, or authority does not constitute a criminal conviction. HRPM does not assert guilt
            beyond what is legally established. This report is not legal advice. Readers are encouraged to
            consult qualified legal professionals where necessary.
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wider mb-2">Accuracy & Corrections</p>
          <p className="leading-relaxed">
            HRPM operates under a corrections and transparency policy. Any party who believes material
            information is inaccurate may submit verifiable documentary evidence, written clarification,
            or legal reference citations. Corrections will be reviewed and updated where appropriate.
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wider mb-2">Confidentiality & Copyright</p>
          <p className="leading-relaxed">
            This report may contain sensitive information related to ongoing legal or advocacy matters.
            Unauthorized alteration, misrepresentation, or selective reproduction is strictly discouraged.
            © {currentDate.getFullYear()} HRPM.org. All rights reserved. No part of this publication may
            be reproduced without prior written permission, except for fair-use academic or journalistic
            citation with proper attribution.
          </p>
        </div>
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="font-semibold text-red-700 mb-2">
            Strictly Confidential – Only for Advocacy Work
          </p>
          <p>© {currentDate.getFullYear()} HRPM.org. All Rights Reserved.</p>
          <p className="mt-1" style={{ color: "#0087C1" }}>
            Documenting injustice. Demanding accountability.
          </p>
          <p className="mt-2 text-[9px] text-gray-400 leading-relaxed max-w-lg mx-auto">
            This site constitutes protected expression under principles of freedom of expression and
            public-interest reporting as recognized under international human rights law, including
            Article 19 of the ICCPR and related frameworks. This publication is issued without malice
            and solely for documentation, transparency, and human rights advocacy purposes.
          </p>
        </div>
      </div>
    </div>
  );
};
