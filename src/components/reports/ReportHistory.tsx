import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Layers } from "lucide-react";
import { format } from "date-fns";

export const ReportHistory = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["generated-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("generated_reports")
        .select("*, cases(title, case_number)")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-2">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading reports…</p>
        </div>
      </div>
    );
  }

  if (!reports?.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-2 max-w-sm">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-semibold">No Reports Generated Yet</h3>
          <p className="text-sm text-muted-foreground">
            Use the AI Reports tab to generate your first report from smart suggestions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{reports.length} reports generated</p>
      <div className="grid gap-3">
        {reports.map((r: any) => (
          <Card key={r.id} className="glass-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate">{r.title}</h4>
                    {r.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {r.cases && (
                        <Badge variant="outline" className="text-[10px]">
                          {(r.cases as any).case_number}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">{r.report_type}</Badge>
                      {r.sections_count > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Layers className="w-3 h-3" /> {r.sections_count} sections
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(r.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
