import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Github, Code, BookOpen, History, Rss } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    <footer className="border-t border-border/50 py-12 bg-card/30 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
              <Link to="/who-what-why" className="hover:text-primary transition-all duration-300">Who, What & Why</Link>
              <Link to="/who-what-why" className="hover:text-primary transition-all duration-300">{t('nav.about')}</Link>
              <Link to="/how-to-use" className="hover:text-primary transition-all duration-300">{t('footer.howToUse')}</Link>
              <Link to="/cases" className="hover:text-primary transition-all duration-300">{t('cases.title')}</Link>
              <Link to="/contact" className="hover:text-primary transition-all duration-300">{t('footer.contact')}</Link>
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
        </div>

        {/* Bottom Bar: Copyright + Icon links */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/50">
            © {new Date().getFullYear()} Human Rights Protection Movement. Open-source & non-profit. {t('footer.copyright')}
          </p>
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-3 text-foreground/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/docs" className="hover:text-primary transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('footer.fullDocs')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/api" className="hover:text-primary transition-colors">
                    <Code className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>{t('footer.api')}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/changelog" className="hover:text-primary transition-colors">
                    <History className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent><p>Changelog</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/case-rss-feed`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Rss className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent><p>RSS Feed</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="https://github.com/BackCheck/justice-unveiled" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent><p>{t('footer.openSource')}</p></TooltipContent>
              </Tooltip>

              <span className="text-border">|</span>

              <Link to="/who-what-why" className="text-xs hover:text-primary transition-colors">{t('footer.privacy')}</Link>
              <Link to="/who-what-why" className="text-xs hover:text-primary transition-colors">{t('footer.terms')}</Link>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
