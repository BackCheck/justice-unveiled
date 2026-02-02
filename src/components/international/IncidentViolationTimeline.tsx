import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { incidentMappings, localViolations, internationalViolations } from "@/data/violationsData";
import { Calendar, Scale, Globe, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export const IncidentViolationTimeline = () => {
  const sortedMappings = [...incidentMappings].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  const getLocalViolation = (id: string) => localViolations.find(v => v.id === id);
  const getInternationalViolation = (id: string) => internationalViolations.find(v => v.id === id);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Incident-to-Violation Mapping
          <Badge variant="secondary" className="ml-auto">
            {incidentMappings.length} Events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-4">
            {sortedMappings.map((mapping, idx) => {
              const totalViolations = mapping.localViolations.length + mapping.internationalViolations.length;
              
              return (
                <div 
                  key={idx} 
                  className="relative pl-6 pb-4 border-l-2 border-border last:border-l-0 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  
                  {/* Date badge */}
                  <Badge variant="outline" className="text-xs mb-2">
                    {format(new Date(mapping.eventDate), "MMM d, yyyy")}
                  </Badge>
                  
                  {/* Event description */}
                  <p className="text-sm font-medium text-foreground mb-3">
                    {mapping.eventDescription}
                  </p>
                  
                  {/* Violation count indicator */}
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-muted-foreground">
                      {totalViolations} violation{totalViolations !== 1 ? 's' : ''} identified
                    </span>
                  </div>
                  
                  {/* Violations grid */}
                  <div className="space-y-2">
                    {/* Local violations */}
                    {mapping.localViolations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-600 mt-0.5" />
                        {mapping.localViolations.map((id) => {
                          const violation = getLocalViolation(id);
                          if (!violation) return null;
                          return (
                            <Badge 
                              key={id}
                              variant="outline" 
                              className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30"
                            >
                              {violation.statute} {violation.section}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* International violations */}
                    {mapping.internationalViolations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                        {mapping.internationalViolations.map((id) => {
                          const violation = getInternationalViolation(id);
                          if (!violation) return null;
                          return (
                            <Badge 
                              key={id}
                              variant="outline" 
                              className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/30"
                            >
                              {violation.instrument} {violation.article}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
