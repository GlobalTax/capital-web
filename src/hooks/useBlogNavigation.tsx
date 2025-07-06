import { useMemo } from 'react';
import { BlogPost } from '@/types/blog';

export const useBlogNavigation = (posts: BlogPost[], currentSlug: string) => {
  const navigation = useMemo(() => {
    // Solo posts publicados, ordenados por fecha
    const publishedPosts = posts
      .filter(post => post.is_published)
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at);
        const dateB = new Date(b.published_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });

    const currentIndex = publishedPosts.findIndex(post => post.slug === currentSlug);
    
    if (currentIndex === -1) {
      return { previousPost: null, nextPost: null, relatedPosts: [] };
    }

    const currentPost = publishedPosts[currentIndex];
    const previousPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < publishedPosts.length - 1 ? publishedPosts[currentIndex + 1] : null;

    // Posts relacionados: misma categoría o tags similares
    const relatedPosts = publishedPosts
      .filter(post => {
        if (post.slug === currentSlug) return false;
        
        // Priorizar posts de la misma categoría
        if (post.category === currentPost.category) return true;
        
        // O posts con tags similares
        const currentTags = currentPost.tags || [];
        const postTags = post.tags || [];
        const commonTags = currentTags.filter(tag => postTags.includes(tag));
        
        return commonTags.length > 0;
      })
      .slice(0, 3); // Máximo 3 posts relacionados

    return {
      previousPost,
      nextPost,
      relatedPosts
    };
  }, [posts, currentSlug]);

  return navigation;
};