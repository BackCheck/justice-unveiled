import { Link } from "react-router-dom";
import { MotionScrollReveal } from "@/components/ui/motion-scroll-reveal";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCases } from "@/hooks/useCases";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  PlusCircle,
  FolderSearch,
  FileText,
  Scale,
  Shield,
  Upload,
  CheckCircle2,
  Eye,
  AlertTriangle,
  MapPin,
  Calendar,
  Users,
  FileUp,
  Clock,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Waves } from "@/components/ui/waves-background";
import hrpmLogo from "@/assets/human-rights-logo.png";
import HomepageAIChat from "@/components/landing/HomepageAIChat";

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30";
    case "under review":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "draft":
      return "bg-muted text-muted-foreground border-border";
    case "closed":
    case "archived":
      return "bg-secondary text-secondary-foreground border-border";
    default:
      return "bg-primary/10 text-primary border-primary/30";
  }
};

const HomePage = () => {
  const { t } = useTranslation();

  useSEO({
    title: "HRPM — Document Injustice. Build Accountability.",
    description:
      "Open-source, non-profit documentation and monitoring platform for human rights cases. Submit evidence, track investigations, generate court-ready reports.",
    url: "https://hrpm.org",
    keywords: ["human rights", "documentation", "accountability", "case management", "evidence"],
  });

  const { data: cases } = useCases();
  const { stats } = usePlatformStats();
  const displayCases = cases?.slice(0, 6) || [];

  const { data: recentEvents } = useQuery({
    queryKey: ["homepage-recent-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("extracted_events")
        .select("id, date, category, description, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: recentUploads } = useQuery({
    queryKey: ["homepage-recent-uploads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("evidence_uploads")
        .select("id, file_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const { data: recentEntities } = useQuery({
    queryKey: ["homepage-recent-entities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("extracted_entities")
        .select("id, name, entity_type, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const hasSignals =
    (recentEvents && recentEvents.length > 0) ||
    (recentUploads && recentUploads.length > 0) ||
    (recentEntities && recentEntities.length > 0);

  const steps = [
    { icon: Upload, title: t("home.howItWorks.step1Title"), description: t("home.howItWorks.step1Desc") },
    { icon: CheckCircle2, title: t("home.howItWorks.step2Title"), description: t("home.howItWorks.step2Desc") },
    { icon: FileText, title: t("home.howItWorks.step3Title"), description: t("home.howItWorks.step3Desc") },
  ];

  const trustItems = [
    { icon: Shield, title: t("home.trustSafety.privacy"), description: t("home.trustSafety.privacyDesc") },
    { icon: Eye, title: t("home.trustSafety.doNoHarm"), description: t("home.trustSafety.doNoHarmDesc") },
    { icon: Scale, title: t("home.trustSafety.verification"), description: t("home.trustSafety.verificationDesc") },
    { icon: AlertTriangle, title: t("home.trustSafety.takedown"), description: t("home.trustSafety.takedownDesc") },
  ];

  const featurePills = [
    { icon: Shield, label: t("home.featurePills.protectedReporting"), desc: t("home.featurePills.protectedReportingDesc") },
    { icon: Users, label: t("home.featurePills.globalNetwork"), desc: t("home.featurePills.globalNetworkDesc") },
    { icon: Heart, label: t("home.featurePills.survivorSupport"), desc: t("home.featurePills.survivorSupportDesc") },
  ];

  const statsItems = [
    { label: t("home.stats.documentedEvents"), value: stats?.totalEvents || 0 },
    { label: t("home.stats.entitiesTracked"), value: stats?.totalEntities || 0 },
    { label: t("home.stats.evidenceFiles"), value: stats?.totalSources || 0 },
    { label: t("home.stats.legalPrecedents"), value: stats?.totalPrecedents || 0 },
  ];

  return (
    <PlatformLayout>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <Waves strokeColor="hsl(199, 100%, 50%)" backgroundColor="transparent" className="z-0" />
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 md:py-36 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-3 mb-8">
              <img src={hrpmLogo} alt="" className="w-12 h-12 drop-shadow-lg" aria-hidden />
              <Badge variant="outline" className="text-xs font-medium tracking-wide border-primary/40 text-primary bg-primary/5 backdrop-blur-sm">
                {t("home.hero.badge")}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.05] max-w-4xl">
              {t("home.hero.title1")}{" "}
              <br className="hidden sm:block" />
              <motion.span
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_auto] animate-gradient-shift inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {t("home.hero.title2")}
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {t("home.hero.description")}
          </motion.p>

          <motion.div className="mt-10 flex flex-wrap items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55 }}>
            <Button asChild size="lg" className="gap-2 text-base px-6 h-12 shadow-lg shadow-primary/20">
              <Link to="/submit-case">
                <PlusCircle className="w-5 h-5" />
                {t("home.hero.reportViolation")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 text-base px-6 h-12 backdrop-blur-sm bg-background/50">
              <Link to="/cases">
                <Heart className="w-5 h-5" />
                {t("home.hero.supportMission")}
              </Link>
            </Button>
          </motion.div>

          {/* Feature pills */}
          <motion.div className="mt-14 flex flex-wrap items-center gap-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
            {featurePills.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Stats strip */}
          {stats && (
            <motion.div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.85 }}>
              {statsItems.map((s) => (
                <div key={s.label} className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-4 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="border-t border-border/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <MotionScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("home.howItWorks.title")}</h2>
            <p className="text-muted-foreground mb-12 max-w-xl">{t("home.howItWorks.subtitle")}</p>
          </MotionScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <MotionScrollReveal key={i} direction="up" delay={i * 150}>
                  <Card className="border-border/40 bg-card/60 h-full">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                        {t("home.howItWorks.step")} {i + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </MotionScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED CASES ═══════════════ */}
      <section className="border-t border-border/30 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <MotionScrollReveal direction="up">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("home.featuredCases.title")}</h2>
              <p className="text-muted-foreground">{t("home.featuredCases.subtitle")}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/cases">
                {t("home.featuredCases.viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </MotionScrollReveal>

          {displayCases.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayCases.map((c, i) => (
                <MotionScrollReveal key={c.id} direction="up" delay={i * 100}>
                <Link to={`/cases/${c.id}`} className="group">
                  <Card className="h-full border-border/40 bg-card/60 transition-all duration-200 group-hover:border-primary/25 group-hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", statusColor(c.status))}>
                          {c.status}
                        </Badge>
                        {c.category && (
                          <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">{c.case_number}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{c.title}</h3>
                      {c.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {c.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>
                        )}
                        {c.updated_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                </MotionScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FolderSearch className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{t("home.featuredCases.noCases")}</p>
              <Button asChild variant="outline" size="sm" className="mt-4 gap-2">
                <Link to="/submit-case">
                  <PlusCircle className="w-4 h-4" /> {t("home.featuredCases.submitFirst")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ LIVE SIGNALS ═══════════════ */}
      {hasSignals && (
        <section className="border-t border-border/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <MotionScrollReveal direction="left">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("home.recentActivity.title")}</h2>
            <p className="text-muted-foreground mb-10">{t("home.recentActivity.subtitle")}</p>
          </MotionScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {recentEvents && recentEvents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> {t("home.recentActivity.newTimelineEvents")}
                  </h3>
                  <div className="space-y-2.5">
                    {recentEvents.slice(0, 4).map((ev) => (
                      <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-card/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground line-clamp-1">{ev.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[9px] h-4">{ev.category}</Badge>
                            <span className="text-[10px] text-muted-foreground">{ev.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentUploads && recentUploads.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileUp className="w-3.5 h-3.5" /> {t("home.recentActivity.newUploads")}
                  </h3>
                  <div className="space-y-2.5">
                    {recentUploads.map((u) => (
                      <div key={u.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-card/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground line-clamp-1">{u.file_name}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentEntities && recentEntities.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> {t("home.recentActivity.entitiesExtracted")}
                  </h3>
                  <div className="space-y-2.5">
                    {recentEntities.map((e) => (
                      <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-card/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground line-clamp-1">{e.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[9px] h-4">{e.entity_type}</Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TRUST & SAFETY ═══════════════ */}
      <section className="border-t border-border/30 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <MotionScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("home.trustSafety.title")}</h2>
            <p className="text-muted-foreground mb-12 max-w-xl">{t("home.trustSafety.subtitle")}</p>
          </MotionScrollReveal>

          <div className="grid sm:grid-cols-2 gap-8">
            {trustItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <MotionScrollReveal key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 100}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </MotionScrollReveal>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap gap-4 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
              {t("home.trustSafety.termsOfService")}
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
              {t("home.trustSafety.privacyPolicy")}
            </Link>
            <Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
              {t("home.trustSafety.disclaimer")}
            </Link>
          </div>
        </div>
      </section>
    </PlatformLayout>
  );
};

export default HomePage;
