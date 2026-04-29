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
  ArrowRight,
  Upload,
  BookOpen,
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

export const QuickNavigationGrid = () => {
  const { stats } = usePlatformStats();

  const modules = [
    {
      title: "Timeline",
      description: "View all events in chronological order. Build and verify the narrative of what happened and when.",
      stat: `${stats.totalEvents} events`,
      icon: Clock,
      href: "/",
      color: "text-primary",
      bgColor: "bg-primary/10",
      hoverBg: "group-hover:bg-primary/20",
      badge: null,
    },
    {
      title: "Entity Network",
      description: "Explore relationships between people, organizations, and institutions involved in the case.",
      stat: `${stats.totalEntities} entities`,
      icon: Network,
      href: "/network",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      hoverBg: "group-hover:bg-chart-2/20",
      badge: stats.aiExtractedEntities > 0 ? `+${stats.aiExtractedEntities} AI` : null,
    },
    {
      title: "Evidence Vault",
      description: "Access all uploaded documents, forensic artifacts, and digital evidence linked to events.",
      stat: `${stats.totalSources} sources`,
      icon: FileSearch,
      href: "/evidence",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      hoverBg: "group-hover:bg-chart-4/20",
      badge: null,
    },
    {
      title: "AI Analyzer",
      description: "Upload documents for AI extraction of events, entities, and discrepancies automatically.",
      stat: `${stats.documentsAnalyzed} analyzed`,
      icon: Brain,
      href: "/analyze",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      hoverBg: "group-hover:bg-amber-500/20",
      badge: "AI",
    },
    {
      title: "Rights Audit",
      description: "Track violations against international frameworks (UDHR, ICCPR, CAT) and local statutes.",
      stat: `${stats.internationalFrameworks} frameworks`,
      icon: Shield,
      href: "/international-analysis",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      hoverBg: "group-hover:bg-orange-500/20",
      badge: null,
    },
    {
      title: "Investigations",
      description: "Run threat profiling, pattern detection, link analysis, and risk assessments on case data.",
      stat: "Analysis tools",
      icon: BarChart3,
      href: "/investigations",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      hoverBg: "group-hover:bg-purple-500/20",
      badge: null,
    },
  ];

  // Determine suggested actions based on current data state
  const suggestedActions = [];
  if (stats.totalSources === 0) {
    suggestedActions.push({ label: "Upload your first document", href: "/uploads", icon: Upload });
  }
  if (stats.totalSources > 0 && stats.documentsAnalyzed === 0) {
    suggestedActions.push({ label: "Analyze uploaded documents with AI", href: "/analyze", icon: Brain });
  }
  if (stats.totalEntities > 0 && stats.totalConnections === 0) {
    suggestedActions.push({ label: "Map entity relationships", href: "/network", icon: Network });
  }
  if (stats.internationalFrameworks === 0 && stats.totalEvents > 0) {
    suggestedActions.push({ label: "Run rights violation audit", href: "/international-analysis", icon: Shield });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Investigation Modules
          </h2>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Click any module to navigate • Hover for details
        </span>
      </div>

      {/* Suggested Next Steps */}
      {suggestedActions.length > 0 && (
        <div className="mb-4 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Suggested Next Steps</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.href}>
                  <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-2.5 cursor-pointer hover:bg-amber-500/15 transition-colors border border-amber-500/20 bg-amber-500/10 text-amber-700">
                    <Icon className="w-3 h-3" />
                    {action.label}
                    <ArrowRight className="w-3 h-3" />
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                <p className="text-[10px] text-muted-foreground mb-1">{module.stat}</p>
                <p className="text-[9px] text-muted-foreground/60 line-clamp-2 leading-snug hidden md:block">{module.description}</p>
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
