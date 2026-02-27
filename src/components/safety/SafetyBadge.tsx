/**
 * SafetyBadge — Compact risk level indicator.
 */

import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import type { RiskLevel } from "@/types/safety";

interface SafetyBadgeProps {
  level: RiskLevel;
  className?: string;
}

const CONFIG: Record<RiskLevel, { icon: typeof ShieldCheck; color: string; label: string }> = {
  LOW: { icon: ShieldCheck, color: "text-green-600 bg-green-100 border-green-300", label: "Safe" },
  MEDIUM: { icon: Shield, color: "text-amber-600 bg-amber-100 border-amber-300", label: "Caution" },
  HIGH: { icon: ShieldAlert, color: "text-orange-600 bg-orange-100 border-orange-300", label: "High Risk" },
  CRITICAL: { icon: ShieldAlert, color: "text-red-600 bg-red-100 border-red-300", label: "Critical" },
};

export const SafetyBadge = ({ level, className }: SafetyBadgeProps) => {
  const cfg = CONFIG[level];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`gap-1 text-[10px] ${cfg.color} ${className || ''}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
};
