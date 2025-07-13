import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, Calendar, User, Tag, TrendingUp } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const { posts, isLoading, fetchPosts } = useBlogPosts();

  useEffect(() => {
    fetchPosts(true); // Only fetch published posts
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: "Tendencias M&A en España 2024: Sectores Emergentes",
      excerpt: "Análisis completo de las principales tendencias del mercado M&A en España. Descubre los sectores más activos, múltiplos de valoración y oportunidades de inversión.",
      author: "Equipo Capittal",
      date: "2024-12-15",
      category: "Tendencias",
      readTime: "8 min",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      tags: ["M&A", "Tendencias", "España", "Valoración"]
    },
    {
      id: 2,
      title: "Múltiplos de Valoración por Sectores 2024",
      excerpt: "Análisis detallado de los múltiplos de valoración por sectores en el mercado español. Datos actualizados y comparativas internacionales.",
      author: "Carlos Martínez",
      date: "2024-12-10",
      category: "Valoración",
      readTime: "12 min",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
      tags: ["Múltiplos", "Valoración", "Sectores", "Datos"]
    },
    {
      id: 3,
      title: "Due Diligence en Empresas Tecnológicas: Guía Completa",
      excerpt: "Todo lo que necesitas saber sobre el proceso de due diligence en startups y empresas tech. Metodología, red flags y mejores prácticas.",
      author: "Ana Rodríguez",
      date: "2024-12-05",
      category: "Due Diligence",
      readTime: "15 min",
      image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=500&h=300&fit=crop",
      tags: ["Due Diligence", "Tecnología", "Startups", "Guía"]
    },
    {
      id: 4,
      title: "Cómo Preparar tu Empresa para una Venta Exitosa",
      excerpt: "Estrategias clave para maximizar la valoración de tu empresa antes de iniciar un proceso de venta. Checklist completo y timeline recomendado.",
      author: "Miguel Santos",
      date: "2024-11-28",
      category: "Venta de Empresas",
      readTime: "10 min",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
      tags: ["Venta", "Preparación", "Estrategia", "Valoración"]
    },
    {
      id: 5,
      title: "Financiación Alternativa para Adquisiciones: Private Equity vs Deuda",
      excerpt: "Comparativa exhaustiva entre las diferentes fuentes de financiación para operaciones M&A. Ventajas, desventajas y casos de uso.",
      author: "David López",
      date: "2024-11-20",
      category: "Financiación",
      readTime: "14 min",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&h=300&fit=crop",
      tags: ["Financiación", "Private Equity", "Deuda", "M&A"]
    },
    {
      id: 6,
      title: "Regulación Post-Brexit: Impacto en M&A Cross-Border",
      excerpt: "Análisis del impacto regulatorio del Brexit en operaciones transfronterizas. Nuevos requisitos y oportunidades en el mercado europeo.",
      author: "Roberto García",
      date: "2024-11-15",
      category: "Regulación",
      readTime: "11 min",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=300&fit=crop",
      tags: ["Brexit", "Regulación", "Cross-Border", "Europa"]
    }
  ];

  const categories = [
    'todos',
    'Tendencias',
    'Valoración', 
    'Due Diligence',
    'Venta de Empresas',
    'Financiación',
    'Regulación'
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

        {/* Categories Filter */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-black mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Leer Artículo
                    </button>
                  </div>
                </article>
              ))}
            </div>
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron artículos que coincidan con tu búsqueda.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Mantente al Día con M&A Insights
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Recibe nuestros análisis semanales directamente en tu email
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email profesional"
                className="flex-1 px-4 py-3 rounded-lg focus:outline-none"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Suscribirse
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;