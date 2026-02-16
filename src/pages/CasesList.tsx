import { Link } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, MapPin, Calendar, Users, FileText, Clock,
  AlertTriangle, Shield, Plus, Search, ArrowRight,
  Database, Brain, Scale, Network, TrendingUp, Eye,
  Zap, BarChart3, Globe, Printer, Share2
} from "lucide-react";
import { SocialShareButtons } from "@/components/sharing/SocialShareButtons";
import { CaseReportPrint } from "@/components/export/CaseReportPrint";
import { useCases, Case } from "@/hooks/useCases";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback } from "react";
import { NewCaseDialog } from "@/components/cases/NewCaseDialog";

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

const FeaturedCaseWidget = ({ caseItem, onPrint }: { caseItem: Case; onPrint: (c: Case) => void }) => (
  <Link to={`/cases/${caseItem.id}`} className="block group">
    <Card className="glass-card relative overflow-hidden border-primary/30 hover:border-primary/60 transition-all duration-500">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl group-hover:bg-primary/15 transition-all duration-700" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-destructive/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <CardContent className="relative z-10 p-6 md:p-8">
        {/* Top badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 border font-semibold">
              <Zap className="w-3 h-3 mr-1" /> Featured Case
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">{caseItem.case_number}</Badge>
          </div>
          <div className="flex gap-1.5">
            <Badge className={`${severityColors[caseItem.severity || "medium"]} border text-xs uppercase tracking-wider`}>
              {caseItem.severity}
            </Badge>
            <Badge className={`${statusColors[caseItem.status]} border text-xs uppercase tracking-wider`}>
              {caseItem.status}
            </Badge>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {caseItem.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
          {caseItem.description}
        </p>

        {/* Intelligence Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <StatBox icon={FileText} value={caseItem.total_sources} label="Source Documents" accent="primary" />
          <StatBox icon={Clock} value={caseItem.total_events} label="Timeline Events" accent="primary" />
          <StatBox icon={Users} value={caseItem.total_entities} label="Entities Mapped" accent="primary" />
          <StatBox icon={Database} value="4.7 GB" label="Raw Data Processed" accent="accent" />
          <StatBox icon={Brain} value="12" label="AI Analyses Run" accent="accent" />
          <StatBox icon={Scale} value="7" label="Legal Frameworks" accent="accent" />
        </div>

        {/* Intelligence Summary Cards */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Network Analysis</span>
            </div>
            <p className="text-xs text-muted-foreground">
              111 entities mapped across 4 categories with influence scoring. Power structure visualization reveals 3 key clusters of coordinated action.
            </p>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Pattern Detection</span>
            </div>
            <p className="text-xs text-muted-foreground">
              98 chronological events reconstructed spanning 10+ years. AI detected 14 procedural failures and 6 testimony contradictions.
            </p>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Rights Audit</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Benchmarked against UDHR, ICCPR, and 5 local statutes. Identified 23 potential violations across international and domestic frameworks.
            </p>
          </div>
        </div>

        {/* Meta + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {caseItem.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {caseItem.location}</span>
            )}
            {caseItem.date_opened && (
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Opened {format(new Date(caseItem.date_opened), "MMM d, yyyy")}</span>
            )}
            {caseItem.lead_investigator && (
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> {caseItem.lead_investigator}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPrint(caseItem); }}>
              <Printer className="w-3.5 h-3.5" /> Print Report
            </Button>
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <SocialShareButtons
                title={`${caseItem.title} | HRPM Investigation`}
                description={`${caseItem.case_number} — ${caseItem.total_sources} sources, ${caseItem.total_events} events, ${caseItem.total_entities} entities mapped`}
                hashtags={["HumanRights", "HRPM", "Justice", "Investigation"]}
                variant="compact"
              />
            </div>
            <Button variant="default" size="sm" className="glow-primary-sm gap-2">
              <Eye className="w-4 h-4" /> Explore Full Case <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const StatBox = ({ icon: Icon, value, label, accent }: { icon: any; value: string | number; label: string; accent: string }) => (
  <div className="text-center p-3 rounded-xl bg-muted/50 border border-border/30">
    <Icon className={`w-4 h-4 mx-auto mb-1.5 text-${accent === "primary" ? "primary" : "muted-foreground"}`} />
    <span className="text-lg font-bold text-foreground block">{value}</span>
    <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
  </div>
);

const CaseCard = ({ caseItem, onPrint }: { caseItem: Case; onPrint: (c: Case) => void }) => (
  <Link to={`/cases/${caseItem.id}`}>
    <Card className="glass-card h-full group cursor-pointer hover-glow-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="font-mono text-xs">{caseItem.case_number}</Badge>
          <div className="flex gap-1.5">
            <Badge className={`${severityColors[caseItem.severity || "medium"]} border text-xs`}>{caseItem.severity || "medium"}</Badge>
            <Badge className={`${statusColors[caseItem.status]} border text-xs`}>{caseItem.status}</Badge>
          </div>
        </div>
        <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors line-clamp-2">{caseItem.title}</CardTitle>
        <CardDescription className="line-clamp-3">{caseItem.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <FileText className="w-4 h-4 mx-auto mb-1 text-primary" />
            <span className="text-sm font-semibold">{caseItem.total_sources}</span>
            <p className="text-[10px] text-muted-foreground">Sources</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
            <span className="text-sm font-semibold">{caseItem.total_events}</span>
            <p className="text-[10px] text-muted-foreground">Events</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
            <span className="text-sm font-semibold">{caseItem.total_entities}</span>
            <p className="text-[10px] text-muted-foreground">Entities</p>
          </div>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {caseItem.location && (
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /><span>{caseItem.location}</span></div>
          )}
          {caseItem.date_opened && (
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>Opened {format(new Date(caseItem.date_opened), "MMM d, yyyy")}</span></div>
          )}
          {caseItem.lead_investigator && (
            <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /><span className="truncate">{caseItem.lead_investigator}</span></div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPrint(caseItem); }}>
              <Printer className="w-3.5 h-3.5" />
            </Button>
            <SocialShareButtons
              title={`${caseItem.title} | HRPM Investigation`}
              description={`${caseItem.case_number} — ${caseItem.total_sources} sources, ${caseItem.total_events} events, ${caseItem.total_entities} entities mapped`}
              hashtags={["HumanRights", "HRPM", "Justice"]}
              variant="compact"
            />
          </div>
          <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
            View Case <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const CasesList = () => {
  const { data: cases, isLoading, error } = useCases();
  const { canEdit } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [printCase, setPrintCase] = useState<Case | null>(null);
  const [showNewCase, setShowNewCase] = useState(false);
  const [userIP, setUserIP] = useState("Detecting...");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(d => setUserIP(d.ip))
      .catch(() => setUserIP("Unable to detect"));
  }, []);

  const handlePrint = useCallback((c: Case) => {
    setPrintCase(c);
    // Use timeout to let CaseReportPrint render, then open in new window
    setTimeout(() => {
      if (!printRef.current) return;
      const printContent = printRef.current.innerHTML;
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`<!DOCTYPE html><html><head><title>${c.title} – Case Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; }
          .hidden { display: block !important; }
          .print\\:block { display: block !important; }
          .min-h-screen { min-height: 100vh; }
          .flex { display: flex; } .flex-col { flex-direction: column; }
          .items-center { align-items: center; } .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .text-center { text-align: center; }
          .text-4xl { font-size: 2.25rem; } .text-3xl { font-size: 1.875rem; }
          .text-2xl { font-size: 1.5rem; } .text-xl { font-size: 1.25rem; }
          .text-lg { font-size: 1.125rem; } .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; } .font-mono { font-family: monospace; }
          .uppercase { text-transform: uppercase; }
          .tracking-widest { letter-spacing: 0.1em; } .tracking-wider { letter-spacing: 0.05em; }
          .leading-relaxed { line-height: 1.625; }
          .mb-1 { margin-bottom: 0.25rem; } .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; } .mb-6 { margin-bottom: 1.5rem; }
          .mb-8 { margin-bottom: 2rem; } .mt-1 { margin-top: 0.25rem; }
          .mt-4 { margin-top: 1rem; } .mt-6 { margin-top: 1.5rem; }
          .mt-8 { margin-top: 2rem; } .my-12 { margin-top: 3rem; margin-bottom: 3rem; }
          .ml-2 { margin-left: 0.5rem; }
          .p-3 { padding: 0.75rem; } .p-4 { padding: 1rem; }
          .p-6 { padding: 1.5rem; } .p-12 { padding: 3rem; }
          .px-8 { padding-left: 2rem; padding-right: 2rem; }
          .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .pt-3 { padding-top: 0.75rem; } .pt-6 { padding-top: 1.5rem; }
          .pb-4 { padding-bottom: 1rem; }
          .gap-2 { gap: 0.5rem; } .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; }
          .space-y-3 > * + * { margin-top: 0.75rem; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .rounded-full { border-radius: 9999px; } .rounded-lg { border-radius: 0.5rem; }
          .border { border: 1px solid #e5e7eb; }
          .border-t { border-top: 1px solid #e5e7eb; }
          .bg-gray-50 { background-color: #f9fafb; }
          .border-gray-100 { border-color: #f3f4f6; }
          .border-gray-200 { border-color: #e5e7eb; }
          .text-gray-500 { color: #6b7280; } .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; } .text-gray-800 { color: #1f2937; }
          .text-gray-900 { color: #111827; } .text-white { color: #fff; }
          .text-red-700 { color: #b91c1c; }
          .w-10 { width: 2.5rem; } .w-16 { width: 4rem; } .w-32 { width: 8rem; }
          .h-1 { height: 0.25rem; } .h-10 { height: 2.5rem; } .h-24 { height: 6rem; }
          .w-auto { width: auto; } .w-full { width: 100%; }
          .max-w-lg { max-width: 32rem; }
          .inline-flex { display: inline-flex; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
          img { max-width: 100%; height: auto; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          @page { margin: 0; size: A4; }
        </style></head><body>${printContent}</body></html>`);
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
    }, 300);
  }, []);

  // Feature the first case (oldest) if available
  const featuredCase = cases && cases.length > 0 ? cases[0] : undefined;
  const otherCases = cases?.filter((c) => c.id !== featuredCase?.id);

  const filteredOtherCases = otherCases?.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PlatformLayout>
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
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Case Files</h1>
                <p className="text-muted-foreground">
                  {cases?.length || 0} investigation{cases?.length !== 1 ? "s" : ""} on record
                </p>
              </div>
            </div>
            {canEdit && (
              <Button className="glow-primary-sm" onClick={() => setShowNewCase(true)}>
                <Plus className="w-4 h-4 mr-2" />New Case
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {isLoading ? (
          <div className="space-y-6">
            <Card className="glass-card"><CardContent className="p-8"><Skeleton className="h-48 w-full" /></CardContent></Card>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass-card"><CardHeader><Skeleton className="h-6 w-24" /><Skeleton className="h-5 w-full" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
              ))}
            </div>
          </div>
        ) : error ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">Failed to load cases</p>
              <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Featured Case */}
            {featuredCase && <FeaturedCaseWidget caseItem={featuredCase} onPrint={handlePrint} />}

            {/* Other Cases Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">All Investigations</h2>
                  <Badge variant="secondary" className="ml-1">{otherCases?.length || 0}</Badge>
                </div>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search cases..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>

              {filteredOtherCases?.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No cases found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? "Try a different search term" : "No additional cases on record"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOtherCases?.map((caseItem) => (
                    <CaseCard key={caseItem.id} caseItem={caseItem} onPrint={handlePrint} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Hidden print report */}
      {printCase && (
        <CaseReportPrint ref={printRef} caseItem={printCase} userIP={userIP} />
      )}

      <NewCaseDialog open={showNewCase} onOpenChange={setShowNewCase} />

    </PlatformLayout>
  );
};

export default CasesList;
