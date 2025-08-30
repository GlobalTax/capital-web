import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Sparkles, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { BlogPost, BlogPostFormData } from '@/types/blog';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useToast } from '@/hooks/use-toast';
import { useBlogValidation } from '@/hooks/useBlogValidation';
import RichTextEditor from './RichTextEditor';
import AuthorSelector from './AuthorSelector';
import AIContentAssistant from './AIContentAssistant';
import ReactMarkdown from 'react-markdown';

interface EnhancedBlogEditorProps {
  post?: BlogPost | null;
  onClose: () => void;
  onSave: () => void;
}

const EnhancedBlogEditor: React.FC<EnhancedBlogEditorProps> = ({ post, onClose, onSave }) => {
  const { createPost, updatePost } = useBlogPosts();
  const { toast } = useToast();
  const { errors, validatePost, clearErrors } = useBlogValidation();
  
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

  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [wordCount, setWordCount] = useState(0);

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

  // Auto-save functionality
  useEffect(() => {
    if (!post) return; // Only auto-save existing posts
    
    const autoSaveInterval = setInterval(() => {
      if (formData.title && formData.content) {
        handleSave(true);
      }
    }, 180000); // 3 minutes

    return () => clearInterval(autoSaveInterval);
  }, [formData.title, formData.content, post]);

  // Word count and reading time calculation
  useEffect(() => {
    const text = formData.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    setWordCount(words);
    
    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.max(1, Math.ceil(words / 200));
    setFormData(prev => ({ ...prev, reading_time: readingTime }));
  }, [formData.content]);

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
      meta_title: prev.meta_title || title
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSave = async (isAutoSave = false) => {
    if (!isAutoSave && !validatePost(formData as any)) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
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

      clearErrors();
      if (!isAutoSave) {
        toast({
          title: "Éxito",
          description: post ? "Post actualizado correctamente" : "Post creado correctamente",
        });
        onSave();
      }
    } catch (error) {
      console.error('Error saving post:', error);
      if (!isAutoSave) {
        toast({
          title: "Error",
          description: "No se pudo guardar el post",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const publishData = { ...formData, is_published: true };
    if (!validatePost(publishData as any)) {
      toast({
        title: "No se puede publicar",
        description: "Completa todos los campos requeridos antes de publicar",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({ ...prev, is_published: true }));
    await handleSave();
  };

  const handleAIContentGenerated = (content: string, type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags') => {
    switch (type) {
      case 'title':
        const titles = content.split('\n').filter(t => t.trim());
        if (titles.length > 0) {
          handleTitleChange(titles[0].replace(/^[\d.-]\s*/, ''));
        }
        break;
      case 'content':
        setFormData(prev => ({ ...prev, content }));
        break;
      case 'excerpt':
        setFormData(prev => ({ ...prev, excerpt: content.substring(0, 300) }));
        break;
      case 'seo':
        const lines = content.split('\n').filter(l => l.trim());
        const metaTitle = lines.find(l => l.includes('título') || l.includes('title'))?.replace(/^[\d.-]\s*(Meta título:|Título:)?\s*/i, '') || '';
        const metaDesc = lines.find(l => l.includes('descripción') || l.includes('description'))?.replace(/^[\d.-]\s*(Meta descripción:|Descripción:)?\s*/i, '') || '';
        
        setFormData(prev => ({
          ...prev,
          meta_title: metaTitle.substring(0, 60),
          meta_description: metaDesc.substring(0, 160)
        }));
        break;
      case 'tags':
        const tags = content.split(',').map(tag => tag.trim().replace(/^[\d.-]\s*/, '')).filter(tag => tag.length > 0);
        setFormData(prev => ({ ...prev, tags }));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">
                {post ? 'Editar Post' : 'Nuevo Post'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {wordCount} palabras • {formData.reading_time} min lectura
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {showAI ? 'Ocultar IA' : 'Asistente IA'}
            </Button>

            {formData.is_published && formData.slug && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista previa
              </Button>
            )}

            <Button
              onClick={() => handleSave()}
              disabled={saving}
              variant="outline"
              className="flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Borrador
            </Button>

            <Button
              onClick={handlePublish}
              disabled={saving || formData.is_published}
              className="flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {formData.is_published ? 'Publicado' : 'Publicar Ahora'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto p-6">
          <Tabs defaultValue="editor" className="space-y-6">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Vista previa</TabsTrigger>
              <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Título del post..."
                  className={`text-3xl font-bold border-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground ${
                    errors.title ? 'border-destructive' : ''
                  }`}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <Label className="text-sm text-muted-foreground">URL del post:</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-del-post"
                  className="font-mono text-sm mt-1"
                />
              </div>

              {/* Excerpt */}
              <div>
                <Label className="text-base font-medium">Extracto</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Breve descripción del post..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Rich Text Editor */}
              <RichTextEditor
                label="Contenido"
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Escribe tu contenido aquí..."
                error={errors.content}
              />
            </TabsContent>

            <TabsContent value="preview">
              <article className="prose prose-lg max-w-none dark:prose-invert">
                <header className="mb-8">
                  <h1 className="mb-4">{formData.title || 'Título del post'}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>Por {formData.author_name}</span>
                    <span>•</span>
                    <span>{formData.reading_time} min de lectura</span>
                    {formData.category && (
                      <>
                        <span>•</span>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                          {formData.category}
                        </span>
                      </>
                    )}
                  </div>
                  {formData.excerpt && (
                    <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4">
                      {formData.excerpt}
                    </p>
                  )}
                </header>
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              </article>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Optimización SEO</h3>
                <div>
                  <Label>Meta Título ({formData.meta_title.length}/60)</Label>
                  <Input
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value.substring(0, 60) }))}
                    placeholder="Título para buscadores..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Meta Descripción ({formData.meta_description.length}/160)</Label>
                  <Textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value.substring(0, 160) }))}
                    placeholder="Descripción para buscadores..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Sidebar */}
        <aside className="w-80 border-l border-border bg-muted/20 p-6 space-y-6">
          {/* Author Selector */}
          <AuthorSelector
            authorName={formData.author_name}
            authorAvatarUrl={formData.author_avatar_url}
            onAuthorChange={(name, avatarUrl) => 
              setFormData(prev => ({ ...prev, author_name: name, author_avatar_url: avatarUrl || '' }))
            }
          />

          {/* Post Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Configuración</h3>
            
            <div>
              <Label>Categoría</Label>
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
              <Label>Tags</Label>
              <Input
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="tag1, tag2, tag3..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Destacado</Label>
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
            </div>
          </div>

          {/* AI Assistant */}
          {showAI && (
            <AIContentAssistant
              onContentGenerated={handleAIContentGenerated}
              currentTitle={formData.title}
              currentContent={formData.content}
              className="border-t pt-6"
            />
          )}
        </aside>
      </div>
    </div>
  );
};

export default EnhancedBlogEditor;