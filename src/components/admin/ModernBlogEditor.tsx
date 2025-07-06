import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Book, Download, Share2, Sparkles, Save, X, Wand2 } from 'lucide-react';
import { BlogPost, BlogPostFormData } from '@/types/blog';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useRealAI } from '@/hooks/useRealAI';
import { useToast } from '@/hooks/use-toast';

interface ModernBlogEditorProps {
  post?: BlogPost | null;
  onClose: () => void;
  onSave: () => void;
}

const ModernBlogEditor: React.FC<ModernBlogEditorProps> = ({ post, onClose, onSave }) => {
  const { createPost, updatePost } = useBlogPosts();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    author_name: 'Equipo Capittal',
    author_avatar_url: '',
    category: '',
    tags: [],
    reading_time: 5,
    is_published: false,
    is_featured: false,
    meta_title: '',
    meta_description: '',
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOptions, setAiOptions] = useState({
    length: 'medio' as 'corto' | 'medio' | 'largo',
    tone: 'profesional' as 'profesional' | 'técnico' | 'divulgativo'
  });

  const { isGenerating, generateTitle, generateContent, optimizeForSEO } = useRealAI({
    onContentGenerated: (content: string, type: 'title' | 'content' | 'seo') => {
      if (type === 'title') {
        handleTitleChange(content);
      } else if (type === 'content') {
        setFormData(prev => ({ ...prev, content }));
      } else if (type === 'seo') {
        const lines = content.split('\n');
        const metaTitle = lines.find(line => line.includes('Meta título'))?.split(':')[1]?.trim() || '';
        const metaDescription = lines.find(line => line.includes('Meta descripción'))?.split(':')[1]?.trim() || '';
        setFormData(prev => ({
          ...prev,
          meta_title: metaTitle || prev.meta_title,
          meta_description: metaDescription || prev.meta_description
        }));
      }
    }
  });

  const categories = ['M&A', 'Valoración', 'Due Diligence', 'Análisis', 'Estrategia', 'Financiación', 'Legal', 'Fiscal'];

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        featured_image_url: post.featured_image_url || '',
        author_name: post.author_name,
        author_avatar_url: post.author_avatar_url || '',
        category: post.category,
        tags: post.tags || [],
        reading_time: post.reading_time,
        is_published: post.is_published,
        is_featured: post.is_featured,
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
      });
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      meta_title: title
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSave = async () => {
    try {
      const postData = {
        ...formData,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (post) {
        await updatePost(post.id, postData);
      } else {
        await createPost(postData);
      }

      toast({
        title: "Éxito",
        description: post ? "Post actualizado correctamente" : "Post creado correctamente",
      });

      onSave();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <div className="grid gap-0 md:grid-cols-12 h-full">
      {/* Sidebar */}
      <div className="order-last md:order-none md:col-span-4 lg:col-span-3 border-r border-border bg-muted/20 p-6">
        <aside className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{post ? 'Editar Post' : 'Nuevo Post'}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Post Info */}
          <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
            <div className="border-border bg-muted/50 border-b px-4 py-3">
              <h3 className="flex items-center text-sm font-semibold">
                <Book className="text-muted-foreground mr-2 size-3.5" />
                Información del Post
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="category" className="text-sm">Categoría</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reading_time" className="text-sm">Tiempo lectura (min)</Label>
                <Input
                  id="reading_time"
                  type="number"
                  value={formData.reading_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tags" className="text-sm">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="tag1, tag2, tag3..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_published" className="text-sm">Publicado</Label>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured" className="text-sm">Destacado</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
            <div className="border-border bg-muted/50 border-b px-4 py-3">
              <h3 className="flex items-center text-sm font-semibold">
                <Sparkles className="text-muted-foreground mr-2 size-3.5" />
                Asistente IA
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="ai-prompt" className="text-sm">Prompt Personalizado</Label>
                <Textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Escribe exactamente lo que quieres que genere la IA... 
Ejemplo: 'Crea un artículo sobre tendencias M&A en el sector fintech español para 2024'"
                  rows={3}
                  className="mt-1 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Longitud</Label>
                  <Select 
                    value={aiOptions.length} 
                    onValueChange={(value: 'corto' | 'medio' | 'largo') => 
                      setAiOptions(prev => ({ ...prev, length: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corto">Corto</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="largo">Largo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">Tono</Label>
                  <Select 
                    value={aiOptions.tone} 
                    onValueChange={(value: 'profesional' | 'técnico' | 'divulgativo') => 
                      setAiOptions(prev => ({ ...prev, tone: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profesional">Profesional</SelectItem>
                      <SelectItem value="técnico">Técnico</SelectItem>
                      <SelectItem value="divulgativo">Divulgativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    if (!aiPrompt) {
                      toast({
                        title: "Prompt requerido",
                        description: "Escribe lo que quieres generar",
                        variant: "destructive"
                      });
                      return;
                    }
                    generateContent(aiPrompt, {
                      category: formData.category,
                      length: aiOptions.length,
                      tone: aiOptions.tone
                    });
                  }}
                  disabled={isGenerating || !aiPrompt}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generando...' : 'Generar Contenido'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => generateTitle(formData.category, aiPrompt)}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generando...' : 'Solo Título'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => optimizeForSEO(formData.title, formData.content)}
                  disabled={isGenerating || !formData.title}
                >
                  {isGenerating ? 'Optimizando...' : 'Optimizar SEO'}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p><strong>Ejemplos de prompts:</strong></p>
                <ul className="mt-1 space-y-1">
                  <li>• "Análisis del mercado M&A español en 2024"</li>
                  <li>• "Guía práctica de due diligence comercial"</li>
                  <li>• "Tendencias valoración empresarial post-COVID"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
            <div className="border-border bg-muted/50 border-b px-4 py-3">
              <h3 className="flex items-center text-sm font-semibold">
                <Save className="text-muted-foreground mr-2 size-3.5" />
                Acciones
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <Button 
                className="w-full"
                onClick={handleSave}
              >
                {post ? 'Actualizar Post' : 'Crear Post'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="md:col-span-8 lg:col-span-9 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-base font-medium">Título del Post</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Escribe un título atractivo..."
              className="mt-2 text-lg"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug" className="text-sm font-medium text-muted-foreground">URL del Post</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="url-del-post"
              className="mt-1 text-sm font-mono"
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt" className="text-base font-medium">Extracto</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Breve descripción del post..."
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Content Editor */}
          <div>
            <Label htmlFor="content" className="text-base font-medium">Contenido</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Escribe tu contenido aquí (acepta Markdown)..."
              rows={20}
              className="mt-2 font-mono text-sm"
            />
          </div>

          {/* SEO Fields */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium">Optimización SEO</h3>
            <div>
              <Label htmlFor="meta_title" className="text-sm font-medium">Meta Título</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                placeholder="Título para buscadores..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="meta_description" className="text-sm font-medium">Meta Descripción</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="Descripción para buscadores..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernBlogEditor;