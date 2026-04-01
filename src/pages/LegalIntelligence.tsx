import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Scale, Gavel } from "lucide-react";
import { useCases } from "@/hooks/useCases";
import { CaseLegalTab } from "@/components/legal-intelligence";
import { useSEO } from "@/hooks/useSEO";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

const LegalIntelligence = () => {
  useSEO({
    title: "Legal Intelligence",
    description: "AI-powered legal research with case law precedents, statute analysis, doctrine mapping, and appeal summary generation.",
    url: "https://hrpm.org/legal-intelligence",
    keywords: ["legal intelligence", "case law", "statute analysis", "doctrine mapping", "legal research"],
  });
  const { selectedCaseId } = useCaseFilter();
  const { data: cases } = useCases();

  const selectedCase = cases?.find((c) => c.id === selectedCaseId);

  return (
    <PlatformLayout>
      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              Legal Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">
              Attach statutes, map case law, apply doctrines, and generate appeal summaries
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1 py-1.5 px-3">
              <Scale className="h-4 w-4" />
              Doctrine Mapping
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 py-1.5 px-3">
              <Gavel className="h-4 w-4" />
              Precedent Library
            </Badge>
          </div>
        </div>

        {/* Case is selected via global header selector */}

        {/* Legal Intelligence Content */}
        {selectedCaseId ? (
          <CaseLegalTab caseId={selectedCaseId} caseTitle={selectedCase?.title} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a Case</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a case from the dropdown above to access the legal intelligence tools,
                including statute attachment, case law mapping, doctrine application, and
                AI-powered appeal summary generation.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PlatformLayout>
  );
};

export default LegalIntelligence;
