import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Section = { title: string; content: React.ReactNode };

export function LegalPage({
  title,
  effectiveDate,
  intro,
  sections,
  footer,
}: {
  title: string;
  effectiveDate?: string;
  intro?: React.ReactNode;
  sections: Section[];
  footer?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{title}</CardTitle>
          {effectiveDate ? (
            <p className="text-sm text-muted-foreground">Effective Date: {effectiveDate}</p>
          ) : null}
          {intro ? <p className="text-muted-foreground mt-2">{intro}</p> : null}
        </CardHeader>

        <CardContent className="space-y-6">
          {sections.map((s, idx) => (
            <div key={idx}>
              {idx === 0 ? null : <Separator />}
              <h2 className="text-lg font-semibold mt-4 mb-2">{s.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed">{s.content}</div>
            </div>
          ))}

          {footer ? (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground text-center pt-2">{footer}</p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
