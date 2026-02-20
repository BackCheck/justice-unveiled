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
  CheckCircle,
  Github,
  Code2
} from "lucide-react";
import { SocialShareButtons } from "@/components/sharing";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  useSEO({
    title: "About HRPM",
    description: "Human Rights Protection Movement - A non-profit organization dedicated to documenting cases of human rights abuse, legal persecution, and institutional failures.",
    type: "website",
  });
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
     "Build transparent, open-source evidence repositories accessible to the public",
     "Identify patterns of procedural failures across institutions",
     "Support individuals navigating complex legal systems",
     "Advocate for systemic reforms to protect fundamental rights",
     "Connect victims with resources, legal aid, and support networks",
     "Publish all source code openly for community audit and contribution",
     "Provide OSINT tools for digital forensics, entity enrichment, and evidence preservation"
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
                     Human Rights Protection Movement
                   </h1>
                   <p className="text-muted-foreground font-medium">Open-source · Non-profit · Investigative Intelligence</p>
                </div>
              </div>
              <SocialShareButtons
                title="About HRPM - Human Rights Protection Movement"
                description="A non-profit organization dedicated to documenting cases of human rights abuse and institutional failures."
                hashtags={["HumanRights", "HRPM", "Justice", "NonProfit"]}
                variant="compact"
              />
            </div>
             <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
               We are a <strong className="text-foreground">non-profit, open-source</strong> organization dedicated to documenting cases of human rights abuse, 
               legal persecution, and institutional failures. Our mission is to bring transparency 
               to systems that too often operate in darkness, and to support those whose fundamental 
               rights have been violated. Every tool we build is freely available to the public.
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
                   HRPM exists to change that. As a non-profit, open-source initiative, we build comprehensive case files that synthesize 
                   documents, testimonies, and evidence into actionable intelligence—bringing 
                   clarity to complex situations and accountability to those who abuse their power. 
                   Our entire codebase is publicly available for review, audit, and contribution.
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

        {/* Open Source Section */}
        <section className="py-16 bg-primary/5 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">Open Source</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Built in the Open
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Transparency is not just a value we advocate for—it's how we build. Our entire platform is 
                  open-source, allowing anyone to inspect, audit, and contribute to the codebase. We believe 
                  that tools for justice should be freely accessible and community-driven.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  As a non-profit initiative, we accept no corporate sponsorships that could compromise our independence. 
                  Every feature we ship is designed to serve victims, researchers, and advocates—not shareholders.
                </p>
                <a 
                  href="https://github.com/BackCheck/justice-unveiled" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View Source on GitHub
                </a>
              </div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    Our Commitments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• 100% open-source codebase under public license</p>
                  <p>• No paywalls on public interest data</p>
                  <p>• Community-driven development and governance</p>
                  <p>• Independent from corporate or political influence</p>
                  <p>• Non-profit — all resources directed to the mission</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Case File Section */}
        <section className="py-16 bg-muted/30">
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

        {/* Privacy Policy Section */}
        <section id="privacy" className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Privacy Policy</h2>
            <div className="prose prose-sm text-muted-foreground max-w-none space-y-4">
              <p>HRPM is committed to protecting user privacy. We collect minimal data necessary to operate the platform.</p>
              <p><strong className="text-foreground">Data Collection:</strong> We do not track visitors with third-party analytics. Authentication data is stored securely and never shared. Evidence uploads are stored with encryption at rest.</p>
              <p><strong className="text-foreground">Cookies:</strong> We use only essential cookies for authentication and session management. No advertising or tracking cookies are used.</p>
              <p><strong className="text-foreground">Data Retention:</strong> Case data and evidence are retained as long as needed for the investigation. Users may request deletion of their account and personal data at any time by contacting us.</p>
              <p><strong className="text-foreground">Open Source:</strong> Our entire codebase is publicly auditable, so you can verify exactly how your data is handled.</p>
            </div>
          </div>
        </section>

        {/* Terms of Service Section */}
        <section id="terms" className="py-16 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Terms of Service</h2>
            <div className="prose prose-sm text-muted-foreground max-w-none space-y-4">
              <p>By using HRPM, you agree to the following terms:</p>
              <p><strong className="text-foreground">Purpose:</strong> This platform is designed for documenting human rights cases, legal research, and public interest advocacy. It must not be used for harassment, doxxing, or any unlawful purpose.</p>
              <p><strong className="text-foreground">Accuracy:</strong> Users are responsible for the accuracy of information they upload. AI-generated analysis should be verified by qualified professionals before use in legal proceedings.</p>
              <p><strong className="text-foreground">No Legal Advice:</strong> HRPM does not provide legal advice. Content on this platform is for informational and research purposes only.</p>
              <p><strong className="text-foreground">Intellectual Property:</strong> The platform code is open-source. Case data contributed to public investigations is made available under open-access principles.</p>
              <p><strong className="text-foreground">Limitation of Liability:</strong> HRPM is provided "as is" without warranty. We are not liable for decisions made based on information presented on this platform.</p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="py-12 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              HRPM is a non-profit, open-source initiative. We do not provide legal advice. 
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
