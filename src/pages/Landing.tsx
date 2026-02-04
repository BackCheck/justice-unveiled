import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Shield, 
  Scale, 
  Users,
  FileText,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import hrpmLogo from "@/assets/human-rights-logo.svg";
import ParticleField from "@/components/landing/ParticleField";
import SpotlightEffect from "@/components/landing/SpotlightEffect";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturedCaseSection from "@/components/landing/FeaturedCaseSection";
import CapabilitiesSection from "@/components/landing/CapabilitiesSection";
import WhySignUpSection from "@/components/landing/WhySignUpSection";
import ImpactStatsSection from "@/components/landing/ImpactStatsSection";
import BottomCTA from "@/components/landing/BottomCTA";
import ScrollReveal from "@/components/landing/ScrollReveal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CookieConsent from "@/components/CookieConsent";

const Landing = () => {
  const { t } = useTranslation();

  const values = [
    { icon: Scale, title: t('landing.values.justice'), description: t('landing.values.justiceDesc') },
    { icon: Shield, title: t('landing.values.protection'), description: t('landing.values.protectionDesc') },
    { icon: FileText, title: t('landing.values.transparency'), description: t('landing.values.transparencyDesc') },
    { icon: Users, title: t('landing.values.solidarity'), description: t('landing.values.solidarityDesc') }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Mouse-following spotlight - entire page */}
      <SpotlightEffect size={500} intensity={0.2} />
      
      {/* Particle Background */}
      <ParticleField />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={hrpmLogo} 
                alt="HRPM Logo" 
                className="w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-foreground tracking-tight">HRPM</span>
              <span className="text-[10px] text-foreground/60 leading-tight">Human Rights Protection Movement</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/about" className="text-sm text-foreground/70 hover:text-primary transition-all duration-300">{t('nav.about')}</Link>
            <Link to="/cases" className="text-sm text-foreground/70 hover:text-primary transition-all duration-300">{t('nav.cases')}</Link>
            <Link to="/dashboard" className="text-sm text-foreground/70 hover:text-primary transition-all duration-300">{t('nav.dashboard')}</Link>
            <Link to="/contact" className="text-sm text-foreground/70 hover:text-primary transition-all duration-300">{t('nav.contact')}</Link>
            <LanguageSwitcher />
            <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300" asChild>
              <Link to="/auth">{t('common.signIn')}</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <Button size="sm" asChild>
              <Link to="/cases">{t('common.explore')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Featured Case Section */}
      <FeaturedCaseSection />

      {/* Impact Stats */}
      <ImpactStatsSection />

      {/* Capabilities Section */}
      <CapabilitiesSection />

      {/* Why Sign Up */}
      <WhySignUpSection />

      {/* Values Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-background border-border/50">{t('about.mission').toUpperCase()}</Badge>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                {t('landing.hero.title')}
              </h2>
              <p className="text-foreground/70 max-w-2xl mx-auto text-base leading-relaxed">
                {t('about.missionText')}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <ScrollReveal key={value.title} delay={index * 100} direction="scale">
                <Card 
                  className={cn(
                    "border-border/50 bg-card/80 backdrop-blur text-center",
                    "hover:border-primary/30 transition-all duration-500",
                    "group cursor-default hover:-translate-y-2"
                  )}
                >
                  <CardContent className="p-6">
                    <div className={cn(
                      "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4",
                      "group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300",
                      "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                    )}>
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">{value.title}</h3>
                    <p className="text-sm text-foreground/60">{value.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="text-center mt-10">
              <Link to="/about">
                <Button variant="outline" className="group hover:border-primary/50">
                  {t('common.learnMore')}
                  <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <BottomCTA />

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 bg-card/30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <img 
                  src={hrpmLogo} 
                  alt="HRPM Logo" 
                  className="w-10 h-10 transition-transform group-hover:scale-110" 
                />
                <div>
                  <p className="font-serif font-semibold text-foreground text-lg">HRPM.org</p>
                  <p className="text-xs text-foreground/60">{t('landing.hero.title')}</p>
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
                <Link to="/about" className="hover:text-primary transition-all duration-300">{t('nav.about')}</Link>
                <Link to="/contact" className="hover:text-primary transition-all duration-300">{t('nav.contact')}</Link>
                <Link to="/cases" className="hover:text-primary transition-all duration-300">{t('nav.cases')}</Link>
                <Link to="/dashboard" className="hover:text-primary transition-all duration-300">{t('nav.dashboard')}</Link>
                <Link to="/auth" className="hover:text-primary transition-all duration-300">{t('common.signIn')}</Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">{t('footer.contact')}</h4>
              <div className="flex flex-col gap-3 text-sm text-foreground/70">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p>+65 31 290 390</p>
                    <p>+92-21-35891281-83</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href="mailto:info@hrpm.org" className="hover:text-primary transition-colors">info@hrpm.org</a>
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">{t('footer.offices')}</h4>
              <div className="flex flex-col gap-4 text-sm text-foreground/70">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground/80">{t('footer.headOffice')}</p>
                    <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground/80">{t('footer.karachiOffice')}</p>
                    <p>Ground Floor, Zamzam Tower, Building # 1-C, 16th Commercial Street, DHA Phase 2 Extension, Karachi 75500</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-foreground/50">
              © {new Date().getFullYear()} {t('landing.hero.title')}. {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-4 text-xs text-foreground/50">
              <Link to="/about" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
              <Link to="/about" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
};

export default Landing;
