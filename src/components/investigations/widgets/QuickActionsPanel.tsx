import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Network, 
  AlertTriangle, 
  FileText, 
  Brain, 
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const QuickActionsPanel = () => {
  const { t } = useTranslation();

  const quickActions = [
    {
      title: t('widgets.threatProfiler'),
      description: t('widgets.generateProfiles'),
      icon: Shield,
      color: "text-red-500 bg-red-500/10 hover:bg-red-500/20",
      href: "/investigations?tab=threats",
    },
    {
      title: t('widgets.patternDetection'),
      description: t('widgets.findConnections'),
      icon: Network,
      color: "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20",
      href: "/investigations?tab=patterns",
    },
    {
      title: t('widgets.riskAssessment'),
      description: t('widgets.automatedScoring'),
      icon: AlertTriangle,
      color: "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20",
      href: "/investigations?tab=risk",
    },
    {
      title: t('widgets.generateReport'),
      description: t('widgets.createBrief'),
      icon: FileText,
      color: "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20",
      href: "/investigations?tab=reports",
    },
    {
      title: t('widgets.aiAnalyzer'),
      description: t('widgets.processDocuments'),
      icon: Brain,
      color: "text-primary bg-primary/10 hover:bg-primary/20",
      href: "/analyze",
    },
    {
      title: t('widgets.networkGraph'),
      description: t('widgets.visualizeRelations'),
      icon: Target,
      color: "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
      href: "/network",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.title} to={action.href}>
            <Button
              variant="ghost"
              className={`w-full h-auto p-3 flex flex-col items-center gap-1.5 ${action.color} border border-transparent hover:border-current/20 rounded-xl`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.title}</span>
              <span className="text-[10px] opacity-70 text-center leading-tight">{action.description}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
};