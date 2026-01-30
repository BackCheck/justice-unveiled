import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Shield, 
  Network, 
  FileSearch, 
  Brain, 
  Scale, 
  Globe, 
  Users,
  FileText,
  Sparkles,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Zap,
  Target,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import hrpmLogo from "@/assets/human-rights-logo.svg";
import ParticleField from "@/components/landing/ParticleField";
import AnimatedCounter from "@/components/landing/AnimatedCounter";
import GlowingOrb from "@/components/landing/GlowingOrb";
import FloatingIcon from "@/components/landing/FloatingIcon";
import ScrollReveal from "@/components/landing/ScrollReveal";
import GradientText from "@/components/landing/GradientText";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Extract events, entities, and violations from raw documents using advanced AI intelligence.",
      link: "/uploads",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      glowColor: "group-hover:shadow-[0_0_40px_hsl(var(--chart-1)/0.3)]"
    },
    {
      icon: Network,
      title: "Entity Network",
      description: "Visualize relationships between individuals, organizations, and institutions with interactive graphs.",
      link: "/network",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      glowColor: "group-hover:shadow-[0_0_40px_hsl(var(--chart-2)/0.3)]"
    },
    {
      icon: FileSearch,
      title: "Evidence Matrix",
      description: "Cross-reference sources and map documents to events with reliability tracking.",
      link: "/evidence",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      glowColor: "group-hover:shadow-[0_0_40px_hsl(var(--chart-4)/0.3)]"
    },
    {
      icon: Globe,
      title: "International Rights Audit",
      description: "Map violations against UN UDHR, ICCPR, CAT, and other global human rights frameworks.",
      link: "/international",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      glowColor: "group-hover:shadow-[0_0_40px_hsl(var(--chart-3)/0.3)]"
    }
  ];

  const stats = [
    { value: 117, label: "Verified Sources", suffix: "+" },
    { value: 10, label: "Years Documented", suffix: "+" },
    { value: 50, label: "Timeline Events", suffix: "+" },
    { value: 6, label: "Int'l Frameworks", suffix: "" }
  ];

  const values = [
    { icon: Scale, title: "Justice", description: "Fair treatment under the law for everyone." },
    { icon: Shield, title: "Protection", description: "Safeguarding fundamental human rights." },
    { icon: FileText, title: "Transparency", description: "Bringing procedural failures to light." },
    { icon: Users, title: "Solidarity", description: "Standing with those facing injustice." }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Particle Background */}
      <ParticleField />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={hrpmLogo} 
                alt="HRPM Logo" 
                className="w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground tracking-tight">HRPM</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Human Rights Protection Movement</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-0.5">About</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-0.5">Dashboard</Link>
            <Link to="/intel-briefing" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-0.5">Intelligence</Link>
            <Link to="/auth">
              <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </nav>
          <Link to="/" className="md:hidden">
            <Button size="sm" className="animate-pulse-glow">Explore</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Animated background orbs */}
        <GlowingOrb color="primary" size="xl" className="top-20 -left-32" delay={0} />
        <GlowingOrb color="accent" size="lg" className="bottom-20 -right-20" delay={1} />
        <GlowingOrb color="chart-2" size="md" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={2} />

        {/* Floating decorative icons */}
        <FloatingIcon icon={Shield} className="top-32 left-[15%] hidden lg:block" delay={0} />
        <FloatingIcon icon={Eye} className="top-48 right-[12%] hidden lg:block" delay={0.5} />
        <FloatingIcon icon={Target} className="bottom-32 left-[8%] hidden lg:block" delay={1} />
        <FloatingIcon icon={Zap} className="bottom-48 right-[18%] hidden lg:block" delay={1.5} />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32 z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <ScrollReveal delay={100}>
              <Badge 
                variant="outline" 
                className={cn(
                  "mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/30",
                  "hover:bg-primary/20 transition-all duration-300 cursor-default",
                  "animate-bounce-soft"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 animate-spin-slow" />
                Investigative Intelligence Platform
              </Badge>
            </ScrollReveal>

            {/* Main Headline */}
            <ScrollReveal delay={200}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-foreground">Documenting </span>
                <GradientText>Justice</GradientText>
                <br />
                <span className="text-foreground">Demanding </span>
                <span className="text-primary relative">
                  Accountability
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                </span>
              </h1>
            </ScrollReveal>

            {/* Subtitle */}
            <ScrollReveal delay={300}>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                An open-source investigative platform transforming documented facts into actionable intelligence 
                for human rights monitoring and anti-corruption efforts.
              </p>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/timeline">
                  <Button size="lg" className="group relative overflow-hidden hover-lift">
                    <span className="relative z-10 flex items-center">
                      Explore Case File #001
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_auto] animate-gradient-shift opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="hover-lift border-border/50 hover:border-primary/50 hover:bg-primary/5">
                    View Intel Dashboard
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Stats Row */}
          <ScrollReveal delay={500}>
            <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className={cn(
                    "text-center p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50",
                    "stat-card group cursor-default"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary/20 via-background to-background relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-background animate-pulse-glow">PLATFORM CAPABILITIES</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Intelligence-Grade <GradientText>Investigation Tools</GradientText>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Purpose-built modules to synthesize raw evidence into structured, actionable insights.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 100} direction="up">
                <Link to={feature.link}>
                  <Card 
                    className={cn(
                      "h-full border-border/50 bg-card/80 backdrop-blur cursor-pointer group",
                      "transition-all duration-500 hover:-translate-y-2",
                      feature.glowColor
                    )}
                  >
                    <CardContent className="p-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                        feature.bgColor,
                        "group-hover:scale-110 group-hover:rotate-3"
                      )}>
                        <feature.icon className={cn("w-6 h-6 transition-all duration-300", feature.color)} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <span className="text-sm text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        Explore <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Case File Preview */}
      <section className="py-20 md:py-32 relative">
        <GlowingOrb color="primary" size="lg" className="-left-48 top-1/4" delay={0} />
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/30 animate-pulse">
                FEATURED INVESTIGATION
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Case File #001: <GradientText>Danish Thanvi</GradientText>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                A comprehensive investigation into documented cases of business interference, harassment, 
                and procedural failures spanning 2015–2025 in Pakistan. This case study demonstrates 
                HRPM's methodology for evidence-based human rights documentation.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "117 verified sources analyzed",
                  "AI-extracted events with confidence scoring",
                  "Entity relationship mapping",
                  "International rights framework audit"
                ].map((item, index) => (
                  <li 
                    key={item} 
                    className="flex items-center gap-3 opacity-0 animate-fade-in-left"
                    style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground hover:text-foreground transition-colors">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to="/timeline">
                <Button className="group hover-lift">
                  View Full Timeline
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
                        <FileSearch className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-semibold">X24 Intelligence Briefing</h4>
                        <p className="text-sm text-muted-foreground">Compiled from 48 verified sources</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { label: "Forensic Evidence", severity: "critical" },
                        { label: "Witness Statements", severity: "high" },
                        { label: "Financial Sabotage", severity: "critical" },
                        { label: "State Surveillance", severity: "medium" }
                      ].map((item, index) => (
                        <div 
                          key={item.label} 
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg bg-muted/50",
                            "hover:bg-muted transition-all duration-300 cursor-default",
                            "opacity-0 animate-fade-in-up"
                          )}
                          style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: 'forwards' }}
                        >
                          <span className="text-sm font-medium">{item.label}</span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs transition-all duration-300 hover:scale-105",
                              item.severity === "critical" && "bg-destructive/10 text-destructive border-destructive/30 animate-pulse",
                              item.severity === "high" && "bg-chart-4/10 text-chart-4 border-chart-4/30",
                              item.severity === "medium" && "bg-chart-5/10 text-chart-5 border-chart-5/30"
                            )}
                          >
                            {item.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Link to="/intel-briefing" className="block mt-6">
                      <Button variant="outline" className="w-full group hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
                        Read Full Briefing
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

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-background">OUR MISSION</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Standing for <GradientText>Human Rights</GradientText>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                HRPM is a non-profit organization dedicated to documenting human rights abuse and supporting 
                those whose fundamental rights have been violated.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <ScrollReveal key={value.title} delay={index * 100} direction="scale">
                <Card 
                  className={cn(
                    "border-border/50 bg-card/80 backdrop-blur text-center",
                    "hover:border-primary/30 transition-all duration-500",
                    "group cursor-default hover:-translate-y-2"
                  )}
                >
                  <CardContent className="p-6">
                    <div className={cn(
                      "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4",
                      "group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300",
                      "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                    )}>
                      <value.icon className="w-7 h-7 text-primary group-hover:animate-bounce-soft" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="text-center mt-12">
              <Link to="/about">
                <Button variant="outline" className="group hover-lift hover:border-primary/50">
                  Learn More About Us
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <GlowingOrb color="primary" size="xl" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <ScrollReveal>
            <div className="relative inline-block mb-8">
              <img 
                src={hrpmLogo} 
                alt="HRPM" 
                className="w-20 h-20 mx-auto animate-float drop-shadow-[0_0_20px_hsl(var(--primary)/0.3)]" 
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <GradientText>Explore</GradientText> the Platform?
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Dive into our case files, explore entity networks, and see how we transform raw evidence 
              into structured intelligence.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/timeline">
                <Button size="lg" className="group hover-lift relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Start Exploring
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="hover-lift hover:border-primary/50 hover:bg-primary/5">
                  Create Account
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 group">
              <img 
                src={hrpmLogo} 
                alt="HRPM Logo" 
                className="w-8 h-8 transition-transform group-hover:scale-110" 
              />
              <div>
                <p className="font-semibold text-foreground">HRPM.org</p>
                <p className="text-xs text-muted-foreground">Human Rights Protection Movement</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-all duration-300 hover:translate-x-0.5">About</Link>
              <Link to="/dashboard" className="hover:text-primary transition-all duration-300 hover:translate-x-0.5">Dashboard</Link>
              <Link to="/intel-briefing" className="hover:text-primary transition-all duration-300 hover:translate-x-0.5">Intelligence</Link>
              <Link to="/auth" className="hover:text-primary transition-all duration-300 hover:translate-x-0.5">Sign In</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Documenting injustice. Demanding accountability.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © {new Date().getFullYear()} HRPM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
