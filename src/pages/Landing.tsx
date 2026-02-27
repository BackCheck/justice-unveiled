import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  LogOut,
  Code,
  BookOpen,
  Github
} from "lucide-react";
import hrpmLogo from "@/assets/human-rights-logo.png";
import { MotionScrollReveal } from "@/components/ui/motion-scroll-reveal";
import SpotlightEffect from "@/components/landing/SpotlightEffect";
import TrustMetrics from "@/components/landing/TrustMetrics";
import InteractiveHeroModules from "@/components/landing/InteractiveHeroModules";
import FeaturedCasesSection from "@/components/landing/FeaturedCasesSection";
import ViolationMetrics from "@/components/landing/ViolationMetrics";
import BottomCTA from "@/components/landing/BottomCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollReveal from "@/components/landing/ScrollReveal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

const MountainHeroSection = lazy(() => import("@/components/landing/MountainHeroSection"));
const GlobeHeroSection = lazy(() => import("@/components/landing/GlobeHeroSection"));

const Landing = () => {
  useSEO({
    title: "Documenting Injustice, Demanding Accountability",
    description: "HRPM is an open-source, non-profit investigative intelligence platform exposing human rights violations through verified evidence and AI-powered analysis.",
    url: "https://hrpm.org/",
    canonicalUrl: "https://hrpm.org/",
    keywords: ["human rights platform", "investigative intelligence", "open source justice", "evidence analysis", "rights violations"],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "HRPM.org",
      "alternateName": "Human Rights Protection & Monitoring",
      "url": "https://hrpm.org",
      "description": "Open-source investigative intelligence platform documenting injustice and demanding accountability.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://hrpm.org/cases?q={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    },
  });
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Navigation - floating over mountain hero */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/40 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={hrpmLogo} 
                alt="HRPM Logo" 
                className="w-9 h-9 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
              />
            </div>
             <div className="flex flex-col">
               <span className="font-bold text-lg text-foreground tracking-tight">HRPM</span>
               <span className="text-[10px] text-foreground/60 leading-tight">Open-Source · Non-Profit</span>
             </div>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/who-what-why" className="text-sm text-foreground/70 hover:text-primary transition-all duration-300">{t('nav.about')}</Link>
            <Link to="/cases" className="text-sm text-foreground/70 hover:text-primary transition-all duration-300">{t('nav.cases')}</Link>
            <Link to="/docs" className="text-sm text-foreground/70 hover:text-primary transition-all duration-300 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Docs
            </Link>
            <Link to="/api" className="text-sm text-foreground/70 hover:text-primary transition-all duration-300 flex items-center gap-1">
              <Code className="w-3.5 h-3.5" />
              API
            </Link>
            <a 
              href="https://github.com/BackCheck/justice-unveiled" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-foreground/70 hover:text-primary transition-all duration-300 flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <LanguageSwitcher />
            {user ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300" asChild>
                  <Link to="/home">Dashboard</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300" asChild>
                <Link to="/auth">{t('common.signIn')}</Link>
              </Button>
            )}
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            {user ? (
              <Button size="sm" asChild>
                <Link to="/home">Dashboard</Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/auth">{t('common.signIn')}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Section 1: Full-screen Mountain Hero — immediate impact */}
      <Suspense fallback={<div className="w-full h-screen bg-background" />}>
        <MountainHeroSection />
      </Suspense>

      {/* Everything below loads on scroll */}
      <div className="relative">
        <SpotlightEffect size={500} intensity={0.2} />

        {/* Section 2: Globe + Stats */}
        <MotionScrollReveal direction="up" delay={100}>
          <Suspense fallback={<div className="min-h-[85vh] bg-background" />}>
            <GlobeHeroSection />
          </Suspense>
        </MotionScrollReveal>

        {/* Trust Metrics */}
        <ScrollReveal delay={100}>
          <div className="max-w-4xl mx-auto px-4 pb-12">
            <TrustMetrics />
          </div>
        </ScrollReveal>

        {/* Featured Cases */}
        <MotionScrollReveal direction="up" delay={100}>
          <FeaturedCasesSection />
        </MotionScrollReveal>

        {/* Violation Metrics */}
        <MotionScrollReveal direction="up" delay={150}>
          <ViolationMetrics />
        </MotionScrollReveal>

        {/* Interactive Module Explorer */}
        <MotionScrollReveal direction="scale" delay={100}>
          <InteractiveHeroModules />
        </MotionScrollReveal>

        {/* Bottom CTA */}
        <MotionScrollReveal direction="up" delay={200}>
          <BottomCTA />
        </MotionScrollReveal>

        {/* Footer */}
        <LandingFooter />
      </div>
    </div>
  );
};

export default Landing;
