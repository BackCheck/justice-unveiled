import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import hrpmLogo from "@/assets/human-rights-logo.png";

interface FooterLink {
  text: string;
  url: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const SiteFooter = ({ compact = false }: { compact?: boolean }) => {
  const menuSections: FooterSection[] = [
    {
      title: "Platform",
      links: [
        { text: "Case Library", url: "/cases" },
        { text: "Timeline", url: "/timeline" },
        { text: "Submit a Case", url: "/submit-case" },
        { text: "Blog & News", url: "/blog" },
        { text: "Report Center", url: "/reports" },
      ],
    },
    {
      title: "Tools",
      links: [
        { text: "AI Analyzer", url: "/analyze" },
        { text: "Evidence Matrix", url: "/evidence" },
        { text: "Entity Network", url: "/network" },
        { text: "Legal Intelligence", url: "/legal-intelligence" },
        { text: "Compliance Checker", url: "/compliance" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "How to Use", url: "/how-to-use" },
        { text: "Documentation", url: "/docs" },
        { text: "Developer API", url: "/api" },
        { text: "About", url: "/about" },
        { text: "Changelog", url: "/changelog" },
        { text: "Commitment", url: "/commitment" },
        { text: "Contact", url: "/contact" },
      ],
    },
  ];

  const bottomLinks: FooterLink[] = [
    { text: "Privacy", url: "/privacy" },
    { text: "Terms", url: "/terms" },
    { text: "Disclaimer", url: "/disclaimer" },
  ];

  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`pt-10 ${compact ? "pb-6" : "pb-8"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <img src={hrpmLogo} alt="HRPM Logo" className="w-10 h-10" />
                <div>
                  <p className="font-bold text-foreground text-lg tracking-tight">HRPM.org</p>
                  <p className="text-xs text-muted-foreground">Open-Source · Non-Profit</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Documenting injustice. Demanding accountability.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span>36 Robinson Road, #20-01 City House, Singapore 068877</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <a href="mailto:info@hrpm.org" className="hover:text-primary transition-colors">info@hrpm.org</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span>+65 31 290 390</span>
                </div>
              </div>
            </div>

            {/* 3 columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
                {menuSections.map((section) => (
                  <div key={section.title}>
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                      {section.title}
                    </h4>
                    <ul className="space-y-2">
                      {section.links.map((link) => (
                        <li key={link.text}>
                          {link.external ? (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {link.text}
                            </a>
                          ) : (
                            <Link
                              to={link.url}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {link.text}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Human Rights Protection & Monitoring (HRPM.org). All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {bottomLinks.map((link) => (
              <Link
                key={link.text}
                to={link.url}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>

        {/* Legal notice */}
        <div className="border-t border-border/20 py-4 text-center">
          <p className="text-[10px] leading-relaxed text-muted-foreground/60 max-w-3xl mx-auto">
            This site constitutes protected expression under Article 19 of the ICCPR. Published without malice, solely for documentation, transparency, and human rights advocacy purposes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
