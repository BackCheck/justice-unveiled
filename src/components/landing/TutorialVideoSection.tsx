import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Video } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import { cn } from "@/lib/utils";

export const TutorialVideoSection = () => {
  const { data: videoUrl, isLoading } = useQuery({
    queryKey: ["tutorial-video"],
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

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-secondary/10 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 bg-background border-border/50"
            >
              <Video className="w-3.5 h-3.5 mr-2" />
              Platform Guide
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How to Use <GradientText>HRPM Platform</GradientText>
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto text-base leading-relaxed">
              Watch our comprehensive tutorial to learn how to navigate the
              platform, document cases, and access investigative tools.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Card
            className={cn(
              "border-border/50 bg-card/80 backdrop-blur overflow-hidden",
              "hover:border-primary/30 transition-all duration-500"
            )}
          >
            <CardContent className="p-0">
              {isLoading ? (
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20" />
                    <div className="h-4 w-32 bg-muted rounded" />
                  </div>
                </div>
              ) : videoUrl ? (
                <div className="aspect-video">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover"
                    poster=""
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 flex items-center justify-center relative group cursor-pointer">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                  </div>

                  <div className="relative flex flex-col items-center gap-4 text-center px-4">
                    <div
                      className={cn(
                        "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center",
                        "group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300",
                        "shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                      )}
                    >
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-1">
                        Tutorial Coming Soon
                      </p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Our comprehensive platform guide is being prepared.
                        Check back soon to learn how to use all the
                        investigative tools.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TutorialVideoSection;
