import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Brain, 
  Network, 
  FileCheck,
  ArrowRight
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { cn } from "@/lib/utils";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      icon: Upload,
      titleKey: "landing.howItWorks.step1.title",
      descriptionKey: "landing.howItWorks.step1.description",
      color: "primary"
    },
    {
      number: "02",
      icon: Brain,
      titleKey: "landing.howItWorks.step2.title",
      descriptionKey: "landing.howItWorks.step2.description",
      color: "chart-4"
    },
    {
      number: "03",
      icon: Network,
      titleKey: "landing.howItWorks.step3.title",
      descriptionKey: "landing.howItWorks.step3.description",
      color: "chart-2"
    },
    {
      number: "04",
      icon: FileCheck,
      titleKey: "landing.howItWorks.step4.title",
      descriptionKey: "landing.howItWorks.step4.description",
      color: "chart-5"
    }
  ];

  const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
    "chart-2": { bg: "bg-chart-2/10", text: "text-chart-2", border: "border-chart-2/30" },
    "chart-4": { bg: "bg-chart-4/10", text: "text-chart-4", border: "border-chart-4/30" },
    "chart-5": { bg: "bg-chart-5/10", text: "text-chart-5", border: "border-chart-5/30" }
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 via-background to-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-background border-border/50">
              {t('landing.howItWorks.badge', 'HOW IT WORKS')}
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              {t('landing.howItWorks.title', 'From Raw Evidence to Actionable Intelligence')}
            </h2>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {t('landing.howItWorks.description', 'Our platform transforms scattered documents and testimonies into structured, verifiable case files ready for legal action or public accountability.')}
            </p>
          </div>
        </ScrollReveal>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const styles = colorStyles[step.color];
            return (
              <ScrollReveal key={step.number} delay={index * 100} direction="up">
                <div className={cn(
                  "relative p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50",
                  "hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 group h-full"
                )}>
                  {/* Step number */}
                  <div className={cn(
                    "absolute -top-4 -left-2 font-serif text-6xl font-bold opacity-10 group-hover:opacity-20 transition-opacity",
                    styles.text
                  )}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                    styles.bg, "group-hover:scale-110"
                  )}>
                    <step.icon className={cn("w-7 h-7", styles.text)} />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {t(step.descriptionKey)}
                  </p>

                  {/* Arrow connector (except last) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-border" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
