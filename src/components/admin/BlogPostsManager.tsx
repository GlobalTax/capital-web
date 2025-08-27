import React, { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Calendar, Tag, Sparkles } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPost, BlogPostFormData } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import AIContentGenerator from './AIContentGenerator';

const BlogPostsManager = memo(() => {
  const { posts, isLoading, createPost, updatePost, deletePost, fetchPosts } = useBlogPosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [aiGenerationType, setAiGenerationType] = useState<'title' | 'content' | 'excerpt' | 'seo' | 'tags'>('title');
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

  const handleAIGeneration = (type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags') => {
    setAiGenerationType(type);
    setAiGeneratorOpen(true);
  };

  const handleAIContentGenerated = (content: string) => {
    switch (aiGenerationType) {
      case 'title':
        // Si el contenido tiene múltiples títulos, tomar el primero
        const titles = content.split('\n').filter(line => line.trim());
        const selectedTitle = titles[0].replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
        handleTitleChange(selectedTitle);
        break;
      case 'content':
        setFormData(prev => ({ ...prev, content }));
        break;
      case 'excerpt':
        setFormData(prev => ({ ...prev, excerpt: content }));
        break;
      case 'seo':
        // Parsear el contenido SEO
        const lines = content.split('\n');
        const metaTitle = lines.find(line => line.includes('Meta título') || line.includes('título'))?.split(':')[1]?.trim() || '';
        const metaDescription = lines.find(line => line.includes('Meta descripción') || line.includes('descripción'))?.split(':')[1]?.trim() || '';
        setFormData(prev => ({
          ...prev,
          meta_title: metaTitle || prev.meta_title,
          meta_description: metaDescription || prev.meta_description
        }));
        break;
      case 'tags':
        // Parsear los tags generados
        const tagsList = content.split(/[,\n]/).map(tag => 
          tag.trim().replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim()
        ).filter(tag => tag.length > 0);
        setFormData(prev => ({ ...prev, tags: tagsList }));
        break;
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-black">Gestión de Blog</h2>
          <p className="text-gray-600">Crea y gestiona los posts del blog con ayuda de IA</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-black text-white border border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Editar Post' : 'Crear Nuevo Post'}</DialogTitle>
              <DialogDescription>
                {editingPost ? 'Modifica los detalles del post' : 'Completa la información para crear un nuevo post'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenido</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAIGeneration('title')}
                          className="flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          IA
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Extracto</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Textarea
                          id="excerpt"
                          value={formData.excerpt}
                          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                          rows={3}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAIGeneration('excerpt')}
                          className="flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          IA
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Contenido (Markdown) *</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2 mb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAIGeneration('content')}
                          className="flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          Generar Artículo Completo
                        </Button>
                      </div>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={15}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
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
                      <Label htmlFor="reading_time">Tiempo de lectura (min)</Label>
                      <Input
                        id="reading_time"
                        type="number"
                        value={formData.reading_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (separadas por comas)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={formData.tags.join(', ')}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        placeholder="fusiones, adquisiciones, valoración"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIGeneration('tags')}
                        className="flex items-center gap-1"
                        disabled={!formData.title && !formData.content}
                      >
                        <Sparkles className="h-3 w-3" />
                        IA
                      </Button>
                    </div>
                  </div>

                  {/* ... keep existing code (author_name, featured_image_url, switches) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="author_name">Autor</Label>
                      <Input
                        id="author_name"
                        value={formData.author_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="featured_image_url">URL Imagen Destacada</Label>
                      <Input
                        id="featured_image_url"
                        value={formData.featured_image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                      />
                    </div>
                  </div>

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
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIGeneration('seo')}
                      className="flex items-center gap-1"
                      disabled={!formData.title}
                    >
                      <Sparkles className="h-3 w-3" />
                      Optimizar SEO con IA
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor="meta_title">Meta Título</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Descripción</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPost ? 'Actualizar' : 'Crear'} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {(posts || []).map((post) => (
          <Card key={post.id} className="border-0.5 border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    {post.is_featured && (
                      <Badge variant="secondary">Destacado</Badge>
                    )}
                    {post.is_published ? (
                      <Badge className="bg-green-100 text-green-800">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="outline">Borrador</Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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

      {(posts || []).length === 0 && (
        <Card className="border-0.5 border-border">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No hay posts creados aún.</p>
            <p className="text-sm text-gray-400 mt-1">Crea tu primer post para comenzar.</p>
          </CardContent>
        </Card>
      )}

      <AIContentGenerator
        isOpen={aiGeneratorOpen}
        onClose={() => setAiGeneratorOpen(false)}
        onContentGenerated={handleAIContentGenerated}
        type={aiGenerationType}
        currentTitle={formData.title}
        currentContent={formData.content}
        category={formData.category}
      />
    </div>
  );
});

BlogPostsManager.displayName = 'BlogPostsManager';

export default BlogPostsManager;
