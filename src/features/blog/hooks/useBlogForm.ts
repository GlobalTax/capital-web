import { useState } from 'react';
import { BlogPost } from '@/types/blog';

export const useBlogForm = (initialPost: BlogPost) => {
  const [post, setPost] = useState<BlogPost>(initialPost);

  const updatePost = (updates: Partial<BlogPost>) => {
    setPost(prev => ({ ...prev, ...updates }));
  };

  const resetPost = () => {
    setPost(initialPost);
  };

  return {
    post,
    updatePost,
    resetPost,
  };
};
