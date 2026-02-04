import { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}

const TextReveal = ({ children, className, delay = 0, stagger = 50 }: TextRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Split text into words for animation
  const text = typeof children === 'string' ? children : '';
  const words = text.split(' ');

  if (typeof children !== 'string') {
    return (
      <div
        ref={containerRef}
        className={cn(
          "transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          className
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      {words.map((word, index) => (
        <span
          key={index}
          className={cn(
            "inline-block transition-all duration-500 ease-out mr-[0.25em]",
            isVisible
              ? "opacity-100 translate-y-0 blur-0"
              : "opacity-0 translate-y-8 blur-sm"
          )}
          style={{
            transitionDelay: `${delay + index * stagger}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default TextReveal;
