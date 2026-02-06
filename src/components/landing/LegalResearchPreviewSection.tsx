import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  Scale,
  Building,
  Globe,
  CheckCircle,
  Landmark,
  Calendar
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import { cn } from "@/lib/utils";

interface CaseLawPrecedent {
  id: string;
  citation: string;
  case_name: string;
  court: string;
  jurisdiction: string;
  year: number | null;
  summary: string | null;
  is_landmark: boolean | null;
  verified: boolean | null;
}

const LegalResearchPreviewSection = () => {
  const { t } = useTranslation();

  const { data: precedents, isLoading } = useQuery({
    queryKey: ["landing-legal-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_law_precedents")
        .select("id, citation, case_name, court, jurisdiction, year, summary, is_landmark, verified")
        .order("year", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as CaseLawPrecedent[];
    },
  });

  const stats = {
    total: precedents?.length || 0,
    verified: precedents?.filter(p => p.verified).length || 0,
    landmark: precedents?.filter(p => p.is_landmark).length || 0
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-secondary/10 to-background relative">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <Badge variant="outline" className="mb-4 bg-background border-border/50">
                LEGAL RESEARCH
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Case Law <GradientText>Library</GradientText>
              </h2>
              <p className="text-foreground/70 mt-2 max-w-xl">
                Verified legal precedents and authorities for human rights litigation
              </p>
            </div>
            <Link to="/legal-research">
              <Button variant="outline" className="group hover:border-primary/50">
                Browse Library
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : precedents && precedents.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {precedents.map((precedent, index) => (
              <ScrollReveal key={precedent.id} delay={index * 100} direction="up">
                <Card className={cn(
                  "p-6 hover:border-primary/30 transition-all duration-300 h-full",
                  precedent.is_landmark && "border-chart-4/30 bg-chart-4/5"
                )}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {precedent.is_landmark && (
                          <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/30">
                            <Landmark className="w-3 h-3 mr-1" />
                            Landmark
                          </Badge>
                        )}
                        {precedent.verified && (
                          <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1">{precedent.case_name}</h3>
                    <p className="text-sm text-primary font-mono">{precedent.citation}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {precedent.court}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {precedent.jurisdiction}
                      </span>
                      {precedent.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {precedent.year}
                        </span>
                      )}
                    </div>
                    {precedent.summary && (
                      <p className="text-sm text-foreground/70 line-clamp-2">
                        {precedent.summary}
                      </p>
                    )}
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <Card className="p-12 text-center bg-muted/30">
              <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Legal Library Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Our verified case law database will be populated with relevant precedents from CourtListener.
              </p>
              <Link to="/legal-research">
                <Button variant="outline">
                  View Library
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default LegalResearchPreviewSection;