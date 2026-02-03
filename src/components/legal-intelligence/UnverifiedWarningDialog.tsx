import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, FileWarning } from "lucide-react";

interface UnverifiedWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UnverifiedWarningDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: UnverifiedWarningDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/10">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <AlertDialogTitle>Include Unverified Precedents?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              You are about to include <strong>unverified case law precedents</strong> in the AI-generated summary.
            </p>
            
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-start gap-2">
                <FileWarning className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 dark:text-amber-400">The generated document will:</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                    <li>Include a DRAFT watermark header</li>
                    <li>Mark unverified citations explicitly</li>
                    <li>Be unsuitable for court filing</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <p className="text-sm">
              This is intended for <strong>internal drafting purposes only</strong>. 
              Verify all precedents before using in formal proceedings.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            I Understand, Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
