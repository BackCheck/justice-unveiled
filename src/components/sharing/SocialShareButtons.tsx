import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Mail,
  MessageCircle,
  Send,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialShareButtonsProps {
  url?: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  variant?: "default" | "compact" | "inline";
}

const SHARE_PLATFORMS = {
  twitter: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    getUrl: (url: string, title: string, hashtags?: string[]) => {
      const params = new URLSearchParams({
        text: title,
        url: url,
        ...(hashtags?.length && { hashtags: hashtags.join(",") }),
      });
      return `https://twitter.com/intent/tweet?${params}`;
    },
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
    getUrl: (url: string) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    },
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
    getUrl: (url: string, title: string, _?: string[], description?: string) => {
      const params = new URLSearchParams({
        url: url,
        title: title,
        ...(description && { summary: description }),
      });
      return `https://www.linkedin.com/shareArticle?mini=true&${params}`;
    },
  },
  whatsapp: {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "hover:bg-[#25D366]/10 hover:text-[#25D366]",
    getUrl: (url: string, title: string) => {
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
    },
  },
  telegram: {
    name: "Telegram",
    icon: Send,
    color: "hover:bg-[#0088CC]/10 hover:text-[#0088CC]",
    getUrl: (url: string, title: string) => {
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    },
  },
  email: {
    name: "Email",
    icon: Mail,
    color: "hover:bg-primary/10 hover:text-primary",
    getUrl: (url: string, title: string, _?: string[], description?: string) => {
      const body = description ? `${description}\n\n${url}` : url;
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    },
  },
};

export const SocialShareButtons = ({
  url,
  title,
  description,
  hashtags = ["HumanRights", "HRPM", "Justice"],
  className,
  variant = "default",
}: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = (platform: keyof typeof SHARE_PLATFORMS) => {
    const config = SHARE_PLATFORMS[platform];
    const shareLink = config.getUrl(shareUrl, title, hashtags, description);
    window.open(shareLink, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  // Compact inline buttons
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {Object.entries(SHARE_PLATFORMS).slice(0, 4).map(([key, platform]) => {
          const Icon = platform.icon;
          return (
            <Button
              key={key}
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", platform.color)}
              onClick={() => handleShare(key as keyof typeof SHARE_PLATFORMS)}
              title={`Share on ${platform.name}`}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted"
          onClick={handleCopyLink}
          title="Copy link"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  // Compact dropdown
  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {Object.entries(SHARE_PLATFORMS).map(([key, platform]) => {
            const Icon = platform.icon;
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => handleShare(key as keyof typeof SHARE_PLATFORMS)}
                className={cn("cursor-pointer", platform.color)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {platform.name}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy Link"}
          </DropdownMenuItem>
          {typeof navigator !== "undefined" && navigator.share && (
            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
              <Share2 className="h-4 w-4 mr-2" />
              More Options...
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default full buttons
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Share2 className="h-4 w-4" />
        <span>Share this report</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(SHARE_PLATFORMS).map(([key, platform]) => {
          const Icon = platform.icon;
          return (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className={cn("gap-2", platform.color)}
              onClick={() => handleShare(key as keyof typeof SHARE_PLATFORMS)}
            >
              <Icon className="h-4 w-4" />
              {platform.name}
            </Button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 flex-1"
          onClick={handleCopyLink}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        {typeof navigator !== "undefined" && navigator.share && (
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={handleNativeShare}
          >
            <Share2 className="h-4 w-4" />
            More
          </Button>
        )}
      </div>
    </div>
  );
};
