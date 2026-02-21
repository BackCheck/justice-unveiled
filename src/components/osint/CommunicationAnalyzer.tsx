import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Phone, Mail, Globe, MapPin, AlertTriangle, FileText, Search, Loader2, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCaseFilter } from "@/contexts/CaseFilterContext";

interface EvidenceMatch {
  id: string;
  source: "event" | "evidence";
  title: string;
  snippet: string;
  date?: string;
  case_id?: string | null;
}

export function CommunicationAnalyzer() {
  const { selectedCaseId } = useCaseFilter();
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneResult, setPhoneResult] = useState<any>(null);
  const [evidenceMatches, setEvidenceMatches] = useState<EvidenceMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [emailHeaders, setEmailHeaders] = useState("");
  const [headerResult, setHeaderResult] = useState<string[]>([]);

  const searchEvidenceForPhone = async (rawNumber: string, nationalNumber: string, international: string) => {
    setSearching(true);
    const matches: EvidenceMatch[] = [];

    // Build search variants (raw, national digits, international format, stripped digits)
    const variants = new Set<string>();
    variants.add(rawNumber.replace(/\s+/g, ""));
    variants.add(nationalNumber);
    variants.add(international);
    // Also try without any non-digit chars for loose matching
    const digitsOnly = rawNumber.replace(/\D/g, "");
    if (digitsOnly.length >= 7) variants.add(digitsOnly.slice(-10)); // last 10 digits

    try {
      // Search extracted_events
      let eventsQuery = supabase.from("extracted_events").select("id, date, description, individuals, sources, case_id");
      if (selectedCaseId) eventsQuery = eventsQuery.eq("case_id", selectedCaseId);
      const { data: events } = await eventsQuery;

      if (events) {
        for (const ev of events) {
          const haystack = `${ev.description} ${ev.individuals} ${ev.sources}`.toLowerCase();
          for (const v of variants) {
            if (haystack.includes(v.toLowerCase())) {
              matches.push({
                id: ev.id,
                source: "event",
                title: `Event: ${ev.date}`,
                snippet: ev.description.slice(0, 200),
                date: ev.date,
                case_id: ev.case_id,
              });
              break;
            }
          }
        }
      }

      // Search evidence_uploads descriptions & file names
      let uploadsQuery = supabase.from("evidence_uploads").select("id, file_name, description, case_id, public_url");
      if (selectedCaseId) uploadsQuery = uploadsQuery.eq("case_id", selectedCaseId);
      const { data: uploads } = await uploadsQuery;

      if (uploads) {
        for (const up of uploads) {
          const haystack = `${up.file_name} ${up.description || ""}`.toLowerCase();
          for (const v of variants) {
            if (haystack.includes(v.toLowerCase())) {
              matches.push({
                id: up.id,
                source: "evidence",
                title: up.file_name,
                snippet: up.description || "Evidence file match",
                case_id: up.case_id,
              });
              break;
            }
          }
        }
      }

      // Search extracted_entities contact_info
      let entitiesQuery = supabase.from("extracted_entities").select("id, name, contact_info, description, case_id");
      if (selectedCaseId) entitiesQuery = entitiesQuery.eq("case_id", selectedCaseId);
      const { data: entities } = await entitiesQuery;

      if (entities) {
        for (const ent of entities) {
          const contactStr = JSON.stringify(ent.contact_info || {}).toLowerCase();
          const descStr = (ent.description || "").toLowerCase();
          const haystack = `${contactStr} ${descStr}`;
          for (const v of variants) {
            if (haystack.includes(v.toLowerCase())) {
              matches.push({
                id: ent.id,
                source: "event",
                title: `Entity: ${ent.name}`,
                snippet: ent.description?.slice(0, 200) || `Contact info contains ${v}`,
                case_id: ent.case_id,
              });
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error("Evidence search error:", err);
    }

    setEvidenceMatches(matches);
    setSearching(false);
    if (matches.length > 0) {
      toast.success(`Found ${matches.length} evidence match(es) for this number`);
    } else {
      toast.info("No evidence matches found for this phone number");
    }
  };

  const analyzePhone = async () => {
    if (!phoneInput.trim()) return;
    setEvidenceMatches([]);
    try {
      const { parsePhoneNumber, isValidPhoneNumber } = await import("libphonenumber-js");
      const phone = parsePhoneNumber(phoneInput);
      if (phone) {
        const result = {
          valid: isValidPhoneNumber(phoneInput),
          country: phone.country,
          countryCallingCode: phone.countryCallingCode,
          nationalNumber: phone.nationalNumber,
          type: phone.getType(),
          uri: phone.getURI(),
          international: phone.formatInternational(),
        };
        setPhoneResult(result);
        toast.success("Phone number analyzed — searching evidence...");
        // Auto-search evidence
        await searchEvidenceForPhone(phoneInput, phone.nationalNumber, phone.formatInternational());
      } else {
        toast.error("Could not parse phone number");
      }
    } catch {
      toast.error("Invalid phone number format. Try with country code (e.g., +92...)");
    }
  };

  const analyzeHeaders = () => {
    if (!emailHeaders.trim()) return;
    const lines = emailHeaders.split("\n");
    const findings: string[] = [];
    
    lines.forEach(line => {
      if (line.startsWith("Received:")) findings.push(`📧 Hop: ${line.slice(9).trim().slice(0, 100)}`);
      if (line.startsWith("From:")) findings.push(`👤 Sender: ${line.slice(5).trim()}`);
      if (line.startsWith("Reply-To:")) findings.push(`↩️ Reply-To: ${line.slice(9).trim()}`);
      if (line.startsWith("X-Originating-IP:")) findings.push(`🌐 Originating IP: ${line.slice(17).trim()}`);
      if (line.startsWith("Authentication-Results:")) findings.push(`🔐 Auth: ${line.slice(23).trim().slice(0, 80)}`);
      if (line.toLowerCase().includes("spf=fail")) findings.push("⚠️ SPF FAIL — possible spoofing");
      if (line.toLowerCase().includes("dkim=fail")) findings.push("⚠️ DKIM FAIL — message integrity issue");
      if (line.toLowerCase().includes("dmarc=fail")) findings.push("⚠️ DMARC FAIL — domain authentication failed");
    });

    if (findings.length === 0) findings.push("No significant headers detected. Paste full raw email headers for better analysis.");
    setHeaderResult(findings);
    toast.success(`Found ${findings.length} header indicators`);
  };

  return (
    <div className="space-y-6">
      {/* Phone Number Intel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Phone Number Intelligence
          </CardTitle>
          <CardDescription>Parse and identify phone numbers from documents. Detects country, carrier type, and validity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="+92 300 1234567" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
            <Button onClick={analyzePhone}>Analyze</Button>
          </div>

          {phoneResult && (
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted/30 rounded-lg text-sm">
              <div><span className="text-muted-foreground">Valid:</span> <Badge variant={phoneResult.valid ? "default" : "destructive"}>{phoneResult.valid ? "Yes" : "No"}</Badge></div>
              <div><span className="text-muted-foreground">Country:</span> {phoneResult.country}</div>
              <div><span className="text-muted-foreground">Code:</span> +{phoneResult.countryCallingCode}</div>
              <div><span className="text-muted-foreground">Type:</span> {phoneResult.type || "Unknown"}</div>
              <div className="col-span-2"><span className="text-muted-foreground">International:</span> {phoneResult.international}</div>
            </div>
          )}

          {searching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching evidence for this number...
            </div>
          )}

          {evidenceMatches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Link className="h-4 w-4 text-primary" />
                Evidence Matches ({evidenceMatches.length})
              </h4>
              {evidenceMatches.map((match) => (
                <div key={`${match.source}-${match.id}`} className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{match.title}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {match.source === "event" ? "Event/Entity" : "Evidence File"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-2">{match.snippet}</p>
                </div>
              ))}
            </div>
          )}

          {phoneResult && !searching && evidenceMatches.length === 0 && (
            <p className="text-xs text-muted-foreground">No matches found in {selectedCaseId ? "selected case" : "all cases"} evidence. Try selecting a specific case for targeted search.</p>
          )}
        </CardContent>
      </Card>

      {/* Email Header Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Header Forensics
          </CardTitle>
          <CardDescription>Paste raw email headers to trace routing, detect spoofing, and identify originating IPs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste raw email headers here..."
            value={emailHeaders}
            onChange={(e) => setEmailHeaders(e.target.value)}
            rows={6}
            className="font-mono text-xs"
          />
          <Button onClick={analyzeHeaders} disabled={!emailHeaders.trim()}>Analyze Headers</Button>

          {headerResult.length > 0 && (
            <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
              {headerResult.map((finding, i) => (
                <p key={i} className="text-sm">{finding}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
