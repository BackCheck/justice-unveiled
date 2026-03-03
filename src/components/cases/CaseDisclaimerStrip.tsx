import { Shield } from "lucide-react";

export const CaseDisclaimerStrip = () => (
  <div className="bg-muted/50 border border-border/30 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
    <Shield className="w-4 h-4 shrink-0 text-primary" />
    <span>
      HRPM documents claims and sources for public-interest purposes; inclusion does not assert guilt or constitute legal advice.
      Allegations may remain subject to judicial determination.
    </span>
  </div>
);
