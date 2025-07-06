import { Textarea } from '@/components/ui/textarea';
import { BlogPost } from '@/types/blog';

interface BlogEditorContentProps {
  post: BlogPost;
  updatePost: (updates: Partial<BlogPost>) => void;
}

const BlogEditorContent = ({ post, updatePost }: BlogEditorContentProps) => {
  return (
    <div className="space-y-6">
      {/* Excerpt */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Extracto
        </label>
        <Textarea
          value={post.excerpt || ''}
          onChange={(e) => updatePost({ excerpt: e.target.value })}
          placeholder="Breve descripción del post..."
          className="resize-none"
          rows={3}
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Contenido
        </label>
        <Textarea
          value={post.content}
          onChange={(e) => updatePost({ content: e.target.value })}
          placeholder="Escribe tu contenido aquí (acepta Markdown)..."
          className="min-h-[500px] font-mono text-sm resize-none"
        />
      </div>
    </div>
  );
};

export default BlogEditorContent;