import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Network, 
  AlertTriangle, 
  FileText, 
  Brain, 
  Target,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Threat Profiler",
    description: "Generate AI adversary profiles",
    icon: Shield,
    color: "text-red-500 bg-red-500/10 hover:bg-red-500/20",
    href: "/investigations?tab=threats",
  },
  {
    title: "Pattern Detection",
    description: "Find hidden connections",
    icon: Network,
    color: "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20",
    href: "/investigations?tab=patterns",
  },
  {
    title: "Risk Assessment",
    description: "Automated threat scoring",
    icon: AlertTriangle,
    color: "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20",
    href: "/investigations?tab=risk",
  },
  {
    title: "Generate Report",
    description: "Create intelligence brief",
    icon: FileText,
    color: "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20",
    href: "/investigations?tab=reports",
  },
  {
    title: "AI Analyzer",
    description: "Process new documents",
    icon: Brain,
    color: "text-primary bg-primary/10 hover:bg-primary/20",
    href: "/analyze",
  },
  {
    title: "Network Graph",
    description: "Visualize relationships",
    icon: Target,
    color: "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
    href: "/network",
  },
];

export const QuickActionsPanel = () => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.href}>
                <Button
                  variant="ghost"
                  className={`w-full h-auto p-3 flex flex-col items-start gap-1 ${action.color} border border-transparent hover:border-current/20`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{action.title}</span>
                  <span className="text-[10px] opacity-70">{action.description}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
