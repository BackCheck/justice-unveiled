import { lazy, Suspense, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { cn } from "@/lib/utils";
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
  ExternalLink,
} from "lucide-react";

// Lazy-load embedded tools
const DocumentAnalyzer = lazy(() =>
  import("@/components/intel/DocumentAnalyzer").then((m) => ({ default: m.DocumentAnalyzer }))
);
const BatchDocumentUploader = lazy(() =>
  import("@/components/intel/BatchDocumentUploader").then((m) => ({ default: m.BatchDocumentUploader }))
);
const AnalyzedDataSummary = lazy(() =>
  import("@/components/intel/AnalyzedDataSummary").then((m) => ({ default: m.AnalyzedDataSummary }))
);

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface ToolDef {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  ai?: boolean;
  /** If set, tool opens full page instead of embedding */
  fullPagePath?: string;
}

const tools: ToolDef[] = [
  { key: "ai", label: "AI Analyzer", description: "Extract intelligence from documents using AI", icon: Brain, ai: true },
  { key: "evidence", label: "Evidence Matrix", description: "Cross-reference evidence across cases", icon: FileText, fullPagePath: "/evidence" },
  { key: "network", label: "Entity Network", description: "Visualize relationships between people & organizations", icon: Network, fullPagePath: "/network" },
  { key: "correlation", label: "Claim Correlation", description: "Link claims to supporting evidence", icon: Scale, fullPagePath: "/correlation" },
  { key: "reconstruction", label: "Reconstruction", description: "Rebuild event sequences and detect gaps", icon: GitBranch, fullPagePath: "/reconstruction" },
  { key: "legal-intelligence", label: "Legal Intelligence", description: "AI-powered legal research and doctrine mapping", icon: Gavel, ai: true, fullPagePath: "/legal-intelligence" },
  { key: "legal-research", label: "Legal Research", description: "Browse statutes, precedents, and case law", icon: Search, fullPagePath: "/legal-research" },
  { key: "compliance", label: "Compliance Checker", description: "Verify procedural compliance against SOPs", icon: ClipboardCheck, fullPagePath: "/compliance" },
  { key: "threat-profiler", label: "Threat Profiler", description: "Assess risk profiles for entities and cases", icon: Shield, ai: true, fullPagePath: "/threat-profiler" },
  { key: "regulatory-harm", label: "Economic Harm", description: "Track financial impact and regulatory failures", icon: TrendingDown, fullPagePath: "/regulatory-harm" },
  { key: "international", label: "International Rights", description: "Map violations to international frameworks", icon: Globe, fullPagePath: "/international" },
  { key: "investigations", label: "Investigation Hub", description: "Full investigation workspace with pattern detection", icon: Target, fullPagePath: "/investigations" },
  { key: "analysis-history", label: "Analysis History", description: "Review past AI analysis results", icon: Clock, ai: true, fullPagePath: "/analysis-history" },
  { key: "osint-toolkit", label: "OSINT Toolkit", description: "Open-source intelligence gathering tools", icon: Radar, ai: true, fullPagePath: "/osint-toolkit" },
  { key: "reports", label: "Report Center", description: "Generate and manage court-ready reports", icon: BarChart3, fullPagePath: "/reports" },
  { key: "intel-briefing", label: "Intel Briefing", description: "Intelligence briefings and dashboards", icon: BookOpen, fullPagePath: "/intel-briefing" },
  { key: "dashboard", label: "Intel Dashboard", description: "Case overview with charts and analytics", icon: BarChart3, fullPagePath: "/dashboard" },
];

const AnalyzeHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTool = searchParams.get("tool") || "";

  // Default to AI Analyzer if no tool param
  useEffect(() => {
    if (!selectedTool) {
      setSearchParams({ tool: "ai" }, { replace: true });
    }
  }, [selectedTool, setSearchParams]);

  const activeTool = tools.find((t) => t.key === (selectedTool || "ai")) || tools[0];

  useSEO({
    title: `${activeTool.label} — Analyze Hub — HRPM`,
    description: activeTool.description,
  });

  const handleToolSelect = (tool: ToolDef) => {
    if (tool.fullPagePath) {
      // Don't change search params for full-page tools — user clicks through
      return;
    }
    setSearchParams({ tool: tool.key }, { replace: true });
  };

  return (
    <PlatformLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Brain className="w-7 h-7 text-primary" />
            Analyze Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            All investigation and analysis tools in one place.
          </p>
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool.key === tool.key && !tool.fullPagePath;
            const isFullPage = !!tool.fullPagePath;

            const cardContent = (
              <Card
                className={cn(
                  "h-full border transition-all duration-150 cursor-pointer",
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/40 bg-card/60 hover:border-primary/30 hover:shadow-sm"
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    {tool.ai && (
                      <Badge variant="secondary" className="h-3.5 px-1 text-[8px] gap-0.5">
                        <Sparkles className="w-2 h-2" /> AI
                      </Badge>
                    )}
                    {isFullPage && (
                      <ExternalLink className="w-3 h-3 text-muted-foreground/50 ml-auto shrink-0" />
                    )}
                  </div>
                  <h3 className={cn("font-medium text-xs leading-tight", isActive ? "text-primary" : "text-foreground")}>
                    {tool.label}
                  </h3>
                </CardContent>
              </Card>
            );

            if (isFullPage) {
              return (
                <Link key={tool.key} to={tool.fullPagePath!} className="group">
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={tool.key} onClick={() => handleToolSelect(tool)} role="button" tabIndex={0}>
                {cardContent}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Embedded tool panel */}
        {(selectedTool === "ai" || !selectedTool) && (
          <Suspense fallback={<div className="flex justify-center py-12"><LogoSpinner size="lg" /></div>}>
            <div className="space-y-6">
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="single">Single Document</TabsTrigger>
                  <TabsTrigger value="batch">Batch Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="single" className="mt-4">
                  <DocumentAnalyzer />
                </TabsContent>
                <TabsContent value="batch" className="mt-4">
                  <BatchDocumentUploader />
                </TabsContent>
              </Tabs>
              <Separator />
              <AnalyzedDataSummary />
            </div>
          </Suspense>
        )}
      </div>
    </PlatformLayout>
  );
};

export default AnalyzeHub;
