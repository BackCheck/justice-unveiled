import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const GradientText = ({ children, className, animate = true }: GradientTextProps) => {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_auto]",
        animate && "animate-gradient-shift",
        className
      )}
    >
      {children}
    </span>
  );
};

export default GradientText;
