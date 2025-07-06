import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BlogPost } from '@/types/blog';
import { Book, Settings, Globe, Image } from 'lucide-react';
import ImageUploadField from '@/components/admin/ImageUploadField';

interface BlogEditorSidebarProps {
  post: BlogPost;
  updatePost: (updates: Partial<BlogPost>) => void;
  errors?: {
    category?: string;
    slug?: string;
  };
}

const BlogEditorSidebar = ({ post, updatePost, errors = {} }: BlogEditorSidebarProps) => {
  const categories = ['M&A', 'Valoración', 'Due Diligence', 'Análisis', 'Estrategia', 'Financiación', 'Legal', 'Fiscal'];
  
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    updatePost({ tags });
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
            <label className="text-xs font-medium text-muted-foreground">Categoría *</label>
            <Select 
              value={post.category} 
              onValueChange={(value) => updatePost({ category: value })}
            >
              <SelectTrigger className={`mt-1 ${errors.category ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Autor</label>
            <Input
              value={post.author_name}
              onChange={(e) => updatePost({ author_name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Tiempo de lectura (min)</label>
            <Input
              type="number"
              value={post.reading_time}
              onChange={(e) => updatePost({ reading_time: parseInt(e.target.value) || 5 })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
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
            <label className="text-xs font-medium text-muted-foreground">Slug *</label>
            <Input
              value={post.slug}
              onChange={(e) => updatePost({ slug: e.target.value })}
              placeholder="url-del-post"
              className={`mt-1 font-mono text-xs ${errors.slug ? 'border-destructive' : ''}`}
            />
            {errors.slug && (
              <p className="text-xs text-destructive mt-1">{errors.slug}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogEditorSidebar;