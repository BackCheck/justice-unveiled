import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { TeaserWrapper } from "@/components/TeaserWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  MapPin, 
  Calendar, 
  Users, 
  FileText, 
  Clock,
  AlertTriangle,
  Shield,
  Plus,
  Search,
  ArrowRight
} from "lucide-react";
import { useCases } from "@/hooks/useCases";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  low: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  closed: "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30",
  pending: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
};

const CasesList = () => {
  const { t } = useTranslation();
  const { data: cases, isLoading, error } = useCases();
  const { canEdit } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCases = cases?.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PlatformLayout>
      <TeaserWrapper
        variant="blur"
        title={t('teaser.casesTitle', 'Browse Investigation Case Files')}
        description={t('teaser.casesDesc', 'Access detailed case profiles, evidence documentation, and investigation timelines.')}
        previewHeight="90vh"
      >
      {/* Header */}
      <div className="bg-secondary/50 backdrop-blur-xl border-b border-border/30 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 glow-primary-sm">
                <FolderOpen className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {t('cases.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('common.investigationsOnRecord', { count: cases?.length || 0 })}
                </p>
              </div>
            </div>
            {canEdit && (
              <Button className="glow-primary-sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('common.newCase')}
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('common.searchCases')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">{t('common.failedToLoad')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('common.tryAgain')}</p>
            </CardContent>
          </Card>
        ) : filteredCases?.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{t('common.noCasesFound')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? t('common.tryDifferentSearch') : t('common.createFirstCase')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases?.map((caseItem) => (
              <Link key={caseItem.id} to={`/cases/${caseItem.id}`}>
                <Card className="glass-card h-full group cursor-pointer hover-glow-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {caseItem.case_number}
                      </Badge>
                      <div className="flex gap-1.5">
                        <Badge className={`${severityColors[caseItem.severity || "medium"]} border text-xs`}>
                          {caseItem.severity || "medium"}
                        </Badge>
                        <Badge className={`${statusColors[caseItem.status]} border text-xs`}>
                          {caseItem.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors line-clamp-2">
                      {caseItem.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {caseItem.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <FileText className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <span className="text-sm font-semibold">{caseItem.total_sources}</span>
                        <p className="text-[10px] text-muted-foreground">{t('common.sources')}</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <span className="text-sm font-semibold">{caseItem.total_events}</span>
                        <p className="text-[10px] text-muted-foreground">{t('common.events')}</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <span className="text-sm font-semibold">{caseItem.total_entities}</span>
                        <p className="text-[10px] text-muted-foreground">{t('common.entities')}</p>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {caseItem.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{caseItem.location}</span>
                        </div>
                      )}
                      {caseItem.date_opened && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{t('common.opened')} {format(new Date(caseItem.date_opened), "MMM d, yyyy")}</span>
                        </div>
                      )}
                      {caseItem.lead_investigator && (
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          <span className="truncate">{caseItem.lead_investigator}</span>
                        </div>
                      )}
                    </div>

                    {/* View button */}
                    <div className="mt-4 flex items-center justify-end text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('common.viewCase')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      </TeaserWrapper>
    </PlatformLayout>
  );
};

export default CasesList;
