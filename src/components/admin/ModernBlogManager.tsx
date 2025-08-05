import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Loader2 } from 'lucide-react';
import BlogManagerList from './blog/BlogManagerList';

const ModernBlogManager = () => {
  const { posts, isLoading, deletePost } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <BlogManagerList posts={posts || []} onDelete={deletePost} />
    </div>
  );
};

export default ModernBlogManager;