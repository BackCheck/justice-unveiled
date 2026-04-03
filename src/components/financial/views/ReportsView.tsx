import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, FileText, Clock, Download } from "lucide-react";

export const ReportsView = () => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Investigation Report", desc: "Full forensic analysis with findings, actors, and evidence chain.", icon: FileBarChart },
          { title: "Legal Brief", desc: "Court-ready document with statutory violations and evidence mapping.", icon: FileText },
          { title: "Timeline Report", desc: "Chronological reconstruction of financial abuse events.", icon: Clock },
        ].map((r, i) => (
          <Card key={i}>
            <CardContent className="p-5 text-center">
              <r.icon className="w-10 h-10 mx-auto text-primary mb-3" />
              <h3 className="text-sm font-semibold mb-1">{r.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{r.desc}</p>
              <Button size="sm" variant="outline" className="gap-2 text-xs">
                <Download className="w-3.5 h-3.5" />Generate PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
