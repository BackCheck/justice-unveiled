import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FloatingIconProps {
  icon: LucideIcon;
  className?: string;
  delay?: number;
  size?: number;
  enableParallax?: boolean;
}

const FloatingIcon = ({ 
  icon: Icon, 
  className, 
  delay = 0, 
  size = 24,
  enableParallax = true 
}: FloatingIconProps) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!enableParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      const intensity = 15 + Math.random() * 10;
      targetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * intensity,
        y: (e.clientY / window.innerHeight - 0.5) * intensity,
      };
    };

    const animate = () => {
      positionRef.current.x += (targetRef.current.x - positionRef.current.x) * 0.05;
      positionRef.current.y += (targetRef.current.y - positionRef.current.y) * 0.05;

      if (iconRef.current) {
        iconRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enableParallax]);

  return (
    <div
      ref={iconRef}
      className={cn(
        "absolute p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg",
        "animate-float opacity-60 hover:opacity-100 transition-all duration-500",
        "hover:scale-110 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]",
        "will-change-transform cursor-pointer",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <Icon className="text-primary transition-colors" size={size} />
    </div>
  );
};

export default FloatingIcon;
