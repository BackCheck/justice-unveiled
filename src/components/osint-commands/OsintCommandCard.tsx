import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { type OsintCommand } from "@/data/osintCommandsData";

export function OsintCommandCard({ cmd }: { cmd: OsintCommand }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd.command);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-md border border-border/40 bg-card hover:border-primary/30 transition-all duration-200 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/30 bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <ChevronRight className="h-3 w-3 text-primary shrink-0" />
          <p className="text-xs font-medium text-foreground truncate">{cmd.title}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
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
    </div>
  );
}
