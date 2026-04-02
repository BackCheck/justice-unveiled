import { useState, useRef } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useSEO } from "@/hooks/useSEO";
import { useCaseFilter } from "@/contexts/CaseFilterContext";
import { useFinancialAbuse } from "@/hooks/useFinancialAbuse";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { toast } from "sonner";
import {
  DollarSign, AlertTriangle, Users, Upload, Shield, TrendingUp,
  FileText, BarChart3, Clock, Target, Sparkles, AlertOctagon,
  CreditCard, Banknote, UserX, FileWarning, Activity, Eye,
} from "lucide-react";

const riskColors: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  none: "bg-muted text-muted-foreground border-border",
};

const categoryIcons: Record<string, typeof AlertTriangle> = {
  financial_abuse: DollarSign,
  workplace_coercion: UserX,
  fraud_indicator: AlertOctagon,
  governance_failure: Shield,
  whistleblower_risk: Eye,
};

const typeLabels: Record<string, string> = {
  salary_manipulation: "Salary Manipulation",
  personal_expense_abuse: "Personal Expense Abuse",
  credit_card_fraud: "Credit Card Fraud",
  suspicious_advance: "Suspicious Advance",
  fake_debt: "Fake Debt Creation",
  embezzlement: "Embezzlement",
  expense_manipulation: "Expense Manipulation",
  forced_deduction: "Forced Deduction",
  governance_failure: "Governance Failure",
  other: "Other",
};

const categoryLabels: Record<string, string> = {
  financial_abuse: "Financial Abuse",
  workplace_coercion: "Workplace Coercion",
  fraud_indicator: "Fraud Indicator",
  governance_failure: "Governance Failure",
  whistleblower_risk: "Whistleblower Risk",
};

const FinancialAbuse = () => {
  useSEO({
    title: "Financial Abuse Intelligence",
    description: "AI-powered financial abuse detection, corporate fraud investigation, and forensic financial analysis for human rights cases.",
  });

  const { selectedCaseId } = useCaseFilter();
  const { user } = useAuth();
  const {
    investigations, findings, actors, evidence,
    stats, loading, analyzing,
    createInvestigation, uploadAndAnalyze, refreshData,
  } = useFinancialAbuse(selectedCaseId || undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (!user) { toast.error("Please sign in to upload evidence"); return; }

    let investigation = investigations[0];
    if (!investigation) {
      const inv = await createInvestigation(
        `Financial Investigation — ${selectedCase?.title || "General"}`,
        `AI-powered financial abuse analysis for ${selectedCase?.case_number || "general investigation"}`
      );
      if (!inv) return;
      investigation = inv;
    }

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'csv', 'pdf', 'txt', 'json', 'xls'].includes(ext || '')) {
        toast.error(`Unsupported file type: ${file.name}. Use Excel, CSV, PDF, or text files.`);
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }
      await uploadAndAnalyze(investigation.id, file, selectedCase?.title);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center min-h-[60vh]"><LogoSpinner size="lg" /></div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              Financial Abuse Intelligence
              <Badge variant="secondary"><Sparkles className="w-3 h-3 mr-1" />AI Forensics</Badge>
            </h1>
            <p className="text-muted-foreground mt-2">
              Detect salary manipulation, corporate fraud, embezzlement, and financial coercion patterns
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xlsx,.csv,.pdf,.txt,.json,.xls"
              className="hidden"
              onChange={handleUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={analyzing}>
              <Upload className="w-4 h-4 mr-2" />
              {analyzing ? "Analyzing..." : "Upload Financial Records"}
            </Button>
          </div>
        </div>

        {/* Stats Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatsCard icon={DollarSign} label="Suspicious Amount" value={formatCurrency(stats.totalSuspiciousAmount)} color="text-destructive" />
          <StatsCard icon={Users} label="Actors Identified" value={stats.totalActors.toString()} color="text-orange-500" />
          <StatsCard icon={AlertTriangle} label="Total Findings" value={stats.totalFindings.toString()} color="text-yellow-500" />
          <StatsCard icon={AlertOctagon} label="Critical Findings" value={stats.criticalFindings.toString()} color="text-destructive" />
          <StatsCard icon={Target} label="High-Risk Actors" value={stats.highRiskActors.toString()} color="text-orange-500" />
          <StatsCard icon={Shield} label="Risk Level" value={stats.riskLevel.toUpperCase()} color="text-primary" />
        </div>

        {/* Risk Level Banner */}
        {stats.riskLevel !== 'none' && (
          <div className={`p-4 rounded-lg border ${riskColors[stats.riskLevel]}`}>
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-5 h-5" />
              Overall Risk: {stats.riskLevel.toUpperCase()}
              {stats.totalSuspiciousAmount > 0 && (
                <span className="ml-2">— Total Suspicious: {formatCurrency(stats.totalSuspiciousAmount)}</span>
              )}
            </div>
            {investigations[0]?.investigation_summary && (
              <p className="mt-2 text-sm opacity-90">{investigations[0].investigation_summary}</p>
            )}
          </div>
        )}

        {analyzing && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <LogoSpinner size="sm" />
              <div className="flex-1">
                <p className="font-medium">AI Analysis in Progress</p>
                <p className="text-sm text-muted-foreground">Scanning financial records for abuse patterns...</p>
                <Progress value={65} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="findings"><AlertTriangle className="w-4 h-4 mr-1" />Findings</TabsTrigger>
            <TabsTrigger value="actors"><Users className="w-4 h-4 mr-1" />Actors</TabsTrigger>
            <TabsTrigger value="timeline"><Clock className="w-4 h-4 mr-1" />Timeline</TabsTrigger>
            <TabsTrigger value="evidence"><FileText className="w-4 h-4 mr-1" />Evidence</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-4">
            {findings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <DollarSign className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Financial Analysis Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Upload Excel files, CSV data, or bank statements to begin AI-powered financial abuse detection.
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />Upload Financial Records
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Category Breakdown */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(categoryLabels).map(([key, label]) => {
                    const count = stats.byCategory[key] || 0;
                    if (count === 0) return null;
                    const Icon = categoryIcons[key] || AlertTriangle;
                    return (
                      <Card key={key} className="border-l-4 border-l-destructive/50">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-destructive/10">
                            <Icon className="w-6 h-6 text-destructive" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-sm text-muted-foreground">{label}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Top Findings */}
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />Critical Findings</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {findings.filter(f => f.risk_score >= 60).slice(0, 6).map(f => (
                      <div key={f.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                        <div className={`p-2 rounded-lg ${f.risk_score >= 80 ? 'bg-destructive/10' : 'bg-orange-500/10'}`}>
                          {f.risk_score >= 80 ? <AlertOctagon className="w-5 h-5 text-destructive" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{f.title}</p>
                            <Badge className={riskColors[f.risk_score >= 80 ? 'critical' : f.risk_score >= 60 ? 'high' : 'medium']} variant="outline">
                              Risk: {f.risk_score}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{f.description}</p>
                          {f.amount > 0 && <p className="text-sm font-semibold mt-1">{f.currency} {f.amount.toLocaleString()}</p>}
                          {f.actor_names?.length ? (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {f.actor_names.map((name, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Top Actors */}
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-orange-500" />Actor Risk Profiles</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {actors.slice(0, 6).map(actor => (
                        <div key={actor.id} className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{actor.actor_name}</p>
                            <Badge className={riskColors[actor.risk_score >= 80 ? 'critical' : actor.risk_score >= 60 ? 'high' : 'medium']} variant="outline">
                              {actor.risk_score}%
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {actor.total_amount > 0 && <p>Amount: PKR {actor.total_amount.toLocaleString()}</p>}
                            {actor.transaction_count > 0 && <p>Transactions: {actor.transaction_count}</p>}
                            {actor.role_description && <p className="italic">{actor.role_description}</p>}
                          </div>
                          {actor.pattern_types?.length ? (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {actor.pattern_types.map((p, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                              ))}
                            </div>
                          ) : null}
                          <Progress value={actor.risk_score} className="mt-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Findings Tab */}
          <TabsContent value="findings" className="space-y-4 mt-4">
            {findings.length === 0 ? (
              <EmptyState label="No findings detected yet" />
            ) : (
              findings.map(f => (
                <Card key={f.id} className="border-l-4" style={{ borderLeftColor: f.risk_score >= 80 ? 'hsl(var(--destructive))' : f.risk_score >= 60 ? '#f97316' : '#eab308' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="outline">{typeLabels[f.finding_type] || f.finding_type}</Badge>
                          <Badge className={riskColors[f.risk_score >= 80 ? 'critical' : f.risk_score >= 60 ? 'high' : 'medium']} variant="outline">
                            Risk: {f.risk_score}%
                          </Badge>
                          <Badge variant="secondary">{categoryLabels[f.category] || f.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{f.title}</h3>
                        <p className="text-muted-foreground mt-1">{f.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {f.amount > 0 && <span className="font-semibold">{f.currency} {f.amount.toLocaleString()}</span>}
                          {f.date_detected && <span className="text-muted-foreground">{f.date_detected}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Actors Tab */}
          <TabsContent value="actors" className="space-y-4 mt-4">
            {actors.length === 0 ? (
              <EmptyState label="No actors identified yet" />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {actors.map(actor => (
                  <Card key={actor.id}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <UserX className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{actor.actor_name}</h3>
                            {actor.role_description && <p className="text-xs text-muted-foreground">{actor.role_description}</p>}
                          </div>
                        </div>
                        <Badge className={riskColors[actor.risk_score >= 80 ? 'critical' : actor.risk_score >= 60 ? 'high' : actor.risk_score >= 40 ? 'medium' : 'low']} variant="outline">
                          Risk: {actor.risk_score}%
                        </Badge>
                      </div>
                      <Separator className="mb-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-muted-foreground">Amount</p><p className="font-semibold">PKR {(actor.total_amount || 0).toLocaleString()}</p></div>
                        <div><p className="text-muted-foreground">Transactions</p><p className="font-semibold">{actor.transaction_count || 0}</p></div>
                      </div>
                      {actor.pattern_types?.length ? (
                        <div className="flex gap-1 mt-3 flex-wrap">
                          {actor.pattern_types.map((p, i) => <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>)}
                        </div>
                      ) : null}
                      <Progress value={actor.risk_score} className="mt-3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4 mt-4">
            {findings.filter(f => f.date_detected).length === 0 ? (
              <EmptyState label="No timeline events detected" />
            ) : (
              <div className="relative border-l-2 border-primary/30 ml-4 space-y-6">
                {findings
                  .filter(f => f.date_detected)
                  .sort((a, b) => (a.date_detected || '').localeCompare(b.date_detected || ''))
                  .map(f => (
                    <div key={f.id} className="relative pl-8">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-primary bg-background" />
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{f.date_detected}</Badge>
                          <Badge className={riskColors[f.risk_score >= 80 ? 'critical' : f.risk_score >= 60 ? 'high' : 'medium']} variant="outline">
                            Risk: {f.risk_score}%
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{f.title}</h4>
                        <p className="text-sm text-muted-foreground">{f.description}</p>
                        {f.amount > 0 && <p className="text-sm font-semibold mt-1">{f.currency} {f.amount.toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Uploaded Financial Records</h3>
              <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={analyzing}>
                <Upload className="w-4 h-4 mr-2" />Add Files
              </Button>
            </div>
            {evidence.length === 0 ? (
              <EmptyState label="No evidence uploaded yet" />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {evidence.map(ev => (
                  <Card key={ev.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ev.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(ev.file_size / 1024).toFixed(0)} KB • {ev.analysis_status}
                        </p>
                      </div>
                      <Badge variant={ev.analysis_status === 'completed' ? 'default' : 'secondary'}>
                        {ev.analysis_status === 'completed' ? '✓ Analyzed' : ev.analysis_status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PlatformLayout>
  );
};

function StatsCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-muted`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-lg font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center text-muted-foreground">{label}. Upload financial records to begin analysis.</CardContent>
    </Card>
  );
}

function formatCurrency(amount: number): string {
  if (amount === 0) return "PKR 0";
  if (amount >= 1_000_000) return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `PKR ${(amount / 1_000).toFixed(0)}K`;
  return `PKR ${amount.toLocaleString()}`;
}

export default FinancialAbuse;
