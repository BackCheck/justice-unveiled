import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FileAudio, 
  File, 
  Download, 
  ExternalLink,
  Calendar,
  HardDrive
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import hrpmLogo from "@/assets/hrpm-logo.png";

interface EvidenceFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  description: string | null;
  category: string | null;
  created_at: string;
}

interface EvidenceRepositoryCardProps {
  file: EvidenceFile;
  caseNumber?: string;
  caseTitle?: string;
}

const categoryColors: Record<string, string> = {
  commentary: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
  legal_document: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  audio_evidence: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  witness_statement: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  court_record: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  media_coverage: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30",
  general: "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
};

const getFileIcon = (fileType: string, fileName: string) => {
  if (fileType.includes('audio') || fileName.endsWith('.mp3')) return FileAudio;
  if (fileType.includes('pdf')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const EvidenceRepositoryCard = ({ file, caseNumber, caseTitle }: EvidenceRepositoryCardProps) => {
  const Icon = getFileIcon(file.file_type, file.file_name);
  const isPDF = file.file_type.includes('pdf');
  
  // Generate a branded coverpage HTML for PDF downloads
  const generateCoverPageHTML = () => {
    const currentDate = format(new Date(), 'MMMM d, yyyy');
    const uploadDate = format(new Date(file.created_at), 'MMMM d, yyyy');
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${file.file_name} - HRPM Evidence Document</title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .cover {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px;
      position: relative;
    }
    .cover::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #d4af37 0%, #f4d58d 50%, #d4af37 100%);
    }
    .header {
      text-align: center;
      padding-bottom: 40px;
      border-bottom: 2px solid rgba(212, 175, 55, 0.3);
    }
    .logo-container {
      margin-bottom: 20px;
    }
    .logo {
      width: 80px;
      height: auto;
    }
    .org-name {
      font-size: 14px;
      letter-spacing: 4px;
      color: #d4af37;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .org-full {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 2px;
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      padding: 60px 0;
    }
    .doc-type {
      font-size: 12px;
      letter-spacing: 3px;
      color: #d4af37;
      text-transform: uppercase;
      margin-bottom: 30px;
    }
    .doc-title {
      font-size: 28px;
      font-weight: bold;
      color: #f8fafc;
      margin-bottom: 20px;
      line-height: 1.3;
      word-break: break-word;
    }
    .doc-category {
      display: inline-block;
      padding: 8px 24px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-radius: 20px;
      color: #d4af37;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .case-info {
      margin-top: 40px;
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .case-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    .case-value {
      font-size: 14px;
      color: #e2e8f0;
    }
    .footer {
      text-align: center;
      padding-top: 40px;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .meta-item {
      text-align: center;
    }
    .meta-label {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .meta-value {
      font-size: 12px;
      color: #cbd5e1;
    }
    .website {
      font-size: 14px;
      color: #d4af37;
      font-weight: 500;
    }
    .disclaimer {
      font-size: 9px;
      color: #64748b;
      margin-top: 15px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="header">
      <div class="logo-container">
        <img src="${hrpmLogo}" class="logo" alt="HRPM Logo" />
      </div>
      <div class="org-name">HRPM</div>
      <div class="org-full">Human Rights Protection & Monitoring</div>
    </div>
    
    <div class="content">
      <div class="doc-type">Evidence Document</div>
      <h1 class="doc-title">${file.file_name}</h1>
      ${file.category ? `<span class="doc-category">${file.category.replace('_', ' ')}</span>` : ''}
      
      ${caseNumber || caseTitle ? `
      <div class="case-info">
        ${caseNumber ? `
        <div class="case-label">Case Reference</div>
        <div class="case-value">${caseNumber}${caseTitle ? ` — ${caseTitle}` : ''}</div>
        ` : ''}
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Date Uploaded</div>
          <div class="meta-value">${uploadDate}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">File Size</div>
          <div class="meta-value">${formatFileSize(file.file_size)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Generated</div>
          <div class="meta-value">${currentDate}</div>
        </div>
      </div>
      <div class="website">hrpm.org</div>
      <div class="disclaimer">
        This document is part of the HRPM evidence repository. 
        All materials are maintained for human rights documentation purposes.
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handleBrandedDownload = () => {
    // For now, open the original file - branded PDF generation would require server-side processing
    // We'll show the coverpage as a printable HTML that can be saved as PDF
    const coverHTML = generateCoverPageHTML();
    const coverWindow = window.open('', '_blank');
    if (coverWindow) {
      coverWindow.document.write(coverHTML);
      coverWindow.document.close();
    }
  };

  return (
    <Card className="glass-card hover-glow-primary group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
            "bg-primary/10 group-hover:bg-primary/20"
          )}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
          
          {/* File Info */}
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate group-hover:text-primary transition-colors">
              {file.file_name}
            </p>
            {file.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {file.description}
              </p>
            )}
            
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {formatFileSize(file.file_size)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(file.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            
            {/* Category Badge */}
            {file.category && (
              <Badge 
                variant="outline"
                className={cn("mt-2 text-xs capitalize border", categoryColors[file.category] || categoryColors.general)}
              >
                {file.category.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            asChild
          >
            <a href={file.public_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Original
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            asChild
          >
            <a href={file.public_url} download={file.file_name}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleBrandedDownload}
            title="Generate branded coverpage"
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
