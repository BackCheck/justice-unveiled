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

const About = () => {
  const values = [
    {
      icon: Scale,
      title: "Justice",
      description: "We believe every person deserves fair treatment under the law, regardless of their resources or status."
    },
    {
      icon: Shield,
      title: "Protection",
      description: "Safeguarding fundamental human rights through documentation, advocacy, and public awareness."
    },
    {
      icon: FileText,
      title: "Transparency",
      description: "Building comprehensive evidence repositories that bring procedural failures to light."
    },
    {
      icon: Users,
      title: "Solidarity",
      description: "Standing with individuals and families facing institutional abuse and systemic injustice."
    }
  ];

  const whatWeDo = [
    "Document and analyze cases of human rights violations and legal abuse",
    "Build transparent evidence repositories accessible to the public",
    "Identify patterns of procedural failures across institutions",
    "Support individuals navigating complex legal systems",
    "Advocate for systemic reforms to protect fundamental rights",
    "Connect victims with resources, legal aid, and support networks"
  ];

  return (
    <PlatformLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                <Globe className="w-9 h-9 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Human Rights Protection Movement
                </h1>
                <p className="text-muted-foreground font-medium">Non-profit investigative platform</p>
              </div>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              We are a non-profit organization dedicated to documenting cases of human rights abuse, 
              legal persecution, and institutional failures. Our mission is to bring transparency 
              to systems that too often operate in darkness, and to support those whose fundamental 
              rights have been violated.
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
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">Our Mission</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Truth Through Evidence
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Many individuals face legal persecution, harassment, and institutional abuse without 
                  the resources to fight back. Evidence is scattered, timelines are obscured, and 
                  patterns of misconduct remain hidden.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  HRPM exists to change that. We build comprehensive case files that synthesize 
                  documents, testimonies, and evidence into actionable intelligence—bringing 
                  clarity to complex situations and accountability to those who abuse their power.
                </p>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-accent" />
                    Who We Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• Individuals facing unjust legal proceedings</p>
                  <p>• Families torn apart by institutional failures</p>
                  <p>• Whistleblowers facing retaliation</p>
                  <p>• Communities affected by systemic abuse</p>
                  <p>• Journalists and researchers investigating misconduct</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide our work and define our commitment to human rights.
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
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">What We Do</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform provides tools and resources to document, analyze, and expose injustice.
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
              Case File #001: The Thanvi Investigation
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Our inaugural investigation documents a multi-year pattern of harassment, business 
              interference, and legal abuse targeting an individual and their family in Denmark. 
              Built from 123 sources, this case file demonstrates how institutional failures 
              can devastate lives—and why transparency matters.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Explore the timeline, evidence matrix, and entity network above</span>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="py-12 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              HRPM is a non-profit initiative. We do not provide legal advice. 
              All case documentation is based on primary sources and is presented for 
              public interest, research, and advocacy purposes.
            </p>
          </div>
        </section>
      </div>
    </PlatformLayout>
  );
};

export default About;
