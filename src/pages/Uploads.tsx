import { useState } from "react";
import { Link } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { EvidenceUploader } from "@/components/evidence/EvidenceUploader";
import { EvidenceFileList } from "@/components/evidence/EvidenceFileList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Lock, LogIn, Shield } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const UploadsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { canUpload, isAuthenticated, role, isLoading } = useUserRole();

  return (
    <PlatformLayout>
      {/* Sub-header */}
      <div className="bg-secondary border-b border-border py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-7 h-7 text-primary" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Evidence Uploads
                </h2>
                <p className="text-muted-foreground">
                  Upload MP3 commentary, PDF documents, and markdown files
                </p>
              </div>
            </div>
            {isAuthenticated && role && (
              <Badge variant="outline" className="capitalize">
                <Shield className="w-3 h-3 mr-1" />
                {role}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            </CardContent>
          </Card>
        ) : canUpload ? (
          <EvidenceUploader onUploadComplete={() => setRefreshTrigger(t => t + 1)} />
        ) : (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-5 h-5" />
                Upload Access Restricted
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated ? (
                <>
                  <p className="text-muted-foreground">
                    You need to sign in with an <strong>Editor</strong> or <strong>Admin</strong> role to upload evidence files.
                  </p>
                  <Button asChild>
                    <Link to="/auth">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In to Upload
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Your current role (<strong className="capitalize">{role}</strong>) does not have upload permissions.
                  Contact an administrator to request Editor or Admin access.
                </p>
              )}
            </CardContent>
          </Card>
        )}
        
        <EvidenceFileList refreshTrigger={refreshTrigger} />
      </main>
    </PlatformLayout>
  );
};

export default UploadsPage;
