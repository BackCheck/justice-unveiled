import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ROLE_TAG_CATEGORIES, 
  ROLE_TAG_LABELS,
  useUpdateEntityProfile 
} from "@/hooks/useEntityProfiles";
import { 
  Tags, Plus, X, Check, ChevronDown, Loader2,
  Search, Shield, Briefcase, Scale, Users, Building2, CircleDollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface RoleTagsEditorProps {
  entityId: string;
  currentTags: string[];
  canEdit?: boolean;
}

const categoryConfig: Record<string, { icon: typeof Users; color: string; bgColor: string }> = {
  investigative: { icon: Search, color: "text-blue-600", bgColor: "bg-blue-500/10" },
  judicial: { icon: Scale, color: "text-purple-600", bgColor: "bg-purple-500/10" },
  complainant: { icon: Shield, color: "text-green-600", bgColor: "bg-green-500/10" },
  accused: { icon: Users, color: "text-red-600", bgColor: "bg-red-500/10" },
  official: { icon: Briefcase, color: "text-cyan-600", bgColor: "bg-cyan-500/10" },
  corporate: { icon: Building2, color: "text-indigo-600", bgColor: "bg-indigo-500/10" },
  beneficiary: { icon: CircleDollarSign, color: "text-amber-600", bgColor: "bg-amber-500/10" },
  facilitator: { icon: Users, color: "text-orange-600", bgColor: "bg-orange-500/10" },
};

export const RoleTagsEditor = ({ entityId, currentTags, canEdit = false }: RoleTagsEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const updateProfile = useUpdateEntityProfile();

  const handleToggleTag = async (tag: string) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    await updateProfile.mutateAsync({
      entityId,
      updates: { role_tags: newTags }
    });
  };

  const getCategoryForTag = (tag: string): string => {
    for (const [category, tags] of Object.entries(ROLE_TAG_CATEGORIES)) {
      if ((tags as readonly string[]).includes(tag)) {
        return category;
      }
    }
    return "other";
  };

  const filteredCategories = Object.entries(ROLE_TAG_CATEGORIES).reduce((acc, [category, tags]) => {
    const filteredTags = tags.filter(tag => 
      ROLE_TAG_LABELS[tag].toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredTags.length > 0) {
      acc[category] = filteredTags;
    }
    return acc;
  }, {} as Record<string, readonly string[]>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-primary" />
            Role Tags
          </span>
          {canEdit && (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <div className="p-2 border-b border-border">
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-2 space-y-3">
                    {Object.entries(filteredCategories).map(([category, tags]) => {
                      const config = categoryConfig[category] || categoryConfig.facilitator;
                      const Icon = config.icon;
                      
                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-1.5 px-1">
                            <Icon className={cn("w-3.5 h-3.5", config.color)} />
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {category}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => {
                              const isSelected = currentTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  onClick={() => handleToggleTag(tag)}
                                  disabled={updateProfile.isPending}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-colors",
                                    isSelected
                                      ? cn(config.bgColor, config.color, "ring-1 ring-current")
                                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                  )}
                                >
                                  {isSelected && <Check className="w-3 h-3" />}
                                  {ROLE_TAG_LABELS[tag]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentTags.length === 0 ? (
          <div className="text-center py-4">
            <Tags className="w-6 h-6 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No roles assigned</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {currentTags.map((tag) => {
              const category = getCategoryForTag(tag);
              const config = categoryConfig[category] || categoryConfig.facilitator;
              
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "text-xs gap-1",
                    config.bgColor,
                    config.color,
                    "border-current/20"
                  )}
                >
                  {ROLE_TAG_LABELS[tag] || tag}
                  {canEdit && (
                    <button
                      onClick={() => handleToggleTag(tag)}
                      disabled={updateProfile.isPending}
                      className="ml-0.5 hover:bg-current/10 rounded-full p-0.5"
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
