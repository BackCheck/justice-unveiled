import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Calendar, Users, FileText, Network } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

export const CaseOverviewCard = () => {
  const { stats } = usePlatformStats();

  return (
    <Card className="glass-card overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="w-5 h-5 text-primary" />
            Case: Danish Thanvi vs. Agencies
          </CardTitle>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 animate-pulse">
            ACQUITTED - May 2025
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <p className="text-sm text-muted-foreground mb-4">
          A decade-long pattern of systematic harassment, evidence fabrication, and regulatory abuse 
          targeting a business executive, culminating in full acquittal after procedural violations 
          and document forgeries were exposed.
        </p>
        
        {/* Category Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
            <p className="text-xl font-bold text-amber-600">{stats.eventsByCategory["Business Interference"] || 0}</p>
            <p className="text-xs text-muted-foreground">Business Interference</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
            <p className="text-xl font-bold text-red-600">{stats.eventsByCategory["Harassment"] || 0}</p>
            <p className="text-xs text-muted-foreground">Harassment Events</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
            <p className="text-xl font-bold text-blue-600">{stats.eventsByCategory["Legal Proceeding"] || 0}</p>
            <p className="text-xs text-muted-foreground">Legal Proceedings</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
            <p className="text-xl font-bold text-purple-600">{stats.eventsByCategory["Criminal Allegation"] || 0}</p>
            <p className="text-xs text-muted-foreground">Criminal Allegations</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>2015 - 2025</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{stats.totalEntities} entities</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            <span>{stats.totalSources} sources</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Network className="w-3.5 h-3.5" />
            <span>{stats.totalConnections} links</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
