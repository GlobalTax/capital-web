import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, Clock, Calendar } from 'lucide-react';
import { useBlogAnalytics } from '@/hooks/useBlogAnalytics';

interface PopularPost {
  id: string;
  post_id: string;
  post_slug: string;
  total_views: number;
  unique_views: number;
  avg_reading_time: number;
  avg_scroll_percentage: number;
  last_viewed: string | null;
  blog_posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featured_image_url: string;
    category: string;
    author_name: string;
    reading_time: number;
    published_at: string;
    created_at: string;
  } | null;
}

interface BlogPopularPostsProps {
  limit?: number;
  showMetrics?: boolean;
  className?: string;
}

const BlogPopularPosts = ({ 
  limit = 5, 
  showMetrics = true, 
  className = "" 
}: BlogPopularPostsProps) => {
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const { getPopularPosts, isLoading } = useBlogAnalytics();

  useEffect(() => {
    const fetchPopularPosts = async () => {
      const posts = await getPopularPosts(limit);
      setPopularPosts(posts);
    };

    fetchPopularPosts();
  }, [limit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${Math.round(views / 100) / 10}k`;
    }
    return views.toString();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Posts Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (popularPosts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Posts Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay datos de popularidad disponibles aún.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Posts Más Populares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {popularPosts.map((post, index) => {
            if (!post.blog_posts) return null;
            
            return (
              <Link 
                key={post.id} 
                to={`/blog/${post.blog_posts.slug}`}
                className="block group"
              >
                <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Ranking number */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>

                  {/* Post info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors mb-1">
                      {post.blog_posts.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.blog_posts.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.blog_posts.published_at || post.blog_posts.created_at)}
                      </span>
                    </div>

                    {showMetrics && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{formatViews(post.total_views)} vistas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.blog_posts.reading_time} min</span>
                        </div>
                        {post.avg_reading_time > 0 && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{Math.round(post.avg_reading_time / 60)}min promedio</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Featured image */}
                  {post.blog_posts.featured_image_url && (
                    <div className="flex-shrink-0 w-12 h-12">
                      <img
                        src={post.blog_posts.featured_image_url}
                        alt={post.blog_posts.title}
                        className="w-full h-full object-cover rounded-lg"
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPopularPosts;