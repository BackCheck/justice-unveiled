import { cn } from "@/lib/utils";

interface GlowingOrbProps {
  className?: string;
  color?: "primary" | "accent" | "chart-2";
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
}

const GlowingOrb = ({ className, color = "primary", size = "md", delay = 0 }: GlowingOrbProps) => {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
    xl: "w-[500px] h-[500px]",
  };

  const colorClasses = {
    primary: "bg-primary/20",
    accent: "bg-accent/30",
    "chart-2": "bg-chart-2/20",
  };

  return (
    <div
      className={cn(
        "absolute rounded-full blur-2xl animate-pulse-glow will-change-[opacity]",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    />
  );
};

export default GlowingOrb;
