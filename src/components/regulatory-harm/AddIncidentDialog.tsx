import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incidentTypeConfig, statusConfig, severityConfig } from "@/types/regulatory-harm";
import type { IncidentType, IncidentStatus, Severity, InstitutionType } from "@/types/regulatory-harm";

interface AddIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    incident_type: IncidentType;
    incident_date: string;
    institution_name: string;
    institution_type: InstitutionType;
    reference_number: string;
    status: IncidentStatus;
    severity: Severity;
  }) => Promise<void>;
}

export const AddIncidentDialog = ({ open, onOpenChange, onSubmit }: AddIncidentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_type: 'banking' as IncidentType,
    incident_date: new Date().toISOString().split('T')[0],
    institution_name: '',
    institution_type: 'bank' as InstitutionType,
    reference_number: '',
    status: 'active' as IncidentStatus,
    severity: 'medium' as Severity
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onOpenChange(false);
    setFormData({
      title: '',
      description: '',
      incident_type: 'banking',
      incident_date: new Date().toISOString().split('T')[0],
      institution_name: '',
      institution_type: 'bank',
      reference_number: '',
      status: 'active',
      severity: 'medium'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Harm Incident</DialogTitle>
          <DialogDescription>
            Document a regulatory action, banking issue, license problem, or contract termination
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Incident Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Bank Account Frozen by NBP"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident_type">Incident Type</Label>
              <Select 
                value={formData.incident_type} 
                onValueChange={(v: IncidentType) => setFormData({ ...formData, incident_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(incidentTypeConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident_date">Incident Date *</Label>
              <Input
                id="incident_date"
                type="date"
                value={formData.incident_date}
                onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution_name">Institution/Entity Name</Label>
              <Input
                id="institution_name"
                value={formData.institution_name}
                onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                placeholder="e.g., National Bank of Pakistan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution_type">Institution Type</Label>
              <Select 
                value={formData.institution_type} 
                onValueChange={(v: InstitutionType) => setFormData({ ...formData, institution_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="regulator">Regulator</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="e.g., Notice No. XYZ-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select 
                value={formData.severity} 
                onValueChange={(v: Severity) => setFormData({ ...formData, severity: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(severityConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: IncidentStatus) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what happened and the impact..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? 'Saving...' : 'Record Incident'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
