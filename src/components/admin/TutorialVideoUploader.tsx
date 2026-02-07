import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Video, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const TutorialVideoUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch current tutorial video URL
  const { data: currentVideoUrl, isLoading } = useQuery({
    queryKey: ["tutorial-video-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "tutorial_video_url")
        .single();

      if (error) {
        console.error("Error fetching tutorial video:", error);
        return null;
      }
      return data?.setting_value;
    },
  });

  // Mutation to update the video URL
  const updateVideoUrl = useMutation({
    mutationFn: async (url: string | null) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ 
          setting_value: url,
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq("setting_key", "tutorial_video_url");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorial-video-admin"] });
      queryClient.invalidateQueries({ queryKey: ["tutorial-video"] });
      toast.success("Tutorial video updated successfully");
    },
    onError: (error) => {
      console.error("Error updating video URL:", error);
      toast.error("Failed to update tutorial video");
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Video file must be less than 100MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `tutorial-${Date.now()}.${fileExt}`;

      // Delete old video if exists
      if (currentVideoUrl) {
        const oldPath = currentVideoUrl.split("/tutorials/")[1];
        if (oldPath) {
          await supabase.storage.from("tutorials").remove([oldPath]);
        }
      }

      // Upload new video
      const { data, error } = await supabase.storage
        .from("tutorials")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("tutorials")
        .getPublicUrl(data.path);

      // Update database with new URL
      await updateVideoUrl.mutateAsync(urlData.publicUrl);
      
      toast.success("Video uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveVideo = async () => {
    if (!currentVideoUrl) return;

    try {
      // Extract path from URL
      const path = currentVideoUrl.split("/tutorials/")[1];
      if (path) {
        await supabase.storage.from("tutorials").remove([path]);
      }
      await updateVideoUrl.mutateAsync(null);
      toast.success("Tutorial video removed");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove video");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Homepage Tutorial Video
        </CardTitle>
        <CardDescription>
          Upload a video tutorial that will be displayed on the homepage to help users understand how to use the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Video Preview */}
        {isLoading ? (
          <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : currentVideoUrl ? (
          <div className="space-y-4">
            <Label>Current Video</Label>
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <video
                src={currentVideoUrl}
                controls
                className="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentVideoUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveVideo}
                disabled={updateVideoUrl.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Video
              </Button>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tutorial video uploaded yet</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="space-y-3">
          <Label htmlFor="video-upload">
            {currentVideoUrl ? "Replace Video" : "Upload Video"}
          </Label>
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="flex-1"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(isUploading && "opacity-50")}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: MP4, WebM, MOV. Maximum file size: 100MB.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialVideoUploader;
