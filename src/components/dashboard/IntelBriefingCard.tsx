import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { intelligenceBriefing, briefingStats } from "@/data/intelligenceBriefingData";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const IntelBriefingCard = () => {
  const { selectedCaseId } = useCaseFilter();

  // Only show for CF-001 case (the Danish Thanvi case that has the static briefing data)
  const { data: cf001Case } = useQuery({
    queryKey: ["cf001-case-id"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cases")
        .select("id")
        .eq("case_number", "CF-001")
        .maybeSingle();
      return data?.id || null;
    },
    staleTime: Infinity,
  });

  // Show briefing only when viewing CF-001 or "All Cases"
  const shouldShow = !selectedCaseId || selectedCaseId === cf001Case;
  if (!shouldShow || !cf001Case) return null;

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
