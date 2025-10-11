import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlogPost } from '@/types/blog';
import ImageUploadField from '@/components/admin/ImageUploadField';
import AuthorSelector from '@/components/admin/blog/AuthorSelector';

interface BlogEditorSidebarProps {
  post: BlogPost;
  updatePost: (updates: Partial<BlogPost>) => void;
  errors?: {
    category?: string;
    slug?: string;
  };
}

export const BlogEditorSidebar = ({ post, updatePost, errors = {} }: BlogEditorSidebarProps) => {
  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    updatePost({ tags });
  };

  return (
    <div className="space-y-6">
      {/* Post Settings */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Configuración del Post</h3>
        
        <div className="space-y-4">
          {/* Category */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Categoría *
            </label>
            <Input
              value={post.category || ''}
              onChange={(e) => updatePost({ category: e.target.value })}
              placeholder="Categoría del post"
              className={errors.category ? 'border-destructive' : ''}
            />
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category}</p>
            )}
          </div>

          {/* Author */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Autor
            </label>
            <AuthorSelector
              authorName={post.author_name || ''}
              authorAvatarUrl={post.author_avatar_url || ''}
              onAuthorChange={(name, avatar) => updatePost({ author_name: name, author_avatar_url: avatar })}
            />
          </div>

          {/* Reading Time */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Tiempo de Lectura (min)
            </label>
            <Input
              type="number"
              value={post.reading_time || 5}
              onChange={(e) => updatePost({ reading_time: parseInt(e.target.value) || 5 })}
              min={1}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Etiquetas
            </label>
            <Input
              value={post.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Separadas por comas"
            />
          </div>
        </div>
      </Card>

      {/* Featured Image */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Imagen Destacada</h3>
        <ImageUploadField
          label="Imagen"
          value={post.featured_image_url || ''}
          onChange={(url) => updatePost({ featured_image_url: url })}
          folder="blog-images"
        />
      </Card>

      {/* Publishing */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Publicación</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Publicado</label>
            <Switch
              checked={post.is_published || false}
              onCheckedChange={(checked) => updatePost({ is_published: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Destacado</label>
            <Switch
              checked={post.is_featured || false}
              onCheckedChange={(checked) => updatePost({ is_featured: checked })}
            />
          </div>
        </div>
      </Card>

      {/* URL Slug */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">URL</h3>
        <Input
          value={post.slug || ''}
          onChange={(e) => updatePost({ slug: e.target.value })}
          placeholder="url-del-post"
          className={errors.slug ? 'border-destructive' : ''}
        />
        {errors.slug && (
          <p className="text-sm text-destructive mt-1">{errors.slug}</p>
        )}
      </Card>
    </div>
  );
};
