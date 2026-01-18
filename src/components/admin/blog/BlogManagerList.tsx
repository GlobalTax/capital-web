import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye, Sparkles } from 'lucide-react';
import { QuickCreateBlogModal } from './QuickCreateBlogModal';
import { BlogPost } from '@/types/blog';
import { useNavigate } from 'react-router-dom';

interface BlogManagerListProps {
  posts: BlogPost[];
  onDelete: (id: string) => void;
}

const BlogManagerList = ({ posts, onDelete }: BlogManagerListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const categories = Array.from(new Set(posts.map(post => post.category))).filter(Boolean);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || post.category === categoryFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || 
                         (statusFilter === 'published' && post.is_published) ||
                         (statusFilter === 'draft' && !post.is_published) ||
                         (statusFilter === 'featured' && post.is_featured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Blog</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tu contenido con herramientas modernas
            </p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <QuickCreateBlogModal onPostCreated={(id) => navigate(`/admin/blog/edit/${id}`)}>
              <Button variant="outline" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Creación Rápida
              </Button>
            </QuickCreateBlogModal>
            
            <Button 
              onClick={() => navigate('/admin/blog/new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Post
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
                <SelectItem value="featured">Destacados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex gap-1">
                      {post.is_published ? (
                        <Badge variant="default" className="text-xs bg-success text-success-foreground">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Borrador
                        </Badge>
                      )}
                      {post.is_featured && (
                        <Badge variant="outline" className="text-xs">
                          Destacado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    className="font-semibold line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author_name}</span>
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      title={post.is_published ? "Ver post publicado" : "Vista previa del borrador"}
                      onClick={() => {
                        if (post.is_published) {
                          window.open(`/blog/${post.slug}`, '_blank');
                        } else {
                          window.open(`/admin/blog/preview/${post.id}`, '_blank');
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id, post.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No hay posts</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter || statusFilter
                ? 'No se encontraron posts con los filtros aplicados.'
                : 'Aún no has creado ningún post.'
              }
            </p>
            <Button onClick={() => navigate('/admin/blog/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Crear tu primer post
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogManagerList;