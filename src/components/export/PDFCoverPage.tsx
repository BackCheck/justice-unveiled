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
          Human Rights Protection Movement
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

      {/* Singapore Office */}
      <div className="text-center mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Head Office
        </h3>
        <p className="text-gray-800 font-medium">
          Human Rights Protection Movement
        </p>
        <p className="text-gray-600">
          36 Robinson Road, #20-01 City House
        </p>
        <p className="text-gray-600">
          Singapore 068877
        </p>
        <p className="text-gray-600 mt-2">
          Tel: +6531 290 390 | Email: info@hrpm.org
        </p>
      </div>

      {/* Disclaimer and Copyright */}
      <div className="border-t border-gray-200 pt-6 text-xs text-gray-500 space-y-4">
        <div>
          <p className="font-semibold uppercase tracking-wider mb-2">Disclaimer</p>
          <p className="leading-relaxed">
            This document is prepared by the Human Rights Protection Movement (HRPM) for informational 
            and legal reference purposes only. All dates, events, and information contained herein are 
            based on official court documents, FIR records, and verified testimonies. This report does 
            not constitute legal advice. HRPM makes no representations or warranties regarding the 
            accuracy, completeness, or suitability of this information. Recipients should seek independent 
            legal counsel for specific legal matters.
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wider mb-2">Confidentiality Notice</p>
          <p className="leading-relaxed">
            The information contained in this report may be privileged and confidential. Unauthorized 
            reproduction, distribution, or disclosure is strictly prohibited. This document is logged 
            with the requester's IP address and timestamp for audit purposes.
          </p>
        </div>
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="font-semibold text-red-700 mb-2">
            Strictly Confidential – Only for Advocacy Work
          </p>
          <p>© {currentDate.getFullYear()} Human Rights Protection Movement. All rights reserved.</p>
          <p className="mt-1" style={{ color: "#0087C1" }}>
            Documenting injustice. Demanding accountability.
          </p>
        </div>
      </div>
    </div>
  );
};
