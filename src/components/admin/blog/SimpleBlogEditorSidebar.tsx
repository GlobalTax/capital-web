import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/types/blog';
import { Book, Settings, Globe, Image, Plus } from 'lucide-react';
import ImageUploadField from '@/components/admin/ImageUploadField';
import AuthorSelector from './AuthorSelector';
import { useBlogCategories } from '@/hooks/useBlogCategories';
import { useState } from 'react';

interface SimpleBlogEditorSidebarProps {
  post: BlogPost;
  updatePost: (updates: Partial<BlogPost>) => void;
  errors?: {
    category?: string;
    slug?: string;
  };
}

const SimpleBlogEditorSidebar = ({ post, updatePost, errors = {} }: SimpleBlogEditorSidebarProps) => {
  const { categories } = useBlogCategories();
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    updatePost({ tags });
  };

  const handleCategoryChange = (category: string) => {
    updatePost({ category });
  };

  const handleAuthorChange = (name: string, avatarUrl?: string) => {
    updatePost({ 
      author_name: name,
      author_avatar_url: avatarUrl || ''
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      updatePost({ category: newCategory.trim() });
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Post Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Book className="h-4 w-4" />
            Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Categoría *</label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`p-2 text-xs rounded border text-left transition-colors ${
                      post.category === category
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {showAddCategory ? (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nueva categoría..."
                    className="text-xs"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                  >
                    Añadir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowAddCategory(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddCategory(true)}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Añadir categoría
                </Button>
              )}
            </div>
            {errors.category && (
              <p className="text-xs text-destructive mt-1">{errors.category}</p>
            )}
          </div>

          <AuthorSelector
            authorName={post.author_name}
            authorAvatarUrl={post.author_avatar_url}
            onAuthorChange={handleAuthorChange}
          />

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Tiempo de lectura (min)</label>
            <Input
              type="number"
              value={post.reading_time}
              onChange={(e) => updatePost({ reading_time: parseInt(e.target.value) || 5 })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Tags</label>
            <Input
              value={post.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="tag1, tag2, tag3..."
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Image className="h-4 w-4" />
            Imagen Destacada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploadField
            label=""
            value={post.featured_image_url}
            onChange={(url) => updatePost({ featured_image_url: url })}
            folder="blog"
            placeholder="URL de la imagen destacada"
          />
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Publicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Publicado</label>
            <Switch
              checked={post.is_published}
              onCheckedChange={(checked) => updatePost({ is_published: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Destacado</label>
            <Switch
              checked={post.is_featured}
              onCheckedChange={(checked) => updatePost({ is_featured: checked })}
            />
          </div>

          {post.is_published && (
            <Badge variant="secondary" className="w-full justify-center">
              Publicado
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* URL Slug */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" />
            URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Slug *</label>
            <Input
              value={post.slug}
              onChange={(e) => updatePost({ slug: e.target.value })}
              placeholder="url-del-post"
              className={`mt-1 font-mono text-xs ${errors.slug ? 'border-destructive' : ''}`}
            />
            {errors.slug && (
              <p className="text-xs text-destructive mt-1">{errors.slug}</p>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              /blog/{post.slug || 'tu-post'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleBlogEditorSidebar;