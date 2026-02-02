import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { useWatchlist, WatchlistItem } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Calendar, 
  Scale, 
  Globe, 
  Users, 
  Trash2, 
  ExternalLink,
  AlertCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Watchlist() {
  const { user } = useAuth();
  const { watchlist, isLoading, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate();

  const getItemTypeIcon = (type: WatchlistItem['item_type']) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'local_violation': return <Scale className="w-4 h-4" />;
      case 'international_violation': return <Globe className="w-4 h-4" />;
      case 'entity': return <Users className="w-4 h-4" />;
    }
  };

  const getItemTypePath = (item: WatchlistItem) => {
    switch (item.item_type) {
      case 'event': return `/events/${item.item_id}`;
      case 'local_violation': return `/violations/local/${item.item_id}`;
      case 'international_violation': return `/violations/international/${item.item_id}`;
      case 'entity': return `/entities/${item.item_id}`;
    }
  };

  const getPriorityStyle = (priority: WatchlistItem['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    }
  };

  const getItemTypeLabel = (type: WatchlistItem['item_type']) => {
    switch (type) {
      case 'event': return 'Timeline Event';
      case 'local_violation': return 'Local Violation';
      case 'international_violation': return 'International Violation';
      case 'entity': return 'Entity';
    }
  };

  const filterByType = (type?: WatchlistItem['item_type']) => {
    if (!type) return watchlist || [];
    return (watchlist || []).filter(item => item.item_type === type);
  };

  const renderWatchlistItems = (items: WatchlistItem[]) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Eye className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No items in watchlist</p>
          <p className="text-sm">Add items from timeline events or violations to track them here.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getItemTypeIcon(item.item_type)}
                  </div>
                  <div>
                    <Badge variant="outline" className="text-[10px]">
                      {getItemTypeLabel(item.item_type)}
                    </Badge>
                  </div>
                </div>
                <Badge className={cn("text-[10px]", getPriorityStyle(item.priority))}>
                  {item.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                {item.item_title}
              </h3>
              {item.item_description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.item_description}
                </p>
              )}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                Added {format(new Date(item.created_at), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => navigate(getItemTypePath(item))}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFromWatchlist.mutate(item.id)}
                  disabled={removeFromWatchlist.isPending}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <PlatformLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-lg font-medium">Sign in required</p>
          <p className="text-muted-foreground">Please sign in to view your watchlist.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </PlatformLayout>
    );
  }

  const eventCount = filterByType('event').length;
  const localCount = filterByType('local_violation').length;
  const intlCount = filterByType('international_violation').length;
  const entityCount = filterByType('entity').length;

  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              My Watchlist
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and monitor important events, violations, and entities
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {watchlist?.length || 0} items
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="text-xs">{watchlist?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-3 h-3" />
              Events
              <Badge variant="secondary" className="text-xs">{eventCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="local" className="gap-2">
              <Scale className="w-3 h-3" />
              Local
              <Badge variant="secondary" className="text-xs">{localCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="international" className="gap-2">
              <Globe className="w-3 h-3" />
              International
              <Badge variant="secondary" className="text-xs">{intlCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="entities" className="gap-2">
              <Users className="w-3 h-3" />
              Entities
              <Badge variant="secondary" className="text-xs">{entityCount}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="all">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse text-muted-foreground">Loading watchlist...</div>
                </div>
              ) : (
                renderWatchlistItems(watchlist || [])
              )}
            </TabsContent>
            <TabsContent value="events">
              {renderWatchlistItems(filterByType('event'))}
            </TabsContent>
            <TabsContent value="local">
              {renderWatchlistItems(filterByType('local_violation'))}
            </TabsContent>
            <TabsContent value="international">
              {renderWatchlistItems(filterByType('international_violation'))}
            </TabsContent>
            <TabsContent value="entities">
              {renderWatchlistItems(filterByType('entity'))}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PlatformLayout>
  );
}
