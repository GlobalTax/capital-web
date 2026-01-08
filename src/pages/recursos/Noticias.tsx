import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ExternalLink, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  source_name: string;
  source_url: string;
  tags: string[];
  published_at: string;
  created_at: string;
}

const CATEGORIES = [
  'Todos',
  'M&A',
  'Private Equity',
  'Venture Capital',
  'Due Diligence',
  'Valoración',
  'Reestructuración',
  'Fiscal'
];

const Noticias: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['ma-news-all', selectedCategory, page],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (selectedCategory !== 'Todos') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { articles: (data || []) as unknown as NewsArticle[], total: count || 0 };
    },
    staleTime: 1000 * 60 * 5,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: es });
    } catch {
      return '';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'M&A': 'bg-primary/10 text-primary',
      'Private Equity': 'bg-blue-500/10 text-blue-600',
      'Venture Capital': 'bg-green-500/10 text-green-600',
      'Due Diligence': 'bg-amber-500/10 text-amber-600',
      'Valoración': 'bg-purple-500/10 text-purple-600',
      'Reestructuración': 'bg-red-500/10 text-red-600',
      'Fiscal': 'bg-slate-500/10 text-slate-600',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  const totalPages = Math.ceil((newsData?.total || 0) / pageSize);

  return (
    <UnifiedLayout variant="home">
      <SEOHead
        title="Noticias M&A España | Fusiones y Adquisiciones | Capittal"
        description="Últimas noticias sobre fusiones, adquisiciones, private equity y venture capital en España. Mantente informado sobre el sector M&A."
        canonical="https://capittal.es/recursos/noticias"
        keywords="noticias M&A, fusiones adquisiciones España, private equity noticias, venture capital España"
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4">
                Recursos
              </Badge>
              <h1 className="text-4xl font-normal text-foreground mb-4">
                Noticias del Sector M&A
              </h1>
              <p className="text-lg text-muted-foreground">
                Las últimas operaciones de fusiones, adquisiciones y private equity en España
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(0);
                  }}
                  className="flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : newsData?.articles && newsData.articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newsData.articles.map((article) => (
                    <Card 
                      key={article.id} 
                      className="group hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        {/* Category */}
                        <Badge 
                          variant="secondary" 
                          className={`mb-3 ${getCategoryColor(article.category)}`}
                        >
                          {article.category}
                        </Badge>

                        {/* Title */}
                        <h2 className="text-lg font-normal text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {article.excerpt || article.content?.substring(0, 150)}
                        </p>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.slice(0, 3).map((tag, idx) => (
                              <span 
                                key={idx}
                                className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(article.published_at || article.created_at)}</span>
                          </div>
                          
                          {article.source_url && (
                            <a 
                              href={article.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              <span>{article.source_name}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Página {page + 1} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No hay noticias disponibles en esta categoría.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </UnifiedLayout>
  );
};

export default Noticias;
