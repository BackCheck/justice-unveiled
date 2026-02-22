import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scale, Shield, FileSearch } from "lucide-react";

export const DashboardHero = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
            Human Rights Protection & Monitoring
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Open-source investigative platform documenting human rights violations through AI-powered evidence analysis, 
            legal compliance tracking, and entity network mapping.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
            <Link to="/how-to-use">
              <FileSearch className="w-3.5 h-3.5" />
              How It Works
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" asChild>
            <Link to="/cases">
              Explore Cases
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
      {/* Quick purpose icons */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Scale className="w-3.5 h-3.5 text-primary" />
          <span>Legal Compliance</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Rights Documentation</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileSearch className="w-3.5 h-3.5 text-primary" />
          <span>AI Evidence Analysis</span>
        </div>
      </div>
    </div>
  );
};
