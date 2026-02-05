import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Calendar,
  Clock,
  Globe,
  Newspaper,
  Sparkles,
  User,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  post_type: string;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  author_avatar_url: string | null;
  cover_image_url: string | null;
  is_featured: boolean | null;
  is_ai_generated: boolean | null;
  published_at: string | null;
  views_count: number | null;
}

const Blog = () => {
  useSEO({
    title: "Blog & News | Human Rights Platform",
    description: "Daily awareness posts on human rights laws, weekly global editorials, and latest news on justice, damages, and legal developments.",
    keywords: ["human rights blog", "legal awareness", "global editorials", "human rights news"],
  });

  const [activeTab, setActiveTab] = useState("all");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const filteredPosts = posts?.filter((post) => {
    if (activeTab === "all") return true;
    return post.post_type === activeTab;
  });

  const featuredPosts = posts?.filter((p) => p.is_featured) || [];
  const latestPosts = filteredPosts?.slice(0, 12) || [];

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

  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Newspaper className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Blog & News</h1>
              <p className="text-muted-foreground">
                Stay informed on human rights laws and global developments
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {posts?.filter((p) => p.post_type === "awareness").length || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Daily Awareness</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">
                    {posts?.filter((p) => p.post_type === "editorial").length || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Weekly Editorials</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">
                    {posts?.filter((p) => p.post_type === "news").length || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">News Articles</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold">
                    {posts?.reduce((acc, p) => acc + (p.views_count || 0), 0).toLocaleString() || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Featured
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredPosts.slice(0, 2).map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors overflow-hidden group">
                    {post.cover_image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPostTypeColor(post.post_type)}>
                          {getPostTypeIcon(post.post_type)}
                          <span className="ml-1 capitalize">{post.post_type}</span>
                        </Badge>
                        {post.is_ai_generated && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author_name || "HRPM Editorial"}
                        </span>
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(post.published_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="awareness" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span className="hidden sm:inline">Daily</span>
            </TabsTrigger>
            <TabsTrigger value="editorial" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">Editorial</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-1">
              <Newspaper className="h-3 w-3" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading posts...
              </div>
            ) : latestPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    Check back soon for updates on human rights and legal developments.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getPostTypeColor(post.post_type)}>
                            {getPostTypeIcon(post.post_type)}
                            <span className="ml-1 capitalize">{post.post_type}</span>
                          </Badge>
                          {post.category && (
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {post.published_at && (
                              <>
                                <Clock className="h-3 w-3" />
                                {format(new Date(post.published_at), "MMM d")}
                              </>
                            )}
                          </span>
                          <span className="flex items-center gap-1 text-primary">
                            Read more
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PlatformLayout>
  );
};

export default Blog;
