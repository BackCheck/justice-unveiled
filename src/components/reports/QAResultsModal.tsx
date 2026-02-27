/**
 * QA Results Modal — shown before report generation when QA issues exist.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle, AlertCircle, ShieldAlert } from "lucide-react";
import type { QAResult, ReportQAError } from "@/lib/reportQA";
import { useUserRole } from "@/hooks/useUserRole";

interface QAResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qaResult: QAResult;
  onProceedAnyway: () => void;
  onCancel: () => void;
}

export const QAResultsModal = ({ open, onOpenChange, qaResult, onProceedAnyway, onCancel }: QAResultsModalProps) => {
  const { isAdmin } = useUserRole();
  const criticalCount = qaResult.errors.length;
  const warningCount = qaResult.warnings.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            Report QA Results
          </DialogTitle>
          <DialogDescription>
            Pre-generation quality checks found issues that may affect report accuracy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 my-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="w-3 h-3" /> {criticalCount} Critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
              <AlertTriangle className="w-3 h-3" /> {warningCount} Warning{warningCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-1.5">
          {/* Dedup stats summary if present */}
          {qaResult.warnings.some(w => w.code === 'ENTITY_CONSOLIDATED' || w.code === 'EVENT_DEDUPLICATED') && (
            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-2">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">📊 Data Integrity Processing</p>
              {qaResult.warnings.filter(w => w.code === 'ENTITY_CONSOLIDATED' || w.code === 'EVENT_DEDUPLICATED').map((w, i) => (
                <p key={i} className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{w.message}</p>
              ))}
            </div>
          )}
          {qaResult.warnings.some(w => w.code === 'EMOTIONAL_LANGUAGE') && (
            <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-2">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">🔒 Tone Sanitization Applied</p>
              {qaResult.warnings.filter(w => w.code === 'EMOTIONAL_LANGUAGE').map((w, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{w.message}</p>
              ))}
            </div>
          )}
          {[...qaResult.errors, ...qaResult.warnings.filter(w => !['ENTITY_CONSOLIDATED', 'EVENT_DEDUPLICATED', 'EMOTIONAL_LANGUAGE'].includes(w.code))].map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-md bg-muted/50">
              {issue.severity === 'critical' ? (
                <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-foreground">{issue.message}</p>
                {issue.details && <p className="text-muted-foreground mt-0.5">{issue.details}</p>}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          {criticalCount > 0 ? (
            <Button
              variant="destructive"
              onClick={onProceedAnyway}
              disabled={!isAdmin}
              title={!isAdmin ? "Only admins can bypass critical QA errors" : "Generate despite critical issues"}
            >
              {isAdmin ? "Generate Anyway (Unsafe)" : "Admin Required"}
            </Button>
          ) : (
            <Button onClick={onProceedAnyway}>
              Generate Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
