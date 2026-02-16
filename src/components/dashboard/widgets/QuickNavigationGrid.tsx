import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Clock,
  Network,
  FileSearch,
  Brain,
  Shield,
  BarChart3,
  Compass,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

export const QuickNavigationGrid = () => {
  const { stats } = usePlatformStats();

  const modules = [
    {
      title: "Timeline",
      description: `${stats.totalEvents} events`,
      icon: Clock,
      href: "/",
      color: "text-primary",
      bgColor: "bg-primary/10",
      hoverBg: "group-hover:bg-primary/20",
      badge: null,
    },
    {
      title: "Network",
      description: `${stats.totalEntities} entities`,
      icon: Network,
      href: "/network",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      hoverBg: "group-hover:bg-chart-2/20",
      badge: stats.aiExtractedEntities > 0 ? `+${stats.aiExtractedEntities} AI` : null,
    },
    {
      title: "Evidence",
      description: `${stats.totalSources} sources`,
      icon: FileSearch,
      href: "/evidence",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      hoverBg: "group-hover:bg-chart-4/20",
      badge: null,
    },
    {
      title: "AI Analyzer",
      description: `${stats.documentsAnalyzed} analyzed`,
      icon: Brain,
      href: "/analyze",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      hoverBg: "group-hover:bg-amber-500/20",
      badge: "AI",
    },
    {
      title: "Rights Audit",
      description: `${stats.internationalFrameworks} frameworks`,
      icon: Shield,
      href: "/international-analysis",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      hoverBg: "group-hover:bg-orange-500/20",
      badge: null,
    },
    {
      title: "Investigations",
      description: "Analysis tools",
      icon: BarChart3,
      href: "/investigations",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      hoverBg: "group-hover:bg-purple-500/20",
      badge: null,
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Quick Navigation</h2>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <Link key={module.title} to={module.href}>
              <div 
                className="nav-card p-3 flex flex-col items-center text-center cursor-pointer group h-full opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'forwards' }}
              >
                <div className={`p-2.5 rounded-xl ${module.bgColor} ${module.hoverBg} transition-all mb-2 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`w-5 h-5 ${module.color}`} />
                </div>
                <h3 className="text-sm font-medium text-foreground/90 mb-0.5">{module.title}</h3>
                <p className="text-[10px] text-muted-foreground">{module.description}</p>
                {module.badge && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 mt-1.5 bg-amber-500/10 text-amber-600 border-0">
                    {module.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
