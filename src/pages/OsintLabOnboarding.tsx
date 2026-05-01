import { Link } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ScanSearch, FileSearch, Brain, Archive, Shield, Phone,
  Terminal, ArrowRight, BookOpen, Compass, Workflow, AlertTriangle,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { osintCategories } from "@/data/osintCommandsData";

const labTabs = [
  { id: "artifacts", label: "Evidence Artifacts", icon: ScanSearch, desc: "Extract IOCs, hashes, wallets, and indicators from uploaded evidence." },
  { id: "forensics", label: "Forensics Lab", icon: FileSearch, desc: "Inspect file metadata, EXIF, and document provenance." },
  { id: "enrichment", label: "Entity Enrichment", icon: Brain, desc: "Augment people, orgs, and accounts with open-source intelligence." },
  { id: "archiver", label: "Web Archiver", icon: Archive, desc: "Preserve URLs as forensic snapshots before they disappear." },
  { id: "darkweb", label: "Dark Web Analyzer", icon: Shield, desc: "Analyse pasted dark-web artifacts for leaks and threat indicators." },
  { id: "comms", label: "Comms Analyzer", icon: Phone, desc: "Investigate phone numbers, identifiers, and communication patterns." },
];

const categoryIconMap: Record<string, string> = {
  personal: "👤", organization: "🏢", "social-media": "🔗", "dark-web": "🕸️",
  geolocation: "📍", "google-dorks": "🔍", automation: "⚙️", government: "🏛️", satellite: "🛰️",
};

export default function OsintLabOnboarding() {
  useSEO({
    title: "OSINT Lab — Getting Started | HRPM",
    description: "Onboarding guide to the HRPM OSINT Lab: where to find forensic tools, how to use OSINT command libraries, and recommended investigative workflows.",
  });

  return (
    <PlatformLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <header className="space-y-4">
          <Badge variant="outline" className="font-mono text-[10px]">OSINT LAB · ONBOARDING</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Welcome to the OSINT Lab
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            The OSINT Lab is your operational workspace for open-source intelligence: digital forensics,
            entity enrichment, evidence preservation, and dark-web artifact analysis. This page explains
            where every tool lives and how to combine them with the OSINT Commands library for
            investigation-grade results.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild>
              <Link to="/osint-toolkit">
                <Compass className="mr-2 h-4 w-4" /> Open OSINT Lab
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/osint-commands">
                <Terminal className="mr-2 h-4 w-4" /> Browse OSINT Commands
              </Link>
            </Button>
          </div>
        </header>

        <Separator />

        {/* Lab Tools Map */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" /> Lab tools at a glance
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Each tab in <Link to="/osint-toolkit" className="text-primary hover:underline">OSINT Lab</Link> is a self-contained module. Pick the one that matches the evidence you have.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {labTabs.map(({ id, label, icon: Icon, desc }) => (
              <Card key={id} className="hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" /> {label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-xs leading-relaxed">{desc}</CardDescription>
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Link to="/osint-toolkit">Open <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Commands Library */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" /> OSINT Commands library
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              A curated catalogue of {osintCategories.reduce((s, c) => s + c.subcategories.reduce((x, y) => x + y.commands.length, 0), 0)}+
              ready-to-use commands, dorks, and one-liners across {osintCategories.length} categories.
              Copy, adapt, and run them alongside the lab tools above.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {osintCategories.map((cat) => {
              const total = cat.subcategories.reduce((s, sub) => s + sub.commands.length, 0);
              return (
                <Link
                  key={cat.id}
                  to={`/osint-commands#${cat.id}`}
                  className="group rounded-lg border border-border/50 bg-card p-3 hover:border-primary/50 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{categoryIconMap[cat.id] ?? cat.icon}</span>
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold truncate group-hover:text-primary">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {cat.subcategories.length} groups
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] h-5 shrink-0">
                      {total}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
          <div>
            <Button asChild variant="outline" size="sm">
              <Link to="/osint-commands">
                Open full command library <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Suggested workflow */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Suggested investigative workflow
          </h2>
          <ol className="space-y-3">
            {[
              { step: "1", title: "Preserve first", body: "Use Web Archiver to snapshot URLs before they vanish, and upload originals via Evidence." },
              { step: "2", title: "Extract artifacts", body: "Run Evidence Artifacts to pull IOCs, hashes, wallets, identifiers from uploads." },
              { step: "3", title: "Enrich entities", body: "Push extracted entities through Entity Enrichment to attach OSINT context." },
              { step: "4", title: "Augment with commands", body: "Use OSINT Commands to manually pivot — Google dorks, username sweeps, satellite, dark-web." },
              { step: "5", title: "Correlate & report", body: "Send findings to the Network graph, Correlation, or Report Center for case-ready output." },
            ].map((s) => (
              <li key={s.step} className="flex gap-3 rounded-lg border border-border/40 bg-card p-3">
                <div className="h-7 w-7 shrink-0 rounded-md bg-primary/15 text-primary font-mono text-sm font-bold flex items-center justify-center">
                  {s.step}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Disclaimer */}
        <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Lawful use only.</span> OSINT techniques must
            be used in compliance with applicable law and platform terms. HRPM is an investigative
            documentation platform — verify findings, cite sources, and use neutral language
            (&ldquo;allegedly&rdquo;) when authoring case material.
          </div>
        </section>
      </div>
    </PlatformLayout>
  );
}
