import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Eye, 
  Plus, 
  Pencil, 
  Trash2, 
  Clock,
  User,
  Database,
  Filter
} from "lucide-react";
import { useAuditLogs, AuditLog } from "@/hooks/useAuditLogs";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const ACTION_COLORS = {
  INSERT: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  UPDATE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  DELETE: "bg-destructive/10 text-destructive border-destructive/20",
};

const ACTION_ICONS = {
  INSERT: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
};

const TABLE_LABELS: Record<string, string> = {
  cases: "Cases",
  evidence_uploads: "Evidence Uploads",
  extracted_events: "Timeline Events",
  extracted_entities: "Entities",
  extracted_discrepancies: "Discrepancies",
  user_roles: "User Roles",
};

interface AuditLogDetailProps {
  log: AuditLog;
}

const AuditLogDetail = ({ log }: AuditLogDetailProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
          <p className="text-sm">{format(new Date(log.created_at), "PPpp")}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">User</p>
          <p className="text-sm">{log.user_email || "System"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Action</p>
          <Badge variant="outline" className={ACTION_COLORS[log.action]}>
            {log.action}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Table</p>
          <p className="text-sm">{TABLE_LABELS[log.table_name] || log.table_name}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-muted-foreground">Record ID</p>
          <p className="text-sm font-mono">{log.record_id || "N/A"}</p>
        </div>
      </div>

      {log.old_data && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Previous Data</p>
          <ScrollArea className="h-48 rounded-md border bg-muted/50 p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(log.old_data, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      )}

      {log.new_data && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">New Data</p>
          <ScrollArea className="h-48 rounded-md border bg-muted/50 p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(log.new_data, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export const AuditLogViewer = () => {
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const { data: logs, isLoading, error } = useAuditLogs({
    tableName: tableFilter !== "all" ? tableFilter : undefined,
    action: actionFilter !== "all" ? (actionFilter as "INSERT" | "UPDATE" | "DELETE") : undefined,
    limit: 200,
  });

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load audit logs. You may not have permission to view them.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Audit Trail
          <Badge variant="secondary" className="ml-2">
            Immutable
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Time-stamped, non-editable logs of all user actions for regulatory compliance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-[180px]">
              <Database className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Tables" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              <SelectItem value="cases">Cases</SelectItem>
              <SelectItem value="evidence_uploads">Evidence Uploads</SelectItem>
              <SelectItem value="extracted_events">Timeline Events</SelectItem>
              <SelectItem value="extracted_entities">Entities</SelectItem>
              <SelectItem value="extracted_discrepancies">Discrepancies</SelectItem>
              <SelectItem value="user_roles">User Roles</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="INSERT">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timestamp
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log) => {
                  const ActionIcon = ACTION_ICONS[log.action];
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.user_email || (
                          <span className="text-muted-foreground italic">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ACTION_COLORS[log.action]}>
                          <ActionIcon className="w-3 h-3 mr-1" />
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {TABLE_LABELS[log.table_name] || log.table_name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Audit Log Details
                              </DialogTitle>
                            </DialogHeader>
                            <AuditLogDetail log={log} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No audit logs found. Actions will be logged as users interact with the platform.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Showing up to 200 most recent logs • Logs are immutable and cannot be modified or deleted
        </p>
      </CardContent>
    </Card>
  );
};
