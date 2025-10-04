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
import { Plus, Edit, Trash2, Eye, Calendar, Tag, Brain, Zap } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPost, BlogPostFormData } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import AIContentStudioPro from './AIContentStudioPro';

const BlogPostsManagerV2 = memo(() => {
  const { posts, isLoading, createPost, updatePost, deletePost, fetchPosts } = useBlogPosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [aiStudioOpen, setAiStudioOpen] = useState(false);
  const [aiStudioType, setAiStudioType] = useState<'title' | 'content' | 'excerpt' | 'seo' | 'tags' | 'research'>('title');
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

  const handleAIStudio = (type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags' | 'research') => {
    setAiStudioType(type);
    setAiStudioOpen(true);
  };

  const handleAIContentGenerated = (content: string) => {
    switch (aiStudioType) {
      case 'title':
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
        const tagsList = content.split(/[,\n]/).map(tag => 
          tag.trim().replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim()
        ).filter(tag => tag.length > 0);
        setFormData(prev => ({ ...prev, tags: tagsList }));
        break;
      case 'research':
        // Para research, podríamos abrir un modal separado o agregar al contenido
        toast({
          title: "Investigación completada",
          description: "Usa la información generada para enriquecer tu artículo",
        });
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
          <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Content Studio Pro
          </h2>
          <p className="text-gray-600">La herramienta de IA más avanzada para crear contenido M&A de clase mundial</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-primary text-primary-foreground border-0 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Post Pro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                {editingPost ? 'Editar Post con IA' : 'Crear Nuevo Post con IA'}
              </DialogTitle>
              <DialogDescription>
                Utiliza la IA más avanzada para crear contenido de clase mundial
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenido IA</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                  <TabsTrigger value="seo">SEO Avanzado</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-6">
                  {/* Título con IA */}
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">Título *</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Escribe tu título o genera uno con IA..."
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAIStudio('title')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        IA
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Label htmlFor="slug" className="text-sm">Slug generado automáticamente</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="mt-1 bg-gray-50"
                        required
                      />
                    </div>
                  </div>

                  {/* Extracto con IA */}
                  <div>
                    <Label htmlFor="excerpt" className="text-base font-semibold">Extracto</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-2">
                        <Textarea
                          id="excerpt"
                          value={formData.excerpt}
                          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                          placeholder="El extracto se puede generar automáticamente..."
                          rows={3}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => handleAIStudio('excerpt')}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          IA
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Herramientas de investigación */}
                  <Card className="bg-muted border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        Asistente de Investigación IA
                      </CardTitle>
                      <CardDescription>
                        Investiga datos actuales del mercado M&A antes de escribir tu artículo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        onClick={() => handleAIStudio('research')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Investigar con IA
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Contenido con IA */}
                  <div>
                    <Label htmlFor="content" className="text-base font-semibold">Contenido (Markdown) *</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex gap-2 mb-2">
                        <Button
                          type="button"
                          onClick={() => handleAIStudio('content')}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Generar Artículo Completo con IA
                        </Button>
                      </div>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="El contenido se generará automáticamente con IA o puedes escribir aquí..."
                        rows={20}
                        required
                        className="font-mono text-sm"
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
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="tags"
                        value={formData.tags.join(', ')}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        placeholder="Los tags se pueden generar automáticamente..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAIStudio('tags')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!formData.title && !formData.content}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        IA
                      </Button>
                    </div>
                  </div>

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
                  <Card className="bg-muted border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-green-600" />
                        Optimización SEO con IA
                      </CardTitle>
                      <CardDescription>
                        Genera meta títulos y descripciones optimizadas automáticamente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        onClick={() => handleAIStudio('seo')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!formData.title}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Optimizar SEO con IA
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <div>
                    <Label htmlFor="meta_title">Meta Título</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="Se genera automáticamente desde el título"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Descripción</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      rows={3}
                      placeholder="Se puede generar automáticamente con IA"
                    />
                  </div>
                </TabsContent>
              </Tabs>

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

      {/* Lista de posts - mantenemos la funcionalidad existente */}
      <div className="grid gap-4">
        {(posts || []).map((post) => (
          <Card key={post.id} className="border-0.5 border-border hover:shadow-lg transition-shadow">
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
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay posts creados aún.</p>
            <p className="text-sm text-gray-400 mt-1">Crea tu primer post con IA para comenzar la revolución del contenido.</p>
          </CardContent>
        </Card>
      )}

      <AIContentStudioPro
        isOpen={aiStudioOpen}
        onClose={() => setAiStudioOpen(false)}
        onContentGenerated={handleAIContentGenerated}
        type={aiStudioType}
        currentTitle={formData.title}
        currentContent={formData.content}
        category={formData.category}
      />
    </div>
  );
});

BlogPostsManagerV2.displayName = 'BlogPostsManagerV2';

export default BlogPostsManagerV2;
