import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  delay: number;
  active: boolean;
  pulse: number;
  connections: number[];
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  opacity: number;
  active: boolean;
}

const NetworkExpansionAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const timeRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }
    };

    const initNetwork = () => {
      nodesRef.current = [];
      connectionsRef.current = [];
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const nodeCount = 35;
      
      // Create nodes in expanding rings
      const rings = [
        { count: 1, radius: 0, delay: 0 },
        { count: 6, radius: 80, delay: 500 },
        { count: 10, radius: 160, delay: 1200 },
        { count: 12, radius: 260, delay: 2000 },
        { count: 6, radius: 360, delay: 2800 },
      ];
      
      let nodeIndex = 0;
      rings.forEach((ring, ringIndex) => {
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2 + (ringIndex * 0.3);
          const targetX = centerX + Math.cos(angle) * ring.radius;
          const targetY = centerY + Math.sin(angle) * ring.radius;
          
          nodesRef.current.push({
            x: centerX,
            y: centerY,
            targetX,
            targetY,
            vx: 0,
            vy: 0,
            radius: ringIndex === 0 ? 8 : 4 + Math.random() * 3,
            opacity: 0,
            delay: ring.delay + i * 80,
            active: false,
            pulse: Math.random() * Math.PI * 2,
            connections: []
          });
          nodeIndex++;
        }
      });
      
      // Create connections between nodes
      const nodes = nodesRef.current;
      nodes.forEach((node, i) => {
        // Connect to nearby nodes
        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dx = node.targetX - other.targetX;
          const dy = node.targetY - other.targetY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Connect if close enough, with bias toward center
          const threshold = i === 0 ? 200 : 140;
          if (dist < threshold && Math.random() > 0.3) {
            node.connections.push(j);
            connectionsRef.current.push({
              from: i,
              to: j,
              progress: 0,
              opacity: 0,
              active: false
            });
          }
        });
      });
    };

    const drawGlow = (x: number, y: number, radius: number, color: string, intensity: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
      gradient.addColorStop(0, color.replace(')', `, ${intensity})`).replace('hsl', 'hsla'));
      gradient.addColorStop(0.5, color.replace(')', `, ${intensity * 0.3})`).replace('hsl', 'hsla'));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      const time = performance.now();
      timeRef.current = time;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const nodes = nodesRef.current;
      const connections = connectionsRef.current;
      
      // Update and draw connections
      connections.forEach((conn) => {
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        
        if (!fromNode.active || !toNode.active) return;
        
        if (!conn.active) {
          conn.active = true;
        }
        
        // Animate connection progress
        if (conn.progress < 1) {
          conn.progress += 0.02;
          conn.opacity = Math.min(conn.progress * 2, 0.6);
        }
        
        const startX = fromNode.x;
        const startY = fromNode.y;
        const endX = startX + (toNode.x - startX) * conn.progress;
        const endY = startY + (toNode.y - startY) * conn.progress;
        
        // Draw connection line with gradient
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, `hsla(199, 100%, 50%, ${conn.opacity})`);
        gradient.addColorStop(1, `hsla(199, 100%, 70%, ${conn.opacity * 0.5})`);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw data pulse along connection
        if (conn.progress >= 1) {
          const pulsePos = (Math.sin(time * 0.003 + conn.from) + 1) / 2;
          const pulseX = startX + (toNode.x - startX) * pulsePos;
          const pulseY = startY + (toNode.y - startY) * pulsePos;
          
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(199, 100%, 70%, ${0.8})`;
          ctx.fill();
        }
      });
      
      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Check if node should activate
        if (!node.active && time > node.delay) {
          node.active = true;
        }
        
        if (!node.active) return;
        
        // Animate node to target position
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        node.x += dx * 0.05;
        node.y += dy * 0.05;
        
        // Fade in
        if (node.opacity < 1) {
          node.opacity += 0.03;
        }
        
        // Pulse effect
        node.pulse += 0.02;
        const pulseScale = 1 + Math.sin(node.pulse) * 0.15;
        const radius = node.radius * pulseScale;
        
        // Draw glow
        drawGlow(node.x, node.y, radius, 'hsl(199, 100%, 50%)', node.opacity * 0.4);
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        
        // Center node is special
        if (i === 0) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius);
          gradient.addColorStop(0, `hsla(199, 100%, 70%, ${node.opacity})`);
          gradient.addColorStop(0.7, `hsla(199, 100%, 50%, ${node.opacity})`);
          gradient.addColorStop(1, `hsla(199, 100%, 40%, ${node.opacity * 0.8})`);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = `hsla(199, 100%, 60%, ${node.opacity * 0.9})`;
        }
        ctx.fill();
        
        // Node border
        ctx.strokeStyle = `hsla(199, 100%, 80%, ${node.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Draw subtle grid in background
      ctx.strokeStyle = 'hsla(199, 50%, 50%, 0.05)';
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initNetwork();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      initNetwork();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-70"
      />
      {/* Central glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
    </div>
  );
};

export default NetworkExpansionAnimation;
