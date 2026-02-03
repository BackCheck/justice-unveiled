import { TrackStats, TimelineTrackType, TRACK_COLORS } from "@/types/reconstruction";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Scale,
  Users,
  Building2,
  Gavel
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReconstructionStatsProps {
  trackStats: TrackStats[];
  totalEvents: number;
  totalDelays: number;
  totalContradictions: number;
  dateRange: { start: string; end: string };
}

const TRACK_ICONS: Record<TimelineTrackType, typeof Clock> = {
  criminal: Gavel,
  regulatory: Scale,
  corporate: Building2,
  personal: Users,
};

export const ReconstructionStats = ({
  trackStats,
  totalEvents,
  totalDelays,
  totalContradictions,
  dateRange,
}: ReconstructionStatsProps) => {
  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{totalEvents}</p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalDelays}</p>
            <p className="text-xs text-muted-foreground">Delays Detected</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{totalContradictions}</p>
            <p className="text-xs text-muted-foreground">Contradictions</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">{dateRange.start?.split("-")[0]}</p>
            <p className="text-xs text-muted-foreground">to {dateRange.end?.split("-")[0]}</p>
          </CardContent>
        </Card>
      </div>

      {/* Track Breakdown */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Track Distribution
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trackStats.map(stat => {
              const Icon = TRACK_ICONS[stat.trackType];
              const color = TRACK_COLORS[stat.trackType];
              
              return (
                <div 
                  key={stat.trackType}
                  className="p-3 rounded-lg bg-muted/50 border"
                  style={{ borderColor: `${color}40` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-sm font-medium capitalize">{stat.trackType}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Events</span>
                      <span className="font-medium">{stat.eventCount}</span>
                    </div>
                    {stat.delayCount > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-600">Delays</span>
                        <span className="font-medium text-orange-600">{stat.delayCount}</span>
                      </div>
                    )}
                    {stat.contradictionCount > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-destructive">Issues</span>
                        <span className="font-medium text-destructive">{stat.contradictionCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
