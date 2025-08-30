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
import AIAssistantModal from './AIAssistantModal';
import BlogEditorSidebar from './BlogEditorSidebar';
import BlogSEOPanel from './BlogSEOPanel';
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
  const [wordCount, setWordCount] = useState(0);

  // Convert formData to BlogPost for components that need it
  const formDataAsBlogPost: BlogPost = {
    id: post?.id || '',
    created_at: post?.created_at || new Date().toISOString(),
    updated_at: post?.updated_at || new Date().toISOString(),
    published_at: formData.is_published ? (post?.published_at || new Date().toISOString()) : null,
    ...formData
  };

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

      console.log("💾 Saving blog post:", {
        postData: postData,
        isUpdate: !!post,
        postId: post?.id,
        operation: formData.is_published ? 'PUBLISH' : 'DRAFT'
      });

      // FIXED: Better validation before saving
      if (post && post.id && post.id.trim() !== '') {
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
      console.error('💥 Error saving post:', {
        error: error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        formData: formData,
        operation: formData.is_published ? 'PUBLISH' : 'DRAFT'
      });
      
      if (!isAutoSave) {
        toast({
          title: "Error",
          description: `No se pudo guardar el post: ${error?.message || 'Error desconocido'}`,
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const publishData = { ...formData, is_published: true, published_at: new Date().toISOString() };
    
    console.log("🚀 PUBLISHING POST:", {
      title: publishData.title,
      slug: publishData.slug,
      is_published: publishData.is_published,
      published_at: publishData.published_at
    });
    
    if (!validatePost(publishData as any)) {
      toast({
        title: "No se puede publicar",
        description: "Completa todos los campos requeridos antes de publicar",
        variant: "destructive",
      });
      return;
    }

    // Update form data immediately and save with published status
    setFormData(publishData);
    
    setSaving(true);
    try {
      if (post && post.id && post.id.trim() !== '') {
        await updatePost(post.id, publishData);
      } else {
        await createPost(publishData);
      }

      clearErrors();
      toast({
        title: "¡Post publicado!",
        description: `Tu post está ahora visible en /blog/${publishData.slug}`,
      });
      onSave();
    } catch (error) {
      console.error('💥 Error publishing post:', error);
      toast({
        title: "Error al publicar",
        description: `No se pudo publicar el post: ${error?.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
            <AIAssistantModal
              onContentGenerated={handleAIContentGenerated}
              currentTitle={formData.title}
              currentContent={formData.content}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Asistente IA
              </Button>
            </AIAssistantModal>

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
        <Tabs defaultValue="editor" className="flex-1">
          <TabsList className="mb-6">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            {/* Title */}
            <div>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título del post..."
                className="text-xl font-bold border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>

            {/* Slug */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>URL:</span>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-del-post"
                className="font-mono text-xs h-8 max-w-xs"
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Extracto</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Breve descripción del post..."
                className="mt-2 resize-none"
                rows={3}
              />
            </div>

            {/* Rich Text Editor */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Contenido</Label>
              <div className="mt-2 border rounded-lg">
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Escribe tu contenido aquí..."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="prose max-w-none">
            {formData.featured_image_url && (
              <img 
                src={formData.featured_image_url} 
                alt={formData.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1>{formData.title || 'Título del post'}</h1>
            {formData.excerpt && (
              <p className="lead text-lg text-muted-foreground">{formData.excerpt}</p>
            )}
            <ReactMarkdown>{formData.content || 'Contenido del post...'}</ReactMarkdown>
          </TabsContent>

          <TabsContent value="seo">
            <BlogSEOPanel
              post={formDataAsBlogPost}
              updatePost={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            />
          </TabsContent>
        </Tabs>
        </main>

        {/* Sidebar */}
        <aside className="w-80 bg-muted/30 border-l overflow-y-auto">
          <BlogEditorSidebar
            post={formDataAsBlogPost}
            updatePost={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            errors={errors}
          />
        </aside>
      </div>
    </div>
  );
};

export default EnhancedBlogEditor;