import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBorderProps {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  duration?: number;
}

const AnimatedGradientBorder = ({
  children,
  className,
  borderWidth = 2,
  duration = 4,
}: AnimatedGradientBorderProps) => {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden p-[1px]",
        className
      )}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(
            var(--gradient-angle, 0deg),
            hsl(var(--primary)),
            hsl(var(--chart-2)),
            hsl(var(--primary))
          )`,
          animation: `gradient-rotate ${duration}s linear infinite`,
        }}
      />
      
      {/* Inner content with background */}
      <div
        className="relative bg-card rounded-[calc(0.75rem-1px)] h-full w-full"
        style={{ padding: borderWidth }}
      >
        {children}
      </div>

      <style>{`
        @keyframes gradient-rotate {
          0% { --gradient-angle: 0deg; }
          100% { --gradient-angle: 360deg; }
        }
        @property --gradient-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>
    </div>
  );
};

export default AnimatedGradientBorder;
