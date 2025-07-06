import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface SimpleBlogSEOPanelProps {
  post: BlogPost;
  updatePost: (updates: Partial<BlogPost>) => void;
}

const SimpleBlogSEOPanel = ({ post, updatePost }: SimpleBlogSEOPanelProps) => {
  return (
    <div className="space-y-6">
      {/* Meta Tags Básicos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO Básico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Meta Título (máximo 70 caracteres)
            </label>
            <Input
              value={post.meta_title || ''}
              onChange={(e) => updatePost({ meta_title: e.target.value })}
              placeholder={post.title || "Título optimizado para SEO..."}
              className="mt-1"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {(post.meta_title || '').length}/70 caracteres
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Meta Descripción (máximo 160 caracteres)
            </label>
            <Textarea
              value={post.meta_description || ''}
              onChange={(e) => updatePost({ meta_description: e.target.value })}
              placeholder="Descripción atractiva para aparecer en los buscadores..."
              className="mt-1 resize-none"
              rows={3}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {(post.meta_description || '').length}/160 caracteres
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              URL Slug
            </label>
            <Input
              value={post.slug || ''}
              onChange={(e) => updatePost({ slug: e.target.value })}
              placeholder="url-del-post"
              className="mt-1 font-mono text-xs"
            />
            <div className="text-xs text-muted-foreground mt-1">
              URL final: /blog/{post.slug || 'tu-post'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Contenido */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Estadísticas del Contenido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Palabras:</span>
              <span className="ml-1 font-medium">
                {post.content ? post.content.trim().split(/\s+/).length : 0}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Tiempo lectura:</span>
              <span className="ml-1 font-medium">{post.reading_time} min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleBlogSEOPanel;