import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, Sparkles, Loader2 } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useToast } from '@/hooks/use-toast';
import BlogEditorContent from '@/components/admin/blog/BlogEditorContent';
import BlogEditorSidebar from '@/components/admin/blog/BlogEditorSidebar';
import BlogAIAssistant from '@/components/admin/blog/BlogAIAssistant';

const BlogEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, createPost, updatePost: updatePostHook, isLoading } = useBlogPosts();
  const { toast } = useToast();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !post) return;
    
    const autoSave = setTimeout(() => {
      handleSave(true);
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [post, hasUnsavedChanges]);

  useEffect(() => {
    if (id && id !== 'new') {
      const existingPost = posts.find(p => p.id === id);
      if (existingPost) {
        setPost(existingPost);
      } else {
        toast({
          title: "Post no encontrado",
          description: "El post que buscas no existe",
          variant: "destructive",
        });
        navigate('/admin/blog-v2');
      }
    } else {
      // New post
      setPost({
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author_name: 'Equipo Capittal',
        category: '',
        tags: [],
        reading_time: 5,
        is_published: false,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        meta_title: '',
        meta_description: '',
      });
    }
  }, [id, posts]);

  const handleSave = async (isAutoSave = false) => {
    if (!post) return;
    
    setSaving(true);
    try {
      const postData = {
        ...post,
        published_at: post.is_published ? new Date().toISOString() : null,
      };

      if (id && id !== 'new') {
        await updatePostHook(id, postData);
      } else {
        const newPost = await createPost(postData);
        if (newPost) {
          navigate(`/admin/blog/edit/${newPost.id}`, { replace: true });
        }
      }

      setHasUnsavedChanges(false);
      
      if (!isAutoSave) {
        toast({
          title: "Guardado",
          description: id && id !== 'new' ? "Post actualizado" : "Post creado",
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePostData = (updates: Partial<BlogPost>) => {
    if (!post) return;
    setPost({ ...post, ...updates });
    setHasUnsavedChanges(true);
  };

  if (isLoading || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/blog-v2')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">
                {id === 'new' ? 'Nuevo Post' : 'Editar Post'}
              </h1>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  Cambios sin guardar
                </Badge>
              )}
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
              IA
            </Button>
            
            {post.is_published && post.slug && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista previa
              </Button>
            )}

            <Button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Content Area */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
          <Tabs defaultValue="editor" className="space-y-6">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Vista previa</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={post.title}
                  onChange={(e) => updatePostData({ 
                    title: e.target.value,
                    slug: e.target.value.toLowerCase()
                      .replace(/[áàäâ]/g, 'a')
                      .replace(/[éèëê]/g, 'e')
                      .replace(/[íìïî]/g, 'i')
                      .replace(/[óòöô]/g, 'o')
                      .replace(/[úùüû]/g, 'u')
                      .replace(/ñ/g, 'n')
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-'),
                    meta_title: post.meta_title || e.target.value
                  })}
                  placeholder="Título del post..."
                  className="text-3xl font-bold border-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground"
                />
              </div>

              <BlogEditorContent post={post} updatePost={updatePostData} />
            </TabsContent>

            <TabsContent value="preview">
              <div className="prose prose-lg max-w-none">
                <h1>{post.title}</h1>
                <div className="whitespace-pre-wrap">{post.content}</div>
              </div>
            </TabsContent>

            <TabsContent value="seo">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Meta Título</label>
                  <Input
                    value={post.meta_title || ''}
                    onChange={(e) => updatePostData({ meta_title: e.target.value })}
                    placeholder="Título para SEO..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Meta Descripción</label>
                  <Input
                    value={post.meta_description || ''}
                    onChange={(e) => updatePostData({ meta_description: e.target.value })}
                    placeholder="Descripción para SEO..."
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Sidebar */}
        <aside className="w-80 border-l border-border bg-background">
          <BlogEditorSidebar post={post} updatePost={updatePostData} />
        </aside>
      </div>

      {/* AI Assistant */}
      {showAI && (
        <BlogAIAssistant
          post={post}
          updatePost={updatePostData}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
};

export default BlogEditorPage;