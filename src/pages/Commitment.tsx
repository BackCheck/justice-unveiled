import { useTranslation } from "react-i18next";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useSEO from "@/hooks/useSEO";
import {
  Heart, ShieldCheck, Cpu, Eye, Users, Scale,
  Handshake, Copy, Check, Megaphone
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const principles = [
  { icon: Heart, labelKey: "commitment.principles.publicInterest", descKey: "commitment.principles.publicInterestDesc" },
  { icon: ShieldCheck, labelKey: "commitment.principles.evidenceIntegrity", descKey: "commitment.principles.evidenceIntegrityDesc" },
  { icon: Cpu, labelKey: "commitment.principles.responsibleTech", descKey: "commitment.principles.responsibleTechDesc" },
  { icon: Eye, labelKey: "commitment.principles.transparency", descKey: "commitment.principles.transparencyDesc" },
  { icon: Users, labelKey: "commitment.principles.inclusion", descKey: "commitment.principles.inclusionDesc" },
  { icon: Scale, labelKey: "commitment.principles.accountability", descKey: "commitment.principles.accountabilityDesc" },
];

const Commitment = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useSEO({
    title: "HRPM Commitment | Human Rights Protection & Monitoring",
    description: "Human Rights Protection & Monitoring (HRPM) commitment to ethical investigations, evidence integrity, responsible AI, and diversity, equity & inclusion.",
    url: "https://hrpm.org/commitment",
    canonicalUrl: "https://hrpm.org/commitment",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "HRPM Commitment to Social Impact, Integrity & Inclusion",
      url: "https://hrpm.org/commitment",
      publisher: {
        "@type": "Organization",
        name: "HRPM.org",
        url: "https://hrpm.org",
      },
    },
  });

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://hrpm.org/commitment");
    setCopied(true);
    toast.success(t("commitment.urlCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PlatformLayout>
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Page header */}
        <div className="space-y-4">
          <Badge variant="outline" className="text-xs font-medium tracking-wider uppercase">
            {t("commitment.badge")}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {t("commitment.title")}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {t("commitment.subtitle")}
          </p>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyUrl}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t("commitment.copied") : t("commitment.copyUrl")}
          </Button>
        </div>

        {/* 1 – Introduction */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t("commitment.intro.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("commitment.intro.body")}</p>
          </CardContent>
        </Card>

        {/* 2 – Social Impact */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{t("commitment.socialImpact.title")}</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside">
              <li>{t("commitment.socialImpact.point1")}</li>
              <li>{t("commitment.socialImpact.point2")}</li>
              <li>{t("commitment.socialImpact.point3")}</li>
              <li>{t("commitment.socialImpact.point4")}</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3 – Evidence Integrity */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{t("commitment.evidenceIntegrity.title")}</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside">
              <li>{t("commitment.evidenceIntegrity.point1")}</li>
              <li>{t("commitment.evidenceIntegrity.point2")}</li>
              <li>{t("commitment.evidenceIntegrity.point3")}</li>
              <li>{t("commitment.evidenceIntegrity.point4")}</li>
              <li>{t("commitment.evidenceIntegrity.point5")}</li>
            </ul>
          </CardContent>
        </Card>

        {/* 4 – Responsible Technology */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{t("commitment.responsibleTech.title")}</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside">
              <li>{t("commitment.responsibleTech.point1")}</li>
              <li>{t("commitment.responsibleTech.point2")}</li>
              <li>{t("commitment.responsibleTech.point3")}</li>
              <li>{t("commitment.responsibleTech.point4")}</li>
            </ul>
          </CardContent>
        </Card>

        {/* 5 – DEI */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{t("commitment.dei.title")}</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside">
              <li>{t("commitment.dei.point1")}</li>
              <li>{t("commitment.dei.point2")}</li>
              <li>{t("commitment.dei.point3")}</li>
              <li>{t("commitment.dei.point4")}</li>
            </ul>
          </CardContent>
        </Card>

        {/* 6 – Collaboration */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{t("commitment.collaboration.title")}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t("commitment.collaboration.body")}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["journalists", "civilSociety", "legalProfessionals", "researchers", "policyAdvocates"].map((key) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {t(`commitment.collaboration.${key}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 7 – Principles Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{t("commitment.principlesTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {principles.map(({ icon: Icon, labelKey, descKey }) => (
              <Card key={labelKey} className="group">
                <CardContent className="pt-5 pb-5 space-y-2 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{t(labelKey)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 8 – Callout Statement */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 pb-6 flex items-start gap-4">
            <Megaphone className="w-8 h-8 text-primary shrink-0 mt-0.5" />
            <blockquote className="text-foreground font-medium leading-relaxed italic text-lg">
              "{t("commitment.callout")}"
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </PlatformLayout>
  );
};

export default Commitment;
