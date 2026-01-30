import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  FileCheck, 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar,
  Scale,
  Target,
  BarChart3,
  MessageSquare,
  FileText
} from "lucide-react";
import { timelineData } from "@/data/timelineData";
import { entities } from "@/data/entitiesData";
import { keyFindings, severityColors, findingCategoryColors } from "@/data/keyFindingsData";
import { sources } from "@/data/sourcesData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IntelBriefingCard } from "./IntelBriefingCard";
import { CaseProfileBadges } from "./CaseProfileBadges";
import { EntityCharts } from "./EntityCharts";
import { IntelChat } from "./IntelChat";
import { IntelReports } from "./IntelReports";

export const IntelDashboard = () => {
  const stats = useMemo(() => {
    const categories = timelineData.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const years = [...new Set(timelineData.map(e => e.date.split('-')[0]))];
    
    return {
      totalEvents: timelineData.length,
      categories,
      yearsSpan: `${Math.min(...years.map(Number))} - ${Math.max(...years.map(Number))}`,
      entities: entities.length,
      sources: sources.length,
      criticalFindings: keyFindings.filter(f => f.severity === "critical").length
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Stats - Pill-shaped indicators with hover effects */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card stat-card border-primary/20 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-primary/10 stat-icon transition-all duration-300 group-hover:bg-primary/20">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-primary stat-number">{stats.yearsSpan}</p>
                  <span className="pill-stat h-2 w-8 bg-primary/60 transition-all duration-500 group-hover:w-12" />
                </div>
                <p className="text-xs text-muted-foreground">Timeline Span</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card stat-card border-destructive/20 opacity-0 animate-fade-in-up group" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-destructive/10 stat-icon transition-all duration-300 group-hover:bg-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-destructive stat-number">{stats.criticalFindings}</p>
                  <span className="pill-stat h-2 w-6 bg-destructive/60 transition-all duration-500 group-hover:w-10 animate-pulse" />
                </div>
                <p className="text-xs text-muted-foreground">Critical Findings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card stat-card border-chart-2/20 opacity-0 animate-fade-in-up group" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-chart-2/10 stat-icon transition-all duration-300 group-hover:bg-chart-2/20">
                <Users className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-chart-2 stat-number">{stats.entities}</p>
                  <span className="pill-stat h-2 w-10 bg-chart-2/60 transition-all duration-500 group-hover:w-14" />
                </div>
                <p className="text-xs text-muted-foreground">Entities Mapped</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card stat-card border-chart-4/20 opacity-0 animate-fade-in-up group" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-chart-4/10 stat-icon transition-all duration-300 group-hover:bg-chart-4/20">
                <FileCheck className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-chart-4 stat-number">{stats.sources}</p>
                  <span className="pill-stat h-2 w-8 bg-chart-4/60 transition-all duration-500 group-hover:w-12" />
                </div>
                <p className="text-xs text-muted-foreground">Verified Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Overview */}
      <Card className="opacity-0 animate-fade-in-up overflow-hidden relative" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Case: Danish Thanvi vs. Agencies
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 badge-pop glow-pulse">
              ACQUITTED - May 2025
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-muted-foreground mb-4">
            A decade-long pattern of systematic harassment, evidence fabrication, and regulatory abuse 
            targeting a business executive, culminating in full acquittal after procedural violations 
            and document forgeries were exposed.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors duration-300 hover-lift cursor-default">
              <p className="font-semibold text-amber-700">{stats.categories["Business Interference"] || 0}</p>
              <p className="text-muted-foreground">Business Interference</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors duration-300 hover-lift cursor-default">
              <p className="font-semibold text-red-700">{stats.categories["Harassment"] || 0}</p>
              <p className="text-muted-foreground">Harassment Events</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors duration-300 hover-lift cursor-default">
              <p className="font-semibold text-blue-700">{stats.categories["Legal Proceeding"] || 0}</p>
              <p className="text-muted-foreground">Legal Proceedings</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors duration-300 hover-lift cursor-default">
              <p className="font-semibold text-purple-700">{stats.categories["Criminal Allegation"] || 0}</p>
              <p className="text-muted-foreground">Criminal Allegations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Profile Badges */}
      <CaseProfileBadges />

      {/* Analytics Section with Tabs */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Entity Charts
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="mt-4">
          <EntityCharts />
        </TabsContent>
        
        <TabsContent value="chat" className="mt-4">
          <IntelChat />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-4">
          <IntelReports />
        </TabsContent>
      </Tabs>

      {/* Intel Briefing Card */}
      <IntelBriefingCard />

      {/* Key Findings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Key Intelligence Findings
          </h2>
          <Link to="/evidence">
            <Button variant="outline" size="sm">View Evidence Matrix</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keyFindings.slice(0, 6).map((finding) => {
            const Icon = finding.icon;
            return (
              <Card key={finding.id} className="glass-card card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2.5 rounded-full ${findingCategoryColors[finding.category]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge className={`${severityColors[finding.severity]} rounded-full px-3`} variant="secondary">
                        {finding.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{finding.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{finding.summary}</p>
                  <ul className="text-xs space-y-1">
                    {finding.details.slice(0, 2).map((detail, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="pill-stat h-1.5 w-1.5 mt-1.5 bg-accent" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/">
          <Card className="glass-card card-hover cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Interactive Timeline</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{stats.totalEvents} documented events</p>
                    <span className="pill-stat h-1.5 w-4 bg-primary/40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/network">
          <Card className="glass-card card-hover cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-chart-2/10 group-hover:bg-chart-2/20 transition-colors">
                  <Users className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <h3 className="font-semibold">Entity Network</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Map connections between actors</p>
                    <span className="pill-stat h-1.5 w-4 bg-chart-2/40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/evidence">
          <Card className="glass-card card-hover cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-chart-4/10 group-hover:bg-chart-4/20 transition-colors">
                  <Building2 className="w-6 h-6 text-chart-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Evidence Matrix</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Cross-reference sources</p>
                    <span className="pill-stat h-1.5 w-4 bg-chart-4/40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
