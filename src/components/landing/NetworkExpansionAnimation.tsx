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
  driftAngle: number;
  driftSpeed: number;
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  opacity: number;
  active: boolean;
  pulseOffset: number;
}

interface DataPacket {
  connectionIndex: number;
  progress: number;
  speed: number;
  size: number;
  direction: number; // 1 or -1
}

const NetworkExpansionAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const packetsRef = useRef<DataPacket[]>([]);
  const timeRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    const initNetwork = () => {
      nodesRef.current = [];
      connectionsRef.current = [];
      packetsRef.current = [];
      
      const nodeCount = 60;
      const width = canvas.width;
      const height = canvas.height;
      const heroHeight = window.innerHeight;
      
      // Create nodes only BELOW the hero section
      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * width;
        // Start nodes below hero area (with some buffer)
        const y = heroHeight + 100 + Math.random() * (height - heroHeight - 100);
        
        nodesRef.current.push({
          x,
          y,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          radius: 2 + Math.random() * 4,
          opacity: 0.3 + Math.random() * 0.5,
          delay: Math.random() * 2000,
          active: true,
          pulse: Math.random() * Math.PI * 2,
          connections: [],
          driftAngle: Math.random() * Math.PI * 2,
          driftSpeed: 0.2 + Math.random() * 0.5
        });
      }
      
      // Create connections between nearby nodes
      const nodes = nodesRef.current;
      nodes.forEach((node, i) => {
        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 250 && Math.random() > 0.4) {
            node.connections.push(j);
            connectionsRef.current.push({
              from: i,
              to: j,
              progress: 1,
              opacity: 0.15 + Math.random() * 0.2,
              active: true,
              pulseOffset: Math.random() * Math.PI * 2
            });
          }
        });
      });
      
      // Initialize data packets
      for (let i = 0; i < 25; i++) {
        if (connectionsRef.current.length > 0) {
          packetsRef.current.push({
            connectionIndex: Math.floor(Math.random() * connectionsRef.current.length),
            progress: Math.random(),
            speed: 0.008 + Math.random() * 0.015,
            size: 2 + Math.random() * 3,
            direction: Math.random() > 0.5 ? 1 : -1
          });
        }
      }
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    const animate = () => {
      const time = performance.now();
      timeRef.current = time;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const nodes = nodesRef.current;
      const connections = connectionsRef.current;
      const packets = packetsRef.current;
      
      // Subtle parallax based on scroll
      const scrollOffset = scrollRef.current * 0.1;
      
      // Update node positions with drift and wave motion
      nodes.forEach((node, i) => {
        node.driftAngle += 0.003;
        const waveOffset = Math.sin(time * 0.0015 + i * 0.5) * 12;
        node.x = node.targetX + Math.cos(node.driftAngle) * 35 * node.driftSpeed + waveOffset;
        node.y = node.targetY + Math.sin(node.driftAngle * 0.7) * 30 * node.driftSpeed - scrollOffset;
        node.pulse += 0.025;
      });
      
      // Draw connections with breathing effect
      connections.forEach((conn) => {
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        
        if (!fromNode || !toNode) return;
        
        const breathe = Math.sin(time * 0.001 + conn.pulseOffset) * 0.5 + 0.5;
        const opacity = conn.opacity * (0.7 + breathe * 0.3);
        
        // Draw connection line with gradient
        const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
        gradient.addColorStop(0, `hsla(199, 89%, 48%, ${opacity})`);
        gradient.addColorStop(0.5, `hsla(199, 89%, 70%, ${opacity * 1.4})`);
        gradient.addColorStop(1, `hsla(199, 89%, 48%, ${opacity})`);
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8 + breathe * 0.4;
        ctx.stroke();
      });
      
      // Draw and update data packets
      packets.forEach((packet) => {
        const conn = connections[packet.connectionIndex];
        if (!conn) return;
        
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        if (!fromNode || !toNode) return;
        
        // Update packet position
        packet.progress += packet.speed * packet.direction;
        
        // Bounce at ends
        if (packet.progress >= 1) {
          packet.progress = 1;
          packet.direction = -1;
        } else if (packet.progress <= 0) {
          packet.progress = 0;
          packet.direction = 1;
          // Randomly jump to new connection
          if (Math.random() > 0.7 && connections.length > 0) {
            packet.connectionIndex = Math.floor(Math.random() * connections.length);
          }
        }
        
        const x = fromNode.x + (toNode.x - fromNode.x) * packet.progress;
        const y = fromNode.y + (toNode.y - fromNode.y) * packet.progress;
        
        // Draw packet with glow
        const packetGlow = ctx.createRadialGradient(x, y, 0, x, y, packet.size * 4);
        packetGlow.addColorStop(0, 'hsla(199, 100%, 70%, 0.8)');
        packetGlow.addColorStop(0.5, 'hsla(199, 100%, 60%, 0.3)');
        packetGlow.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(x, y, packet.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = packetGlow;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, packet.size, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(199, 100%, 80%, 0.9)';
        ctx.fill();
      });
      
      // Draw nodes
      nodes.forEach((node) => {
        const pulseScale = 1 + Math.sin(node.pulse) * 0.2;
        const radius = node.radius * pulseScale;
        
        // Outer glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4);
        glow.addColorStop(0, `hsla(199, 89%, 48%, ${node.opacity * 0.4})`);
        glow.addColorStop(0.5, `hsla(199, 89%, 48%, ${node.opacity * 0.1})`);
        glow.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        
        // Node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(199, 89%, 60%, ${node.opacity})`;
        ctx.fill();
        
        // Bright center
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(199, 100%, 80%, ${node.opacity})`;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initNetwork();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      initNetwork();
    });
    window.addEventListener("scroll", handleScroll);

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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

export default NetworkExpansionAnimation;
