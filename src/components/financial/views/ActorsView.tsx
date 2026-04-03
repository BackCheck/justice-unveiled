import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { UserX } from "lucide-react";
import type { FinancialActor, FinancialFinding } from "@/hooks/useFinancialAbuse";

interface Props {
  actors: FinancialActor[];
  findings: FinancialFinding[];
}

export const ActorsView = ({ actors, findings }: Props) => {
  if (actors.length === 0) {
    return <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-sm">No actors identified yet.</div>;
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {actors.map(actor => {
        const actorFindings = findings.filter(f => f.actor_names?.includes(actor.actor_name));
        const riskClass = actor.risk_score >= 80 ? "border-destructive/50" : actor.risk_score >= 60 ? "border-orange-500/50" : "border-border";
        
        return (
          <Card key={actor.id} className={`border-l-4 ${riskClass}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <UserX className="w-5 h-5 text-destructive" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{actor.actor_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {actor.role_description || "Role unspecified"}
                  </p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${actor.risk_score >= 80 ? "border-destructive text-destructive" : ""}`}>
                  {actor.risk_score >= 80 ? "CRITICAL" : actor.risk_score >= 60 ? "HIGH" : "MEDIUM"}
                </Badge>
              </div>
              
              <Progress value={actor.risk_score} className="h-1.5 mb-3" />
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-bold text-sm">{actor.risk_score}%</p>
                  <p className="text-muted-foreground">Risk</p>
                </div>
                <div>
                  <p className="font-bold text-sm">{actorFindings.length}</p>
                  <p className="text-muted-foreground">Findings</p>
                </div>
                <div>
                  <p className="font-bold text-sm">{actor.transaction_count}</p>
                  <p className="text-muted-foreground">Txns</p>
                </div>
              </div>

              {actor.total_amount > 0 && (
                <>
                  <Separator className="my-3" />
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-sm font-bold">PKR {actor.total_amount.toLocaleString()}</p>
                </>
              )}

              {actor.pattern_types?.length ? (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {actor.pattern_types.map((p, i) => <Badge key={i} variant="secondary" className="text-[10px]">{p}</Badge>)}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
