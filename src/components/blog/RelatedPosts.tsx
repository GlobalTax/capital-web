import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface RelatedPostsProps {
  posts: BlogPost[];
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="text-xl">Artículos Relacionados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
              <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                {/* Imagen destacada */}
                {post.featured_image_url && (
                  <div className="mb-3">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}

                {/* Categoría */}
                <Badge variant="secondary" className="mb-2">
                  {post.category}
                </Badge>

                {/* Título */}
                <h3 className="font-semibold text-sm leading-tight mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                {/* Extracto */}
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {truncateText(post.excerpt, 80)}
                  </p>
                )}

                {/* Meta información */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-4 w-4 border">
                      {post.author_avatar_url ? (
                        <AvatarImage src={post.author_avatar_url} alt={post.author_name} />
                      ) : (
                        <AvatarFallback className="text-[8px]">
                          {post.author_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>{post.author_name.split(' ')[0]}</span>
                    <span className="text-muted-foreground/50">·</span>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.reading_time} min</span>
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {post.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedPosts;