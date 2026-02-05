import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle, 
  FileSearch, 
  ExternalLink,
  Calendar,
  MapPin
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import GlowingOrb from "./GlowingOrb";
import { cn } from "@/lib/utils";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const FeaturedCaseSection = () => {
  const { t } = useTranslation();
  const { stats: fullStats } = usePlatformStats();

  const caseHighlights = [
    `${fullStats.totalSources}+ ${t('landing.featuredCase.highlight1')}`,
    `${fullStats.totalEvents}+ ${t('landing.featuredCase.highlight2')}`,
    `${fullStats.totalEntities}+ ${t('landing.featuredCase.highlight3')}`,
    `${fullStats.verifiedPrecedents} ${t('landing.featuredCase.highlight4')}`,
    t('landing.featuredCase.highlight5')
  ];

  const legalItems = [
    { label: t('landing.featuredCase.verifiedCaseLaw'), severity: "verified" },
    { label: t('landing.featuredCase.citeCheck'), severity: "active" },
    { label: t('landing.featuredCase.forensicEvidence'), severity: "critical" },
    { label: t('landing.featuredCase.proceduralViolations'), severity: "high" }
  ];

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'verified': return t('landing.featuredCase.verified');
      case 'active': return t('landing.featuredCase.active');
      case 'critical': return t('landing.featuredCase.critical');
      case 'high': return t('landing.featuredCase.high');
      default: return severity;
    }
  };

  return (
    <section className="py-20 md:py-28 relative">
      <GlowingOrb color="primary" size="lg" className="-left-48 top-1/4" delay={0} />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            {/* Featured Label */}
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {t('landing.featuredCase.badge')}
              </Badge>
            </div>

            {/* Case Title */}
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {t('landing.featuredCase.title')} <GradientText>{t('landing.featuredCase.name')}</GradientText>
            </h2>

            {/* Why Featured */}
            <p className="text-foreground/70 text-sm mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{t('landing.featuredCase.period')}</span>
              <span className="text-border">•</span>
              <MapPin className="w-4 h-4 text-primary" />
              <span>{t('landing.featuredCase.location')}</span>
            </p>

            {/* Description */}
            <p className="text-foreground/80 mb-6 leading-relaxed text-base">
              {t('landing.featuredCase.description')}
            </p>
            
            {/* Highlights */}
            <ul className="space-y-3 mb-8">
              {caseHighlights.map((item, index) => (
                <li 
                  key={item} 
                  className="flex items-center gap-3 opacity-0 animate-fade-in-left"
                  style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/70 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/timeline">
              <Button className="group">
                {t('landing.featuredCase.viewTimeline')}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={200}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl animate-pulse" />
              <Card className="relative border-border/50 bg-card/90 backdrop-blur overflow-hidden group hover:border-primary/30 transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_auto] animate-gradient-shift" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileSearch className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{t('landing.featuredCase.legalSuiteTitle')}</h4>
                      <p className="text-sm text-foreground/60">{t('landing.featuredCase.legalSuiteSubtitle')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {legalItems.map((item, index) => (
                      <div 
                        key={item.label} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg bg-muted/50",
                          "hover:bg-muted transition-all duration-300 cursor-default",
                          "opacity-0 animate-fade-in-up"
                        )}
                        style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: 'forwards' }}
                      >
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs transition-all duration-300",
                            item.severity === "critical" && "bg-destructive/10 text-destructive border-destructive/30",
                            item.severity === "high" && "bg-chart-4/10 text-chart-4 border-chart-4/30",
                            item.severity === "verified" && "bg-chart-2/10 text-chart-2 border-chart-2/30",
                            item.severity === "active" && "bg-primary/10 text-primary border-primary/30"
                          )}
                        >
                          {getSeverityLabel(item.severity)}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Link to="/intel-briefing" className="block mt-6">
                    <Button variant="outline" className="w-full group hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
                      {t('landing.featuredCase.readBriefing')}
                      <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCaseSection;