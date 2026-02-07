import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Users, 
  Crown, 
  Pencil, 
  Eye,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Settings,
  Video,
  ScrollText
} from "lucide-react";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { useAllUserRoles, useUpdateUserRole } from "@/hooks/useAdminRoles";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { TutorialVideoUploader } from "@/components/admin/TutorialVideoUploader";

const roleConfig: Record<AppRole, { label: string; icon: typeof Crown; color: string; description: string }> = {
  admin: {
    label: "Admin",
    icon: Crown,
    color: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
    description: "Full access to all features",
  },
  editor: {
    label: "Editor",
    icon: Pencil,
    color: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
    description: "Can upload and edit content",
  },
  analyst: {
    label: "Analyst",
    icon: Eye,
    color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    description: "View-only access",
  },
};

const AdminPanel = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { data: users, isLoading: usersLoading, error } = useAllUserRoles();
  const updateRole = useUpdateUserRole();
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    currentRole: AppRole;
    newRole: AppRole;
  } | null>(null);

  // Redirect non-admins
  if (!roleLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleRoleChange = (userId: string, userName: string, currentRole: AppRole, newRole: AppRole) => {
    if (currentRole === newRole) return;
    
    // Prevent self-demotion
    if (userId === user?.id && newRole !== "admin") {
      toast.error("You cannot demote yourself from Admin");
      return;
    }

    setConfirmDialog({
      open: true,
      userId,
      userName,
      currentRole,
      newRole,
    });
  };

  const confirmRoleChange = async () => {
    if (!confirmDialog) return;

    try {
      await updateRole.mutateAsync({
        userId: confirmDialog.userId,
        newRole: confirmDialog.newRole,
      });
      toast.success(`${confirmDialog.userName}'s role updated to ${roleConfig[confirmDialog.newRole].label}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setConfirmDialog(null);
    }
  };

  const getInitials = (name: string | null, id: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return id.slice(0, 2).toUpperCase();
  };

  return (
    <PlatformLayout>
      {/* Sub-header with glass effect */}
      <div className="bg-secondary/50 backdrop-blur-xl border-b border-border/30 py-8 px-4 relative overflow-hidden">
        {/* Background glow for header */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover-glow-primary">
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 glow-primary-sm">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Admin Panel
                </h2>
                <p className="text-muted-foreground">
                  Manage user roles and permissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Site Settings
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ScrollText className="w-4 h-4" />
              Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6 space-y-6">
            {/* Role Legend */}
            <div className="grid md:grid-cols-3 gap-4">
              {(Object.entries(roleConfig) as [AppRole, typeof roleConfig.admin][]).map(([role, config]) => {
                const Icon = config.icon;
                return (
                  <Card key={role} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{config.label}</h3>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  {users?.length || 0} registered user{users?.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading || roleLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-9 w-28" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>Failed to load users</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((userItem) => {
                        const config = roleConfig[userItem.role];
                        const Icon = config.icon;
                        const isCurrentUser = userItem.user_id === user?.id;

                        return (
                          <TableRow key={userItem.user_id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border-2 border-primary/20">
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    {getInitials(userItem.display_name, userItem.user_id)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {userItem.display_name || "Unknown User"}
                                    {isCurrentUser && (
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        You
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {userItem.user_id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${config.color} border`}>
                                <Icon className="w-3 h-3 mr-1" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(userItem.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={userItem.role}
                                onValueChange={(value: AppRole) =>
                                  handleRoleChange(
                                    userItem.user_id,
                                    userItem.display_name || "User",
                                    userItem.role,
                                    value
                                  )
                                }
                                disabled={updateRole.isPending}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Crown className="w-3 h-3" />
                                      Admin
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="editor">
                                    <div className="flex items-center gap-2">
                                      <Pencil className="w-3 h-3" />
                                      Editor
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="analyst">
                                    <div className="flex items-center gap-2">
                                      <Eye className="w-3 h-3" />
                                      Analyst
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <TutorialVideoUploader />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog?.open} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change <strong>{confirmDialog?.userName}</strong>'s role
              from <strong>{confirmDialog?.currentRole && roleConfig[confirmDialog.currentRole].label}</strong> to{" "}
              <strong>{confirmDialog?.newRole && roleConfig[confirmDialog.newRole].label}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={updateRole.isPending}>
              {updateRole.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PlatformLayout>
  );
};

export default AdminPanel;
