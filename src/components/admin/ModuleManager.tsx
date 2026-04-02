import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock, Brain, ClipboardCheck, FileWarning, Terminal,
  FileText, Network, GitBranch, AlertTriangle, UploadCloud,
  Folder, Scale, Crosshair, Globe, Search,
} from "lucide-react";
import { useModules, useToggleModule, SiteModule } from "@/hooks/useModules";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock, Brain, ClipboardCheck, FileWarning, Terminal,
  FileText, Network, GitBranch, AlertTriangle, UploadCloud,
  Folder, Scale, Crosshair, Globe, Search,
};

const ModuleManager = () => {
  const { data: modules, isLoading } = useModules();
  const toggleModule = useToggleModule();

  const handleToggle = async (mod: SiteModule) => {
    try {
      await toggleModule.mutateAsync({ id: mod.id, is_enabled: !mod.is_enabled });
      toast.success(`${mod.module_name} ${mod.is_enabled ? "disabled" : "enabled"}`);
    } catch {
      toast.error("Failed to update module");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Module Management</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable platform modules. Disabled modules will be hidden from all users across the site.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules?.map((mod) => {
          const Icon = iconMap[mod.icon_name || ""] || FileText;
          return (
            <Card
              key={mod.id}
              className={`transition-all duration-200 ${
                mod.is_enabled
                  ? "border-primary/20 bg-card"
                  : "border-border/30 bg-muted/30 opacity-70"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${mod.is_enabled ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`w-5 h-5 ${mod.is_enabled ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{mod.module_name}</CardTitle>
                    </div>
                  </div>
                  <Switch
                    checked={mod.is_enabled}
                    onCheckedChange={() => handleToggle(mod)}
                    disabled={toggleModule.isPending}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs mb-3">
                  {mod.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1">
                  {mod.routes.map((route) => (
                    <Badge key={route} variant="outline" className="text-[10px] font-mono">
                      {route}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleManager;
