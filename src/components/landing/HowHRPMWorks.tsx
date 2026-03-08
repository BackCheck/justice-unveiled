import { Link } from "react-router-dom";
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

const workflowSteps = [
  {
    icon: FileSearch,
    title: "Evidence Collection",
    description:
      "Digital evidence, legal filings, witness records, and investigative documents are collected and preserved with forensic integrity.",
    details: [
      "Court records",
      "Digital files",
      "Communications",
      "Regulatory documents",
    ],
  },
  {
    icon: Users,
    title: "Entity Identification",
    description:
      "People, organizations, institutions, and locations are extracted from evidence and structured into an entity database.",
    details: [
      "Roles",
      "Relationships",
      "Repeated appearances across events",
    ],
  },
  {
    icon: CalendarClock,
    title: "Timeline Reconstruction",
    description:
      "Events are chronologically reconstructed to identify patterns, sequences, and escalation points within the case history.",
    details: [
      "Procedural developments",
      "Legal actions",
      "Harassment patterns",
      "Regulatory events",
    ],
  },
  {
    icon: Scale,
    title: "Legal & Rights Analysis",
    description:
      "Events and actions are evaluated against national laws and international human rights frameworks.",
    details: [
      "Procedural violations",
      "Legal inconsistencies",
      "Potential rights infringements",
    ],
  },
];

const pipelineLabels = ["Evidence", "Entities", "Timeline", "Legal Analysis"];

const HowHRPMWorks = () => {
  return (
    <section id="how-it-works" className="border-t border-border/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Header */}
        <MotionScrollReveal direction="up">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            How HRPM Works
          </h2>
          <p className="text-muted-foreground mb-14 max-w-2xl leading-relaxed">
            HRPM transforms fragmented legal records, digital evidence, and
            investigative materials into structured intelligence through a
            multi-stage analytical workflow.
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
                Explore Investigations
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
