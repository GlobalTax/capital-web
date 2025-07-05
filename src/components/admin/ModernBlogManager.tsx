import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPost } from '@/types/blog';
import { cn } from '@/lib/utils';
import ModernBlogEditor from './ModernBlogEditor';

const ModernBlogManager = () => {
  const { posts, isLoading, deletePost } = useBlogPosts();
  const [selectedCategory, setSelectedCategory] = useState("Todos los Posts");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const categories = [
    "Todos los Posts",
    ...Array.from(new Set(posts.map((post) => post.category))),
  ];

  const filteredPosts =
    selectedCategory === "Todos los Posts"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingPost(null);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      await deletePost(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col items-center gap-6 text-center">
            <Badge variant="secondary">Blog</Badge>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold lg:text-6xl">
                Gestión de Contenido
              </h1>
              <Button onClick={handleNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Post
              </Button>
            </div>
            <p className="text-balance lg:text-xl text-muted-foreground">
              Gestiona el contenido de tu blog con herramientas modernas y IA integrada.
              Crea artículos profesionales sobre M&A, valoraciones y análisis empresariales.
            </p>
          </div>
          
          <div className="mx-auto mt-20 grid max-w-7xl grid-cols-1 gap-20 lg:grid-cols-4">
            <div className="hidden flex-col gap-2 lg:flex">
              {categories.map((category) => (
                <Button
                  variant="ghost"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "justify-start text-left",
                    selectedCategory === category &&
                      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="lg:col-span-3">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <React.Fragment key={post.id}>
                    <div className="flex flex-col gap-3 group">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-muted-foreground">
                          {post.category}
                        </p>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {post.is_published && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-semibold text-balance lg:text-3xl cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleEdit(post)}>
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground">{post.excerpt}</p>
                      
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="font-medium">{post.author_name}</span>
                        <span className="text-muted-foreground">
                          {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                        </span>
                        <span className="text-muted-foreground">
                          {post.reading_time} min lectura
                        </span>
                        {post.is_published ? (
                          <Badge variant="default" className="bg-success text-success-foreground">
                            Publicado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Borrador</Badge>
                        )}
                        {post.is_featured && (
                          <Badge variant="outline">Destacado</Badge>
                        )}
                      </div>
                    </div>
                    <Separator className="my-8" />
                  </React.Fragment>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-muted-foreground text-lg">
                    {selectedCategory !== 'Todos los Posts' 
                      ? `No hay posts en la categoría "${selectedCategory}".`
                      : 'No hay posts creados aún.'
                    }
                  </p>
                  <Button onClick={handleNew} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear tu primer post
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
          <ModernBlogEditor 
            post={editingPost} 
            onClose={() => setIsEditorOpen(false)}
            onSave={() => {
              setIsEditorOpen(false);
              window.location.reload(); // Refresh the posts list
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModernBlogManager;