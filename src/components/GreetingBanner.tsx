import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { useTimeBasedTheme } from "@/hooks/useTimeBasedTheme";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface GreetingBannerProps {
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export const GreetingBanner = ({ 
  className, 
  showIcon = true, 
  compact = false 
}: GreetingBannerProps) => {
  const { greeting, icon, period } = useTimeBasedTheme();
  const { user } = useAuth();

  const IconComponent = {
    sunrise: Sunrise,
    sun: Sun,
    sunset: Sunset,
    moon: Moon,
  }[icon];

  const iconColors = {
    morning: "text-amber-500",
    afternoon: "text-yellow-500",
    evening: "text-orange-500",
    night: "text-indigo-400",
  };

  const displayName = user?.email?.split("@")[0] || "Investigator";

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showIcon && (
          <IconComponent className={cn("h-4 w-4", iconColors[period])} />
        )}
        <span className="text-sm font-medium text-foreground/80">
          {greeting}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r",
      period === "morning" && "from-amber-500/10 via-orange-500/5 to-transparent",
      period === "afternoon" && "from-yellow-500/10 via-amber-500/5 to-transparent",
      period === "evening" && "from-orange-500/10 via-rose-500/5 to-transparent",
      period === "night" && "from-indigo-500/10 via-purple-500/5 to-transparent",
      className
    )}>
      {showIcon && (
        <div className={cn(
          "p-2 rounded-lg",
          period === "morning" && "bg-amber-500/20",
          period === "afternoon" && "bg-yellow-500/20",
          period === "evening" && "bg-orange-500/20",
          period === "night" && "bg-indigo-500/20",
        )}>
          <IconComponent className={cn("h-5 w-5", iconColors[period])} />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-foreground">
          {greeting}, {displayName}
        </span>
        <span className="text-sm text-muted-foreground">
          {getTimeMessage(period)}
        </span>
      </div>
    </div>
  );
};

function getTimeMessage(period: "morning" | "afternoon" | "evening" | "night"): string {
  const messages = {
    morning: "Ready to review the latest intelligence updates?",
    afternoon: "Your investigation dashboard awaits.",
    evening: "Wrapping up? Check the day's findings.",
    night: "Working late? Stay focused on justice.",
  };
  return messages[period];
}
