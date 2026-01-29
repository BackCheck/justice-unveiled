import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { EvidenceUploader } from "@/components/evidence/EvidenceUploader";
import { EvidenceFileList } from "@/components/evidence/EvidenceFileList";
import { Upload } from "lucide-react";

const UploadsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <PlatformLayout>
      {/* Sub-header */}
      <div className="bg-secondary border-b border-border py-8 px-4">
        <div className="max-w-5xl mx-auto">
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
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <EvidenceUploader onUploadComplete={() => setRefreshTrigger(t => t + 1)} />
        <EvidenceFileList refreshTrigger={refreshTrigger} />
      </main>
    </PlatformLayout>
  );
};

export default UploadsPage;
