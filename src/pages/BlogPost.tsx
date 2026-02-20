import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock,
  Sparkles,
  BookOpen,
  Share2,
  Tag
} from "lucide-react";
import { format } from "date-fns";
import { StartInvestigationButton } from "@/components/blog/StartInvestigationButton";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  post_type: string;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  author_avatar_url: string | null;
  is_featured: boolean | null;
  is_ai_generated: boolean | null;
  published_at: string | null;
  views_count: number | null;
  created_at: string;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <PlatformLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </PlatformLayout>
    );
  }

  if (error || !post) {
    return (
      <PlatformLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </PlatformLayout>
    );
  }

  useSEO({
    title: post.title,
    description: post.excerpt || `Read ${post.title} on HRPM - Human Rights Protection Movement.`,
    image: post.cover_image_url || undefined,
    url: `https://hrpm.org/blog/${post.slug}`,
    canonicalUrl: `https://hrpm.org/blog/${post.slug}`,
    type: "article",
    publishedTime: post.published_at || post.created_at,
    author: post.author_name || "HRPM Investigations Unit",
    section: post.category || "Human Rights",
    tags: post.tags || [],
    keywords: post.tags || [],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt || post.title,
      "image": post.cover_image_url || "https://hrpm.org/og-image.png",
      "datePublished": post.published_at || post.created_at,
      "author": { "@type": "Organization", "name": post.author_name || "HRPM" },
      "publisher": {
        "@type": "Organization",
        "name": "HRPM.org",
        "logo": { "@type": "ImageObject", "url": "https://hrpm.org/favicon.png" }
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `https://hrpm.org/blog/${post.slug}` }
    },
  });

  return (
    <PlatformLayout>
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {/* Header */}
        <header className="space-y-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {post.category && (
              <Badge variant="outline">{post.category}</Badge>
            )}
            {post.is_ai_generated && (
              <Badge className="gap-1 bg-primary/90">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </Badge>
            )}
            {post.is_featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {post.author_name && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author_name}
              </div>
            )}
            {post.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.published_at), "MMMM d, yyyy")}
              </div>
            )}
            {post.views_count !== null && post.views_count > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.views_count} views
              </div>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={post.cover_image_url} 
              alt={post.title}
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none py-8">
            <div 
              className="text-foreground leading-relaxed [&_img]:rounded-lg [&_img]:max-w-full [&_a]:text-primary [&_a]:underline [&_iframe]:rounded-lg [&_iframe]:w-full [&_iframe]:aspect-video"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t flex-wrap">
          <StartInvestigationButton
            blogTitle={post.title}
            blogExcerpt={post.excerpt}
            blogContent={post.content}
            blogCategory={post.category}
            blogSlug={post.slug}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied!");
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </article>
    </PlatformLayout>
  );
};

export default BlogPostPage;
