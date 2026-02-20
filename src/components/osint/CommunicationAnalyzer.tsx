import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Phone, Mail, Globe, MapPin, AlertTriangle } from "lucide-react";

export function CommunicationAnalyzer() {
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneResult, setPhoneResult] = useState<any>(null);
  const [emailHeaders, setEmailHeaders] = useState("");
  const [headerResult, setHeaderResult] = useState<string[]>([]);

  const analyzePhone = async () => {
    if (!phoneInput.trim()) return;
    try {
      const { parsePhoneNumber, isValidPhoneNumber } = await import("libphonenumber-js");
      const phone = parsePhoneNumber(phoneInput);
      if (phone) {
        setPhoneResult({
          valid: isValidPhoneNumber(phoneInput),
          country: phone.country,
          countryCallingCode: phone.countryCallingCode,
          nationalNumber: phone.nationalNumber,
          type: phone.getType(),
          uri: phone.getURI(),
          international: phone.formatInternational(),
        });
        toast.success("Phone number analyzed");
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
