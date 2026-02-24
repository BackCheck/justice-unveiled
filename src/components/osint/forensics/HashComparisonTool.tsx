import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, GitCompareArrows } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import type { ForensicResult, HashAlgorithm } from "./types";

interface HashComparisonToolProps {
  result: ForensicResult;
}

function detectAlgorithm(hash: string): HashAlgorithm | null {
  const clean = hash.trim().toLowerCase();
  if (/^[a-f0-9]{64}$/.test(clean)) return "SHA-256";
  if (/^[a-f0-9]{40}$/.test(clean)) return "SHA-1";
  if (/^[a-f0-9]{32}$/.test(clean)) return "MD5";
  return null;
}

export function HashComparisonTool({ result }: HashComparisonToolProps) {
  const [referenceHash, setReferenceHash] = useState("");
  const [open, setOpen] = useState(false);

  const detectedAlgo = referenceHash.trim() ? detectAlgorithm(referenceHash) : null;

  const getComputedHash = (algo: HashAlgorithm): string => {
    switch (algo) {
      case "SHA-256": return result.hashSha256;
      case "SHA-1": return result.hashSha1;
      case "MD5": return result.hashMd5;
    }
  };

  const isMatch = detectedAlgo
    ? referenceHash.trim().toLowerCase() === getComputedHash(detectedAlgo).toLowerCase()
    : null;

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitCompareArrows className="h-4 w-4 text-primary" />
                Hash Comparison — Tamper Detection
              </CardTitle>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Paste a known reference hash to verify against computed values. Algorithm is auto-detected by length.
            </p>
            <Input
              placeholder="Paste reference hash (MD5, SHA-1, or SHA-256)..."
              value={referenceHash}
              onChange={(e) => setReferenceHash(e.target.value)}
              className="font-mono text-xs"
            />
            {referenceHash.trim() && (
              <div className="space-y-2">
                {detectedAlgo ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{detectedAlgo}</Badge>
                      <span className="text-xs text-muted-foreground">detected</span>
                    </div>
                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${isMatch ? "border-green-500/50 bg-green-500/10" : "border-destructive/50 bg-destructive/10"}`}>
                      {isMatch ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-green-500">Hash Match — Integrity Verified</p>
                            <p className="text-xs text-muted-foreground">File has not been tampered with</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="text-sm font-medium text-destructive">Hash Mismatch — Possible Tampering</p>
                            <p className="text-xs text-muted-foreground">The file does not match the reference hash</p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-destructive">Unrecognized hash format. Expected 32 (MD5), 40 (SHA-1), or 64 (SHA-256) hex characters.</p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
