import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { CombinedEntity } from "@/hooks/useCombinedEntities";
import {
  Users,
  Building2,
  Shield,
  Scale,
  Expand,
  EyeOff,
  Search,
  Bookmark,
  BookmarkCheck,
  Link2,
  Copy,
  AlertTriangle,
  FileText,
  Network,
  Target,
} from "lucide-react";
import { categoryColors } from "@/data/entitiesData";
import { toast } from "sonner";

interface NodeContextMenuProps {
  entity: CombinedEntity;
  children: React.ReactNode;
  onExpand: (entity: CombinedEntity) => void;
  onHide: (entity: CombinedEntity) => void;
  onInvestigate: (entity: CombinedEntity) => void;
  onToggleWatchlist: (entity: CombinedEntity) => void;
  onShowConnections: (entity: CombinedEntity) => void;
  isOnWatchlist: boolean;
  isHidden: boolean;
}

export const NodeContextMenu = ({
  entity,
  children,
  onExpand,
  onHide,
  onInvestigate,
  onToggleWatchlist,
  onShowConnections,
  isOnWatchlist,
  isHidden,
}: NodeContextMenuProps) => {
  const getIcon = () => {
    switch (entity.type) {
      case "person": return Users;
      case "organization": return Building2;
      case "agency": return Shield;
      default: return Scale;
    }
  };

  const Icon = getIcon();

  const handleCopyName = () => {
    navigator.clipboard.writeText(entity.name);
    toast.success(`Copied "${entity.name}" to clipboard`);
  };

  const handleCopyDetails = () => {
    const details = `Name: ${entity.name}\nType: ${entity.type}\nRole: ${entity.role}\nCategory: ${entity.category}\nDescription: ${entity.description}`;
    navigator.clipboard.writeText(details);
    toast.success("Entity details copied to clipboard");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* Entity Header */}
        <div className="px-2 py-2 border-b">
          <div className="flex items-center gap-2">
            <div 
              className="p-1.5 rounded-full"
              style={{ backgroundColor: categoryColors[entity.category || "neutral"] }}
            >
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entity.name}</p>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] h-4">
                  {entity.type}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-[10px] h-4"
                  style={{ 
                    borderColor: categoryColors[entity.category || "neutral"],
                    color: categoryColors[entity.category || "neutral"]
                  }}
                >
                  {entity.category}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <ContextMenuItem onClick={() => onExpand(entity)} className="gap-2">
          <Expand className="w-4 h-4" />
          <span>Expand Connections</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onShowConnections(entity)} className="gap-2">
          <Network className="w-4 h-4" />
          <span>Show All Links</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onInvestigate(entity)} className="gap-2">
          <Search className="w-4 h-4" />
          <span>Investigate Entity</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Watchlist & Visibility */}
        <ContextMenuItem onClick={() => onToggleWatchlist(entity)} className="gap-2">
          {isOnWatchlist ? (
            <>
              <BookmarkCheck className="w-4 h-4 text-primary" />
              <span>Remove from Watchlist</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              <span>Add to Watchlist</span>
            </>
          )}
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onHide(entity)} className="gap-2">
          <EyeOff className="w-4 h-4" />
          <span>{isHidden ? "Show Entity" : "Hide from View"}</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Analysis Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Target className="w-4 h-4" />
            <span>Analysis Actions</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-52">
            <ContextMenuItem className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Flag as Suspicious</span>
            </ContextMenuItem>
            <ContextMenuItem className="gap-2">
              <Link2 className="w-4 h-4" />
              <span>Link to Evidence</span>
            </ContextMenuItem>
            <ContextMenuItem className="gap-2">
              <FileText className="w-4 h-4" />
              <span>Generate Report</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Copy Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={handleCopyName} className="gap-2">
              <span>Copy Name</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyDetails} className="gap-2">
              <span>Copy Full Details</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
};
