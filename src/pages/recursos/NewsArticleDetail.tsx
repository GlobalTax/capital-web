import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { getArticleSchema, getBreadcrumbSchema } from '@/utils/seo';
import { BlogProseContent } from '@/components/blog/BlogProseContent';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  source_name: string | null;
  source_url: string | null;
  author_name: string;
  author_avatar_url: string | null;
  featured_image_url: string | null;
  tags: string[] | null;
  read_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const NewsArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['news-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug!)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as unknown as NewsArticle;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ['news-related', article?.category, article?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, slug, excerpt, category, published_at, created_at')
        .eq('is_published', true)
        .eq('category', article!.category)
        .neq('id', article!.id)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data || []) as unknown as NewsArticle[];
    },
    enabled: !!article?.category && !!article?.id,
    staleTime: 1000 * 60 * 5,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: es });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <UnifiedLayout variant="home">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error || !article) {
    return <Navigate to="/404" replace />;
  }

  const publishedDate = article.published_at || article.created_at;
  const pageTitle = article.meta_title || `${article.title} | Noticias M&A | Capittal`;
  const pageDescription = article.meta_description || article.excerpt || article.title;

  return (
    <UnifiedLayout variant="home">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`https://capittal.es/recursos/noticias/${article.slug}`}
        ogImage={article.featured_image_url || 'https://capittal.es/og-default.jpg'}
        keywords={article.tags?.join(', ')}
        noindex={true}
        structuredData={[
          getArticleSchema(
            article.title,
            pageDescription,
            `https://capittal.es/recursos/noticias/${article.slug}`,
            article.featured_image_url || '',
            publishedDate,
            article.updated_at,
            article.author_name || 'Equipo Capittal'
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Noticias M&A', url: 'https://capittal.es/recursos/noticias' },
            { name: article.title, url: `https://capittal.es/recursos/noticias/${article.slug}` }
          ])
        ]}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { name: 'Inicio', url: '/' },
          { name: 'Noticias M&A', url: '/recursos/noticias' },
          { name: article.title, url: `/recursos/noticias/${article.slug}` }
        ]} />

        {/* Back link */}
        <Link
          to="/recursos/noticias"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Link>

        {/* Header */}
        <header className="mb-10">
          <Badge variant="secondary" className="mb-4">
            {article.category}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
            </div>

            {article.read_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{article.read_time} min de lectura</span>
              </div>
            )}

            {article.author_name && (
              <span>Por {article.author_name}</span>
            )}
          </div>
        </header>

        {/* Featured image */}
        {article.featured_image_url && (
          <div className="mb-10 rounded-lg overflow-hidden">
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <BlogProseContent content={article.content} />

        {/* Source */}
        {article.source_url && (
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Fuente original:{' '}
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
              >
                {article.source_name || 'Ver fuente'}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Related articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-normal text-foreground mb-8">
              Noticias relacionadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link key={related.id} to={`/recursos/noticias/${related.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-3 text-xs">
                        {related.category}
                      </Badge>
                      <h3 className="text-sm font-normal text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {related.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(related.published_at || related.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </UnifiedLayout>
  );
};

export default NewsArticleDetail;
