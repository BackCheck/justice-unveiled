import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin, Github, Code, BookOpen, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import hrpmLogo from "@/assets/human-rights-logo.png";

const LandingFooter = () => {
  const { t } = useTranslation();

  const { data: recentPosts } = useQuery({
    queryKey: ["recent-blog-posts-footer"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("title, slug")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  return (
    <footer className="border-t border-border/50 py-16 bg-card/30 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <img src={hrpmLogo} alt="HRPM Logo" className="w-10 h-10 transition-transform group-hover:scale-110" />
              <div>
                <p className="font-semibold text-foreground text-lg">HRPM.org</p>
                <p className="text-xs text-foreground/60">Open-Source · Non-Profit</p>
              </div>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              <span className="block font-medium text-foreground/80">{t('footer.tagline')}</span>
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{t('footer.quickLinks')}</h4>
            <div className="flex flex-col gap-2 text-sm text-foreground/70">
              <Link to="/who-what-why" className="hover:text-primary transition-all duration-300">{t('nav.about')}</Link>
              <Link to="/how-to-use" className="hover:text-primary transition-all duration-300 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> {t('footer.howToUse')}
              </Link>
              <Link to="/cases" className="hover:text-primary transition-all duration-300">{t('cases.title')}</Link>
              <Link to="/" className="hover:text-primary transition-all duration-300">{t('nav.dashboard')}</Link>
              <Link to="/docs" className="hover:text-primary transition-all duration-300 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> {t('footer.fullDocs')}
              </Link>
              <Link to="/api" className="hover:text-primary transition-all duration-300 flex items-center gap-1">
                <Code className="w-3.5 h-3.5" /> {t('footer.api')}
              </Link>
              <Link to="/changelog" className="hover:text-primary transition-all duration-300 flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Changelog
              </Link>
              <a href="https://github.com/BackCheck/justice-unveiled" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-all duration-300 flex items-center gap-1">
                <Github className="w-3.5 h-3.5" /> {t('footer.openSource')}
              </a>
            </div>
          </div>

          {/* Recent Blog Posts */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{t('footer.recentPosts')}</h4>
            <div className="flex flex-col gap-2 text-sm text-foreground/70">
              {recentPosts && recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="hover:text-primary transition-all duration-300 line-clamp-1">
                    {post.title}
                  </Link>
                ))
              ) : (
                <Link to="/blog" className="hover:text-primary transition-all duration-300">{t('footer.visitBlog')}</Link>
              )}
              <Link to="/blog" className="text-primary hover:text-primary/80 transition-all duration-300 font-medium mt-1">
                {t('footer.viewAllPosts')} →
              </Link>
            </div>
          </div>

          {/* Contact & Offices (merged) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{t('footer.contact')}</h4>
            <div className="flex flex-col gap-3 text-sm text-foreground/70">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p>+65 31 290 390</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:info@hrpm.org" className="hover:text-primary transition-colors">info@hrpm.org</a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground/80">{t('footer.headOffice')}</p>
                  <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-xs text-foreground/50">
             © {new Date().getFullYear()} Human Rights Protection Movement. Open-source & non-profit. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 text-xs text-foreground/50">
            <Link to="/who-what-why" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
            <Link to="/who-what-why" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
