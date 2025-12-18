import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  reading_time: number;
}

interface ArticleSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxArticles?: number;
}

export const ArticleSelector: React.FC<ArticleSelectorProps> = ({
  selectedIds,
  onSelectionChange,
  maxArticles = 3,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['newsletter-blog-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, category, featured_image_url, published_at, created_at, reading_time')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const filteredArticles = articles?.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else if (selectedIds.length < maxArticles) {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const isMaxReached = selectedIds.length >= maxArticles;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar artículos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selection info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {selectedIds.length} de {maxArticles} artículos seleccionados
        </span>
        {isMaxReached && (
          <Badge variant="secondary" className="text-amber-600 bg-amber-50">
            Máximo alcanzado
          </Badge>
        )}
      </div>

      {/* Articles list */}
      <ScrollArea className="h-[400px] pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Cargando artículos...
          </div>
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <div className="space-y-3">
            {filteredArticles.map((article) => {
              const isSelected = selectedIds.includes(article.id);
              const isDisabled = !isSelected && isMaxReached;

              return (
                <Card
                  key={article.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-primary border-primary'
                      : isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => !isDisabled && toggleSelection(article.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="mt-1"
                      />

                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                        {article.featured_image_url ? (
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {article.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(
                              new Date(article.published_at || article.created_at),
                              'dd MMM yyyy',
                              { locale: es }
                            )}
                          </span>
                          <span>{article.reading_time} min lectura</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron artículos
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export const getArticlesById = async (ids: string[]): Promise<BlogPost[]> => {
  if (ids.length === 0) return [];
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, featured_image_url, published_at, created_at, reading_time')
    .in('id', ids);
  
  if (error) throw error;
  return data as BlogPost[];
};
