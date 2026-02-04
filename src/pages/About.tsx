import { useTranslation } from "react-i18next";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Scale, 
  Shield, 
  Users, 
  FileText, 
  Heart,
  Globe,
  Target,
  CheckCircle
} from "lucide-react";
import { SocialShareButtons } from "@/components/sharing";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  const { t } = useTranslation();
  
  useSEO({
    title: t('about.title'),
    description: t('about.missionText'),
    type: "website",
  });

  const values = [
    {
      icon: Scale,
      title: t('about.values.justice'),
      description: t('about.values.justiceDesc')
    },
    {
      icon: Shield,
      title: t('about.values.protection'),
      description: t('about.values.protectionDesc')
    },
    {
      icon: FileText,
      title: t('about.values.transparency'),
      description: t('about.values.transparencyDesc')
    },
    {
      icon: Users,
      title: t('about.values.solidarity'),
      description: t('about.values.solidarityDesc')
    }
  ];

  const whatWeDo = [
    t('about.whatWeDo.items.item1'),
    t('about.whatWeDo.items.item2'),
    t('about.whatWeDo.items.item3'),
    t('about.whatWeDo.items.item4'),
    t('about.whatWeDo.items.item5'),
    t('about.whatWeDo.items.item6'),
  ];

  const whoWeHelp = [
    t('about.helpList.item1'),
    t('about.helpList.item2'),
    t('about.helpList.item3'),
    t('about.helpList.item4'),
    t('about.helpList.item5'),
  ];

  return (
    <PlatformLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                  <Globe className="w-9 h-9 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {t('landing.hero.title')}
                  </h1>
                  <p className="text-muted-foreground font-medium">{t('about.subtitle')}</p>
                </div>
              </div>
              <SocialShareButtons
                title={t('about.title')}
                description={t('about.missionText')}
                hashtags={["HumanRights", "HRPM", "Justice", "NonProfit"]}
                variant="compact"
              />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              {t('about.missionDesc1')}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">{t('about.mission')}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {t('about.missionTitle')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('about.missionDesc1')}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.missionDesc2')}
                </p>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-accent" />
                    {t('about.whoWeHelp')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  {whoWeHelp.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t('about.values.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('about.values.description')}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <Card key={value.title} className="border-border hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t('about.whatWeDo.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('about.whatWeDo.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {whatWeDo.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border"
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Case File Section */}
        <section className="py-16 bg-primary/5">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t('about.caseFile.title')}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('about.caseFile.description')}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{t('about.caseFile.exploreNote')}</span>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="py-12 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('about.footerNote')}
            </p>
          </div>
        </section>
      </div>
    </PlatformLayout>
  );
};

export default About;
