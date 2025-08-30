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
import { useBlogValidation } from '@/hooks/useBlogValidation';
import EnhancedBlogEditor from '@/components/admin/blog/EnhancedBlogEditor';

const BlogEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, createPost, updatePost: updatePostHook, isLoading } = useBlogPosts();
  const { toast } = useToast();
  const { errors, validatePost, clearErrors } = useBlogValidation();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality - SIMPLIFICADO
  useEffect(() => {
    if (!hasUnsavedChanges || !post) return;
    
    const autoSave = setTimeout(() => {
      if (post.title && post.content) { // Solo auto-guardar si hay contenido básico
        handleSave(true);
      }
    }, 300000); // Auto-save cada 5 minutos en lugar de 30 segundos

    return () => clearTimeout(autoSave);
  }, [post?.title, post?.content]); // Solo vigilar cambios críticos

  useEffect(() => {
    if (id && id !== 'new') {
      const existingPost = (posts || []).find(p => p.id === id);
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
    
    // Validar solo en guardado manual, no en auto-save
    if (!isAutoSave && !validatePost(post)) {
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
      clearErrors();
      
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
    <EnhancedBlogEditor 
      post={post} 
      onClose={() => navigate('/admin/blog-v2')} 
      onSave={() => {
        setHasUnsavedChanges(false);
        navigate('/admin/blog-v2');
      }} 
    />
  );
};

export default BlogEditorPage;