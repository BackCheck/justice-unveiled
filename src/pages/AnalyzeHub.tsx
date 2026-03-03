import { Link } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  Network,
  Scale,
  GitBranch,
  Gavel,
  Search,
  ClipboardCheck,
  Shield,
  TrendingDown,
  Globe,
  Target,
  Clock,
  Radar,
  BarChart3,
  BookOpen,
  Sparkles,
} from "lucide-react";

const tools = [
  { path: "/analyze/ai", label: "AI Analyzer", description: "Extract intelligence from documents using AI", icon: Brain, ai: true },
  { path: "/evidence", label: "Evidence Matrix", description: "Cross-reference evidence across cases", icon: FileText },
  { path: "/network", label: "Entity Network", description: "Visualize relationships between people & organizations", icon: Network },
  { path: "/correlation", label: "Claim Correlation", description: "Link claims to supporting evidence", icon: Scale },
  { path: "/reconstruction", label: "Reconstruction", description: "Rebuild event sequences and detect gaps", icon: GitBranch },
  { path: "/legal-intelligence", label: "Legal Intelligence", description: "AI-powered legal research and doctrine mapping", icon: Gavel, ai: true },
  { path: "/legal-research", label: "Legal Research", description: "Browse statutes, precedents, and case law", icon: Search },
  { path: "/compliance", label: "Compliance Checker", description: "Verify procedural compliance against SOPs", icon: ClipboardCheck },
  { path: "/threat-profiler", label: "Threat Profiler", description: "Assess risk profiles for entities and cases", icon: Shield, ai: true },
  { path: "/regulatory-harm", label: "Economic Harm", description: "Track financial impact and regulatory failures", icon: TrendingDown },
  { path: "/international", label: "International Rights", description: "Map violations to international frameworks", icon: Globe },
  { path: "/investigations", label: "Investigation Hub", description: "Full investigation workspace with pattern detection", icon: Target },
  { path: "/analysis-history", label: "Analysis History", description: "Review past AI analysis results", icon: Clock, ai: true },
  { path: "/osint-toolkit", label: "OSINT Toolkit", description: "Open-source intelligence gathering tools", icon: Radar, ai: true },
  { path: "/reports", label: "Report Center", description: "Generate and manage court-ready reports", icon: BarChart3 },
  { path: "/intel-briefing", label: "Intel Briefing", description: "Intelligence briefings and dashboards", icon: BookOpen },
  { path: "/dashboard", label: "Intel Dashboard", description: "Case overview with charts and analytics", icon: BarChart3 },
];

const AnalyzeHub = () => {
  useSEO({
    title: "Analyze Hub — HRPM",
    description: "Access all HRPM analysis and investigation tools in one place.",
  });

  return (
    <PlatformLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Analyze Hub
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            All investigation and analysis tools in one place. Select a tool to get started.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.path} to={tool.path} className="group">
                <Card className="h-full border-border/40 bg-card/60 transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                            {tool.label}
                          </h3>
                          {tool.ai && (
                            <Badge variant="secondary" className="h-4 px-1 text-[9px] gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default AnalyzeHub;
