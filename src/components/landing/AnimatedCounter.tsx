import { useEffect, useState, useRef, forwardRef } from "react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

const AnimatedCounter = forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  ({ end, duration = 2000, suffix = "", className = "" }, forwardedRef) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const internalRef = useRef<HTMLSpanElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLSpanElement>) || internalRef;

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );

      if (internalRef.current) {
        observer.observe(internalRef.current);
      }

      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (!isVisible) return;

      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [isVisible, end, duration]);

    return (
      <span ref={internalRef} className={className}>
        {count}{suffix}
      </span>
    );
  }
);

AnimatedCounter.displayName = "AnimatedCounter";

export default AnimatedCounter;
