import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Wifi, HardDrive, Mail, UserX, ChevronRight } from "lucide-react";

const APT_CHAIN = [
  { icon: Shield, label: "Screen Memory Malware", detail: "Keylogger + screen capture deployed on CEO local machine", severity: "critical" },
  { icon: HardDrive, label: "Macrium Reflect Image", detail: "Full disk image captured for offline analysis & credential extraction", severity: "critical" },
  { icon: Mail, label: "Google Takeout Exfil", detail: "EMAIL_LOG_SEARCH queries on CEO legal communications via admin abuse", severity: "critical" },
  { icon: UserX, label: "Identity Hijacking", detail: "Zubair operates as sharjeel@ — domain alias impersonation", severity: "high" },
];

export const APTVectorCard = () => {
  return (
    <Card className="glass-card border-destructive/50 overflow-hidden relative">
      {/* Scanning line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-destructive/40 to-transparent animate-pulse" style={{ top: "30%" }} />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />
            APT Vector — Digital Espionage Kill Chain
          </CardTitle>
          <Badge variant="destructive" className="animate-pulse text-xs">
            ACTIVE THREAT
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {APT_CHAIN.map((step, i) => (
            <div key={i}>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-colors">
                <div className="mt-0.5 p-1.5 rounded bg-destructive/10">
                  <step.icon className="w-3.5 h-3.5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{step.label}</span>
                    <Badge variant="outline" className={`text-[10px] px-1 py-0 ${step.severity === "critical" ? "border-destructive/50 text-destructive" : "border-chart-4/50 text-chart-4"}`}>
                      {step.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{step.detail}</p>
                </div>
              </div>
              {i < APT_CHAIN.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ChevronRight className="w-3 h-3 text-destructive/40 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-destructive/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">PECA 2016 Violations</span>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[10px] border-destructive/30">S.3 Unauthorized Access</Badge>
            <Badge variant="outline" className="text-[10px] border-destructive/30">S.14 Identity Theft</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
