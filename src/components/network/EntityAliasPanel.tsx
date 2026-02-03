import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useEntityAliases, 
  useAddEntityAlias, 
  EntityAlias 
} from "@/hooks/useEntityProfiles";
import { 
  Plus, User, CreditCard, Mail, Phone, Hash, MoreHorizontal, 
  Check, X, Shield, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityAliasPanelProps {
  entityId: string;
  entityName: string;
  canEdit?: boolean;
}

const aliasTypeConfig: Record<string, { icon: typeof User; label: string; color: string }> = {
  name: { icon: User, label: "Name/Alias", color: "text-blue-500" },
  cnic: { icon: CreditCard, label: "CNIC", color: "text-green-500" },
  email: { icon: Mail, label: "Email", color: "text-purple-500" },
  phone: { icon: Phone, label: "Phone", color: "text-orange-500" },
  employee_id: { icon: Hash, label: "Employee ID", color: "text-cyan-500" },
  other: { icon: MoreHorizontal, label: "Other", color: "text-muted-foreground" },
};

export const EntityAliasPanel = ({ entityId, entityName, canEdit = false }: EntityAliasPanelProps) => {
  const { data: aliases, isLoading } = useEntityAliases(entityId);
  const addAlias = useAddEntityAlias();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newAliasType, setNewAliasType] = useState<string>("name");
  const [newAliasValue, setNewAliasValue] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const handleAddAlias = async () => {
    if (!newAliasValue.trim()) return;

    await addAlias.mutateAsync({
      entity_id: entityId,
      alias_type: newAliasType as EntityAlias["alias_type"],
      alias_value: newAliasValue.trim(),
      is_primary: isPrimary,
      verified: false,
      source: null,
    });

    setNewAliasValue("");
    setNewAliasType("name");
    setIsPrimary(false);
    setIsAdding(false);
  };

  // Group aliases by type
  const groupedAliases = (aliases || []).reduce((acc, alias) => {
    if (!acc[alias.alias_type]) {
      acc[alias.alias_type] = [];
    }
    acc[alias.alias_type].push(alias);
    return acc;
  }, {} as Record<string, EntityAlias[]>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Identity & Aliases
          </span>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsAdding(!isAdding)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Alias Form */}
        {isAdding && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={newAliasType} onValueChange={setNewAliasType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(aliasTypeConfig).map(([key, { label }]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Value</Label>
                <Input
                  value={newAliasValue}
                  onChange={(e) => setNewAliasValue(e.target.value)}
                  placeholder="Enter alias..."
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-border"
                />
                Primary identifier
              </label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setIsAdding(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleAddAlias}
                  disabled={!newAliasValue.trim() || addAlias.isPending}
                >
                  {addAlias.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Aliases List */}
        {Object.keys(groupedAliases).length === 0 ? (
          <div className="text-center py-6">
            <Shield className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No aliases recorded</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Add names, CNICs, emails, or phone numbers
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[280px]">
            <div className="space-y-3">
              {Object.entries(groupedAliases).map(([type, typeAliases]) => {
                const config = aliasTypeConfig[type] || aliasTypeConfig.other;
                const Icon = config.icon;
                
                return (
                  <div key={type} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-3.5 h-3.5", config.color)} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {config.label}
                      </span>
                    </div>
                    <div className="pl-5 space-y-1">
                      {typeAliases.map((alias) => (
                        <div
                          key={alias.id}
                          className="flex items-center gap-2 py-1 px-2 rounded bg-muted/30 border border-border/30"
                        >
                          <span className="text-sm font-mono flex-1 truncate">
                            {alias.alias_value}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {alias.is_primary && (
                              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                Primary
                              </Badge>
                            )}
                            {alias.verified && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 border-green-500 text-green-600">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
