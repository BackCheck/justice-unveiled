import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity,
  FileText,
  Users,
  Network,
  Sparkles,
  Calendar,
  Upload,
  CheckCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const activityIcons = {
  upload: Upload,
  analysis: Sparkles,
  entity: Users,
  event: Calendar,
  connection: Network,
  document: FileText,
  complete: CheckCircle,
};

const activityColors = {
  upload: "text-blue-500 bg-blue-500/10",
  analysis: "text-amber-500 bg-amber-500/10",
  entity: "text-chart-2 bg-chart-2/10",
  event: "text-primary bg-primary/10",
  connection: "text-purple-500 bg-purple-500/10",
  document: "text-chart-4 bg-chart-4/10",
  complete: "text-emerald-500 bg-emerald-500/10",
};

export const ActivityFeed = () => {
  // Fetch recent uploads
  const { data: uploads } = useQuery({
    queryKey: ["recent-uploads-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence_uploads")
        .select("id, file_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60,
  });

  // Fetch recent events
  const { data: events } = useQuery({
    queryKey: ["recent-events-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_events")
        .select("id, description, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60,
  });

  // Fetch recent entities
  const { data: entities } = useQuery({
    queryKey: ["recent-entities-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracted_entities")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60,
  });

  // Combine and sort activities
  const activities = [
    ...(uploads || []).map(u => ({
      id: `upload-${u.id}`,
      type: "upload" as const,
      title: u.file_name,
      description: "Document uploaded",
      time: u.created_at,
    })),
    ...(events || []).map(e => ({
      id: `event-${e.id}`,
      type: "event" as const,
      title: e.description.slice(0, 50) + (e.description.length > 50 ? "..." : ""),
      description: "AI extracted event",
      time: e.created_at,
    })),
    ...(entities || []).map(e => ({
      id: `entity-${e.id}`,
      type: "entity" as const,
      title: e.name,
      description: "Entity identified",
      time: e.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Recent Activity
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {activities.length} updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="px-4 pb-4 space-y-1">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent activity
              </div>
            ) : (
              activities.map((activity, index) => {
                const Icon = activityIcons[activity.type];
                const colorClass = activityColors[activity.type];
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                  >
                    <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-[10px] text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
