import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FloatingIconProps {
  icon: LucideIcon;
  className?: string;
  delay?: number;
  size?: number;
}

const FloatingIcon = ({ icon: Icon, className, delay = 0, size = 24 }: FloatingIconProps) => {
  return (
    <div
      className={cn(
        "absolute p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg",
        "animate-float opacity-60 hover:opacity-100 transition-opacity",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <Icon className="text-primary" size={size} />
    </div>
  );
};

export default FloatingIcon;
