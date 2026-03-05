import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Share2,
  Linkedin,
  FileText,
  Presentation,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateLinkedInArticle, generateLinkedInPost } from "@/lib/linkedinArticleGenerator";
import { generatePresentation, type PresentationOptions } from "@/lib/presentationGenerator";

interface LinkedInShareMenuProps {
  /** Case/content title */
  title: string;
  description?: string;
  /** Full URL for sharing */
  url?: string;
  /** Data for article/presentation generation */
  contentData?: {
    caseTitle: string;
    caseNumber?: string;
    description?: string;
    severity?: string;
    location?: string;
    status?: string;
    events?: { date: string; category: string; description: string; individuals?: string }[];
    entities?: { name: string; entity_type: string; role?: string; category?: string }[];
    discrepancies?: { title: string; severity: string; description: string }[];
    stats?: { sources: number; events: number; entities: number; discrepancies: number };
  };
  className?: string;
  variant?: "default" | "compact";
}

export const LinkedInShareMenu = ({
  title,
  description,
  url,
  contentData,
  className,
  variant = "default",
}: LinkedInShareMenuProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleLinkedInPost = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const handleLinkedInArticle = () => {
    if (!contentData) {
      toast.error("No case data available to generate article");
      return;
    }

    const article = generateLinkedInArticle(contentData);

    // Copy to clipboard
    navigator.clipboard.writeText(article).then(() => {
      toast.success("LinkedIn article copied to clipboard!", {
        description: "Paste it into LinkedIn's article editor to publish.",
      });
    }).catch(() => {
      // Fallback: open in new window for manual copy
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(`<html><head><title>LinkedIn Article — ${title}</title>
          <style>body{font-family:system-ui;max-width:700px;margin:40px auto;padding:20px;line-height:1.8;color:#1f2937;background:#fff;}
          pre{white-space:pre-wrap;background:#f9fafb;padding:24px;border-radius:12px;border:1px solid #e5e7eb;font-size:14px;}
          .actions{margin-bottom:24px;display:flex;gap:12px;}
          button{padding:10px 20px;border-radius:8px;border:none;cursor:pointer;font-weight:600;}
          .copy-btn{background:#0077b5;color:white;}
          .linkedin-btn{background:#0a66c2;color:white;}</style></head><body>
          <h1>📝 LinkedIn Article Content</h1>
          <div class="actions">
            <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('content').textContent).then(()=>this.textContent='✓ Copied!')">Copy All</button>
            <a href="https://www.linkedin.com/article/new/" target="_blank"><button class="linkedin-btn">Open LinkedIn Article Editor →</button></a>
          </div>
          <pre id="content">${article.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </body></html>`);
        w.document.close();
      }
    });
  };

  const handleLinkedInPostCopy = () => {
    const post = generateLinkedInPost({
      title,
      description,
      url: shareUrl,
      stats: contentData?.stats ? { events: contentData.stats.events, entities: contentData.stats.entities } : undefined,
    });

    navigator.clipboard.writeText(post).then(() => {
      setCopied(true);
      toast.success("LinkedIn post copied!", { description: "Paste directly into your LinkedIn feed." });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error("Failed to copy"));
  };

  const handlePresentation = () => {
    if (!contentData) {
      toast.error("No case data available to generate presentation");
      return;
    }

    const presOpts: PresentationOptions = {
      caseTitle: contentData.caseTitle,
      caseNumber: contentData.caseNumber,
      description: contentData.description,
      severity: contentData.severity,
      location: contentData.location,
      events: contentData.events,
      entities: contentData.entities,
      discrepancies: contentData.discrepancies,
      stats: contentData.stats,
    };

    const html = generatePresentation(presOpts);
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      toast.success("Presentation opened!", {
        description: "Use Print (Ctrl+P) to save as PDF for SlideShare.",
      });
    } else {
      toast.error("Please allow popups to open presentations.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "compact" ? "ghost" : "outline"}
          size={variant === "compact" ? "icon" : "default"}
          className={cn(
            variant === "compact" ? "h-8 w-8" : "gap-2",
            "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
            className
          )}
        >
          <Linkedin className="h-4 w-4" />
          {variant !== "compact" && "Share on LinkedIn"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">LinkedIn & SlideShare</DropdownMenuLabel>

        <DropdownMenuItem onClick={handleLinkedInPost} className="cursor-pointer">
          <ExternalLink className="h-4 w-4 mr-2" />
          Share as Post
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLinkedInPostCopy} className="cursor-pointer">
          {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Copied!" : "Copy Post Text"}
        </DropdownMenuItem>

        {contentData && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Export Content</DropdownMenuLabel>

            <DropdownMenuItem onClick={handleLinkedInArticle} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Generate LinkedIn Article
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handlePresentation} className="cursor-pointer">
              <Presentation className="h-4 w-4 mr-2" />
              Create Presentation
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
