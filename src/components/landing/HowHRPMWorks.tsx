import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MotionScrollReveal } from "@/components/ui/motion-scroll-reveal";
import {
  FileSearch,
  Users,
  CalendarClock,
  Scale,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

const stepIcons: LucideIcon[] = [FileSearch, Users, CalendarClock, Scale];

const HowHRPMWorks = () => {
  const { t } = useTranslation();

  const workflowSteps = [
    {
      icon: stepIcons[0],
      title: t("home.howItWorks.step1Title"),
      description: t("home.howItWorks.step1Desc"),
      details: [
        t("home.howItWorks.step1Detail1"),
        t("home.howItWorks.step1Detail2"),
        t("home.howItWorks.step1Detail3"),
        t("home.howItWorks.step1Detail4"),
      ],
    },
    {
      icon: stepIcons[1],
      title: t("home.howItWorks.step2Title"),
      description: t("home.howItWorks.step2Desc"),
      details: [
        t("home.howItWorks.step2Detail1"),
        t("home.howItWorks.step2Detail2"),
        t("home.howItWorks.step2Detail3"),
      ],
    },
    {
      icon: stepIcons[2],
      title: t("home.howItWorks.step3Title"),
      description: t("home.howItWorks.step3Desc"),
      details: [
        t("home.howItWorks.step3Detail1"),
        t("home.howItWorks.step3Detail2"),
        t("home.howItWorks.step3Detail3"),
        t("home.howItWorks.step3Detail4"),
      ],
    },
    {
      icon: stepIcons[3],
      title: t("home.howItWorks.step4Title"),
      description: t("home.howItWorks.step4Desc"),
      details: [
        t("home.howItWorks.step4Detail1"),
        t("home.howItWorks.step4Detail2"),
        t("home.howItWorks.step4Detail3"),
      ],
    },
  ];

  const pipelineLabels = [
    t("home.howItWorks.pipelineEvidence"),
    t("home.howItWorks.pipelineEntities"),
    t("home.howItWorks.pipelineTimeline"),
    t("home.howItWorks.pipelineLegalAnalysis"),
  ];

  return (
    <section id="how-it-works" className="border-t border-border/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Header */}
        <MotionScrollReveal direction="up">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("home.howItWorks.title")}
          </h2>
          <p className="text-muted-foreground mb-14 max-w-2xl leading-relaxed">
            {t("home.howItWorks.subtitle")}
          </p>
        </MotionScrollReveal>

        {/* Workflow Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <MotionScrollReveal key={i} direction="up" delay={i * 120}>
                <Card className="border-border/40 bg-card/60 h-full relative overflow-hidden group hover:border-primary/25 transition-colors duration-300">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Step number */}
                    <span className="absolute top-4 right-4 text-[10px] font-mono font-bold text-muted-foreground/40 uppercase tracking-widest">
                      0{i + 1}
                    </span>

                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {step.description}
                    </p>

                    <ul className="mt-auto space-y-1.5">
                      {step.details.map((d, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span className="mt-1 w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </MotionScrollReveal>
            );
          })}
        </div>

        {/* Pipeline Diagram */}
        <MotionScrollReveal direction="up" delay={100}>
          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
            {pipelineLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold tracking-wide border",
                    "border-border/50 bg-card/60 text-foreground"
                  )}
                >
                  {label}
                </span>
                {i < pipelineLabels.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-primary/50 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </MotionScrollReveal>

        {/* CTA */}
        <MotionScrollReveal direction="up" delay={200}>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="gap-2 text-base px-6 h-12 shadow-lg shadow-primary/20">
              <Link to="/cases">
                {t("home.howItWorks.exploreInvestigations")}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </MotionScrollReveal>
      </div>
    </section>
  );
};

export default HowHRPMWorks;
