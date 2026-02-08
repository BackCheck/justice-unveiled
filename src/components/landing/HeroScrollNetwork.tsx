import { useEffect, useRef, useState } from "react";

interface Dot {
  x: number;
  y: number;
  baseOpacity: number;
  currentOpacity: number;
  radius: number;
  pulsePhase: number;
}

interface Connection {
  from: number;
  to: number;
  opacity: number;
  lit: boolean;
}

const HeroScrollNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const dotsRef = useRef<Dot[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const scrollProgressRef = useRef(0);
  const lastScrollRef = useRef(0);
  const scrollDeltaRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initDots = () => {
      dotsRef.current = [];
      connectionsRef.current = [];

      const dotCount = 50;
      const width = canvas.width;
      const height = canvas.height;

      // Create dots in a scattered pattern
      for (let i = 0; i < dotCount; i++) {
        dotsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseOpacity: 0.1 + Math.random() * 0.2,
          currentOpacity: 0.1,
          radius: 2 + Math.random() * 3,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // Create potential connections between nearby dots
      const dots = dotsRef.current;
      dots.forEach((dot, i) => {
        dots.forEach((other, j) => {
          if (i >= j) return;
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200 && Math.random() > 0.5) {
            connectionsRef.current.push({
              from: i,
              to: j,
              opacity: 0,
              lit: false,
            });
          }
        });
      });
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScrollRef.current;
      scrollDeltaRef.current = delta;
      lastScrollRef.current = currentScroll;

      // Calculate scroll progress within hero (0 to 1)
      const heroHeight = window.innerHeight;
      scrollProgressRef.current = Math.min(currentScroll / heroHeight, 1);

      // Hide when scrolled past hero
      setIsVisible(currentScroll < heroHeight);

      // Light up connections based on scroll activity
      if (Math.abs(delta) > 2) {
        const numToLight = Math.min(
          Math.floor(Math.abs(delta) / 3),
          connectionsRef.current.length
        );
        for (let i = 0; i < numToLight; i++) {
          const randomIndex = Math.floor(
            Math.random() * connectionsRef.current.length
          );
          connectionsRef.current[randomIndex].lit = true;
        }
      }
    };

    const animate = () => {
      const time = performance.now();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dots = dotsRef.current;
      const connections = connectionsRef.current;
      const scrollActivity = Math.min(Math.abs(scrollDeltaRef.current) / 10, 1);

      // Decay scroll delta
      scrollDeltaRef.current *= 0.95;

      // Update and draw connections
      connections.forEach((conn) => {
        const fromDot = dots[conn.from];
        const toDot = dots[conn.to];

        if (!fromDot || !toDot) return;

        // Fade in when lit, fade out over time
        if (conn.lit) {
          conn.opacity = Math.min(conn.opacity + 0.15, 1);
          if (conn.opacity >= 0.9) {
            conn.lit = false;
          }
        } else {
          conn.opacity *= 0.97;
        }

        if (conn.opacity < 0.01) return;

        // Draw connection with glow
        const gradient = ctx.createLinearGradient(
          fromDot.x,
          fromDot.y,
          toDot.x,
          toDot.y
        );
        gradient.addColorStop(0, `hsla(199, 89%, 48%, ${conn.opacity * 0.3})`);
        gradient.addColorStop(
          0.5,
          `hsla(199, 89%, 70%, ${conn.opacity * 0.8})`
        );
        gradient.addColorStop(1, `hsla(199, 89%, 48%, ${conn.opacity * 0.3})`);

        ctx.beginPath();
        ctx.moveTo(fromDot.x, fromDot.y);
        ctx.lineTo(toDot.x, toDot.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + conn.opacity * 1.5;
        ctx.stroke();

        // Light up connected dots
        if (conn.opacity > 0.3) {
          fromDot.currentOpacity = Math.max(
            fromDot.currentOpacity,
            conn.opacity
          );
          toDot.currentOpacity = Math.max(toDot.currentOpacity, conn.opacity);
        }
      });

      // Update and draw dots
      dots.forEach((dot) => {
        // Pulse effect
        dot.pulsePhase += 0.02;
        const pulse = Math.sin(dot.pulsePhase) * 0.3 + 0.7;

        // Calculate target opacity based on scroll activity
        const targetOpacity = dot.baseOpacity + scrollActivity * 0.5;

        // Smoothly transition opacity
        dot.currentOpacity =
          dot.currentOpacity * 0.95 +
          Math.max(targetOpacity, dot.currentOpacity) * 0.05;

        const opacity = dot.currentOpacity * pulse;
        const radius = dot.radius * (1 + dot.currentOpacity * 0.5);

        // Outer glow
        const glow = ctx.createRadialGradient(
          dot.x,
          dot.y,
          0,
          dot.x,
          dot.y,
          radius * 4
        );
        glow.addColorStop(0, `hsla(199, 89%, 60%, ${opacity * 0.6})`);
        glow.addColorStop(0.5, `hsla(199, 89%, 48%, ${opacity * 0.2})`);
        glow.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(199, 89%, 70%, ${opacity})`;
        ctx.fill();

        // Bright center
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(199, 100%, 85%, ${opacity})`;
        ctx.fill();

        // Decay current opacity
        dot.currentOpacity *= 0.98;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initDots();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      initDots();
    });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
      style={{ opacity: isVisible ? 0.8 : 0 }}
    />
  );
};

export default HeroScrollNetwork;
