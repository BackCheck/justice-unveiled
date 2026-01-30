import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Brain, 
  FileText, 
  Loader2, 
  Sparkles,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAnalyzeDocument } from "@/hooks/useExtractedEvents";
import { cn } from "@/lib/utils";

interface DocumentAnalyzerProps {
  uploadId?: string;
  onAnalysisComplete?: () => void;
}

export const DocumentAnalyzer = ({ uploadId, onAnalysisComplete }: DocumentAnalyzerProps) => {
  const [documentContent, setDocumentContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [documentType, setDocumentType] = useState("legal");
  const [localUploadId, setLocalUploadId] = useState(uploadId || crypto.randomUUID());

  const analyzeDocument = useAnalyzeDocument();

  const handleAnalyze = async () => {
    if (!documentContent.trim()) return;

    await analyzeDocument.mutateAsync({
      uploadId: localUploadId,
      documentContent,
      fileName: fileName || "Pasted Document",
      documentType,
    });

    onAnalysisComplete?.();
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Document Analyzer
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Gemini Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste document content to extract timeline events, entities, and evidence discrepancies
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">Document Name</Label>
            <Input
              id="fileName"
              placeholder="e.g., Judgment Criminal Appeal No. 16"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="legal">Legal Document (Court Orders, Judgments)</SelectItem>
                <SelectItem value="communication">Communication (Emails, Messages)</SelectItem>
                <SelectItem value="financial">Financial Record (Statements, Invoices)</SelectItem>
                <SelectItem value="testimony">Witness Statement / Testimony</SelectItem>
                <SelectItem value="investigation">Investigation Report</SelectItem>
                <SelectItem value="other">Other Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Document Content</Label>
          <Textarea
            id="content"
            placeholder="Paste the full text content of your document here...

The AI will extract:
• Timeline events with dates and categories
• People, organizations, and official bodies
• Procedural failures and evidence discrepancies
• Legal references and case citations"
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {documentContent.length} characters • ~{Math.ceil(documentContent.split(/\s+/).length / 1000)}k words
          </p>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!documentContent.trim() || analyzeDocument.isPending}
          className="w-full"
        >
          {analyzeDocument.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Document...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Extract Intelligence
            </>
          )}
        </Button>

        {/* Analysis Results Preview */}
        {analyzeDocument.isSuccess && analyzeDocument.data && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              Analysis Complete
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className={cn(
                "p-4 rounded-lg border text-center",
                "bg-primary/5 border-primary/20"
              )}>
                <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{analyzeDocument.data.eventsExtracted}</div>
                <div className="text-xs text-muted-foreground">Events Extracted</div>
              </div>
              <div className={cn(
                "p-4 rounded-lg border text-center",
                "bg-secondary/50 border-secondary"
              )}>
                <Users className="w-6 h-6 mx-auto mb-2 text-foreground" />
                <div className="text-2xl font-bold">{analyzeDocument.data.entitiesExtracted}</div>
                <div className="text-xs text-muted-foreground">Entities Found</div>
              </div>
              <div className={cn(
                "p-4 rounded-lg border text-center",
                "bg-destructive/5 border-destructive/20"
              )}>
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-destructive" />
                <div className="text-2xl font-bold">{analyzeDocument.data.discrepanciesExtracted}</div>
                <div className="text-xs text-muted-foreground">Discrepancies</div>
              </div>
            </div>
          </div>
        )}

        {/* Extraction Capabilities */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            What gets extracted:
          </h4>
          <div className="grid md:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div>
              <Badge variant="outline" className="mb-2">Timeline Events</Badge>
              <ul className="space-y-1">
                <li>• Dates and chronology</li>
                <li>• Event categories</li>
                <li>• Legal actions taken</li>
                <li>• Outcomes and results</li>
              </ul>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Entities</Badge>
              <ul className="space-y-1">
                <li>• People involved</li>
                <li>• Organizations</li>
                <li>• Official bodies</li>
                <li>• Roles and relationships</li>
              </ul>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Discrepancies</Badge>
              <ul className="space-y-1">
                <li>• Procedural failures</li>
                <li>• Chain of custody issues</li>
                <li>• Testimony contradictions</li>
                <li>• Document forgeries</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
