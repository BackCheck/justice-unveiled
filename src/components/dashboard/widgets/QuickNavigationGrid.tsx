import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Clock,
  Network,
  FileSearch,
  Brain,
  Shield,
  Scale,
  Upload,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

export const QuickNavigationGrid = () => {
  const { stats } = usePlatformStats();

  const modules = [
    {
      title: "Interactive Timeline",
      description: `${stats.totalEvents} documented events`,
      icon: Clock,
      href: "/",
      color: "text-primary bg-primary/10 group-hover:bg-primary/20",
      badge: null,
    },
    {
      title: "Entity Network",
      description: `${stats.totalEntities} entities mapped`,
      icon: Network,
      href: "/network",
      color: "text-chart-2 bg-chart-2/10 group-hover:bg-chart-2/20",
      badge: stats.aiExtractedEntities > 0 ? `+${stats.aiExtractedEntities} AI` : null,
    },
    {
      title: "Evidence Matrix",
      description: `${stats.totalSources} verified sources`,
      icon: FileSearch,
      href: "/evidence",
      color: "text-chart-4 bg-chart-4/10 group-hover:bg-chart-4/20",
      badge: null,
    },
    {
      title: "AI Analyzer",
      description: `${stats.documentsAnalyzed} docs analyzed`,
      icon: Brain,
      href: "/analyze",
      color: "text-amber-500 bg-amber-500/10 group-hover:bg-amber-500/20",
      badge: "AI",
    },
    {
      title: "Rights Audit",
      description: `${stats.internationalFrameworks} frameworks`,
      icon: Shield,
      href: "/international-analysis",
      color: "text-orange-500 bg-orange-500/10 group-hover:bg-orange-500/20",
      badge: null,
    },
    {
      title: "Investigations Hub",
      description: "Threat analysis tools",
      icon: BarChart3,
      href: "/investigations",
      color: "text-purple-500 bg-purple-500/10 group-hover:bg-purple-500/20",
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {modules.map((module, index) => {
        const Icon = module.icon;
        return (
          <Link key={module.title} to={module.href}>
            <Card 
              className="glass-card card-hover cursor-pointer group h-full opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${module.color} transition-colors`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {module.badge && (
                    <Badge variant="secondary" className="text-[9px] px-1.5">
                      {module.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold mb-1">{module.title}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{module.description}</p>
                <ArrowRight className="w-3 h-3 mt-2 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
