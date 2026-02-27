import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Sparkles, Shield, Globe2, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveGlobe } from "@/components/ui/interactive-globe";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TypingText from "@/components/landing/TypingText";

const GlobeHeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <ScrollReveal delay={100}>
              <Badge
                variant="outline"
                className={cn(
                  "px-4 py-2 bg-primary/10 text-primary border-primary/30",
                  "hover:bg-primary/20 transition-all duration-300 cursor-default"
                )}
              >
                <Shield className="w-3.5 h-3.5 mr-2" />
                Open-Source · Non-Profit · Verified
              </Badge>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">{t('landing.hero.title1')}</span>
                <br />
                <span className="text-foreground">{t('landing.hero.title2')} </span>
                <span className="text-primary relative">
                  {t('landing.hero.title3')}
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="text-lg md:text-xl text-foreground/80 font-medium">
                <span className="text-foreground">{t('landing.hero.typingPrefix')} </span>
                <TypingText
                  words={t('landing.hero.typingWords', { returnObjects: true }) as string[]}
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseDuration={2500}
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <p className="text-base md:text-lg text-foreground/60 max-w-xl leading-relaxed">
                {t('landing.hero.description')}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Button size="lg" className="group relative overflow-hidden" asChild>
                  <Link to="/cases">
                    <span className="relative z-10 flex items-center">
                      {t('landing.hero.cta')}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary hover:text-primary-foreground" asChild>
                  <Link to="/auth">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('landing.hero.startInvestigation')}
                  </Link>
                </Button>
              </div>
            </ScrollReveal>

            {/* Stats row */}
            <ScrollReveal delay={600}>
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10+</div>
                  <div className="text-xs text-muted-foreground">Regions Tracked</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary flex items-center gap-1">
                    <FileSearch className="w-5 h-5" />
                    AI
                  </div>
                  <div className="text-xs text-muted-foreground">Powered Analysis</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-muted-foreground">Open Source</div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — Globe */}
          <ScrollReveal delay={300}>
            <div className="relative flex items-center justify-center lg:justify-end">
              <InteractiveGlobe
                size={520}
                dotColor="rgba(100, 180, 255, ALPHA)"
                arcColor="hsla(var(--primary), 0.4)"
                markerColor="hsla(var(--primary), 1)"
                autoRotateSpeed={0.003}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default GlobeHeroSection;
