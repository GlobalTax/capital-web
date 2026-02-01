import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';
import { Loader2 } from 'lucide-react';
import BlogPreviewBanner from '@/components/admin/blog/BlogPreviewBanner';
import { useToast } from '@/hooks/use-toast';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogProseContent } from '@/components/blog/BlogProseContent';

const BlogPreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePost } = useBlogPosts();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el post.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, toast]);

  const handlePublish = async () => {
    if (!post) return;
    
    try {
      await updatePost(post.id, { is_published: true });
      toast({
        title: "Publicado",
        description: "El post ha sido publicado correctamente.",
      });
      window.open(`/blog/${post.slug}`, '_blank');
      navigate('/admin/blog-v2');
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Post no encontrado</p>
        <button 
          onClick={() => navigate('/admin/blog-v2')}
          className="text-primary hover:underline"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner de borrador */}
      {!post.is_published && (
        <BlogPreviewBanner 
          postId={post.id} 
          onPublish={handlePublish}
        />
      )}

      {/* Contenido del post */}
      <article className={`max-w-4xl mx-auto px-4 py-8 ${!post.is_published ? 'pt-20' : ''}`}>
        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={post.featured_image_url} 
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* Category & Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span>{post.reading_time} min de lectura</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {post.title}
        </h1>

        {/* Author & Date */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b">
          {post.author_avatar_url && (
            <img 
              src={post.author_avatar_url} 
              alt={post.author_name}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{post.author_name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(post.published_at || post.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-muted px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <BlogProseContent content={post.content} />
      </article>
    </div>
  );
};

export default BlogPreviewPage;
