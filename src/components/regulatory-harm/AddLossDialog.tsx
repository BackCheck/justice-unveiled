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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lossCategoryConfig } from "@/types/regulatory-harm";
import type { LossCategory } from "@/types/regulatory-harm";

interface AddLossDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: string;
  onSubmit: (data: {
    incident_id: string;
    loss_category: LossCategory;
    description: string;
    amount: number;
    currency: string;
    time_spent_hours: number;
    hourly_rate: number;
    start_date: string | null;
    end_date: string | null;
    is_recurring: boolean;
    recurring_frequency: string | null;
    is_estimated: boolean;
  }) => Promise<void>;
}

export const AddLossDialog = ({ open, onOpenChange, incidentId, onSubmit }: AddLossDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loss_category: 'lost_revenue' as LossCategory,
    description: '',
    amount: 0,
    currency: 'PKR',
    time_spent_hours: 0,
    hourly_rate: 0,
    start_date: '',
    end_date: '',
    is_recurring: false,
    recurring_frequency: 'monthly',
    is_estimated: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    setLoading(true);
    await onSubmit({
      incident_id: incidentId,
      ...formData,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null
    });
    setLoading(false);
    onOpenChange(false);
    setFormData({
      loss_category: 'lost_revenue',
      description: '',
      amount: 0,
      currency: 'PKR',
      time_spent_hours: 0,
      hourly_rate: 0,
      start_date: '',
      end_date: '',
      is_recurring: false,
      recurring_frequency: 'monthly',
      is_estimated: true
    });
  };

  // Calculate time-based amount
  const timeBasedAmount = formData.time_spent_hours * formData.hourly_rate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Financial Loss</DialogTitle>
          <DialogDescription>
            Record a financial loss associated with this incident
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loss_category">Loss Category *</Label>
            <Select 
              value={formData.loss_category} 
              onValueChange={(v: LossCategory) => setFormData({ ...formData, loss_category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(lossCategoryConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the financial loss..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (PKR) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                placeholder="0"
                required
              />
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_estimated"
                  checked={formData.is_estimated}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_estimated: !!checked })}
                />
                <Label htmlFor="is_estimated" className="text-sm">Estimated amount</Label>
              </div>
            </div>
          </div>

          {/* Time-based calculation */}
          <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
            <h4 className="text-sm font-medium">Time-Based Calculation (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_spent_hours">Hours Spent</Label>
                <Input
                  id="time_spent_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.time_spent_hours || ''}
                  onChange={(e) => setFormData({ ...formData, time_spent_hours: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (PKR)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  value={formData.hourly_rate || ''}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            {timeBasedAmount > 0 && (
              <p className="text-sm text-muted-foreground">
                Time-based cost: <span className="font-semibold text-foreground">PKR {timeBasedAmount.toLocaleString()}</span>
              </p>
            )}
          </div>

          {/* Period tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: !!checked })}
              />
              <Label htmlFor="is_recurring" className="text-sm">Recurring loss</Label>
            </div>
            {formData.is_recurring && (
              <Select 
                value={formData.recurring_frequency} 
                onValueChange={(v) => setFormData({ ...formData, recurring_frequency: v })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.description.trim() || formData.amount <= 0}>
              {loading ? 'Saving...' : 'Add Loss'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
