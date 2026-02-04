import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Shield, 
  Zap,
  Target,
  Eye,
  Sparkles,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import GlowingOrb from "./GlowingOrb";
import FloatingIcon from "./FloatingIcon";
import ScrollReveal from "./ScrollReveal";
import TrustMetrics from "./TrustMetrics";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <ScrollReveal delay={100}>
            <Badge 
              variant="outline" 
              className={cn(
                "mb-6 px-5 py-2.5 text-sm bg-primary/10 text-primary border-primary/30",
                "hover:bg-primary/20 transition-all duration-300 cursor-default"
              )}
            >
              <Sparkles className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('landing.hero.badge')}
            </Badge>
          </ScrollReveal>

          {/* Main Headline - Using Playfair Display */}
          <ScrollReveal delay={200}>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="block text-foreground mb-2">
                {t('landing.hero.headlineMain', 'Exposing Injustice.')}
              </span>
              <span className="block bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                {t('landing.hero.headlineHighlight', 'Demanding Truth.')}
              </span>
            </h1>
          </ScrollReveal>

          {/* Tagline */}
          <ScrollReveal delay={250}>
            <p className="text-xl md:text-2xl font-medium text-foreground/90 mb-4 tracking-wide">
              {t('landing.hero.subtitle')}
            </p>
          </ScrollReveal>

          {/* Plain-language Subtitle */}
          <ScrollReveal delay={300}>
            <p className="text-base md:text-lg text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.description')}
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button size="lg" className="group relative overflow-hidden h-14 px-8 text-base font-semibold" asChild>
                <Link to="/cases">
                  <span className="relative z-10 flex items-center">
                    {t('landing.hero.cta')}
                    <ArrowRight className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-border/50 hover:border-primary/50 hover:bg-primary/5 h-14 px-8 text-base" asChild>
                <Link to="/auth">
                  <Play className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t('landing.hero.secondaryCta')}
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          {/* Social proof line */}
          <ScrollReveal delay={450}>
            <p className="text-sm text-muted-foreground">
              {t('landing.hero.socialProof', 'Trusted by journalists, legal advocates & human rights researchers worldwide')}
            </p>
          </ScrollReveal>
        </div>

        {/* Trust Metrics */}
        <ScrollReveal delay={500}>
          <div className="mt-16 md:mt-20 max-w-5xl mx-auto">
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
  );
};

export default HeroSection;
