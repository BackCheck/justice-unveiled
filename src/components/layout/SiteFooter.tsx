import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Github, Rss, Mail, MapPin, Phone, Shield, Scale, FileText, Globe } from "lucide-react";
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
  const { t } = useTranslation();

  const { data: recentPosts } = useQuery({
    queryKey: ["recent-blog-posts-footer"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("title, slug")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  const menuSections: FooterSection[] = [
    {
      title: "Platform",
      links: [
        { text: "Dashboard", url: "/dashboard" },
        { text: "Case Files", url: "/cases" },
        { text: "Investigations", url: "/investigations" },
        { text: "Entity Network", url: "/network" },
        { text: "Evidence Matrix", url: "/evidence" },
      ],
    },
    {
      title: "Analysis Tools",
      links: [
        { text: "AI Analyzer", url: "/analyze" },
        { text: "Legal Intelligence", url: "/legal-intelligence" },
        { text: "Compliance Checker", url: "/compliance" },
        { text: "Threat Profiler", url: "/threat-profiler" },
        { text: "OSINT Toolkit", url: "/osint-toolkit" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Documentation", url: "/docs" },
        { text: "API Reference", url: "/api" },
        { text: "How to Use", url: "/how-to-use" },
        { text: "Changelog", url: "/changelog" },
        { text: "Report Center", url: "/reports" },
      ],
    },
    {
      title: "Organization",
      links: [
        { text: "About HRPM", url: "/about" },
        { text: "Blog & News", url: "/blog" },
        { text: "Contact", url: "/contact" },
        { text: "GitHub", url: "https://github.com/BackCheck/justice-unveiled", external: true },
        { text: "RSS Feed", url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/case-rss-feed`, external: true },
      ],
    },
  ];

  const bottomLinks: FooterLink[] = [
    { text: "Privacy Policy", url: "/privacy" },
    { text: "Terms of Service", url: "/terms" },
    { text: "Disclaimer", url: "/disclaimer" },
  ];

  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section: Brand + Menu columns */}
        <div className={`pt-10 ${compact ? 'pb-6' : 'pb-8'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center gap-3 group">
                <img
                  src={hrpmLogo}
                  alt="HRPM Logo"
                  className="w-10 h-10 transition-transform group-hover:scale-110"
                />
                <div>
                  <p className="font-bold text-foreground text-lg tracking-tight">HRPM.org</p>
                  <p className="text-xs text-muted-foreground">Open-Source · Non-Profit</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                HRPM is an independent public-interest documentation and monitoring platform.
                We empower advocates, researchers, and legal teams with AI-driven tools to
                document injustice and demand accountability.
              </p>

              {/* Contact info */}
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

              {/* Recent posts */}
              {recentPosts && recentPosts.length > 0 && !compact && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Latest Updates</p>
                  {recentPosts.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="block text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      → {post.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Menu columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
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
            This site constitutes protected expression under principles of freedom of expression and public-interest
            reporting as recognized under international human rights law, including Article 19 of the ICCPR and related
            frameworks. This publication is issued without malice and solely for documentation, transparency, and human
            rights advocacy purposes.
          </p>
          <p className="text-xs font-medium mt-2" style={{ color: "#0087C1" }}>
            Documenting injustice. Demanding accountability.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
