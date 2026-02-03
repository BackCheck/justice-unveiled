import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, Users, Building2, Briefcase, Scale, 
  ArrowRight, ArrowLeftRight, Sparkles, Shield, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PowerNetworkLegendProps {
  className?: string;
}

export const PowerNetworkLegend = ({ className }: PowerNetworkLegendProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const entityTypes = [
    { icon: Users, label: "Person", color: "hsl(var(--chart-1))" },
    { icon: Building2, label: "Organization", color: "hsl(var(--chart-2))" },
    { icon: Briefcase, label: "Government Agency", color: "hsl(var(--chart-3))" },
    { icon: Scale, label: "Legal Entity", color: "hsl(var(--chart-4))" },
  ];

  const categoryTypes = [
    { label: "Protagonist", color: "hsl(var(--chart-5))", description: "Victim/Target" },
    { label: "Antagonist", color: "hsl(var(--destructive))", description: "Accused/Perpetrator" },
    { label: "Official", color: "hsl(var(--chart-3))", description: "State Bodies" },
    { label: "Neutral", color: "hsl(var(--muted-foreground))", description: "Witnesses/Others" },
  ];

  const influenceTypes = [
    { icon: ArrowRight, label: "One-way Influence", description: "Power flows in one direction" },
    { icon: ArrowLeftRight, label: "Bidirectional", description: "Mutual influence" },
    { icon: Target, label: "High Influence", description: "Strong connection weight" },
  ];

  const roleTags = [
    { label: "Investigator", category: "investigative" },
    { label: "Complainant", category: "complainant" },
    { label: "Accused", category: "accused" },
    { label: "Beneficiary", category: "beneficiary" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("bg-card/95 backdrop-blur-xl border-border/50 shadow-lg", className)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Power Network Legend
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-3 pt-0 space-y-4">
            {/* Entity Types */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Entity Types
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {entityTypes.map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-3 h-3" style={{ color }} />
                    </div>
                    <span className="text-[11px]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Actor Categories
              </p>
              <div className="space-y-1.5">
                {categoryTypes.map(({ label, color, description }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-offset-background"
                      style={{ backgroundColor: color, outlineColor: color }}
                    />
                    <span className="text-[11px] font-medium">{label}</span>
                    <span className="text-[10px] text-muted-foreground">- {description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Influence Arrows */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Influence Flow
              </p>
              <div className="space-y-1.5">
                {influenceTypes.map(({ icon: Icon, label, description }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-medium">{label}</span>
                    <span className="text-[10px] text-muted-foreground truncate">- {description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Tags */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Role Tags
              </p>
              <div className="flex flex-wrap gap-1">
                {roleTags.map(({ label, category }) => (
                  <Badge 
                    key={label} 
                    variant="outline" 
                    className={cn(
                      "text-[9px] px-1.5 py-0",
                      category === "investigative" && "border-blue-500 text-blue-600",
                      category === "complainant" && "border-green-500 text-green-600",
                      category === "accused" && "border-red-500 text-red-600",
                      category === "beneficiary" && "border-amber-500 text-amber-600"
                    )}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Indicator */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] text-muted-foreground">
                  AI-extracted entities show sparkle
                </span>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
