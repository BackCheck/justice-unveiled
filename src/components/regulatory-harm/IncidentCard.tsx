import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight,
  Landmark,
  FileWarning,
  Award,
  FileText,
  Calendar,
  Building2,
  DollarSign,
  Clock,
  Paperclip,
  ExternalLink
} from "lucide-react";
import type { RegulatoryHarmIncident } from "@/types/regulatory-harm";
import { 
  incidentTypeConfig, 
  statusConfig, 
  severityConfig,
  lossCategoryConfig 
} from "@/types/regulatory-harm";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface IncidentCardProps {
  incident: RegulatoryHarmIncident;
  onAddLoss?: (incidentId: string) => void;
  onAddTime?: (incidentId: string) => void;
  onUploadAffidavit?: (incidentId: string) => void;
}

const incidentIcons = {
  banking: Landmark,
  regulatory_notice: FileWarning,
  license: Award,
  contract: FileText
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `PKR ${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `PKR ${(amount / 1000).toFixed(1)}K`;
  return `PKR ${amount.toLocaleString()}`;
};

export const IncidentCard = ({ 
  incident, 
  onAddLoss,
  onAddTime,
  onUploadAffidavit 
}: IncidentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const typeConfig = incidentTypeConfig[incident.incident_type] || { label: incident.incident_type, icon: 'FileWarning', color: 'text-muted-foreground' };
  const statConfig = statusConfig[incident.status] || { label: incident.status, color: 'text-muted-foreground', bgColor: 'bg-muted' };
  const sevConfig = severityConfig[incident.severity] || { label: incident.severity, color: 'text-muted-foreground', bgColor: 'bg-muted' };
  const Icon = incidentIcons[incident.incident_type] || FileWarning;

  const totalLosses = incident.financial_losses?.reduce((s, l) => s + Number(l.amount), 0) || 0;
  const totalTime = incident.time_entries?.reduce((s, t) => s + Number(t.hours_spent), 0) || 0;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      incident.severity === 'critical' && "border-destructive/30",
      incident.status === 'active' && "border-orange-500/30"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={cn("p-2 rounded-lg", sevConfig.bgColor)}>
                  <Icon className={cn("w-5 h-5", typeConfig.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CardTitle className="text-base">{incident.title}</CardTitle>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(incident.incident_date), 'MMM d, yyyy')}
                    </span>
                    {incident.institution_name && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {incident.institution_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <Badge variant="outline" className={cn("text-xs", sevConfig.bgColor, sevConfig.color)}>
                    {sevConfig.label}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", statConfig.bgColor, statConfig.color)}>
                    {statConfig.label}
                  </Badge>
                </div>
                {totalLosses > 0 && (
                  <span className="text-sm font-semibold text-destructive">
                    {formatCurrency(totalLosses)}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {incident.description && (
              <p className="text-sm text-muted-foreground">{incident.description}</p>
            )}

            {/* Reference & Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {incident.reference_number && (
                <span className="font-mono bg-muted px-2 py-0.5 rounded">
                  Ref: {incident.reference_number}
                </span>
              )}
              <Badge variant="secondary" className="text-xs">
                {typeConfig.label}
              </Badge>
            </div>

            {/* Financial Losses */}
            {incident.financial_losses && incident.financial_losses.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-destructive" />
                  Financial Losses ({incident.financial_losses.length})
                </h4>
                <div className="grid gap-2">
                  {incident.financial_losses.map(loss => {
                    const catConfig = lossCategoryConfig[loss.loss_category] || { label: loss.loss_category, color: 'text-muted-foreground' };
                    return (
                      <div 
                        key={loss.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", catConfig.color)}>
                            {catConfig.label}
                          </Badge>
                          <span className="text-sm">{loss.description}</span>
                          {loss.is_estimated && (
                            <span className="text-xs text-muted-foreground italic">(est.)</span>
                          )}
                        </div>
                        <span className="font-semibold text-destructive">
                          {formatCurrency(Number(loss.amount))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time Tracking */}
            {incident.time_entries && incident.time_entries.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Time Spent ({totalTime.toFixed(1)} hours)
                </h4>
                <div className="text-sm text-muted-foreground">
                  Total cost: {formatCurrency(incident.time_entries.reduce((s, t) => s + Number(t.total_cost || 0), 0))}
                </div>
              </div>
            )}

            {/* Affidavits */}
            {incident.affidavits && incident.affidavits.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-purple-500" />
                  Attached Documents ({incident.affidavits.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {incident.affidavits.map(aff => (
                    <a
                      key={aff.id}
                      href={aff.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      {aff.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => onAddLoss?.(incident.id)}>
                <DollarSign className="w-4 h-4 mr-1" />
                Add Loss
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAddTime?.(incident.id)}>
                <Clock className="w-4 h-4 mr-1" />
                Add Time
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUploadAffidavit?.(incident.id)}>
                <Paperclip className="w-4 h-4 mr-1" />
                Upload Affidavit
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
