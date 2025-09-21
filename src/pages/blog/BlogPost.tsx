
import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import BlogPostContent from '@/components/blog/BlogPostContent';
import BlogNavigation from '@/components/blog/BlogNavigation';
import RelatedPosts from '@/components/blog/RelatedPosts';
import BlogBreadcrumbs from '@/components/blog/BlogBreadcrumbs';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useBlogNavigation } from '@/hooks/useBlogNavigation';
import { useSimpleBlogAnalytics } from '@/hooks/useSimpleBlogAnalytics';
import { useBlogRSS } from '@/hooks/useBlogRSS';
import { BlogPost as BlogPostType } from '@/types/blog';

const BlogPost = () => {
  const { slug } = useParams();
  const { posts, getPostBySlug } = useBlogPosts();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Navegación y posts relacionados
  const { previousPost, nextPost, relatedPosts } = useBlogNavigation(
    (posts || []) as any[], 
    slug || ''
  );

  // Analytics y tracking - SIMPLIFICADO
  const { trackPostView, useScrollTracking } = useSimpleBlogAnalytics();
  
  // RSS y Open Graph
  const { applyOpenGraphTags } = useBlogRSS();

  // Activar tracking de scroll para este post - moved outside conditional
  const scrollTrackingResult = useScrollTracking(post?.id || '', post?.slug || '');

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const fetchedPost = await getPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
          
          // Actualizar meta tags para SEO
          if (fetchedPost.meta_title) {
            document.title = fetchedPost.meta_title;
          } else {
            document.title = `${fetchedPost.title} | Blog Capittal`;
          }
          
          if (fetchedPost.meta_description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
              metaDescription.setAttribute('content', fetchedPost.meta_description);
            }
          }

          // Aplicar Open Graph tags
          applyOpenGraphTags(fetchedPost);

          // Trackear vista del post
          trackPostView(fetchedPost.id, fetchedPost.slug);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, getPostBySlug]);

  if (isLoading) {
    return (
      <UnifiedLayout variant="home">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando artículo...</p>
            </div>
          </div>
        </section>
      </UnifiedLayout>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <UnifiedLayout variant="home">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Breadcrumbs */}
        <BlogBreadcrumbs 
          currentPage={{
            title: post.title,
            category: post.category
          }} 
        />
        
        <BlogPostContent post={post} />
        
        {/* Navegación entre posts */}
        <BlogNavigation 
          previousPost={previousPost} 
          nextPost={nextPost} 
        />
        
        {/* Posts relacionados */}
        <RelatedPosts posts={relatedPosts} />
      </div>
    </UnifiedLayout>
  );
};

export default BlogPost;
