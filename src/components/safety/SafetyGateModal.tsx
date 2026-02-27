/**
 * Safety Gate Modal — Shows reputation/defamation risk signals, rewrites, and blockers.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldAlert, ShieldCheck, AlertTriangle, XCircle, Eye, ArrowRight } from "lucide-react";
import type { SafetyGateResult } from "@/types/safety";
import { useUserRole } from "@/hooks/useUserRole";

interface SafetyGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SafetyGateResult;
  onProceed: () => void;
  onCancel: () => void;
}

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-green-100 text-green-800 border-green-300",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
};

export const SafetyGateModal = ({ open, onOpenChange, result, onProceed, onCancel }: SafetyGateModalProps) => {
  const { isAdmin } = useUserRole();
  const hasBlockers = result.blockers.length > 0;
  const canProceed = !hasBlockers || isAdmin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            Reputation & Defamation Safety Gate
          </DialogTitle>
          <DialogDescription>
            Pre-export safety analysis for court-safe compliance.
          </DialogDescription>
        </DialogHeader>

        {/* Overall Risk Badge */}
        <div className="flex items-center gap-3">
          <Badge className={`text-sm px-3 py-1 ${RISK_COLORS[result.decision.overall]}`}>
            {result.decision.overall} RISK
          </Badge>
          <span className="text-xs text-muted-foreground">
            {result.signals.length} signal{result.signals.length !== 1 ? 's' : ''} · {result.rewritePlan.transformations.length} rewrite{result.rewritePlan.transformations.length !== 1 ? 's' : ''} · {result.mode.replace('_', ' ')}
          </span>
        </div>

        {/* Blockers */}
        {hasBlockers && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-destructive uppercase tracking-wider">Blockers</p>
            {result.blockers.map((b, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-xs">
                <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{b.message}</p>
                  {b.action && <p className="text-muted-foreground mt-0.5">{b.action}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Warnings</p>
            {result.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p>{w.message}</p>
              </div>
            ))}
          </div>
        )}

        <Accordion type="multiple" className="w-full">
          {/* Signals Table */}
          {result.signals.length > 0 && (
            <AccordionItem value="signals">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Risk Signals ({result.signals.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-1.5">Category</th>
                        <th className="text-left p-1.5">Level</th>
                        <th className="text-left p-1.5">Snippet</th>
                        <th className="text-left p-1.5">Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.signals.slice(0, 20).map((s, i) => (
                        <tr key={i} className="border-b border-muted/30">
                          <td className="p-1.5 font-mono text-[10px]">{s.category.replace(/_/g, ' ')}</td>
                          <td className="p-1.5">
                            <Badge variant="outline" className={`text-[10px] ${RISK_COLORS[s.level]}`}>{s.level}</Badge>
                          </td>
                          <td className="p-1.5 max-w-[200px] truncate">{s.text.slice(0, 60)}…</td>
                          <td className="p-1.5 text-[10px]">{s.targets.slice(0, 2).join(', ') || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Applied Rewrites */}
          {result.rewritePlan.transformations.length > 0 && (
            <AccordionItem value="rewrites">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Applied Rewrites ({result.rewritePlan.transformations.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {result.rewritePlan.transformations.slice(0, 15).map((t, i) => (
                    <div key={i} className="p-2 rounded border bg-muted/30 text-xs">
                      <p className="text-muted-foreground mb-1">{t.reason} <span className="font-mono text-[10px]">({t.ruleId})</span></p>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-destructive/70">{t.from.slice(0, 60)}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span className="text-green-700 dark:text-green-400">{t.to.slice(0, 60)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          {canProceed ? (
            <Button onClick={onProceed} variant={hasBlockers ? "destructive" : "default"}>
              {hasBlockers ? (
                <>
                  <ShieldAlert className="w-4 h-4 mr-1.5" />
                  Override & Proceed (Admin)
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Proceed with Safety Rewrites
                </>
              )}
            </Button>
          ) : (
            <Button disabled variant="destructive">
              Admin Override Required
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
