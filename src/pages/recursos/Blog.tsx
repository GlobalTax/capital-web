
import React from 'react';
import { HomeLayout } from '@/shared';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useBlogFilters } from '@/hooks/useBlogFilters';
import BlogFilters from '@/components/blog/BlogFilters';
import SimpleBlogPopularPosts from '@/components/blog/SimpleBlogPopularPosts';
import { Link } from 'react-router-dom';

const Blog = () => {
  const { posts, isLoading } = useBlogPosts();
  const {
    filters,
    featuredPosts,
    regularPosts,
    categories,
    tags,
    updateFilter,
    updateSort,
    clearFilters,
    hasActiveFilters,
    totalResults
  } = useBlogFilters(posts || []);
  
  const featuredArticle = featuredPosts[0] || null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <HomeLayout>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando artículos...</p>
            </div>
          </div>
        </section>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Contenido principal */}
              <div className="lg:col-span-3">
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                    Blog Capittal
                  </h1>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                    Artículos especializados y análisis de mercado escritos 
                    por nuestros expertos en M&A.
                  </p>
                </div>

                {/* Filtros de búsqueda */}
                <BlogFilters
                  search={filters.search}
                  category={filters.category}
                  tag={filters.tag}
                  sortBy={filters.sortBy}
                  sortOrder={filters.sortOrder}
                  categories={categories}
                  tags={tags}
                  totalResults={totalResults}
                  hasActiveFilters={hasActiveFilters}
                  onSearchChange={(search) => updateFilter('search', search)}
                  onCategoryChange={(category) => updateFilter('category', category)}
                  onTagChange={(tag) => updateFilter('tag', tag)}
                  onSortChange={(sortBy, sortOrder) => {
                    updateSort(sortBy, sortOrder);
                  }}
                  onClearFilters={clearFilters}
                />

                {/* Artículo Destacado */}
                {featuredArticle && (
                  <div className="mb-20">
                    <Link to={`/blog/${featuredArticle.slug}`}>
                      <div className="bg-white border-0.5 border-border rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500">Artículo Destacado</span>
                        </div>
                        {featuredArticle.featured_image_url && (
                          <div className="mb-6">
                            <img
                              src={featuredArticle.featured_image_url}
                              alt={featuredArticle.title}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <h2 className="text-3xl font-bold text-black mb-4">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                          {featuredArticle.excerpt || truncateText(featuredArticle.content, 200)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{featuredArticle.published_at ? formatDate(featuredArticle.published_at) : formatDate(featuredArticle.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{featuredArticle.author_name}</span>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 rounded-lg font-medium">
                              {featuredArticle.category}
                            </span>
                          </div>
                          <Button className="bg-white text-black border-0.5 border-border rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out font-medium">
                            Leer Artículo
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Grid de Artículos */}
                {regularPosts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {regularPosts.map((article) => (
                      <Link key={article.id} to={`/blog/${article.slug}`}>
                        <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer">
                          <div className="flex flex-col h-full">
                            {article.featured_image_url && (
                              <div className="mb-4">
                                <img
                                  src={article.featured_image_url}
                                  alt={article.title}
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                              </div>
                            )}
                            
                            <span className="text-sm font-medium text-gray-500 mb-3 px-3 py-1 bg-gray-100 rounded-lg self-start">
                              {article.category}
                            </span>
                            
                            <h3 className="text-xl font-bold text-black mb-3 hover:text-gray-800 transition-colors">
                              {article.title}
                            </h3>
                            
                            <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed">
                              {article.excerpt || truncateText(article.content, 150)}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{article.published_at ? formatDate(article.published_at) : formatDate(article.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{article.reading_time} min</span>
                                <ArrowRight className="h-4 w-4 text-gray-400 hover:text-black hover:translate-x-1 transition-all duration-300" />
                              </div>
                            </div>

                            {article.tags && article.tags.length > 0 && (
                              <div className="flex gap-1 mt-3 flex-wrap">
                                {article.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Estado vacío */}
                {totalResults === 0 && !isLoading && (
                  <div className="text-center py-16">
                    {hasActiveFilters ? (
                      <>
                        <h3 className="text-2xl font-bold text-black mb-4">No se encontraron resultados</h3>
                        <p className="text-gray-600 mb-8">
                          Intenta ajustar los filtros de búsqueda o explorar otras categorías.
                        </p>
                        <Button onClick={clearFilters} variant="outline">
                          Limpiar filtros
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-black mb-4">Próximamente</h3>
                        <p className="text-gray-600 mb-8">
                          Estamos preparando contenido de valor para ti.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Call to Action */}
                <div className="text-center mt-16">
                  <p className="text-gray-600 mb-6">
                    ¿Te interesa recibir nuestros análisis de mercado por email?
                  </p>
                  <Button className="bg-white text-black border-0.5 border-border rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out font-medium">
                    Suscríbete al Newsletter
                  </Button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  {/* Posts populares */}
                  <SimpleBlogPopularPosts limit={5} />
                </div>
              </div>
            </div>
          </div>
        </section>
    </HomeLayout>
  );
};

export default Blog;
