import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, Building2, Calendar, AlertTriangle, Circle, ChevronDown, Layers } from "lucide-react";
import { NodeType, RiskLevel } from "@/hooks/useGraphData";

interface FloatingLegendProps {
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

export const FloatingLegend = ({ 
  activeLayers, 
  activeRiskLevels, 
  onToggleLayer, 
  onToggleRiskLevel 
}: FloatingLegendProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {/* Collapsed view - Layer pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {layerConfig.map(layer => {
          const Icon = layer.icon;
          const isActive = activeLayers.has(layer.type);
          return (
            <button
              key={layer.type}
              onClick={() => onToggleLayer(layer.type)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all",
                "border backdrop-blur-sm shadow-sm",
                isActive 
                  ? "bg-card/90 border-border text-foreground" 
                  : "bg-card/50 border-border/50 text-muted-foreground opacity-60 hover:opacity-100"
              )}
            >
              <Icon className="w-3 h-3" style={{ color: layer.color }} />
              <span className="hidden sm:inline">{layer.label}</span>
            </button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Layers className="w-3.5 h-3.5 mr-1" />
          <ChevronDown className={cn(
            "w-3 h-3 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Expanded view - Risk levels */}
      {isExpanded && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide px-1">Risk:</span>
          {riskConfig.map(risk => {
            const isActive = activeRiskLevels.has(risk.level);
            return (
              <button
                key={risk.level}
                onClick={() => onToggleRiskLevel(risk.level)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all",
                  "border backdrop-blur-sm",
                  isActive 
                    ? "bg-card/90 border-border" 
                    : "bg-card/50 border-border/50 opacity-50 hover:opacity-100"
                )}
              >
                <Circle 
                  className="w-2 h-2" 
                  fill={risk.color} 
                  stroke={risk.color}
                />
                <span>{risk.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
