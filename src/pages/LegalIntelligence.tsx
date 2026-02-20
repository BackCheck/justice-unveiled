import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Scale, Gavel, FolderOpen } from "lucide-react";
import { useCases } from "@/hooks/useCases";
import { CaseLegalTab } from "@/components/legal-intelligence";
import { useSEO } from "@/hooks/useSEO";

const LegalIntelligence = () => {
  useSEO({
    title: "Legal Intelligence",
    description: "AI-powered legal research with case law precedents, statute analysis, doctrine mapping, and appeal summary generation.",
    url: "https://hrpm.org/legal-intelligence",
    keywords: ["legal intelligence", "case law", "statute analysis", "doctrine mapping", "legal research"],
  });
  const navigate = useNavigate();
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const { data: cases, isLoading: casesLoading } = useCases();

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

        {/* Case Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              Select Case
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Choose a case to analyze..." />
              </SelectTrigger>
              <SelectContent>
                {casesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading cases...
                  </SelectItem>
                ) : cases && cases.length > 0 ? (
                  cases
                    .filter((c) => c.id && c.id.trim() !== "")
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {c.case_number}
                          </span>
                          <span>{c.title}</span>
                        </div>
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="none" disabled>
                    No cases found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

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
