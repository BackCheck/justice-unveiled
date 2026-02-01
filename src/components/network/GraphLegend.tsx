import { cn } from "@/lib/utils";
import { Users, Building2, Calendar, AlertTriangle, MapPin, Circle } from "lucide-react";
import { NodeType, RiskLevel } from "@/hooks/useGraphData";

interface GraphLegendProps {
  activeLayers: Set<NodeType>;
  activeRiskLevels: Set<RiskLevel>;
  onToggleLayer: (layer: NodeType) => void;
  onToggleRiskLevel: (level: RiskLevel) => void;
}

const layerConfig: { type: NodeType; label: string; icon: typeof Users; color: string }[] = [
  { type: "person", label: "Identity", icon: Users, color: "#3b82f6" },
  { type: "violation", label: "Threat", icon: AlertTriangle, color: "#ef4444" },
  { type: "organization", label: "Behaviour", icon: Building2, color: "#f97316" },
  { type: "event", label: "Event", icon: Calendar, color: "#eab308" },
];

const riskConfig: { level: RiskLevel; label: string; color: string }[] = [
  { level: "critical", label: "Critical", color: "#ef4444" },
  { level: "high", label: "High", color: "#f97316" },
  { level: "medium", label: "Medium", color: "#eab308" },
  { level: "low", label: "Low", color: "#22c55e" },
];

export const GraphLegend = ({ 
  activeLayers, 
  activeRiskLevels, 
  onToggleLayer, 
  onToggleRiskLevel 
}: GraphLegendProps) => {
  return (
    <div className="absolute left-4 top-20 z-10 bg-card/90 backdrop-blur-sm border rounded-lg p-4 space-y-4 min-w-[140px]">
      {/* Layers */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Layers</p>
        <div className="space-y-1.5">
          {layerConfig.map(layer => {
            const Icon = layer.icon;
            const isActive = activeLayers.has(layer.type);
            return (
              <button
                key={layer.type}
                onClick={() => onToggleLayer(layer.type)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1 rounded text-xs transition-all",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Circle 
                  className="w-2.5 h-2.5" 
                  fill={isActive ? layer.color : "transparent"} 
                  stroke={layer.color}
                  strokeWidth={2}
                />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk Level */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Risk Level</p>
        <div className="space-y-1.5">
          {riskConfig.map(risk => {
            const isActive = activeRiskLevels.has(risk.level);
            return (
              <button
                key={risk.level}
                onClick={() => onToggleRiskLevel(risk.level)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1 rounded text-xs transition-all",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Circle 
                  className="w-2.5 h-2.5" 
                  fill={isActive ? risk.color : "transparent"} 
                  stroke={risk.color}
                  strokeWidth={2}
                />
                <span>{risk.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Node Size */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Node Size</p>
        <div className="flex items-center gap-1.5 px-2">
          <Circle className="w-2 h-2" fill="currentColor" />
          <Circle className="w-3 h-3" fill="currentColor" />
          <Circle className="w-4 h-4" fill="currentColor" />
          <span className="text-[10px] text-muted-foreground ml-1">= Connections</span>
        </div>
      </div>
    </div>
  );
};
