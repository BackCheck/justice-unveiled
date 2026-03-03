import { Link } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCases } from "@/hooks/useCases";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import hrpmLogo from "@/assets/human-rights-logo.png";

// ── How it works ──
const steps = [
  {
    icon: Upload,
    title: "Submit case or evidence",
    description:
      "Anyone can submit a new case with documents, media, and witness information — or add evidence to an existing investigation.",
  },
  {
    icon: CheckCircle2,
    title: "Verification & structuring",
    description:
      "Submissions are reviewed by moderators. AI extracts timeline events, entities, and legal references automatically.",
  },
  {
    icon: FileText,
    title: "Actionable outputs",
    description:
      "Generate court-ready report packs, evidence matrices, legal citations, and shareable public timelines.",
  },
];

// ── Trust & Safety ──
const trustItems = [
  {
    icon: Shield,
    title: "Privacy by design",
    description:
      "PII auto-redaction, consent controls, and tiered visibility (Public / Restricted / Private) for every submission.",
  },
  {
    icon: Eye,
    title: "Do-no-harm principle",
    description:
      "Safety gate blocks outputs that could endanger victims. Defamation risk detection on all AI-generated content.",
  },
  {
    icon: Scale,
    title: "Verification standards",
    description:
      "Every case goes through moderation. AI confidence scores are surfaced, never hidden.",
  },
  {
    icon: AlertTriangle,
    title: "Takedown policy",
    description:
      "Content can be flagged, reviewed, and removed. We comply with legal takedown requests and protect whistleblowers.",
  },
];

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

  // Recent activity for live signals
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

  // Recent uploads
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

  // Recent entities
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

  return (
    <PlatformLayout>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/4 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-32 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img src={hrpmLogo} alt="" className="w-11 h-11" aria-hidden />
            <Badge
              variant="outline"
              className="text-xs font-medium tracking-wide border-primary/30 text-primary"
            >
              Open-Source · Non-Profit
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08] max-w-3xl">
            Document injustice.{" "}
            <span className="text-primary">Build accountability.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Open-source · Non-profit · Public-interest documentation + AI-assisted analysis.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="gap-2 text-base px-6 h-12">
              <Link to="/submit-case">
                <PlusCircle className="w-5 h-5" />
                Submit a Case
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 text-base px-6 h-12">
              <Link to="/cases">
                <FolderSearch className="w-5 h-5" />
                Explore Cases
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="gap-2 text-base">
              <a href="#how-it-works">
                How it Works
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* Stats strip */}
          {stats && (
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Documented Events", value: stats.totalEvents || 0 },
                { label: "Entities Tracked", value: stats.totalEntities || 0 },
                { label: "Evidence Files", value: stats.totalSources || 0 },
                { label: "Legal Precedents", value: stats.totalPrecedents || 0 },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="border-t border-border/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">How HRPM Works</h2>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Three steps from submission to court-ready documentation.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Card key={i} className="border-border/40 bg-card/60">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                      Step {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED CASES ═══════════════ */}
      <section className="border-t border-border/30 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Featured Cases</h2>
              <p className="text-muted-foreground">Active investigations and documented case files.</p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/cases">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {displayCases.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayCases.map((c) => (
                <Link key={c.id} to={`/cases/${c.id}`} className="group">
                  <Card className="h-full border-border/40 bg-card/60 transition-all duration-200 group-hover:border-primary/25 group-hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] uppercase tracking-wider", statusColor(c.status))}
                        >
                          {c.status}
                        </Badge>
                        {c.category && (
                          <Badge variant="secondary" className="text-[10px]">
                            {c.category}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                          {c.case_number}
                        </span>
                      </div>

                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {c.title}
                      </h3>

                      {c.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {c.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {c.location}
                          </span>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FolderSearch className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No cases documented yet.</p>
              <Button asChild variant="outline" size="sm" className="mt-4 gap-2">
                <Link to="/submit-case">
                  <PlusCircle className="w-4 h-4" /> Submit the first case
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Recent Activity</h2>
            <p className="text-muted-foreground mb-10">Latest signals across all documented cases.</p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* New timeline events */}
              {recentEvents && recentEvents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> New Timeline Events
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

              {/* New uploads */}
              {recentUploads && recentUploads.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileUp className="w-3.5 h-3.5" /> New Uploads
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

              {/* New entities */}
              {recentEntities && recentEntities.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Entities Extracted
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
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Trust & Safety</h2>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Built for court-grade credibility. Every output is filtered for legal safety.
          </p>

          <div className="grid sm:grid-cols-2 gap-8">
            {trustItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap gap-4 text-sm">
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <Link
              to="/disclaimer"
              className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </section>
    </PlatformLayout>
  );
};

export default HomePage;
