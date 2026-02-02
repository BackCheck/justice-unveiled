import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  Brain,
  Network,
  FileSearch,
  AlertTriangle,
  Users,
  TrendingUp,
  Shield,
  Sparkles,
  Zap,
  Eye,
  Search,
  BarChart3,
  FileText,
  Clock,
  MapPin,
} from "lucide-react";
import { ThreatProfiler } from "@/components/investigations/ThreatProfiler";
import { PatternDetector } from "@/components/investigations/PatternDetector";
import { RiskAssessment } from "@/components/investigations/RiskAssessment";
import { ReportGenerator } from "@/components/investigations/ReportGenerator";
import { InvestigationWorkspace } from "@/components/investigations/InvestigationWorkspace";
import { LinkAnalysis } from "@/components/investigations/LinkAnalysis";
import { useSEO } from "@/hooks/useSEO";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const Investigations = () => {
  useSEO({
    title: "Investigation Hub",
    description: "AI-powered investigation suite for comprehensive case analysis, threat profiling, and pattern detection.",
  });

  const { stats } = usePlatformStats();
  const [activeSection, setActiveSection] = useState<string>("workspace");

  const investigationModules = [
    {
      id: "workspace",
      label: "Workspace",
      icon: Target,
      description: "Central command for case investigation",
      color: "text-primary",
    },
    {
      id: "threats",
      label: "Threat Profiler",
      icon: Shield,
      description: "AI-generated adversary profiles",
      color: "text-red-500",
    },
    {
      id: "patterns",
      label: "Pattern Detection",
      icon: Network,
      description: "Hidden connection discovery",
      color: "text-purple-500",
    },
    {
      id: "risk",
      label: "Risk Assessment",
      icon: AlertTriangle,
      description: "Automated threat scoring",
      color: "text-orange-500",
    },
    {
      id: "links",
      label: "Link Analysis",
      icon: Users,
      description: "Entity relationship mapping",
      color: "text-blue-500",
    },
    {
      id: "reports",
      label: "Report Generator",
      icon: FileText,
      description: "AI intelligence reports",
      color: "text-emerald-500",
    },
  ];

  return (
    <PlatformLayout>
      <div className="flex flex-col h-full">
        {/* Command Center Header */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border/50 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Target className="w-7 h-7 text-primary" />
                  Investigation Hub
                  <Badge variant="secondary" className="ml-2 gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive intelligence analysis and threat assessment suite
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/80 border border-border/50">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{stats.totalEvents}</span>
                  <span className="text-xs text-muted-foreground">Events</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/80 border border-border/50">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{stats.totalEntities}</span>
                  <span className="text-xs text-muted-foreground">Entities</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium">{stats.totalDiscrepancies}</span>
                  <span className="text-xs text-muted-foreground">Issues</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Investigation Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="h-full flex flex-col">
            {/* Module Tabs */}
            <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm px-6">
              <TabsList className="h-auto p-1 bg-transparent gap-1 flex-wrap">
                {investigationModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <TabsTrigger
                      key={module.id}
                      value={module.id}
                      className="gap-2 px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                      <Icon className={`w-4 h-4 ${activeSection === module.id ? module.color : ""}`} />
                      <span className="hidden sm:inline">{module.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="workspace" className="h-full m-0 data-[state=active]:flex">
                <InvestigationWorkspace />
              </TabsContent>

              <TabsContent value="threats" className="h-full m-0 p-6 overflow-auto">
                <ThreatProfiler />
              </TabsContent>

              <TabsContent value="patterns" className="h-full m-0 p-6 overflow-auto">
                <PatternDetector />
              </TabsContent>

              <TabsContent value="risk" className="h-full m-0 p-6 overflow-auto">
                <RiskAssessment />
              </TabsContent>

              <TabsContent value="links" className="h-full m-0 p-6 overflow-auto">
                <LinkAnalysis />
              </TabsContent>

              <TabsContent value="reports" className="h-full m-0 p-6 overflow-auto">
                <ReportGenerator />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default Investigations;
