import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface BlogNavigationProps {
  previousPost: BlogPost | null;
  nextPost: BlogPost | null;
}

const BlogNavigation = ({ previousPost, nextPost }: BlogNavigationProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!previousPost && !nextPost) {
    return null;
  }

  return (
    <Card className="mt-12">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Post anterior */}
          <div className="flex flex-col">
            {previousPost ? (
              <Link to={`/blog/${previousPost.slug}`} className="group">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">Artículo anterior</p>
                    <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                      {previousPost.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(previousPost.published_at || previousPost.created_at)}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{previousPost.reading_time} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center justify-center h-20 text-muted-foreground">
                <p className="text-sm">No hay artículo anterior</p>
              </div>
            )}
          </div>

          {/* Post siguiente */}
          <div className="flex flex-col">
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`} className="group">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-right">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">Siguiente artículo</p>
                    <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                      {nextPost.title}
                    </h3>
                    <div className="flex items-center justify-end gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{nextPost.reading_time} min</span>
                      <Clock className="h-3 w-3" />
                      <span className="ml-2">{formatDate(nextPost.published_at || nextPost.created_at)}</span>
                      <Calendar className="h-3 w-3" />
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ) : (
              <div className="flex items-center justify-center h-20 text-muted-foreground">
                <p className="text-sm">No hay más artículos</p>
              </div>
            )}
          </div>
        </div>

        {/* Botón volver al blog */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <Link to="/recursos/blog">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Blog
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogNavigation;