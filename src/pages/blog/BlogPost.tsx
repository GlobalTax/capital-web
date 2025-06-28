
import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogPostContent from '@/components/blog/BlogPostContent';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPost as BlogPostType } from '@/types/blog';

const BlogPost = () => {
  const { slug } = useParams();
  const { getPostBySlug } = useBlogPosts();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
      <BlogPostContent post={post} />
      <Footer />
    </div>
  );
};

export default BlogPost;
