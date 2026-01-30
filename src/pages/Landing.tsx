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
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import hrpmLogo from "@/assets/human-rights-logo.svg";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Extract events, entities, and violations from raw documents using advanced AI intelligence.",
      link: "/uploads",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10"
    },
    {
      icon: Network,
      title: "Entity Network",
      description: "Visualize relationships between individuals, organizations, and institutions with interactive graphs.",
      link: "/network",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10"
    },
    {
      icon: FileSearch,
      title: "Evidence Matrix",
      description: "Cross-reference sources and map documents to events with reliability tracking.",
      link: "/evidence",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10"
    },
    {
      icon: Globe,
      title: "International Rights Audit",
      description: "Map violations against UN UDHR, ICCPR, CAT, and other global human rights frameworks.",
      link: "/international",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10"
    }
  ];

  const stats = [
    { value: "117+", label: "Verified Sources" },
    { value: "10+", label: "Years Documented" },
    { value: "50+", label: "Timeline Events" },
    { value: "6", label: "Int'l Frameworks" }
  ];

  const values = [
    { icon: Scale, title: "Justice", description: "Fair treatment under the law for everyone." },
    { icon: Shield, title: "Protection", description: "Safeguarding fundamental human rights." },
    { icon: FileText, title: "Transparency", description: "Bringing procedural failures to light." },
    { icon: Users, title: "Solidarity", description: "Standing with those facing injustice." }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={hrpmLogo} 
              alt="HRPM Logo" 
              className="w-10 h-10 transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground tracking-tight">HRPM</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Human Rights Protection Movement</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/intel-briefing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Intelligence</Link>
            <Link to="/auth">
              <Button size="sm" variant="outline">Sign In</Button>
            </Link>
          </nav>
          <Link to="/" className="md:hidden">
            <Button size="sm">Explore</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl floating-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/30",
                "opacity-0 animate-fade-in badge-pop"
              )}
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Investigative Intelligence Platform
            </Badge>

            {/* Main Headline */}
            <h1 
              className={cn(
                "text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              <span className="text-foreground">Documenting </span>
              <span className="text-gradient-animate">Justice</span>
              <br />
              <span className="text-foreground">Demanding </span>
              <span className="text-primary">Accountability</span>
            </h1>

            {/* Subtitle */}
            <p 
              className={cn(
                "text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
            >
              An open-source investigative platform transforming documented facts into actionable intelligence 
              for human rights monitoring and anti-corruption efforts.
            </p>

            {/* CTA Buttons */}
            <div 
              className={cn(
                "flex flex-col sm:flex-row items-center justify-center gap-4",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
            >
            <Link to="/timeline">
              <Button size="lg" className="group hover-lift">
                Explore Case File #001
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/dashboard">
                <Button size="lg" variant="outline" className="hover-lift">
                  View Intel Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div 
            className={cn(
              "mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto",
              "opacity-0 animate-fade-in-up"
            )}
            style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
          >
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover-lift"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-secondary/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-background">PLATFORM CAPABILITIES</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Intelligence-Grade Investigation Tools
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Purpose-built modules to synthesize raw evidence into structured, actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={feature.title} to={feature.link}>
                <Card 
                  className={cn(
                    "h-full border-border/50 bg-card/80 backdrop-blur hover-lift cursor-pointer group",
                    "opacity-0 animate-fade-in-up"
                  )}
                  style={{ animationDelay: `${0.1 * (index + 1)}s`, animationFillMode: 'forwards' }}
                >
                  <CardContent className="p-6">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", feature.bgColor)}>
                      <feature.icon className={cn("w-6 h-6", feature.color)} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <span className="text-sm text-primary flex items-center gap-1">
                      Explore <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Case File Preview */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/30">
                FEATURED INVESTIGATION
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Case File #001: Danish Thanvi
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
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to="/timeline">
                <Button className="group hover-lift">
                  View Full Timeline
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl" />
              <Card className="relative border-border/50 bg-card/90 backdrop-blur overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileSearch className="w-6 h-6 text-primary" />
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
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">{item.label}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            item.severity === "critical" && "bg-destructive/10 text-destructive border-destructive/30",
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
                    <Button variant="outline" className="w-full group">
                      Read Full Briefing
                      <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-background">OUR MISSION</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Standing for Human Rights
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              HRPM is a non-profit organization dedicated to documenting human rights abuse and supporting 
              those whose fundamental rights have been violated.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={value.title} 
                className={cn(
                  "border-border/50 bg-card/80 backdrop-blur text-center hover-lift",
                  "opacity-0 animate-fade-in-up"
                )}
                style={{ animationDelay: `${0.1 * (index + 1)}s`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/about">
              <Button variant="outline" className="group hover-lift">
                Learn More About Us
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <img src={hrpmLogo} alt="HRPM" className="w-20 h-20 mx-auto mb-8 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Explore the Platform?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Dive into our case files, explore entity networks, and see how we transform raw evidence 
            into structured intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/timeline">
              <Button size="lg" className="group hover-lift">
                Start Exploring
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="hover-lift">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={hrpmLogo} alt="HRPM Logo" className="w-8 h-8" />
              <div>
                <p className="font-semibold text-foreground">HRPM.org</p>
                <p className="text-xs text-muted-foreground">Human Rights Protection Movement</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/intel-briefing" className="hover:text-primary transition-colors">Intelligence</Link>
              <Link to="/auth" className="hover:text-primary transition-colors">Sign In</Link>
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
