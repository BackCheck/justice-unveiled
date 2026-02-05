import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookmarkPlus, Search, FileText } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import GlowingOrb from "./GlowingOrb";
import hrpmLogo from "@/assets/human-rights-logo.svg";

const BottomCTA = () => {
  const { t } = useTranslation();

  const accountBenefits = [
    { icon: BookmarkPlus, text: t('landing.cta.benefit1') },
    { icon: Search, text: t('landing.cta.benefit2') },
    { icon: FileText, text: t('landing.cta.benefit3') }
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <GlowingOrb color="primary" size="xl" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative max-w-3xl mx-auto px-4 text-center z-10">
        <ScrollReveal>
          <div className="relative inline-block mb-6">
            <img 
              src={hrpmLogo} 
              alt="HRPM" 
              className="w-16 h-16 mx-auto drop-shadow-[0_0_20px_hsl(var(--primary)/0.3)]" 
            />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.cta.title')} <GradientText>{t('landing.cta.titleHighlight')}</GradientText>?
          </h2>
        </ScrollReveal>
        
        <ScrollReveal delay={200}>
          <p className="text-foreground/70 mb-8 max-w-xl mx-auto text-base leading-relaxed">
            {t('landing.cta.description')}
          </p>
        </ScrollReveal>
        
        <ScrollReveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button size="lg" className="group relative overflow-hidden" asChild>
              <Link to="/cases">
                <span className="relative z-10 flex items-center">
                  {t('landing.cta.primaryButton')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="hover:border-primary/50 hover:bg-primary/5" asChild>
              <Link to="/auth">{t('landing.cta.secondaryButton')}</Link>
            </Button>
          </div>
        </ScrollReveal>

        {/* Account Benefits */}
        <ScrollReveal delay={400}>
          <div className="pt-6 border-t border-border/30">
            <p className="text-sm text-foreground/50 mb-4">{t('landing.cta.whyAccount')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              {accountBenefits.map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-2 text-sm text-foreground/60">
                  <benefit.icon className="w-4 h-4 text-primary" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BottomCTA;