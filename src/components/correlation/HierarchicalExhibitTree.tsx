import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronDown, 
  Scale, 
  FileText, 
  Folder,
  FolderOpen,
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { 
  LegalClaim, 
  ClaimEvidenceLink,
  LegalFramework,
} from "@/types/correlation";

interface HierarchicalExhibitTreeProps {
  claims: LegalClaim[];
  links: ClaimEvidenceLink[];
  evidenceFiles?: { id: string; file_name: string }[];
}

interface TreeNode {
  type: "section" | "claim" | "exhibit";
  id: string;
  label: string;
  children?: TreeNode[];
  data?: any;
}

export const HierarchicalExhibitTree = ({
  claims,
  links,
  evidenceFiles = [],
}: HierarchicalExhibitTreeProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedFramework, setSelectedFramework] = useState<LegalFramework | "all">("all");

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Build hierarchical tree: Legal Section → Claims → Exhibits
  const tree = useMemo(() => {
    const filteredClaims = selectedFramework === "all" 
      ? claims 
      : claims.filter((c) => c.legal_framework === selectedFramework);

    // Group by legal section
    const sectionMap = new Map<string, LegalClaim[]>();
    filteredClaims.forEach((claim) => {
      const key = `${claim.legal_section}|${claim.legal_framework}`;
      if (!sectionMap.has(key)) {
        sectionMap.set(key, []);
      }
      sectionMap.get(key)!.push(claim);
    });

    // Build tree structure
    const nodes: TreeNode[] = [];
    sectionMap.forEach((sectionClaims, key) => {
      const [section, framework] = key.split("|");
      const sectionNode: TreeNode = {
        type: "section",
        id: key,
        label: section,
        data: { framework },
        children: sectionClaims.map((claim) => {
          const claimLinks = links.filter((l) => l.claim_id === claim.id);
          const exhibits = claimLinks.filter((l) => l.exhibit_number);
          
          return {
            type: "claim" as const,
            id: claim.id,
            label: claim.allegation_text.slice(0, 80) + (claim.allegation_text.length > 80 ? "..." : ""),
            data: claim,
            children: exhibits.map((link) => ({
              type: "exhibit" as const,
              id: link.id,
              label: link.exhibit_number || "Exhibit",
              data: {
                ...link,
                fileName: evidenceFiles.find((f) => f.id === link.evidence_upload_id)?.file_name,
              },
            })),
          };
        }),
      };
      nodes.push(sectionNode);
    });

    return nodes.sort((a, b) => a.label.localeCompare(b.label));
  }, [claims, links, evidenceFiles, selectedFramework]);

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = level * 20;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 hover:bg-muted/50 cursor-pointer rounded transition-colors",
            level === 0 && "bg-muted/30 font-medium"
          )}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {/* Expand/collapse icon */}
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )
          ) : (
            <div className="w-4" />
          )}

          {/* Node icon */}
          {node.type === "section" && (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500 shrink-0" />
            )
          )}
          {node.type === "claim" && (
            <Scale className="w-4 h-4 text-primary shrink-0" />
          )}
          {node.type === "exhibit" && (
            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
          )}

          {/* Label */}
          <span className={cn(
            "flex-1 text-sm truncate",
            node.type === "exhibit" && "text-muted-foreground"
          )}>
            {node.label}
          </span>

          {/* Badges */}
          {node.type === "section" && (
            <Badge variant="secondary" className="text-xs">
              {node.children?.length || 0} claims
            </Badge>
          )}
          {node.type === "section" && node.data?.framework && (
            <Badge variant="outline" className="text-xs">
              {node.data.framework === "pakistani" ? "🇵🇰" : "🌍"}
            </Badge>
          )}
          {node.type === "claim" && node.data?.status && (
            <Badge 
              className={cn(
                "text-xs text-white",
                node.data.status === "supported" && "bg-emerald-500",
                node.data.status === "unsupported" && "bg-red-500",
                node.data.status === "partially_supported" && "bg-amber-500",
                node.data.status === "unverified" && "bg-slate-500"
              )}
            >
              {node.data.support_score}%
            </Badge>
          )}
          {node.type === "exhibit" && node.data?.fileName && (
            <span className="text-xs text-muted-foreground">
              {node.data.fileName}
            </span>
          )}
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Hierarchical Exhibit Structure
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedFramework === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFramework("all")}
            >
              All
            </Button>
            <Button
              variant={selectedFramework === "pakistani" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFramework("pakistani")}
            >
              🇵🇰 Pakistani
            </Button>
            <Button
              variant={selectedFramework === "international" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFramework("international")}
            >
              🌍 International
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tree.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No claims documented yet</p>
            <p className="text-sm">Add claims to build the exhibit hierarchy</p>
          </div>
        ) : (
          <div className="border rounded-lg divide-y max-h-[500px] overflow-auto">
            {tree.map((node) => renderNode(node))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
