import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import BlogFilters from '@/components/BlogFilters';
import { Search, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { posts, isLoading, fetchPosts } = useBlogPosts();

  useEffect(() => {
    fetchPosts(true); // Only fetch published posts
  }, []);

  // Obtener categorías y tags únicos de los posts
  const { availableCategories, availableTags, filteredPosts } = useMemo(() => {
    const categories = [...new Set(posts.map(post => post.category))];
    const allTags = posts.flatMap(post => post.tags || []);
    const tags = [...new Set(allTags)];
    
    const filtered = posts.filter(post => {
      const matchesSearch = searchTerm === '' || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 || 
        (post.tags && selectedTags.some(tag => post.tags.includes(tag)));
      
      return matchesSearch && matchesCategory && matchesTags;
    });

    return {
      availableCategories: categories,
      availableTags: tags,
      filteredPosts: filtered
    };
  }, [posts, searchTerm, selectedCategory, selectedTags]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedTags([]);
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando artículos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Blog M&A Insights
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                Análisis experto, tendencias del mercado y mejores prácticas en fusiones y adquisiciones
              </p>
              <div className="flex items-center max-w-md mx-auto bg-white rounded-lg shadow-lg">
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlogFilters
              selectedCategory={selectedCategory}
              selectedTags={selectedTags}
              availableCategories={availableCategories}
              availableTags={availableTags}
              onCategoryChange={handleCategoryChange}
              onTagToggle={handleTagToggle}
              onClearFilters={handleClearFilters}
            />
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => (
                  <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.published_at 
                            ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: es })
                            : format(new Date(post.created_at), 'dd MMM yyyy', { locale: es })
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.reading_time} min
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold text-black mb-3 line-clamp-2">
                        {post.title}
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                          Leer más <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron artículos que coincidan con tu búsqueda.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Newsletter />
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;