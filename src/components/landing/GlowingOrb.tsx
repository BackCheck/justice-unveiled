import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GlowingOrbProps {
  className?: string;
  color?: "primary" | "accent" | "chart-2";
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
  enableParallax?: boolean;
}

const GlowingOrb = ({ 
  className, 
  color = "primary", 
  size = "md", 
  delay = 0,
  enableParallax = true 
}: GlowingOrbProps) => {
  const orbRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

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

  useEffect(() => {
    if (!enableParallax) return;

    // Different intensity for each orb based on size
    const intensityMap = { sm: 30, md: 20, lg: 15, xl: 10 };
    const intensity = intensityMap[size];

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * intensity,
        y: (e.clientY / window.innerHeight - 0.5) * intensity,
      };
    };

    const animate = () => {
      positionRef.current.x += (targetRef.current.x - positionRef.current.x) * 0.03;
      positionRef.current.y += (targetRef.current.y - positionRef.current.y) * 0.03;

      if (orbRef.current) {
        orbRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enableParallax, size]);

  return (
    <div
      ref={orbRef}
      className={cn(
        "absolute rounded-full blur-3xl animate-pulse-glow will-change-transform",
        "transition-opacity duration-1000",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    />
  );
};

export default GlowingOrb;
