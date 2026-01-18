import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Hash,
  Eye,
  Wand2,
  Loader2
} from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { useBlogSEO } from '@/hooks/useBlogSEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogSEOPanelProps {
  post: BlogPost;
  updatePost: (updates: Partial<BlogPost>) => void;
}

const BlogSEOPanel = ({ post, updatePost }: BlogSEOPanelProps) => {
  const { toast } = useToast();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { 
    analysis, 
    seoErrors, 
    isCheckingSlug, 
    analyzePost, 
    generateSlug, 
    generateMetaTags 
  } = useBlogSEO();

  // Memoize analyzePost call
  const memoizedAnalyzePost = useCallback((postToAnalyze: BlogPost) => {
    analyzePost(postToAnalyze);
  }, [analyzePost]);

  // Analizar el post cuando cambie
  useEffect(() => {
    if (post.title || post.content || post.slug) {
      memoizedAnalyzePost(post);
    }
  }, [post.title, post.content, post.slug, post.meta_title, post.meta_description, memoizedAnalyzePost]);

  // NOTE: Slug generation is now centralized in EnhancedBlogEditor.tsx
  // NOTE: Reading time calculation is now centralized in EnhancedBlogEditor.tsx

  const handleAutoGenerateMetaTags = async () => {
    if (!post.title && !post.content) {
      toast({
        title: "Contenido requerido",
        description: "Necesitas un título o contenido para generar meta tags",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: {
          type: 'seo',
          prompt: post.title || 'Artículo de blog',
          context: {
            title: post.title,
            content: post.content?.substring(0, 1500),
            category: post.category
          }
        }
      });
      
      if (error) throw error;
      
      // Handle structured tool calling response (new format)
      if (data?.seo_data) {
        const seoData = data.seo_data;
        updatePost({
          meta_title: seoData.meta_title?.substring(0, 60),
          meta_description: seoData.meta_description?.substring(0, 160)
        });
        toast({ title: "Meta tags generados", description: "Se han generado los meta tags con IA" });
        return;
      }
      
      // Fallback: Parse text response (legacy format)
      const content = data?.content || '';
      const lines = content.split('\n').filter((l: string) => l.trim());
      
      const updates: Partial<BlogPost> = {};
      
      // Extraer meta título
      const titleLine = lines.find((l: string) => 
        l.toLowerCase().includes('título') || l.toLowerCase().includes('title')
      );
      if (titleLine) {
        updates.meta_title = titleLine
          .replace(/^[\d.)\-\s]*/g, '')
          .replace(/^(meta\s*)?t[íi]tulo:?\s*/i, '')
          .replace(/["']/g, '')
          .trim()
          .substring(0, 60);
      }
      
      // Extraer meta descripción
      const descLine = lines.find((l: string) => 
        l.toLowerCase().includes('descripción') || l.toLowerCase().includes('description')
      );
      if (descLine) {
        updates.meta_description = descLine
          .replace(/^[\d.)\-\s]*/g, '')
          .replace(/^(meta\s*)?descripci[óo]n:?\s*/i, '')
          .replace(/["']/g, '')
          .trim()
          .substring(0, 160);
      }
      
      if (Object.keys(updates).length > 0) {
        updatePost(updates);
        toast({ title: "Meta tags generados", description: "Se han generado los meta tags con IA" });
      } else {
        // Fallback al método simple
        const fallback = generateMetaTags(post);
        updatePost(fallback);
        toast({ title: "Meta tags generados", description: "Generados con método básico" });
      }
    } catch (error) {
      console.error('Error generating meta tags:', error);
      // Fallback al método simple
      const fallback = generateMetaTags(post);
      updatePost(fallback);
      toast({ title: "Meta tags generados", description: "Generados con método básico (IA no disponible)" });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateSlug = () => {
    if (post.title) {
      const newSlug = generateSlug(post.title);
      updatePost({ slug: newSlug });
      toast({ 
        title: "Slug regenerado", 
        description: `Nuevo slug: ${newSlug}` 
      });
    }
  };

  const getSEOScoreText = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita mejoras';
  };

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Puntuación SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{analysis.seoScore}/100</span>
            <Badge variant={analysis.seoScore >= 80 ? 'default' : analysis.seoScore >= 60 ? 'secondary' : 'destructive'}>
              {getSEOScoreText(analysis.seoScore)}
            </Badge>
          </div>
          <Progress 
            value={analysis.seoScore} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Google Snippet Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vista previa en Google
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-4 space-y-1">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate font-medium">
              {post.meta_title || post.title || 'Título del artículo'}
            </div>
            <div className="text-green-700 text-sm truncate">
              capittal.es/blog/{post.slug || 'url-del-post'}
            </div>
            <div className="text-gray-600 text-sm line-clamp-2">
              {post.meta_description || post.excerpt || 'Descripción del artículo que aparecerá en los resultados de búsqueda...'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Análisis de Contenido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span>{analysis.wordCount} palabras</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{analysis.readingTime} min lectura</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span>{analysis.paragraphCount} párrafos</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span>{analysis.headingCount} encabezados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Tags */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            Meta Tags SEO
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoGenerateMetaTags}
            disabled={isGeneratingAI}
            className="flex items-center gap-1"
          >
            {isGeneratingAI ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="h-3 w-3" />
            )}
            {isGeneratingAI ? 'Generando...' : 'Auto-generar'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Meta Título ({analysis.metaTitleLength}/70)
            </label>
            <Input
              value={post.meta_title || ''}
              onChange={(e) => updatePost({ meta_title: e.target.value })}
              placeholder="Título optimizado para SEO..."
              className={`mt-1 ${seoErrors.metaTitle ? 'border-destructive' : ''}`}
            />
            {seoErrors.metaTitle && (
              <p className="text-xs text-destructive mt-1">{seoErrors.metaTitle}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Meta Descripción ({analysis.metaDescriptionLength}/160)
            </label>
            <Textarea
              value={post.meta_description || ''}
              onChange={(e) => updatePost({ meta_description: e.target.value })}
              placeholder="Descripción atractiva para SEO..."
              className={`mt-1 resize-none ${seoErrors.metaDescription ? 'border-destructive' : ''}`}
              rows={3}
            />
            {seoErrors.metaDescription && (
              <p className="text-xs text-destructive mt-1">{seoErrors.metaDescription}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* URL Slug */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash className="h-4 w-4" />
            URL Slug
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSlug}
            disabled={!post.title}
            className="flex items-center gap-1"
          >
            <Wand2 className="h-3 w-3" />
            Regenerar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Input
              value={post.slug || ''}
              onChange={(e) => updatePost({ slug: e.target.value })}
              placeholder="url-del-post"
              className={`font-mono text-xs ${seoErrors.slug ? 'border-destructive' : ''}`}
            />
            {seoErrors.slug && (
              <p className="text-xs text-destructive mt-1">{seoErrors.slug}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isCheckingSlug ? (
              <Clock className="h-3 w-3 animate-spin" />
            ) : analysis.isSlugUnique ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
            )}
            <span>
              {isCheckingSlug 
                ? 'Verificando disponibilidad...' 
                : analysis.isSlugUnique 
                  ? 'Slug disponible' 
                  : 'Slug ya existe'
              }
            </span>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <div className="flex items-center gap-1 mb-1">
              <Eye className="h-3 w-3" />
              <span className="font-medium">Preview URL:</span>
            </div>
            <code className="text-primary">
              {window.location.origin}/blog/{post.slug || 'tu-post'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* SEO Suggestions */}
      {analysis.suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Sugerencias de Mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogSEOPanel;
