import { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { SocialShareButtons } from "./SocialShareButtons";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ShareableCardProps {
  title: string;
  description?: string;
  url?: string;
  hashtags?: string[];
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  showShareInHeader?: boolean;
}

export const ShareableCard = ({
  title,
  description,
  url,
  hashtags,
  children,
  header,
  className,
  showShareInHeader = false,
}: ShareableCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {header && (
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1">{header}</div>
          {showShareInHeader && (
            <SocialShareButtons
              title={title}
              description={description}
              url={url}
              hashtags={hashtags}
              variant="compact"
            />
          )}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {!showShareInHeader && (
        <CardFooter className="flex-col items-start gap-4 bg-muted/30 pt-4">
          <Separator />
          <SocialShareButtons
            title={title}
            description={description}
            url={url}
            hashtags={hashtags}
            variant="inline"
          />
        </CardFooter>
      )}
    </Card>
  );
};
