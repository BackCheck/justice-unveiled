import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MouseParallaxProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  smooth?: number;
}

const MouseParallax = ({ 
  children, 
  className, 
  intensity = 20,
  smooth = 0.1 
}: MouseParallaxProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      targetRef.current = {
        x: ((e.clientX - centerX) / rect.width) * intensity,
        y: ((e.clientY - centerY) / rect.height) * intensity,
      };
    };

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smooth;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smooth;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, smooth]);

  return (
    <div ref={containerRef} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
};

export default MouseParallax;
