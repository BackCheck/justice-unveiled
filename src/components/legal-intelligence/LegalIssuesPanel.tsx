import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus, CheckCircle, Sparkles, AlertCircle, Scale, FileText } from "lucide-react";
import { useLegalIssues, useAddLegalIssue, useUpdateLegalIssue } from "@/hooks/useLegalIntelligence";
import type { LegalIssue } from "@/types/legal-intelligence";

interface LegalIssuesPanelProps {
  caseId: string;
}

export const LegalIssuesPanel = ({ caseId }: LegalIssuesPanelProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    issue_title: "",
    issue_description: "",
    issue_type: "procedural" as LegalIssue["issue_type"],
    severity: "medium",
  });

  const { data: issues, isLoading } = useLegalIssues(caseId);
  const addIssue = useAddLegalIssue();
  const updateIssue = useUpdateLegalIssue();

  const openIssues = issues?.filter((i) => !i.is_resolved) || [];
  const resolvedIssues = issues?.filter((i) => i.is_resolved) || [];

  const handleAddIssue = () => {
    if (!newIssue.issue_title.trim()) return;
    
    addIssue.mutate(
      {
        case_id: caseId,
        ...newIssue,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewIssue({
            issue_title: "",
            issue_description: "",
            issue_type: "procedural",
            severity: "medium",
          });
        },
      }
    );
  };

  const handleResolve = (issue: LegalIssue) => {
    updateIssue.mutate({
      id: issue.id,
      caseId,
      updates: { is_resolved: true },
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "procedural":
        return <AlertTriangle className="h-4 w-4" />;
      case "constitutional":
        return <Scale className="h-4 w-4" />;
      case "evidential":
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "procedural":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "constitutional":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "evidential":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "substantive":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-500";
      case "medium":
        return "bg-amber-500/10 text-amber-500";
      case "low":
        return "bg-green-500/10 text-green-500";
      default:
        return "";
    }
  };

  const IssueCard = ({ issue, showResolve = true }: { issue: LegalIssue; showResolve?: boolean }) => (
    <div className="p-3 rounded-lg border border-border/50 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium">{issue.issue_title}</p>
            {issue.ai_generated && (
              <Badge className="bg-primary/10 text-primary border-primary/20 h-5">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={`${getTypeColor(issue.issue_type)} text-xs`}>
              {getTypeIcon(issue.issue_type)}
              <span className="ml-1 capitalize">{issue.issue_type}</span>
            </Badge>
            <Badge className={`${getSeverityColor(issue.severity)} text-xs`}>
              {issue.severity}
            </Badge>
          </div>
        </div>
        {showResolve && !issue.is_resolved && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResolve(issue)}
            disabled={updateIssue.isPending}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolve
          </Button>
        )}
      </div>
      {issue.issue_description && (
        <p className="text-xs text-muted-foreground">{issue.issue_description}</p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Legal Issues
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Legal Issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Issue Title</Label>
                  <Input
                    placeholder="e.g., FIR Registration Delay"
                    value={newIssue.issue_title}
                    onChange={(e) => setNewIssue({ ...newIssue, issue_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the legal issue..."
                    value={newIssue.issue_description}
                    onChange={(e) => setNewIssue({ ...newIssue, issue_description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Type</Label>
                    <Select
                      value={newIssue.issue_type}
                      onValueChange={(v) => setNewIssue({ ...newIssue, issue_type: v as LegalIssue["issue_type"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="procedural">Procedural</SelectItem>
                        <SelectItem value="substantive">Substantive</SelectItem>
                        <SelectItem value="constitutional">Constitutional</SelectItem>
                        <SelectItem value="evidential">Evidential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={newIssue.severity}
                      onValueChange={(v) => setNewIssue({ ...newIssue, severity: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddIssue} disabled={addIssue.isPending} className="w-full">
                  Add Issue
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading issues...</p>
        ) : (
          <div className="space-y-4">
            {openIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-500">Open Issues ({openIssues.length})</h4>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {openIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            {resolvedIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-500">Resolved ({resolvedIssues.length})</h4>
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-2 opacity-70">
                    {resolvedIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} showResolve={false} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            {issues?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No legal issues identified yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
