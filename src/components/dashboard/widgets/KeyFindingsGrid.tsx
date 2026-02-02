import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, ChevronRight } from "lucide-react";
import { keyFindings, severityColors, findingCategoryColors } from "@/data/keyFindingsData";

export const KeyFindingsGrid = () => {
  const displayFindings = keyFindings.slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Key Intelligence Findings
        </h2>
        <Link to="/evidence">
          <Button variant="outline" size="sm" className="gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayFindings.map((finding, index) => {
          const Icon = finding.icon;
          return (
            <Card 
              key={finding.id} 
              className="glass-card card-hover opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2 rounded-lg ${findingCategoryColors[finding.category]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge className={`${severityColors[finding.severity]} text-[10px]`} variant="secondary">
                    {finding.severity.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-sm mt-2 line-clamp-2">{finding.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{finding.summary}</p>
                <ul className="space-y-1">
                  {finding.details.slice(0, 2).map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span className="line-clamp-1">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
