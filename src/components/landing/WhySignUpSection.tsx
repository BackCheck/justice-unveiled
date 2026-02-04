import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bookmark, 
  Bell, 
  Upload,
  Shield,
  Users,
  FileText,
  ArrowRight,
  Check
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { cn } from "@/lib/utils";

const WhySignUpSection = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Bookmark,
      titleKey: "landing.whySignUp.benefit1.title",
      descriptionKey: "landing.whySignUp.benefit1.description"
    },
    {
      icon: Bell,
      titleKey: "landing.whySignUp.benefit2.title",
      descriptionKey: "landing.whySignUp.benefit2.description"
    },
    {
      icon: Upload,
      titleKey: "landing.whySignUp.benefit3.title",
      descriptionKey: "landing.whySignUp.benefit3.description"
    },
    {
      icon: Shield,
      titleKey: "landing.whySignUp.benefit4.title",
      descriptionKey: "landing.whySignUp.benefit4.description"
    },
    {
      icon: Users,
      titleKey: "landing.whySignUp.benefit5.title",
      descriptionKey: "landing.whySignUp.benefit5.description"
    },
    {
      icon: FileText,
      titleKey: "landing.whySignUp.benefit6.title",
      descriptionKey: "landing.whySignUp.benefit6.description"
    }
  ];

  const quickFacts = [
    "landing.whySignUp.fact1",
    "landing.whySignUp.fact2",
    "landing.whySignUp.fact3",
    "landing.whySignUp.fact4"
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-2/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Benefits */}
          <div>
            <ScrollReveal>
              <Badge variant="outline" className="mb-4 bg-background border-primary/30">
                {t('landing.whySignUp.badge', 'WHY CREATE AN ACCOUNT')}
              </Badge>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                {t('landing.whySignUp.title', 'Join the Movement for Accountability')}
              </h2>
              <p className="text-base md:text-lg text-foreground/70 mb-8 leading-relaxed">
                {t('landing.whySignUp.description', 'Create a free account to access advanced features and become part of a global community working toward justice and transparency.')}
              </p>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <ScrollReveal key={benefit.titleKey} delay={index * 80}>
                  <div className={cn(
                    "flex items-start gap-3 p-4 rounded-xl",
                    "bg-card/60 border border-border/50 hover:border-primary/30",
                    "transition-all duration-300 hover:-translate-y-1"
                  )}>
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        {t(benefit.titleKey)}
                      </h4>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        {t(benefit.descriptionKey)}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right side - CTA Card */}
          <ScrollReveal delay={200}>
            <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                    {t('landing.whySignUp.ctaTitle', 'Free Forever')}
                  </h3>
                  <p className="text-foreground/70">
                    {t('landing.whySignUp.ctaSubtitle', 'No credit card required. No hidden fees.')}
                  </p>
                </div>

                {/* Quick facts */}
                <div className="space-y-3 mb-8">
                  {quickFacts.map((factKey, index) => (
                    <div key={factKey} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-chart-2/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-chart-2" />
                      </div>
                      <span className="text-sm text-foreground/80">
                        {t(factKey)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button size="lg" className="w-full h-14 text-base font-semibold group" asChild>
                  <Link to="/auth">
                    {t('landing.whySignUp.ctaButton', 'Create Free Account')}
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t('landing.whySignUp.ctaNote', 'By signing up, you agree to our Terms of Service and Privacy Policy.')}
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default WhySignUpSection;
