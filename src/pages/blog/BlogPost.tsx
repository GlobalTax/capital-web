
import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    posts, 
    slug || ''
  );

  // Analytics y tracking - SIMPLIFICADO
  const { trackPostView, useScrollTracking } = useSimpleBlogAnalytics();
  
  // RSS y Open Graph
  const { applyOpenGraphTags } = useBlogRSS();

  // Activar tracking de scroll para este post
  if (post) {
    useScrollTracking(post.id, post.slug);
  }

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
      <div className="min-h-screen bg-white">
        <Header />
        <section className="pt-32 pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando artículo...</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
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
      <Footer />
    </div>
  );
};

export default BlogPost;
