import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Phone, Mail, Globe, Hash, Shield, FileText, Search, ScanSearch, MapPin, CreditCard, Clock, MessageSquare } from "lucide-react";
import { useEvidenceArtifacts, useScanArtifacts } from "@/hooks/useEvidenceArtifacts";

const ARTIFACT_ICONS: Record<string, any> = {
  phone: Phone,
  email: Mail,
  ip_address: Globe,
  url: Globe,
  hash: Hash,
  crypto_address: Shield,
  date_reference: Clock,
  communication_transcript: MessageSquare,
  metadata: FileText,
  physical_address: MapPin,
  id_number: CreditCard,
  bank_account: CreditCard,
};

const ARTIFACT_COLORS: Record<string, string> = {
  phone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  email: "bg-green-500/10 text-green-700 dark:text-green-300",
  ip_address: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  url: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  hash: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  crypto_address: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  date_reference: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  communication_transcript: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  metadata: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  physical_address: "bg-red-500/10 text-red-700 dark:text-red-300",
  id_number: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  bank_account: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function EvidenceArtifactsPanel() {
  const { data: artifacts = [], isLoading } = useEvidenceArtifacts();
  const scanMutation = useScanArtifacts();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((a) => {
      const matchesSearch = !searchTerm || 
        a.artifact_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.context_snippet || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.file_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || a.artifact_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [artifacts, searchTerm, typeFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    artifacts.forEach((a) => {
      counts[a.artifact_type] = (counts[a.artifact_type] || 0) + 1;
    });
    return counts;
  }, [artifacts]);

  const handleScanAll = async () => {
    try {
      toast.info("Scanning all evidence documents for artifacts...");
      const result = await scanMutation.mutateAsync({ scanAll: true });
      toast.success(`Scan complete: ${result.totalArtifacts} artifacts found across ${result.uploadsScanned} documents`);
    } catch (err: any) {
      toast.error(err.message || "Scan failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Scan Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ScanSearch className="h-5 w-5 text-primary" />
                Evidence Artifacts Scanner
              </CardTitle>
              <CardDescription>
                AI-powered extraction of phone numbers, emails, IPs, hashes, and metadata from all evidence documents
              </CardDescription>
            </div>
            <Button onClick={handleScanAll} disabled={scanMutation.isPending}>
              {scanMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Scanning...</>
              ) : (
                <><ScanSearch className="h-4 w-4 mr-2" /> Scan All Documents</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-sm">{artifacts.length} total artifacts</Badge>
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const Icon = ARTIFACT_ICONS[type] || FileText;
              return (
                <Badge key={type} variant="secondary" className={`text-xs ${ARTIFACT_COLORS[type] || ""}`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {type.replace(/_/g, " ")}: {count}
                </Badge>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artifacts, values, or filenames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone">Phone Numbers</SelectItem>
                <SelectItem value="email">Email Addresses</SelectItem>
                <SelectItem value="ip_address">IP Addresses</SelectItem>
                <SelectItem value="url">URLs</SelectItem>
                <SelectItem value="hash">Hashes</SelectItem>
                <SelectItem value="crypto_address">Crypto Addresses</SelectItem>
                <SelectItem value="physical_address">Physical Addresses</SelectItem>
                <SelectItem value="id_number">ID Numbers</SelectItem>
                <SelectItem value="bank_account">Bank Accounts</SelectItem>
                <SelectItem value="communication_transcript">Transcripts</SelectItem>
                <SelectItem value="metadata">Metadata</SelectItem>
                <SelectItem value="date_reference">Date References</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredArtifacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ScanSearch className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No artifacts found</p>
            <p className="text-sm mt-1">Click "Scan All Documents" to extract artifacts from evidence files</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredArtifacts.map((artifact) => {
            const Icon = ARTIFACT_ICONS[artifact.artifact_type] || FileText;
            const colorClass = ARTIFACT_COLORS[artifact.artifact_type] || "";
            return (
              <Card key={artifact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium break-all">
                          {artifact.artifact_value}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {artifact.artifact_type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      {artifact.context_snippet && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {artifact.context_snippet}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {artifact.file_name && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {artifact.file_name}
                          </span>
                        )}
                        {artifact.metadata && Object.keys(artifact.metadata).length > 0 && (
                          <span className="text-muted-foreground/60">
                            {Object.entries(artifact.metadata)
                              .filter(([, v]) => v)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
