import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Scale, 
  Search,
  ExternalLink,
  Calendar,
  Building,
  Globe,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Landmark,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseLawPrecedent {
  id: string;
  citation: string;
  case_name: string;
  court: string;
  jurisdiction: string;
  year: number | null;
  summary: string | null;
  key_principles: string[] | null;
  related_statutes: string[] | null;
  is_landmark: boolean | null;
  source_url: string | null;
  verified: boolean | null;
  notes: string | null;
}

const LegalResearch = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const { data: precedents, isLoading } = useQuery({
    queryKey: ["case-law-precedents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_law_precedents")
        .select("*")
        .order("year", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as CaseLawPrecedent[];
    },
  });

  // Get unique jurisdictions for filter
  const jurisdictions = [...new Set(precedents?.map(p => p.jurisdiction).filter(Boolean))];

  const filteredPrecedents = precedents?.filter(precedent => {
    const matchesSearch = 
      precedent.case_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      precedent.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      precedent.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJurisdiction = jurisdictionFilter === "all" || precedent.jurisdiction === jurisdictionFilter;
    const matchesVerified = verifiedFilter === "all" || 
      (verifiedFilter === "verified" && precedent.verified) ||
      (verifiedFilter === "unverified" && !precedent.verified);

    return matchesSearch && matchesJurisdiction && matchesVerified;
  });

  const landmarkCases = filteredPrecedents?.filter(p => p.is_landmark);
  const recentCases = filteredPrecedents?.filter(p => !p.is_landmark);

  const stats = {
    total: precedents?.length || 0,
    verified: precedents?.filter(p => p.verified).length || 0,
    landmark: precedents?.filter(p => p.is_landmark).length || 0,
    jurisdictions: jurisdictions.length
  };

  return (
    <PlatformLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Scale className="w-8 h-8 text-primary" />
              Legal Research Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Verified case law precedents and legal authorities
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Precedents</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <CheckCircle className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <Landmark className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.landmark}</p>
                <p className="text-sm text-muted-foreground">Landmark Cases</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Globe className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.jurisdictions}</p>
                <p className="text-sm text-muted-foreground">Jurisdictions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search case name, citation, or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jurisdictions</SelectItem>
              {jurisdictions.map(j => (
                <SelectItem key={j} value={j}>{j}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPrecedents?.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No precedents found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Landmark Cases */}
            {landmarkCases && landmarkCases.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-chart-4" />
                  Landmark Cases
                </h2>
                <div className="space-y-4">
                  {landmarkCases.map((precedent) => (
                    <PrecedentCard key={precedent.id} precedent={precedent} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Cases */}
            <div className="space-y-4">
              {landmarkCases && landmarkCases.length > 0 && (
                <h2 className="text-xl font-semibold">All Precedents</h2>
              )}
              <div className="space-y-4">
                {recentCases?.map((precedent) => (
                  <PrecedentCard key={precedent.id} precedent={precedent} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  );
};

const PrecedentCard = ({ precedent }: { precedent: CaseLawPrecedent }) => (
  <Card className={cn(
    "hover:border-primary/30 transition-all duration-300",
    precedent.is_landmark && "border-chart-4/30 bg-chart-4/5"
  )}>
    <CardContent className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{precedent.case_name}</h3>
              {precedent.is_landmark && (
                <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/30">
                  <Landmark className="w-3 h-3 mr-1" />
                  Landmark
                </Badge>
              )}
              {precedent.verified ? (
                <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Unverified
                </Badge>
              )}
            </div>
            <p className="text-sm text-primary font-mono">{precedent.citation}</p>
          </div>
          {precedent.source_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={precedent.source_url} target="_blank" rel="noopener noreferrer">
                View Source
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building className="w-4 h-4" />
            {precedent.court}
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            {precedent.jurisdiction}
          </span>
          {precedent.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {precedent.year}
            </span>
          )}
        </div>

        {/* Summary */}
        {precedent.summary && (
          <p className="text-sm text-foreground/80 leading-relaxed">
            {precedent.summary}
          </p>
        )}

        {/* Key Principles */}
        {precedent.key_principles && precedent.key_principles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Principles:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {precedent.key_principles.map((principle, i) => (
                <li key={i}>{principle}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Statutes */}
        {precedent.related_statutes && precedent.related_statutes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {precedent.related_statutes.map((statute, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {statute}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default LegalResearch;