import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Newspaper, 
  BookOpen, 
  Calendar, 
  ExternalLink, 
  Search,
  Tag,
  User,
  Clock,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  is_featured: boolean | null;
  is_ai_generated: boolean | null;
  published_at: string | null;
  views_count: number | null;
}

interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source_name: string | null;
  author: string | null;
  image_url: string | null;
  published_at: string | null;
  category: string | null;
  keywords: string[] | null;
  is_featured: boolean | null;
}

const Blog = () => {
  const { t } = useTranslation();

  useSEO({
    title: "Blog & News - Human Rights Awareness",
    description: "Read investigative reports, human rights awareness articles, and global news on legal abuse, institutional failures, and systemic injustice.",
    url: "https://hrpm.org/blog",
    canonicalUrl: "https://hrpm.org/blog",
    keywords: ["human rights blog", "investigative reports", "legal abuse", "awareness", "justice news"],
  });
  const [activeTab, setActiveTab] = useState("blog");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: blogPosts, isLoading: blogLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const { data: newsArticles, isLoading: newsLoading } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("is_relevant", true)
        .order("published_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as NewsArticle[];
    },
  });

  const filteredBlogs = blogPosts?.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNews = newsArticles?.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredBlogs = filteredBlogs?.filter(post => post.is_featured);
  const regularBlogs = filteredBlogs?.filter(post => !post.is_featured);

  return (
    <PlatformLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-primary" />
              Blog & News
            </h1>
            <p className="text-muted-foreground mt-1">
              Human rights awareness, legal updates, and investigative journalism
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              News Feed
            </TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog" className="space-y-6 mt-6">
            {blogLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBlogs?.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No blog posts yet</h3>
                <p className="text-muted-foreground">Check back soon for updates</p>
              </div>
            ) : (
              <>
                {/* Featured Posts */}
                {featuredBlogs && featuredBlogs.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Featured
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {featuredBlogs.slice(0, 2).map((post) => (
                        <BlogCard key={post.id} post={post} featured />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Posts */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularBlogs?.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6 mt-6">
            {newsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-36 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredNews?.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No news articles yet</h3>
                <p className="text-muted-foreground">External news will appear here once fetched</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNews?.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PlatformLayout>
  );
};

const BlogCard = ({ post, featured = false }: { post: BlogPost; featured?: boolean }) => (
  <Link to={`/blog/${post.slug}`}>
    <Card className={cn(
      "overflow-hidden hover:border-primary/30 transition-all duration-300 group h-full",
      featured && "md:col-span-1"
    )}>
      {post.cover_image_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={post.cover_image_url} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {post.is_ai_generated && (
            <Badge className="absolute top-2 right-2 bg-primary/90">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
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
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between pt-2">
          {post.author_name && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />
              {post.author_name}
            </span>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1">
              {post.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </Link>
);

const NewsCard = ({ article }: { article: NewsArticle }) => (
  <Card className="hover:border-primary/30 transition-all duration-300 group">
    <CardContent className="p-4">
      <div className="flex gap-4">
        {article.image_url && (
          <div className="w-36 h-24 rounded-lg overflow-hidden shrink-0">
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {article.source_name && (
              <Badge variant="outline" className="text-xs">
                {article.source_name}
              </Badge>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(article.published_at), "MMM d, yyyy")}
              </span>
            )}
          </div>
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.description}
            </p>
          )}
          <Button variant="ghost" size="sm" className="p-0 h-auto text-primary" asChild>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read full article
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Blog;