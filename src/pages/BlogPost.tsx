import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Share2,
  User,
  BookOpen,
  Newspaper,
  Sparkles,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { format } from "date-fns";

const BlogPost = () => {
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

      // Increment view count
      await supabase
        .from("blog_posts")
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq("id", data.id);

      return data;
    },
    enabled: !!slug,
  });

  useSEO({
    title: post ? `${post.title} | HRPM Blog` : "Blog Post | Human Rights Platform",
    description: post?.excerpt || "Read about human rights developments and legal awareness.",
    keywords: post?.tags || ["human rights", "legal awareness"],
    ogImage: post?.cover_image_url || undefined,
    ogType: "article",
  });

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "awareness":
        return <BookOpen className="h-4 w-4" />;
      case "editorial":
        return <Globe className="h-4 w-4" />;
      case "news":
        return <Newspaper className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "awareness":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "editorial":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "news":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post?.title || "";

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <PlatformLayout>
        <div className="max-w-3xl mx-auto py-12 text-center text-muted-foreground">
          Loading article...
        </div>
      </PlatformLayout>
    );
  }

  if (error || !post) {
    return (
      <PlatformLayout>
        <div className="max-w-3xl mx-auto py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </PlatformLayout>
    );
  }

  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <PlatformLayout>
      <article className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="rounded-xl overflow-hidden mb-6">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge className={getPostTypeColor(post.post_type)}>
              {getPostTypeIcon(post.post_type)}
              <span className="ml-1 capitalize">{post.post_type}</span>
            </Badge>
            {post.category && (
              <Badge variant="outline">{post.category}</Badge>
            )}
            {post.is_ai_generated && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          {/* Author & Date */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {post.author_avatar_url ? (
                <img
                  src={post.author_avatar_url}
                  alt={post.author_name || "Author"}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
              <span>{post.author_name || "HRPM Editorial"}</span>
            </div>
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.published_at), "MMMM d, yyyy")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
          </div>
        </header>

        <Separator className="my-6" />

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {/* Render content - assuming it's plain text or HTML */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </>
        )}

        {/* Share */}
        <Separator className="my-6" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share this article
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: post.excerpt,
              image: post.cover_image_url,
              author: {
                "@type": "Person",
                name: post.author_name || "HRPM Editorial",
              },
              publisher: {
                "@type": "Organization",
                name: "Human Rights Progress Monitor",
                logo: {
                  "@type": "ImageObject",
                  url: "https://hrpm.org/logo.png",
                },
              },
              datePublished: post.published_at,
              dateModified: post.updated_at,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": shareUrl,
              },
            }),
          }}
        />
      </article>
    </PlatformLayout>
  );
};

export default BlogPost;
