import { useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancialActor, FinancialFinding } from "@/hooks/useFinancialAbuse";
import { GitBranch } from "lucide-react";

interface Props {
  actors: FinancialActor[];
  findings: FinancialFinding[];
}

interface GraphNode {
  id: string;
  name: string;
  risk: number;
  x: number;
  y: number;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  strength: number;
}

export const ActorNetworkGraph = ({ actors, findings }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { nodes, edges } = useMemo(() => {
    if (actors.length === 0) return { nodes: [], edges: [] };

    const centerX = 400;
    const centerY = 250;
    const radius = 160;

    const graphNodes: GraphNode[] = actors.map((a, i) => {
      const angle = (2 * Math.PI * i) / actors.length - Math.PI / 2;
      return {
        id: a.id,
        name: a.actor_name,
        risk: a.risk_score,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        radius: 24 + (a.risk_score / 100) * 20,
      };
    });

    const graphEdges: GraphEdge[] = [];
    for (let i = 0; i < actors.length; i++) {
      for (let j = i + 1; j < actors.length; j++) {
        const a1 = actors[i];
        const a2 = actors[j];
        // Find shared findings
        const a1Findings = findings.filter(f => f.actor_names?.includes(a1.actor_name));
        const a2Findings = findings.filter(f => f.actor_names?.includes(a2.actor_name));
        const shared = a1Findings.filter(f => f.actor_names?.includes(a2.actor_name));
        
        // Shared patterns
        const sharedPatterns = (a1.pattern_types || []).filter(p => (a2.pattern_types || []).includes(p));

        if (shared.length > 0 || sharedPatterns.length > 0) {
          graphEdges.push({
            source: a1.id,
            target: a2.id,
            label: shared.length > 0 
              ? `${shared.length} shared findings` 
              : `${sharedPatterns.length} shared patterns`,
            strength: Math.min(shared.length + sharedPatterns.length, 5),
          });
        }
      }
    }

    return { nodes: graphNodes, edges: graphEdges };
  }, [actors, findings]);

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return "hsl(var(--destructive))";
    if (risk >= 60) return "#f97316";
    if (risk >= 40) return "#eab308";
    return "hsl(var(--primary))";
  };

  if (actors.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          No actors identified. Upload financial records to detect actor networks.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Actor Relationship Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg ref={svgRef} viewBox="0 0 800 500" className="w-full h-[500px] bg-muted/20 rounded-lg">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {edges.map((edge, i) => {
              const s = nodes.find(n => n.id === edge.source);
              const t = nodes.find(n => n.id === edge.target);
              if (!s || !t) return null;
              const midX = (s.x + t.x) / 2;
              const midY = (s.y + t.y) / 2;
              return (
                <g key={`edge-${i}`}>
                  <line
                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={edge.strength}
                    strokeOpacity={0.3}
                    strokeDasharray={edge.strength <= 1 ? "4,4" : undefined}
                  />
                  <rect x={midX - 50} y={midY - 10} width={100} height={20} rx={4}
                    fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={0.5} />
                  <text x={midX} y={midY + 4} textAnchor="middle" fontSize={9}
                    fill="hsl(var(--muted-foreground))">
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => (
              <g key={node.id} filter="url(#glow)">
                <circle cx={node.x} cy={node.y} r={node.radius}
                  fill={getRiskColor(node.risk)} fillOpacity={0.15}
                  stroke={getRiskColor(node.risk)} strokeWidth={2} />
                <circle cx={node.x} cy={node.y} r={node.radius * 0.6}
                  fill={getRiskColor(node.risk)} fillOpacity={0.3} />
                <text x={node.x} y={node.y - node.radius - 8} textAnchor="middle"
                  fontSize={13} fontWeight="bold" fill="hsl(var(--foreground))">
                  {node.name}
                </text>
                <text x={node.x} y={node.y + 5} textAnchor="middle"
                  fontSize={11} fontWeight="bold" fill="hsl(var(--foreground))">
                  {node.risk}%
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--destructive))" }} />
              Critical (80%+)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              High (60-79%)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              Medium (40-59%)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--primary))" }} />
              Low (&lt;40%)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {actors.map(actor => {
          const relatedFindings = findings.filter(f => f.actor_names?.includes(actor.actor_name));
          const connectedActors = actors.filter(a => 
            a.id !== actor.id && findings.some(f => 
              f.actor_names?.includes(actor.actor_name) && f.actor_names?.includes(a.actor_name)
            )
          );
          return (
            <Card key={actor.id} className="border-l-4" style={{ borderLeftColor: getRiskColor(actor.risk_score) }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{actor.actor_name}</span>
                  <Badge variant="outline">{actor.risk_score}% Risk</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📄 {relatedFindings.length} findings linked</p>
                  <p>🔗 {connectedActors.length} connected actors</p>
                  {actor.pattern_types?.length ? (
                    <p>📊 Patterns: {actor.pattern_types.join(", ")}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
