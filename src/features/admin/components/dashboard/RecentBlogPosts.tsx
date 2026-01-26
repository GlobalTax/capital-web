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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 md:p-6 pb-2 sm:pb-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base md:text-lg truncate">Últimos Posts</CardTitle>
          <CardDescription className="text-xs md:text-sm">Artículos recientes</CardDescription>
        </div>
        <Link to="/admin/blog-v2" className="shrink-0 ml-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
            <span className="hidden sm:inline">Ver todos</span>
            <span className="sm:hidden">Ver</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </Badge>
        </Link>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {isLoading ? (
          <div className="space-y-2 sm:space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 sm:h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <p className="font-normal text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">{post.title}</p>
                    <Badge variant={post.is_published ? "default" : "secondary"} className="text-[10px] sm:text-xs px-1 sm:px-2">
                      {post.is_published ? 'Pub.' : 'Borr.'}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {format(new Date(post.updated_at), 'dd/MM/yy HH:mm', { locale: es })}
                  </p>
                </div>
                <Link to={`/admin/blog-v2/${post.id}`} className="shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
            No hay posts recientes
          </p>
        )}
      </CardContent>
    </Card>
  );
};
