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
  Sparkles,
  Zap,
  Target,
  Eye,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import hrpmLogo from "@/assets/human-rights-logo.svg";
import ParticleField from "@/components/landing/ParticleField";
import GlowingOrb from "@/components/landing/GlowingOrb";
import FloatingIcon from "@/components/landing/FloatingIcon";
import ScrollReveal from "@/components/landing/ScrollReveal";
import GradientText from "@/components/landing/GradientText";
import SpotlightEffect from "@/components/landing/SpotlightEffect";
import TrustMetrics from "@/components/landing/TrustMetrics";
import FeaturedCaseSection from "@/components/landing/FeaturedCaseSection";
import CapabilitiesSection from "@/components/landing/CapabilitiesSection";
import BottomCTA from "@/components/landing/BottomCTA";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
              <span className="font-bold text-lg text-foreground tracking-tight">HRPM</span>
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
      <section className="relative min-h-[85vh] flex items-center">
        {/* Animated background orbs */}
        <GlowingOrb color="primary" size="xl" className="top-20 -left-32" delay={0} />
        <GlowingOrb color="accent" size="lg" className="bottom-20 -right-20" delay={1} />
        <GlowingOrb color="chart-2" size="md" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={2} />

        {/* Floating decorative icons */}
        <FloatingIcon icon={Shield} className="top-32 left-[15%] hidden lg:block" delay={0} />
        <FloatingIcon icon={Eye} className="top-48 right-[12%] hidden lg:block" delay={0.5} />
        <FloatingIcon icon={Target} className="bottom-32 left-[8%] hidden lg:block" delay={1} />
        <FloatingIcon icon={Zap} className="bottom-48 right-[18%] hidden lg:block" delay={1.5} />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <ScrollReveal delay={100}>
              <Badge 
                variant="outline" 
                className={cn(
                  "mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/30",
                  "hover:bg-primary/20 transition-all duration-300 cursor-default"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Open-Source Investigative Platform
              </Badge>
            </ScrollReveal>

            {/* Main Headline */}
            <ScrollReveal delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-foreground">Documenting Truth.</span>
                <br />
                <span className="text-foreground">Demanding </span>
                <span className="text-primary relative">
                  Accountability
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                </span>
              </h1>
            </ScrollReveal>

            {/* Plain-language Subtitle */}
            <ScrollReveal delay={300}>
              <p className="text-base md:text-lg text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                An open-source investigative platform for documenting human rights abuse, 
                corruption, and procedural injustice using verified evidence and transparent methodology.
              </p>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="group relative overflow-hidden" asChild>
                  <Link to="/cases">
                    <span className="relative z-10 flex items-center">
                      Explore Case Files
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-border/50 hover:border-primary/50 hover:bg-primary/5" asChild>
                  <Link to="/dashboard">View Intelligence Dashboard</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>

          {/* Trust Metrics - Moved higher */}
          <ScrollReveal delay={500}>
            <div className="mt-16 md:mt-20 max-w-4xl mx-auto">
              <TrustMetrics />
            </div>
          </ScrollReveal>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Section */}
      <FeaturedCaseSection />

      {/* Capabilities Section - Grouped into 3 clusters */}
      <CapabilitiesSection />

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
              <Badge variant="outline" className="mb-4 bg-background border-border/50">OUR MISSION</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Standing for <GradientText>Human Rights</GradientText>
              </h2>
              <p className="text-foreground/70 max-w-2xl mx-auto text-base leading-relaxed">
                HRPM is a non-profit organization dedicated to documenting human rights abuse and supporting 
                those whose fundamental rights have been violated.
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
                  Learn More About Us
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
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
                  <p className="font-semibold text-foreground text-lg">HRPM.org</p>
                  <p className="text-xs text-foreground/60">Human Rights Protection Movement</p>
                </div>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                <span className="block font-medium text-foreground/80">Documenting injustice. Demanding accountability.</span>
                A platform dedicated to exposing human rights violations through investigative intelligence and verified evidence.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-foreground/70">
                <Link to="/about" className="hover:text-primary transition-all duration-300">About Us</Link>
                <Link to="/contact" className="hover:text-primary transition-all duration-300">Contact</Link>
                <Link to="/cases" className="hover:text-primary transition-all duration-300">Case Files</Link>
                <Link to="/dashboard" className="hover:text-primary transition-all duration-300">Dashboard</Link>
                <Link to="/auth" className="hover:text-primary transition-all duration-300">Sign In</Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact</h4>
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
              <h4 className="font-semibold text-foreground">Offices</h4>
              <div className="flex flex-col gap-4 text-sm text-foreground/70">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground/80">Singapore (Head Office)</p>
                    <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground/80">Karachi Office</p>
                    <p>Ground Floor, Zamzam Tower, Building # 1-C, 16th Commercial Street, DHA Phase 2 Extension, Karachi 75500</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-foreground/50">
              © {new Date().getFullYear()} Human Rights Protection Movement. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-foreground/50">
              <Link to="/about" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/about" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
