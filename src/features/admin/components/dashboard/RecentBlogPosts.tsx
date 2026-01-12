import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentBlogPosts = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['recent-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, is_published, updated_at, slug')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Últimos Posts de Blog</CardTitle>
          <CardDescription>Artículos recientes</CardDescription>
        </div>
        <Link to="/admin/blog-v2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Ver todos <ExternalLink className="ml-1 h-3 w-3" />
          </Badge>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-normal text-sm truncate">{post.title}</p>
                    <Badge variant={post.is_published ? "default" : "secondary"}>
                      {post.is_published ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(post.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
                <Link to={`/admin/blog-v2/${post.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay posts recientes
          </p>
        )}
      </CardContent>
    </Card>
  );
};
