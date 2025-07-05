import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, Calendar, Tag, Search, Filter, Sparkles } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPost, BlogPostFormData } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import { useSimpleAI } from '@/hooks/useSimpleAI';
import BlogDashboard from './BlogDashboard';

const BlogPostsManagerSimplified = () => {
  const { posts, isLoading, createPost, updatePost, deletePost, fetchPosts } = useBlogPosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
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
  const { toast } = useToast();
  
  // Hook de IA
  const { isGenerating, generateTitle, generateContent, optimizeForSEO } = useSimpleAI({
    onContentGenerated: (content: string) => {
      // Determinar qué hacer con el contenido generado basado en el contexto
      if (content.includes('Meta título:')) {
        const lines = content.split('\n');
        const metaTitle = lines.find(line => line.includes('Meta título'))?.split(':')[1]?.trim() || '';
        const metaDescription = lines.find(line => line.includes('Meta descripción'))?.split(':')[1]?.trim() || '';
        setFormData(prev => ({
          ...prev,
          meta_title: metaTitle || prev.meta_title,
          meta_description: metaDescription || prev.meta_description
        }));
      } else if (content.startsWith('#')) {
        // Es contenido markdown
        setFormData(prev => ({ ...prev, content }));
      } else {
        // Es un título
        handleTitleChange(content);
      }
    }
  });

  const categories = ['M&A', 'Valoración', 'Due Diligence', 'Análisis', 'Estrategia', 'Financiación', 'Legal', 'Fiscal'];

  const resetForm = () => {
    setFormData({
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
    setEditingPost(null);
    setShowAIAssistant(false);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const postData = {
        ...formData,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingPost) {
        await updatePost(editingPost.id, postData);
      } else {
        await createPost(postData);
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
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
    setIsDialogOpen(true);
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

  // Filtrar posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && post.is_published) ||
                         (filterStatus === 'draft' && !post.is_published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y botón crear */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blog Posts</h2>
          <p className="text-muted-foreground">Gestiona el contenido de tu blog de forma simple</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Editar Post' : 'Crear Nuevo Post'}
              </DialogTitle>
              <DialogDescription>
                Crea contenido de calidad para tu blog
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Título del post..."
                  required
                />
              </div>

              {/* Asistente IA */}
              <Card className="border-dashed border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Asistente IA
                    </CardTitle>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAIAssistant(!showAIAssistant)}
                    >
                      {showAIAssistant ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </div>
                  <CardDescription>
                    Deja que la IA te ayude a crear contenido excepcional
                  </CardDescription>
                </CardHeader>
                {showAIAssistant && (
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        onClick={() => generateTitle()}
                        disabled={isGenerating}
                      >
                        ✨ {isGenerating ? 'Generando...' : 'Generar título atractivo'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        onClick={() => generateContent(formData.title || 'Artículo sobre M&A', formData.category)}
                        disabled={isGenerating || !formData.title}
                      >
                        📝 {isGenerating ? 'Creando...' : 'Crear contenido completo'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        onClick={() => optimizeForSEO(formData.title, formData.content)}
                        disabled={isGenerating || !formData.title}
                      >
                        🔍 {isGenerating ? 'Optimizando...' : 'Optimizar para SEO'}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Categoría y configuración básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="reading_time">Tiempo lectura (min)</Label>
                  <Input
                    id="reading_time"
                    type="number"
                    value={formData.reading_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                  />
                </div>
              </div>

              {/* Extracto */}
              <div>
                <Label htmlFor="excerpt">Extracto</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Breve descripción del post..."
                  rows={3}
                />
              </div>

              {/* Contenido */}
              <div>
                <Label htmlFor="content">Contenido *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe tu contenido aquí (acepta Markdown)..."
                  rows={15}
                  required
                  className="font-mono text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="tag1, tag2, tag3..."
                />
              </div>

              {/* Configuración de publicación */}
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                  <Label htmlFor="is_published">Publicado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured">Destacado</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {editingPost ? 'Actualizar' : 'Crear'} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard */}
      {showDashboard && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Dashboard del Blog</CardTitle>
                <CardDescription>Resumen de actividad y métricas</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDashboard(false)}
              >
                Ocultar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BlogDashboard />
          </CardContent>
        </Card>
      )}

      {!showDashboard && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDashboard(true)}
              className="w-full"
            >
              Mostrar Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de posts */}
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    {post.is_featured && (
                      <Badge variant="secondary">Destacado</Badge>
                    )}
                    {post.is_published ? (
                      <Badge className="bg-success text-success-foreground">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="outline">Borrador</Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm mb-2">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {post.category}
                    </span>
                    <span>{post.reading_time} min lectura</span>
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.published_at)}
                      </span>
                    )}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
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
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-muted-foreground text-lg">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'No se encontraron posts con los filtros aplicados.'
                : 'No hay posts creados aún.'
              }
            </p>
            {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
              <p className="text-sm text-muted-foreground mt-1">
                Crea tu primer post para comenzar.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogPostsManagerSimplified;