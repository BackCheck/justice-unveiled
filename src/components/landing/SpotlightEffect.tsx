import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SpotlightEffectProps {
  className?: string;
  size?: number;
  intensity?: number;
}

const SpotlightEffect = ({ 
  className, 
  size = 400,
  intensity = 0.15 
}: SpotlightEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {/* Main spotlight */}
      <div
        className="absolute rounded-full transition-transform duration-75 ease-out"
        style={{
          width: size,
          height: size,
          left: mousePosition.x - size / 2,
          top: mousePosition.y - size / 2,
          background: `radial-gradient(circle at center, hsl(var(--primary) / ${intensity}) 0%, hsl(var(--primary) / ${intensity * 0.5}) 30%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      
      {/* Secondary glow ring */}
      <div
        className="absolute rounded-full transition-transform duration-150 ease-out"
        style={{
          width: size * 1.5,
          height: size * 1.5,
          left: mousePosition.x - (size * 1.5) / 2,
          top: mousePosition.y - (size * 1.5) / 2,
          background: `radial-gradient(circle at center, hsl(var(--chart-2) / ${intensity * 0.3}) 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Bright center point */}
      <div
        className="absolute rounded-full transition-transform duration-50 ease-out"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          left: mousePosition.x - (size * 0.3) / 2,
          top: mousePosition.y - (size * 0.3) / 2,
          background: `radial-gradient(circle at center, hsl(var(--primary) / ${intensity * 0.8}) 0%, transparent 70%)`,
          filter: "blur(10px)",
        }}
      />
    </div>
  );
};

export default SpotlightEffect;
