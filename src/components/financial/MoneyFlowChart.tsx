import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancialActor, FinancialFinding } from "@/hooks/useFinancialAbuse";
import { TrendingUp } from "lucide-react";

interface Props {
  actors: FinancialActor[];
  findings: FinancialFinding[];
}

interface FlowNode {
  id: string;
  label: string;
  column: number;
  y: number;
  height: number;
  color: string;
}

interface FlowLink {
  source: string;
  target: string;
  value: number;
  label: string;
}

export const MoneyFlowChart = ({ actors, findings }: Props) => {
  const { flowNodes, flowLinks, maxAmount } = useMemo(() => {
    if (actors.length === 0 || findings.length === 0) {
      return { flowNodes: [], flowLinks: [], maxAmount: 0 };
    }

    // Build Sankey-like data: Company → Actor → Finding Type
    const actorAmounts = actors.map(a => ({
      name: a.actor_name,
      amount: a.total_amount || findings
        .filter(f => f.actor_names?.includes(a.actor_name))
        .reduce((s, f) => s + (f.amount || 0), 0),
    })).filter(a => a.amount > 0).sort((a, b) => b.amount - a.amount);

    const typeAmounts: Record<string, number> = {};
    findings.forEach(f => {
      if (f.amount > 0) {
        typeAmounts[f.finding_type] = (typeAmounts[f.finding_type] || 0) + f.amount;
      }
    });

    const totalAmount = actorAmounts.reduce((s, a) => s + a.amount, 0);
    if (totalAmount === 0) return { flowNodes: [], flowLinks: [], maxAmount: 0 };

    const svgH = 400;
    const padding = 20;
    const usableH = svgH - padding * 2;

    const nodes: FlowNode[] = [];
    const links: FlowLink[] = [];

    // Source node (Company)
    nodes.push({ id: "company", label: "Company Funds", column: 0, y: padding, height: usableH, color: "hsl(var(--primary))" });

    // Actor nodes (middle column)
    let actorY = padding;
    actorAmounts.forEach(a => {
      const h = Math.max(30, (a.amount / totalAmount) * usableH);
      const risk = actors.find(ac => ac.actor_name === a.name)?.risk_score || 50;
      nodes.push({
        id: `actor-${a.name}`,
        label: a.name,
        column: 1,
        y: actorY,
        height: h,
        color: risk >= 80 ? "hsl(var(--destructive))" : risk >= 60 ? "#f97316" : "#eab308",
      });
      links.push({ source: "company", target: `actor-${a.name}`, value: a.amount, label: `PKR ${(a.amount / 1000).toFixed(0)}K` });
      actorY += h + 8;
    });

    // Type nodes (right column)
    const sortedTypes = Object.entries(typeAmounts).sort((a, b) => b[1] - a[1]);
    let typeY = padding;
    const typeTotalAmount = sortedTypes.reduce((s, [, v]) => s + v, 0);
    sortedTypes.forEach(([type, amount]) => {
      const h = Math.max(24, (amount / typeTotalAmount) * usableH);
      nodes.push({
        id: `type-${type}`,
        label: type.replace(/_/g, " "),
        column: 2,
        y: typeY,
        height: h,
        color: "hsl(var(--muted-foreground))",
      });
      typeY += h + 6;
    });

    // Actor → Type links
    actorAmounts.forEach(a => {
      const actorFindings = findings.filter(f => f.actor_names?.includes(a.name) && f.amount > 0);
      const byType: Record<string, number> = {};
      actorFindings.forEach(f => { byType[f.finding_type] = (byType[f.finding_type] || 0) + f.amount; });
      Object.entries(byType).forEach(([type, amount]) => {
        links.push({ source: `actor-${a.name}`, target: `type-${type}`, value: amount, label: "" });
      });
    });

    return { flowNodes: nodes, flowLinks: links, maxAmount: totalAmount };
  }, [actors, findings]);

  const colX = [60, 350, 640];

  if (actors.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          No money flow data available. Upload financial records to visualize fund movements.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Money Flow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 800 450" className="w-full h-[450px] bg-muted/10 rounded-lg">
            {/* Column headers */}
            <text x={colX[0] + 30} y={14} textAnchor="middle" fontSize={11} fontWeight="bold" fill="hsl(var(--muted-foreground))">SOURCE</text>
            <text x={colX[1] + 30} y={14} textAnchor="middle" fontSize={11} fontWeight="bold" fill="hsl(var(--muted-foreground))">ACTORS</text>
            <text x={colX[2] + 30} y={14} textAnchor="middle" fontSize={11} fontWeight="bold" fill="hsl(var(--muted-foreground))">ABUSE TYPE</text>

            {/* Links */}
            {flowLinks.map((link, i) => {
              const sNode = flowNodes.find(n => n.id === link.source);
              const tNode = flowNodes.find(n => n.id === link.target);
              if (!sNode || !tNode) return null;
              const sX = colX[sNode.column] + 60;
              const tX = colX[tNode.column];
              const sY = sNode.y + sNode.height / 2;
              const tY = tNode.y + tNode.height / 2;
              const thickness = Math.max(2, Math.min(20, (link.value / (maxAmount || 1)) * 40));
              return (
                <g key={`link-${i}`}>
                  <path
                    d={`M${sX},${sY} C${(sX + tX) / 2},${sY} ${(sX + tX) / 2},${tY} ${tX},${tY}`}
                    fill="none"
                    stroke={sNode.color}
                    strokeWidth={thickness}
                    strokeOpacity={0.2}
                  />
                  {link.label && (
                    <text x={(sX + tX) / 2} y={((sY + tY) / 2) - 6} textAnchor="middle"
                      fontSize={9} fill="hsl(var(--muted-foreground))">
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {flowNodes.map(node => {
              const x = colX[node.column];
              return (
                <g key={node.id}>
                  <rect x={x} y={node.y} width={60} height={node.height} rx={4}
                    fill={node.color} fillOpacity={0.2} stroke={node.color} strokeWidth={1} />
                  <text x={x + 30} y={node.y + node.height / 2 + 4} textAnchor="middle"
                    fontSize={10} fontWeight="600" fill="hsl(var(--foreground))">
                    {node.label.length > 10 ? node.label.slice(0, 10) + "…" : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Flow Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {actors.filter(a => (a.total_amount || 0) > 0).sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0)).slice(0, 6).map(actor => (
          <Card key={actor.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{actor.actor_name}</span>
                <Badge variant="outline" className="text-xs">PKR {((actor.total_amount || 0) / 1000).toFixed(0)}K</Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((actor.total_amount || 0) / (maxAmount || 1)) * 100)}%`,
                    background: actor.risk_score >= 80 ? "hsl(var(--destructive))" : actor.risk_score >= 60 ? "#f97316" : "#eab308",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{actor.transaction_count || 0} transactions</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
