import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { DetailPageHeader } from "@/components/detail/DetailPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LinkedEvidence } from "@/components/timeline/LinkedEvidence";
import { timelineData, categoryColors, TimelineEvent } from "@/data/timelineData";
import { 
  Calendar, 
  Users, 
  Scale, 
  FileText, 
  AlertTriangle, 
  BookOpen,
  Sparkles,
  Clock
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// Helper to get property with different naming conventions
const getEventProp = (event: any, snakeCase: string, camelCase: string): string => {
  return event[snakeCase] || event[camelCase] || '';
};

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Try to find in database first
  const { data: dbEvent, isLoading: dbLoading } = useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extracted_events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId && eventId.includes('-'), // UUID format
    retry: false,
  });

  // Try static data if not a UUID
  const staticEvent: TimelineEvent | null = !eventId?.includes('-') 
    ? timelineData[parseInt(eventId || '0')] || null
    : null;

  const event = dbEvent || staticEvent;
  const isExtracted = !!dbEvent;

  if (dbLoading) {
    return (
      <PlatformLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Loading event details...</div>
        </div>
      </PlatformLayout>
    );
  }

  if (!event) {
    return (
      <PlatformLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Event not found</p>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">
            Go back
          </button>
        </div>
      </PlatformLayout>
    );
  }

  const getFormattedDate = () => {
    try {
      const parsed = parseISO(event.date);
      if (isNaN(parsed.getTime())) return event.date;
      return format(parsed, "MMMM d, yyyy");
    } catch {
      return event.date;
    }
  };

  const category = event.category || 'Unknown';
  const confidenceScore = isExtracted && dbEvent ? dbEvent.confidence_score : undefined;
  const legalAction = getEventProp(event, 'legal_action', 'legalAction');
  const evidenceDiscrepancy = getEventProp(event, 'evidence_discrepancy', 'evidenceDiscrepancy');

  const badges = [
    { label: category, className: `${categoryColors[category as keyof typeof categoryColors] || 'bg-muted'} text-white` },
    { label: getFormattedDate(), variant: "outline" as const },
    ...(isExtracted ? [{ label: "AI Extracted", className: "bg-primary/10 text-primary border-primary/30" }] : []),
  ];

  const priorityFromCategory = (cat: string): 'low' | 'medium' | 'high' | 'critical' => {
    if (cat === 'Criminal Allegation') return 'critical';
    if (cat === 'Legal Proceeding') return 'high';
    if (cat === 'Harassment') return 'high';
    return 'medium';
  };

  return (
    <PlatformLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <DetailPageHeader
          title={event.description.slice(0, 80) + (event.description.length > 80 ? '...' : '')}
          subtitle="Timeline Event"
          description={event.description}
          badges={badges}
          icon={isExtracted ? <Sparkles className="w-6 h-6 text-primary" /> : <Calendar className="w-6 h-6 text-primary" />}
          backPath="/timeline"
          backLabel="Back to Timeline"
          itemType="event"
          itemId={eventId || '0'}
          priority={priorityFromCategory(category)}
          hashtags={['HumanRights', 'HRPM', category.replace(/\s/g, '')]}
        />

        <Separator />

        {/* Main content grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Key Individuals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Key Individuals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{event.individuals}</p>
            </CardContent>
          </Card>

          {/* Legal/Regulatory Action */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground" />
                Legal/Regulatory Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{legalAction}</p>
            </CardContent>
          </Card>

          {/* Outcome */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Outcome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{event.outcome}</p>
            </CardContent>
          </Card>

          {/* Evidence Discrepancy */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <AlertTriangle className="w-4 h-4" />
                Evidence Discrepancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary">{evidenceDiscrepancy}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Sources & References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{event.sources}</p>
          </CardContent>
        </Card>

        {/* Confidence Score for AI extracted */}
        {isExtracted && confidenceScore && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Extraction Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      Number(confidenceScore) >= 0.8 ? "bg-emerald-500" :
                      Number(confidenceScore) >= 0.6 ? "bg-amber-500" : "bg-destructive"
                    )}
                    style={{ width: `${Number(confidenceScore) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(Number(confidenceScore) * 100)}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Linked Evidence */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Linked Evidence Files</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkedEvidence eventIndex={parseInt(eventId || '0')} />
          </CardContent>
        </Card>

        {/* Metadata */}
        {isExtracted && dbEvent && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created: {format(new Date(dbEvent.created_at), "PPp")}
                </div>
                {dbEvent.updated_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated: {format(new Date(dbEvent.updated_at), "PPp")}
                  </div>
                )}
                {dbEvent.extraction_method && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Method: {dbEvent.extraction_method}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PlatformLayout>
  );
}
