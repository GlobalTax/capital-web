import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  source_name: string;
  source_url: string;
  published_at: string;
  created_at: string;
}

export const MANewsSection: React.FC = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ['ma-news-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return (data || []) as unknown as NewsArticle[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) {
    return null; // Don't show section if no news
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMM yyyy', { locale: es });
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

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Actualidad M&A
          </Badge>
          <h2 className="text-3xl font-normal text-foreground mb-4">
            Últimas Noticias del Sector
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mantente informado sobre las principales operaciones de fusiones y adquisiciones en España
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((article) => (
            <a
              key={article.id}
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card 
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 cursor-pointer h-full"
              >
                <CardContent className="p-5">
                  {/* Category Badge */}
                  <Badge 
                    variant="secondary" 
                    className={`mb-3 text-xs ${getCategoryColor(article.category)}`}
                  >
                    {article.category}
                  </Badge>

                  {/* Title */}
                  <h3 className="text-sm font-normal text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.published_at || article.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
                      <span className="truncate max-w-[80px]">{article.source_name}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link 
            to="/recursos/noticias"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-normal"
          >
            Ver todas las noticias
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MANewsSection;
