import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SocialShareButtons } from "@/components/sharing/SocialShareButtons";
import { WatchlistButton } from "./WatchlistButton";
import { WatchlistItem } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DetailPageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  badges?: { label: string; variant?: "default" | "secondary" | "outline" | "destructive"; className?: string }[];
  icon?: ReactNode;
  backPath?: string;
  backLabel?: string;
  itemType: WatchlistItem['item_type'];
  itemId: string;
  priority?: WatchlistItem['priority'];
  hashtags?: string[];
  className?: string;
}

export const DetailPageHeader = ({
  title,
  subtitle,
  description,
  badges,
  icon,
  backPath,
  backLabel = "Back",
  itemType,
  itemId,
  priority = 'medium',
  hashtags = ['HumanRights', 'HRPM'],
  className,
}: DetailPageHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePrint = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please sign in to print reports.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    window.print();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Back button */}
      {backPath && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(backPath)}
          className="text-muted-foreground hover:text-foreground no-print"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backLabel}
        </Button>
      )}

      {/* Header content */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Icon and title */}
          <div className="flex items-start gap-4">
            {icon && (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="space-y-1">
              {subtitle && (
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {subtitle}
                </p>
              )}
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                {title}
              </h1>
            </div>
          </div>

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <Badge
                  key={idx}
                  variant={badge.variant || "secondary"}
                  className={badge.className}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <WatchlistButton
            itemType={itemType}
            itemId={itemId}
            itemTitle={title}
            itemDescription={description}
            priority={priority}
          />
          <Button variant="outline" size="default" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <SocialShareButtons
            title={title}
            description={description}
            hashtags={hashtags}
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
};
