import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Calendar, TrendingUp } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';

const BlogDashboard = () => {
  const { posts, isLoading } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalPosts = posts.length;
  const publishedPosts = posts.filter(post => post.is_published).length;
  const draftPosts = posts.filter(post => !post.is_published).length;
  const featuredPosts = posts.filter(post => post.is_featured).length;

  const recentPosts = posts
    .filter(post => post.is_published)
    .sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime())
    .slice(0, 5);

  const categoryCounts = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const stats = [
    {
      title: 'Total Posts',
      value: totalPosts,
      icon: FileText,
      description: `${publishedPosts} publicados`,
      trend: '+12%'
    },
    {
      title: 'Publicados',
      value: publishedPosts,
      icon: Eye,
      description: `${draftPosts} borradores`,
      trend: '+8%'
    },
    {
      title: 'Destacados',
      value: featuredPosts,
      icon: TrendingUp,
      description: 'Posts destacados',
      trend: 'Estable'
    },
    {
      title: 'Este Mes',
      value: posts.filter(post => {
        const postDate = new Date(post.created_at);
        const now = new Date();
        return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
      }).length,
      icon: Calendar,
      description: 'Posts creados',
      trend: '+25%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-md bg-primary/10">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Posts Recientes
            </CardTitle>
            <CardDescription>
              Últimas publicaciones del blog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {post.category} • {post.reading_time} min
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('es-ES') : ''}
                      </p>
                    </div>
                    {post.is_featured && (
                      <Badge variant="secondary" className="text-xs">
                        Destacado
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No hay posts publicados aún
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Categorías */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Categorías
            </CardTitle>
            <CardDescription>
              Categorías más populares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.length > 0 ? (
                topCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{category}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? 'post' : 'posts'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {Math.round((count / totalPosts) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No hay categorías aún
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogDashboard;