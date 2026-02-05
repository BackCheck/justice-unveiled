import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Newspaper,
  Search,
  ExternalLink,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Scale,
  Globe,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { format } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source_name: string | null;
  category: string | null;
  image_url: string | null;
  published_at: string | null;
  sentiment: string | null;
  keywords: string[] | null;
  is_featured: boolean | null;
}

const NewsHub = () => {
  useSEO({
    title: "News Hub | Human Rights Platform",
    description: "Latest news on human rights, legal developments, malicious prosecution, and justice worldwide. Stay informed with curated news from trusted sources.",
    keywords: ["human rights news", "legal news", "justice news", "malicious prosecution", "damages news"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: articles, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("is_relevant", true)
        .order("published_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as NewsArticle[];
    },
  });

  // Get unique categories
  const categories = [...new Set(articles?.map((a) => a.category).filter(Boolean) || [])];

  // Filter articles
  const filteredArticles = articles?.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.keywords?.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || article.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles?.filter((a) => a.is_featured) || [];

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "negative":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case "human rights":
        return <Globe className="h-4 w-4" />;
      case "legal":
        return <Scale className="h-4 w-4" />;
      case "prosecution":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Newspaper className="h-4 w-4" />;
    }
  };

  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Newspaper className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">News Hub</h1>
                <p className="text-muted-foreground">
                  Curated human rights and legal news from around the world
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{articles?.length || 0}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold">{featuredArticles.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Featured</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">{categories.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Categories</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">24h</span>
                </div>
                <p className="text-sm text-muted-foreground">Update Cycle</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat!}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* News Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading news articles...
          </div>
        ) : filteredArticles?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles?.map((article) => (
              <Card
                key={article.id}
                className="group hover:border-primary/50 transition-colors overflow-hidden"
              >
                {article.image_url && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {article.category && (
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(article.category)}
                        <span className="ml-1">{article.category}</span>
                      </Badge>
                    )}
                    {article.sentiment && (
                      <Badge className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                        {article.sentiment}
                      </Badge>
                    )}
                    {article.is_featured && (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>

                  {article.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {article.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {article.source_name && (
                        <span className="font-medium">{article.source_name}</span>
                      )}
                      {article.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(article.published_at), "MMM d")}
                        </span>
                      )}
                    </div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      Read
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Keywords */}
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {article.keywords.slice(0, 3).map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PlatformLayout>
  );
};

export default NewsHub;
