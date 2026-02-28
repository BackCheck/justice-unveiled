import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Globe, Shield } from "lucide-react";
import hrpmLogo from "@/assets/human-rights-logo.png";

export const CaseReportFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border/40 pt-8 pb-6 space-y-6">
      {/* Organization Block */}
      <div className="flex flex-col items-center text-center gap-3">
        <img src={hrpmLogo} alt="HRPM Logo" className="w-10 h-10" />
        <div>
          <p className="font-semibold text-foreground text-sm">Human Rights Protection & Monitoring (HRPM.org)</p>
          <p className="text-xs text-muted-foreground">Independent Public-Interest Documentation & Monitoring Platform</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />36 Robinson Road, #20-01 City House, Singapore 068877</span>
          <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /><a href="mailto:info@hrpm.org" className="hover:text-primary transition-colors">info@hrpm.org</a></span>
          <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />+65 31 290 390</span>
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Short Legal Disclaimer */}
      <div className="max-w-3xl mx-auto text-[11px] leading-relaxed text-muted-foreground text-center space-y-1.5">
        <p>
          This report is published in good faith for public-interest documentation and advocacy purposes.
          The findings reflect analysis of available evidence, witness statements, legal filings, and open-source material at the time of publication.
        </p>
        <p>
          Allegations remain subject to judicial determination where applicable. HRPM does not provide legal advice.
          Requests for corrections may be submitted with verifiable supporting documentation.
        </p>
        <p className="italic">
          This publication is issued without malice and solely for documentation, transparency, and human rights advocacy purposes.
        </p>
      </div>

      <Separator className="opacity-30" />

      {/* Copyright & Tagline */}
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          © {currentYear} HRPM.org. All Rights Reserved.
        </p>
        <p className="text-xs font-medium" style={{ color: "#0087C1" }}>
          Documenting injustice. Demanding accountability.
        </p>
      </div>
    </footer>
  );
};
