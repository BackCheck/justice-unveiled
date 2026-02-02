import { useParams, useNavigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { DetailPageHeader } from "@/components/detail/DetailPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { localViolations, internationalViolations, incidentMappings } from "@/data/violationsData";
import { 
  Scale, 
  Globe, 
  AlertTriangle, 
  BookOpen,
  FileText,
  Calendar,
  Link2
} from "lucide-react";
import { format } from "date-fns";

export default function ViolationDetail() {
  const { type, violationId } = useParams<{ type: 'local' | 'international'; violationId: string }>();
  const navigate = useNavigate();

  const isLocal = type === 'local';
  
  const violation = isLocal
    ? localViolations.find(v => v.id === violationId)
    : internationalViolations.find(v => v.id === violationId);

  // Find related incidents for this violation
  const relatedIncidents = incidentMappings.filter(mapping => 
    isLocal 
      ? mapping.localViolations.includes(violationId || '')
      : mapping.internationalViolations.includes(violationId || '')
  );

  if (!violation) {
    return (
      <PlatformLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Violation not found</p>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">
            Go back
          </button>
        </div>
      </PlatformLayout>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      default: return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    }
  };

  const priorityFromSeverity = (severity: "critical" | "high" | "medium"): 'medium' | 'high' | 'critical' => {
    if (severity === 'critical') return 'critical';
    if (severity === 'high') return 'high';
    return 'medium';
  };

  // Build content based on violation type
  const isLocalViolation = 'statute' in violation;
  const title = isLocalViolation 
    ? `${violation.statute} - ${violation.section}`
    : `${violation.instrument} - ${violation.article}`;
  
  const subtitle = isLocalViolation ? "Local Statute Violation" : "International Framework Violation";

  const badges = [
    { label: violation.severity.toUpperCase(), className: getSeverityStyle(violation.severity) },
    { label: isLocalViolation ? "Pakistani Law" : "International Law", variant: "outline" as const },
    ...(isLocalViolation ? [] : [{ label: (violation as any).framework, variant: "secondary" as const }]),
  ];

  return (
    <PlatformLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <DetailPageHeader
          title={title}
          subtitle={subtitle}
          description={violation.description}
          badges={badges}
          icon={isLocalViolation ? <Scale className="w-6 h-6 text-amber-600" /> : <Globe className="w-6 h-6 text-blue-600" />}
          backPath="/international"
          backLabel="Back to Violations Registry"
          itemType={isLocalViolation ? "local_violation" : "international_violation"}
          itemId={violationId || ''}
          priority={priorityFromSeverity(violation.severity)}
          hashtags={['HumanRights', 'HRPM', isLocalViolation ? 'PakistaniLaw' : 'InternationalLaw']}
        />

        <Separator />

        {/* Violation Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Legal Reference */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                Legal Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLocalViolation ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Statute:</span>
                    <span className="font-medium">{(violation as any).statute}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Section:</span>
                    <span className="font-medium">{(violation as any).section}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Instrument:</span>
                    <span className="font-medium">{(violation as any).instrument}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Article:</span>
                    <span className="font-medium">{(violation as any).article}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Framework:</span>
                    <span className="font-medium">{(violation as any).framework}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Severity Analysis */}
          <Card className={getSeverityStyle(violation.severity).replace('text-', 'border-').split(' ')[0]}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Severity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={getSeverityStyle(violation.severity)}>
                  {violation.severity.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">severity level</span>
              </div>
              <p className="text-sm">
                {violation.severity === 'critical' && "This violation represents a fundamental breach of rights requiring immediate attention."}
                {violation.severity === 'high' && "This is a serious violation with significant impact on rights protection."}
                {violation.severity === 'medium' && "This violation requires attention and remediation."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Full Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Detailed Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{violation.description}</p>
          </CardContent>
        </Card>

        {/* Related Incidents */}
        {relatedIncidents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                Related Incidents ({relatedIncidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatedIncidents.map((incident, idx) => (
                  <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(incident.eventDate), "MMM d, yyyy")}
                      </Badge>
                    </div>
                    <p className="text-sm">{incident.eventDescription}</p>
                    
                    {/* Show other violations linked to this incident */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {isLocalViolation ? (
                        incident.internationalViolations.map(vId => {
                          const v = internationalViolations.find(x => x.id === vId);
                          if (!v) return null;
                          return (
                            <Badge 
                              key={vId}
                              variant="outline" 
                              className="text-[10px] bg-blue-500/10 text-blue-600 cursor-pointer hover:bg-blue-500/20"
                              onClick={() => navigate(`/violations/international/${vId}`)}
                            >
                              {v.instrument} {v.article}
                            </Badge>
                          );
                        })
                      ) : (
                        incident.localViolations.map(vId => {
                          const v = localViolations.find(x => x.id === vId);
                          if (!v) return null;
                          return (
                            <Badge 
                              key={vId}
                              variant="outline" 
                              className="text-[10px] bg-amber-500/10 text-amber-600 cursor-pointer hover:bg-amber-500/20"
                              onClick={() => navigate(`/violations/local/${vId}`)}
                            >
                              {v.statute} {v.section}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legal Context */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Legal Context & Implications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isLocalViolation 
                ? "This violation falls under Pakistani domestic law and may be subject to local judicial review and remediation procedures."
                : "This violation of international law may be brought before relevant international bodies and tribunals, and Pakistan may have reporting obligations under this framework."
              }
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Documentation Required</Badge>
              <Badge variant="outline">Legal Review Recommended</Badge>
              <Badge variant="outline">Remediation Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlatformLayout>
  );
}
