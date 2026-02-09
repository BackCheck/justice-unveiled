import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  Newspaper, 
  BookOpen,
  Calendar,
  Sparkles
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import GradientText from "./GradientText";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  published_at: string | null;
  is_ai_generated: boolean | null;
}

const BlogPreviewSection = () => {
  const { t } = useTranslation();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["landing-blog-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, category, published_at, is_ai_generated")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <Badge variant="outline" className="mb-4 bg-background border-border/50">
                AWARENESS & INSIGHTS
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Latest from <GradientText>Our Blog</GradientText>
              </h2>
              <p className="text-foreground/70 mt-2 max-w-xl">
                Human rights awareness, investigative journalism, and legal updates
              </p>
            </div>
            <Link to="/blog">
              <Button variant="outline" className="group hover:border-primary/50">
                View All Posts
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 100} direction="up">
                <Link to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:border-primary/30 transition-all duration-300 group h-full">
                    {post.cover_image_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={post.cover_image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {post.is_ai_generated && (
                          <Badge className="absolute top-2 right-2 bg-primary/90">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(post.published_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <Card className="p-12 text-center bg-muted/30">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Our awareness blog is launching soon with human rights news and investigative insights.
              </p>
              <Link to="/blog">
                <Button variant="outline">
                  Visit Blog
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default BlogPreviewSection;