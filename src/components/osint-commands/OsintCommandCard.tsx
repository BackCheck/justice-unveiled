import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, ChevronRight, Info, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { type OsintCommand } from "@/data/osintCommandsData";
import { cn } from "@/lib/utils";

export function OsintCommandCard({ cmd }: { cmd: OsintCommand }) {
  const [copied, setCopied] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd.command);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine where to run this command
  const getRunTag = () => {
    const c = cmd.command.toLowerCase();
    if (cmd.isLink) return { label: "Web Tool", color: "text-chart-4" };
    if (c.startsWith("site:") || c.startsWith('"') || c.startsWith("intitle:") || c.startsWith("inurl:") || c.startsWith("filetype:") || c.startsWith("cache:") || c.startsWith("google "))
      return { label: "Google Search", color: "text-chart-5" };
    if (c.startsWith("curl") || c.startsWith("wget") || c.startsWith("dig") || c.startsWith("echo") || c.startsWith("awk") || c.startsWith("strings") || c.startsWith("git ") || c.startsWith("pdfgrep"))
      return { label: "Terminal", color: "text-chart-2" };
    if (c.startsWith("python") || c.startsWith("sherlock") || c.startsWith("maigret") || c.startsWith("twint") || c.startsWith("instaloader") || c.startsWith("holehe") || c.startsWith("h8mail") || c.startsWith("phoneinfoga") || c.startsWith("theharvester") || c.startsWith("metagoofil") || c.startsWith("gobuster") || c.startsWith("subfinder") || c.startsWith("amass") || c.startsWith("shodan") || c.startsWith("torify") || c.startsWith("httrack") || c.startsWith("exiftool") || c.startsWith("ffmpeg") || c.startsWith("dehashed") || c.startsWith("tiktok") || c.startsWith("reddit") || c.startsWith("telegram") || c.startsWith("linkedin") || c.startsWith("yt-dlp"))
      return { label: "CLI Tool", color: "text-chart-1" };
    return { label: "Google Search", color: "text-chart-5" };
  };

  const runTag = getRunTag();

  return (
    <div className="group relative rounded-md border border-border/40 bg-card hover:border-primary/30 transition-all duration-200 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/30 bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <ChevronRight className="h-3 w-3 text-primary shrink-0" />
          <p className="text-xs font-medium text-foreground truncate">{cmd.title}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Run environment tag */}
          <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border/50", runTag.color)}>
            {runTag.label}
          </span>
          {cmd.example && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 text-muted-foreground hover:text-primary",
                showExample && "text-primary bg-primary/10"
              )}
              onClick={() => setShowExample(!showExample)}
              title="Show usage example"
            >
              <Lightbulb className="h-3 w-3" />
            </Button>
          )}
          {cmd.isLink && cmd.linkUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary"
              onClick={() => window.open(cmd.linkUrl, "_blank")}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-primary"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 text-chart-2" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      {/* Command body */}
      <div className="relative p-3 bg-foreground/[0.03] dark:bg-foreground/5">
        <pre className="text-[11px] font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap break-all select-all">
          <span className="text-primary/70 select-none">$ </span>
          <code className="text-foreground/80">{cmd.command}</code>
        </pre>
      </div>
      {/* Example panel */}
      {showExample && cmd.example && (
        <div className="px-3 py-2.5 border-t border-primary/20 bg-primary/5">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {cmd.example}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
