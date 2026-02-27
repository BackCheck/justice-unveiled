import { useCallback, useEffect, useRef } from "react";
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
  const posRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);
  const rafRef = useRef<number>();

  const updateStyle = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.opacity = visibleRef.current ? "1" : "0";
    const children = el.children;
    const { x, y } = posRef.current;
    if (children[0]) {
      (children[0] as HTMLElement).style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
    }
    if (children[1]) {
      (children[1] as HTMLElement).style.transform = `translate(${x - (size * 1.5) / 2}px, ${y - (size * 1.5) / 2}px)`;
    }
    if (children[2]) {
      (children[2] as HTMLElement).style.transform = `translate(${x - (size * 0.3) / 2}px, ${y - (size * 0.3) / 2}px)`;
    }
  }, [size]);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      posRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          updateStyle();
          rafRef.current = undefined;
        });
      }
    };

    const handleMouseEnter = () => { visibleRef.current = true; updateStyle(); };
    const handleMouseLeave = () => { visibleRef.current = false; updateStyle(); };

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateStyle]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 opacity-0",
        className
      )}
    >
      <div
        className="absolute top-0 left-0 rounded-full will-change-transform"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at center, hsl(var(--primary) / ${intensity}) 0%, hsl(var(--primary) / ${intensity * 0.5}) 30%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute top-0 left-0 rounded-full will-change-transform"
        style={{
          width: size * 1.5,
          height: size * 1.5,
          background: `radial-gradient(circle at center, hsl(var(--chart-2) / ${intensity * 0.3}) 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute top-0 left-0 rounded-full will-change-transform"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          background: `radial-gradient(circle at center, hsl(var(--primary) / ${intensity * 0.8}) 0%, transparent 70%)`,
          filter: "blur(10px)",
        }}
      />
    </div>
  );
};

export default SpotlightEffect;
