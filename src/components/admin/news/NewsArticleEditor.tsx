// ============= NEWS ARTICLE EDITOR =============
// Modal para editar noticias M&A

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Sparkles, Globe } from 'lucide-react';
import { NewsArticle } from '@/hooks/useNewsArticles';

interface NewsArticleEditorProps {
  article: NewsArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<NewsArticle>) => void;
}

export const NewsArticleEditor = ({ article, open, onOpenChange, onSave }: NewsArticleEditorProps) => {
  const [formData, setFormData] = useState<Partial<NewsArticle>>({});

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        tags: article.tags,
        featured_image_url: article.featured_image_url,
        meta_title: article.meta_title,
        meta_description: article.meta_description,
      });
    }
  }, [article]);

  const handleChange = (field: keyof NewsArticle, value: string | string[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Noticia
            {article.is_processed && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                IA
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="source">Fuente</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Título de la noticia"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={formData.slug || ''}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="url-de-la-noticia"
              />
            </div>

            <div className="space-y-2">
              <Label>Resumen</Label>
              <Textarea
                value={formData.excerpt || ''}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="Resumen breve de la noticia"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido</Label>
              <Textarea
                value={formData.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Contenido completo"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="M&A, Fusiones, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Imagen destacada (URL)</Label>
                <Input
                  value={formData.featured_image_url || ''}
                  onChange={(e) => handleChange('featured_image_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (separados por coma)</Label>
              <Input
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="fusiones, adquisiciones, tecnología"
              />
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                value={formData.meta_title || ''}
                onChange={(e) => handleChange('meta_title', e.target.value)}
                placeholder="Título para SEO (max 60 caracteres)"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {(formData.meta_title?.length || 0)}/60 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                value={formData.meta_description || ''}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                placeholder="Descripción para SEO (max 160 caracteres)"
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {(formData.meta_description?.length || 0)}/160 caracteres
              </p>
            </div>
          </TabsContent>

          <TabsContent value="source" className="space-y-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fuente:</span>
                <span>{article.source_name || 'No especificada'}</span>
              </div>
              
              {article.source_url && (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver artículo original
                </a>
              )}

              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                <p>Scrapeado: {article.fetched_at ? new Date(article.fetched_at).toLocaleString('es-ES') : 'N/A'}</p>
                <p>Procesado IA: {article.processed_at ? new Date(article.processed_at).toLocaleString('es-ES') : 'N/A'}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
