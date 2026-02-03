import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronDown, 
  ChevronRight,
  FileSearch,
  Users,
  Link,
  Clock,
  Shield,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CircleDashed
} from "lucide-react";
import type { 
  ProceduralRequirement, 
  ComplianceCheck, 
  ComplianceStatus,
  RequirementCategory 
} from "@/types/compliance";
import { categoryConfig, statusConfig, frameworkConfig, severityConfig } from "@/types/compliance";
import { cn } from "@/lib/utils";

interface ComplianceChecklistProps {
  requirements: ProceduralRequirement[];
  checks: ComplianceCheck[];
  onUpdateStatus: (checkId: string, status: ComplianceStatus, details?: any) => Promise<boolean>;
  onInitialize: () => Promise<void>;
  loading?: boolean;
}

const categoryIcons: Record<RequirementCategory, React.ElementType> = {
  search_warrant: FileSearch,
  witness_protocol: Users,
  chain_of_custody: Link,
  timeline_compliance: Clock,
  constitutional: Shield
};

const statusIcons: Record<ComplianceStatus, React.ElementType> = {
  compliant: CheckCircle,
  violated: XCircle,
  pending: CircleDashed,
  partial: AlertTriangle,
  not_applicable: CircleDashed
};

export const ComplianceChecklist = ({ 
  requirements, 
  checks, 
  onUpdateStatus,
  onInitialize,
  loading 
}: ComplianceChecklistProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['search_warrant', 'witness_protocol']));
  const [editingCheck, setEditingCheck] = useState<string | null>(null);
  const [violationDetails, setViolationDetails] = useState<string>('');

  // Group requirements by category
  const groupedRequirements = requirements.reduce((acc, req) => {
    const cat = req.requirement_category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(req);
    return acc;
  }, {} as Record<string, ProceduralRequirement[]>);

  // Map checks by requirement ID
  const checksByReq = new Map(checks.map(c => [c.requirement_id, c]));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleStatusChange = async (check: ComplianceCheck, newStatus: ComplianceStatus) => {
    if (newStatus === 'violated') {
      setEditingCheck(check.id);
    } else {
      await onUpdateStatus(check.id, newStatus);
    }
  };

  const confirmViolation = async (checkId: string) => {
    await onUpdateStatus(checkId, 'violated', { 
      violation_details: violationDetails,
      manual_override: true 
    });
    setEditingCheck(null);
    setViolationDetails('');
  };

  if (requirements.length === 0 && !loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Compliance Checks</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Initialize compliance checks for this case to begin the procedural audit
          </p>
          <Button onClick={onInitialize}>
            Initialize Checklist
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedRequirements).map(([category, reqs]) => {
        const CategoryIcon = categoryIcons[category as RequirementCategory] || Shield;
        const config = categoryConfig[category as RequirementCategory];
        const isExpanded = expandedCategories.has(category);
        
        // Calculate category stats
        const categoryChecks = reqs.map(r => checksByReq.get(r.id)).filter(Boolean);
        const violated = categoryChecks.filter(c => c?.status === 'violated').length;
        const compliant = categoryChecks.filter(c => c?.status === 'compliant').length;

        return (
          <Collapsible 
            key={category} 
            open={isExpanded}
            onOpenChange={() => toggleCategory(category)}
          >
            <Card className={cn(
              "transition-all duration-200",
              violated > 0 && "border-destructive/30"
            )}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <CategoryIcon className={cn("w-5 h-5", config?.color || 'text-primary')} />
                      <CardTitle className="text-base">{config?.label || category}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {violated > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          {violated}
                        </Badge>
                      )}
                      {compliant > 0 && (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {compliant}
                        </Badge>
                      )}
                      <Badge variant="secondary">{reqs.length} items</Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {reqs.map((req) => {
                      const check = checksByReq.get(req.id);
                      const status = check?.status || 'pending';
                      const StatusIcon = statusIcons[status];
                      const statusCfg = statusConfig[status];
                      const frameworkCfg = frameworkConfig[req.legal_framework];
                      const severityCfg = severityConfig[req.severity_if_violated];

                      return (
                        <div 
                          key={req.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            status === 'violated' && "bg-destructive/5 border-destructive/30",
                            status === 'compliant' && "bg-emerald-500/5 border-emerald-500/30",
                            status === 'pending' && "bg-muted/30"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Status Toggle */}
                            <div className="pt-0.5">
                              <Checkbox 
                                checked={status === 'compliant'}
                                onCheckedChange={(checked) => {
                                  if (check) {
                                    handleStatusChange(check, checked ? 'compliant' : 'pending');
                                  }
                                }}
                                disabled={!check}
                              />
                            </div>

                            {/* Requirement Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-medium text-sm">{req.requirement_name}</span>
                                <Badge variant="outline" className={cn("text-xs", frameworkCfg.color)}>
                                  {frameworkCfg.label}
                                </Badge>
                                {req.is_mandatory && (
                                  <Badge variant="outline" className={cn("text-xs", severityCfg.bgColor, severityCfg.color)}>
                                    {severityCfg.label} if violated
                                  </Badge>
                                )}
                                {check?.ai_detected && (
                                  <Badge variant="secondary" className="text-xs gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    AI Detected ({Math.round((check.ai_confidence || 0) * 100)}%)
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {req.requirement_description}
                              </p>
                              
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                                  {req.legal_reference}
                                </span>
                                {req.statutory_timeline && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {req.statutory_timeline}
                                  </span>
                                )}
                              </div>

                              {/* Violation Details Input */}
                              {editingCheck === check?.id && (
                                <div className="mt-3 space-y-2">
                                  <Textarea
                                    placeholder="Describe what actually happened vs. what should have happened..."
                                    value={violationDetails}
                                    onChange={(e) => setViolationDetails(e.target.value)}
                                    className="min-h-[80px]"
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => confirmViolation(check.id)}
                                    >
                                      Confirm Violation
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setEditingCheck(null);
                                        setViolationDetails('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Show violation details if already violated */}
                              {status === 'violated' && check?.violation_details && editingCheck !== check.id && (
                                <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                                  <p className="text-xs text-destructive">{check.violation_details}</p>
                                </div>
                              )}
                            </div>

                            {/* Status Selector */}
                            {check && editingCheck !== check.id && (
                              <Select
                                value={status}
                                onValueChange={(value) => handleStatusChange(check, value as ComplianceStatus)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue>
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className={cn("w-3.5 h-3.5", statusCfg.color)} />
                                      <span className={statusCfg.color}>{statusCfg.label}</span>
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([key, cfg]) => {
                                    const Icon = statusIcons[key as ComplianceStatus];
                                    return (
                                      <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                          <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                                          <span>{cfg.label}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};
