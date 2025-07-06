import { useEffect } from 'react';
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
  Wand2
} from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { useBlogSEO } from '@/hooks/useBlogSEO';
import { Separator } from '@/components/ui/separator';

interface BlogSEOPanelProps {
  post: BlogPost;
  updatePost: (updates: Partial<BlogPost>) => void;
}

const BlogSEOPanel = ({ post, updatePost }: BlogSEOPanelProps) => {
  const { 
    analysis, 
    seoErrors, 
    isCheckingSlug, 
    analyzePost, 
    generateSlug, 
    generateMetaTags 
  } = useBlogSEO();

  // Analizar el post cuando cambie
  useEffect(() => {
    if (post.title || post.content || post.slug) {
      analyzePost(post);
    }
  }, [post.title, post.content, post.slug, post.meta_title, post.meta_description]);

  // Auto-generar slug cuando cambie el título
  useEffect(() => {
    if (post.title && !post.slug) {
      const newSlug = generateSlug(post.title);
      updatePost({ slug: newSlug });
    }
  }, [post.title]);

  // Auto-actualizar tiempo de lectura
  useEffect(() => {
    if (analysis.readingTime !== post.reading_time) {
      updatePost({ reading_time: analysis.readingTime });
    }
  }, [analysis.readingTime]);

  const handleAutoGenerateMetaTags = () => {
    const metaUpdates = generateMetaTags(post);
    updatePost(metaUpdates);
  };

  const handleGenerateSlug = () => {
    if (post.title) {
      const newSlug = generateSlug(post.title);
      updatePost({ slug: newSlug });
    }
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
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
            className="flex items-center gap-1"
          >
            <Wand2 className="h-3 w-3" />
            Auto-generar
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