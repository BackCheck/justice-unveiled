import { SocialShareButtons } from "./SocialShareButtons";
import { cn } from "@/lib/utils";

interface PageShareHeaderProps {
  title: string;
  description?: string;
  url?: string;
  hashtags?: string[];
  className?: string;
}

export const PageShareHeader = ({
  title,
  description,
  url,
  hashtags,
  className,
}: PageShareHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between gap-4 flex-wrap", className)}>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold truncate">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      <SocialShareButtons
        title={title}
        description={description}
        url={url}
        hashtags={hashtags}
        variant="compact"
      />
    </div>
  );
};
