import { useState, useCallback } from "react";
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
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types/regulatory-harm";

interface UploadAffidavitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: string;
  onSubmit: (file: File, metadata: {
    incident_id: string;
    document_type: DocumentType;
    title: string;
    description: string;
    affidavit_date: string | null;
    notarized: boolean;
    sworn_before: string | null;
  }) => Promise<void>;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'affidavit', label: 'Affidavit' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'contract', label: 'Contract' },
  { value: 'notice', label: 'Regulatory Notice' },
  { value: 'license', label: 'License/Permit' },
  { value: 'correspondence', label: 'Correspondence' },
];

export const UploadAffidavitDialog = ({ open, onOpenChange, incidentId, onSubmit }: UploadAffidavitDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    document_type: 'affidavit' as DocumentType,
    title: '',
    description: '',
    affidavit_date: '',
    notarized: false,
    sworn_before: ''
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, "") }));
      }
    }
  }, [formData.title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: e.target.files![0].name.replace(/\.[^/.]+$/, "") }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.title.trim()) return;

    setLoading(true);
    await onSubmit(file, {
      incident_id: incidentId,
      document_type: formData.document_type,
      title: formData.title,
      description: formData.description,
      affidavit_date: formData.affidavit_date || null,
      notarized: formData.notarized,
      sworn_before: formData.sworn_before || null
    });
    setLoading(false);
    onOpenChange(false);
    setFile(null);
    setFormData({
      document_type: 'affidavit',
      title: '',
      description: '',
      affidavit_date: '',
      notarized: false,
      sworn_before: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Attach a financial affidavit, statement, or supporting document
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              dragActive && "border-primary bg-primary/5",
              file ? "border-emerald-500 bg-emerald-500/5" : "border-muted-foreground/25"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-500" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop a file, or click to browse
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button type="button" variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select File
                  </label>
                </Button>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type</Label>
              <Select 
                value={formData.document_type} 
                onValueChange={(v: DocumentType) => setFormData({ ...formData, document_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Loss Affidavit Q1 2024"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the document contents..."
              rows={2}
            />
          </div>

          {/* Affidavit-specific fields */}
          {formData.document_type === 'affidavit' && (
            <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
              <h4 className="text-sm font-medium">Affidavit Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="affidavit_date">Date Sworn</Label>
                  <Input
                    id="affidavit_date"
                    type="date"
                    value={formData.affidavit_date}
                    onChange={(e) => setFormData({ ...formData, affidavit_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sworn_before">Sworn Before</Label>
                  <Input
                    id="sworn_before"
                    value={formData.sworn_before}
                    onChange={(e) => setFormData({ ...formData, sworn_before: e.target.value })}
                    placeholder="e.g., Notary Public Name"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notarized"
                  checked={formData.notarized}
                  onCheckedChange={(checked) => setFormData({ ...formData, notarized: !!checked })}
                />
                <Label htmlFor="notarized" className="text-sm">Notarized / Attested</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file || !formData.title.trim()}>
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
