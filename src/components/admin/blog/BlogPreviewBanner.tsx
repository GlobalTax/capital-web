import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit, Send, ArrowLeft } from 'lucide-react';

interface BlogPreviewBannerProps {
  postId: string;
  onPublish: () => void;
}

const BlogPreviewBanner = ({ postId, onPublish }: BlogPreviewBannerProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-amber-950 hover:bg-amber-600/20"
            onClick={() => navigate('/admin/blog-v2')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <span className="font-medium text-sm">
            📝 Vista previa de borrador
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-amber-950 hover:bg-amber-600/20"
            onClick={() => navigate(`/admin/blog/edit/${postId}`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button 
            size="sm"
            className="bg-amber-950 text-amber-50 hover:bg-amber-900"
            onClick={onPublish}
          >
            <Send className="h-4 w-4 mr-1" />
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewBanner;
