import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ExternalLink, 
  Fingerprint, 
  Users, 
  Eye, 
  Shield,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { intelligenceBriefing, briefingStats } from "@/data/intelligenceBriefingData";

export const IntelBriefingCard = () => {
  // Show first 4 briefing sections as preview
  const previewSections = intelligenceBriefing.slice(0, 4);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            X24 Intelligence Briefing
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {briefingStats.sourcesReferenced} SOURCES
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Comprehensive threat intelligence analysis compiled from NotebookLM. 
          Covers forensic evidence, witness analysis, state surveillance, and financial sabotage patterns.
        </p>
      </CardHeader>
      <CardContent>
        {/* Preview Grid */}
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          {previewSections.map((section) => {
            const Icon = section.icon;
            return (
              <div 
                key={section.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-background border hover:border-primary/30 transition-colors"
              >
                <div className="p-1.5 rounded bg-primary/10 flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium truncate">{section.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {section.keyPoints[0]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Themes */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {briefingStats.keyThemes.slice(0, 4).map((theme) => (
            <Badge key={theme} variant="secondary" className="text-xs">
              {theme}
            </Badge>
          ))}
          <Badge variant="secondary" className="text-xs text-muted-foreground">
            +{briefingStats.keyThemes.length - 4} more
          </Badge>
        </div>

        {/* CTA */}
        <Link to="/intel-briefing">
          <Button className="w-full" variant="default">
            <span>View Full Intelligence Briefing</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
