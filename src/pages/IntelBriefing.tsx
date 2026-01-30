import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { intelligenceBriefing, briefingStats } from "@/data/intelligenceBriefingData";
import { Link } from "react-router-dom";
import { ProceduralFailuresTimeline } from "@/components/intel/ProceduralFailuresTimeline";

const IntelBriefing = () => {
  const [expandedSection, setExpandedSection] = useState<string | undefined>("forensic-digital-evidence");

  return (
    <PlatformLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-destructive/5 border-b border-border py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  X24 THREAT INTELLIGENCE
                </Badge>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                  {briefingStats.sourcesReferenced} SOURCES
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
                Intelligence Briefing
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Comprehensive analysis of forensic evidence, witness statements, state surveillance misuse, 
                and financial sabotage patterns in the Danish Thanvi case. Compiled from {briefingStats.sourcesReferenced} verified sources 
                spanning {briefingStats.yearsDocumented}.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Link to="/evidence">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Evidence Matrix
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-secondary/50 border-b border-border py-4 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Case Status:</span>
              <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-300">
                {briefingStats.caseStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sections:</span>
              <span className="font-medium">{briefingStats.totalSections}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Timeline:</span>
              <span className="font-medium">{briefingStats.yearsDocumented}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground">Ongoing Threats:</span>
              <span className="font-medium text-destructive">{briefingStats.ongoingThreats.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Themes */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {briefingStats.keyThemes.map((theme) => (
            <Badge key={theme} variant="secondary" className="text-xs">
              {theme}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Content - Accordion Sections */}
      <main className="max-w-5xl mx-auto px-4 pb-12">
        <Accordion 
          type="single" 
          collapsible 
          value={expandedSection}
          onValueChange={setExpandedSection}
          className="space-y-4"
        >
          {intelligenceBriefing.map((section, index) => {
            const Icon = section.icon;
            return (
              <AccordionItem 
                key={section.id} 
                value={section.id}
                className="border rounded-lg bg-card shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          SECTION {index + 1}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground">{section.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {section.summary}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  {/* Summary */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 border-l-4 border-primary">
                    <p className="text-sm leading-relaxed">{section.summary}</p>
                  </div>

                  {/* Key Points */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Key Points
                    </h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {section.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Detailed Findings */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Detailed Findings
                    </h4>
                    <div className="space-y-4">
                      {section.details.map((detail, i) => (
                        <Card key={i} className="bg-background">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              {detail.heading}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                              {detail.content}
                            </p>
                            {detail.evidence && (
                              <Badge variant="outline" className="text-xs">
                                Evidence: {detail.evidence}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Connections */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      Pattern Connections
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <ul className="space-y-2">
                        {section.connections.map((connection, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground">{connection}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Sources */}
                  <div className="text-xs text-muted-foreground border-t pt-4">
                    <span className="font-medium">Sources: </span>
                    {section.sources}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Procedural Failures Timeline */}
        <div className="mt-8">
          <ProceduralFailuresTimeline />
        </div>

        {/* Ongoing Threats Section */}
        <Card className="mt-8 border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Ongoing Threats & Active Proceedings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {briefingStats.ongoingThreats.map((threat, i) => (
                <li key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-destructive/20">
                  <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{threat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link to="/">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-1">Interactive Timeline</h3>
                <p className="text-sm text-muted-foreground">Explore all documented events chronologically</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/evidence">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-1">Evidence Matrix</h3>
                <p className="text-sm text-muted-foreground">Cross-reference sources and documents</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/network">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-1">Entity Network</h3>
                <p className="text-sm text-muted-foreground">Map connections between key actors</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </PlatformLayout>
  );
};

export default IntelBriefing;
