import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { OsintCommandCard } from "./OsintCommandCard";
import type { OsintCategory } from "@/data/osintCommandsData";

interface Props {
  category: OsintCategory & {
    subcategories: Array<{
      name: string;
      icon: string;
      commands: Array<any>;
    }>;
  };
}

export function OsintCategorySection({ category }: Props) {
  const totalCount = category.subcategories.reduce((s, sub) => s + sub.commands.length, 0);

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-card">
      {/* Category header — terminal style */}
      <div className="px-4 py-3 border-b border-border/30 bg-foreground flex items-center gap-3">
        <span className="text-lg">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-mono font-bold text-primary-foreground tracking-wide">
            {category.name.toUpperCase()}
          </h2>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-[10px] h-5">
          {totalCount} cmd
        </Badge>
      </div>

      <Accordion type="multiple" className="w-full">
        {category.subcategories.map((sub, si) => (
          <AccordionItem key={si} value={`${category.id}-${si}`} className="border-border/20">
            <AccordionTrigger className="px-4 py-2.5 text-sm hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-xs font-medium">{sub.icon} {sub.name}</span>
                <Badge variant="outline" className="text-[10px] h-4 ml-1 font-mono border-border/50">
                  {sub.commands.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {sub.commands.map((cmd) => (
                  <OsintCommandCard key={cmd.id} cmd={cmd} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
