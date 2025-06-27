
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';

const articles = [
  {
    id: 1,
    title: "Tendencias en Fusiones y Adquisiciones 2024",
    description:
      "Análisis completo de las principales tendencias del mercado M&A en España. Descubre los sectores más activos, múltiplos de valoración y oportunidades de inversión para el próximo año.",
    date: "15 de Marzo, 2024",
    category: "M&A",
    author: "Equipo Capittal",
    featured: true,
  },
  {
    id: 2,
    title: "Cómo Valorar una Empresa: Guía Completa",
    description:
      "Metodologías de valoración empresarial explicadas paso a paso. Aprende a aplicar múltiplos de EBITDA, DCF y otros métodos utilizados por profesionales en transacciones reales.",
    date: "12 de Marzo, 2024",
    category: "Valoración",
    author: "Equipo Capittal",
    featured: false,
  },
  {
    id: 3,
    title: "Due Diligence: Claves del Proceso",
    description:
      "Todo lo que necesitas saber sobre el proceso de due diligence en operaciones M&A. Desde la preparación inicial hasta los aspectos críticos que pueden determinar el éxito de la transacción.",
    date: "8 de Marzo, 2024",
    category: "Due Diligence",
    author: "Equipo Capittal",
    featured: false,
  },
  {
    id: 4,
    title: "Múltiplos Sectoriales en España",
    description:
      "Análisis detallado de los múltiplos de valoración por sectores en el mercado español. Datos actualizados y comparativas con mercados internacionales para tomar mejores decisiones de inversión.",
    date: "5 de Marzo, 2024",
    category: "Análisis",
    author: "Equipo Capittal",
    featured: false,
  },
  {
    id: 5,
    title: "Estrategias de Crecimiento Inorgánico",
    description:
      "Cómo las empresas pueden acelerar su crecimiento a través de adquisiciones estratégicas. Casos de éxito y lecciones aprendidas en el mercado español.",
    date: "2 de Marzo, 2024",
    category: "Estrategia",
    author: "Equipo Capittal",
    featured: false,
  },
  {
    id: 6,
    title: "Financiación de Operaciones M&A",
    description:
      "Opciones de financiación para operaciones de fusiones y adquisiciones. Desde deuda bancaria hasta fondos de private equity y venture capital.",
    date: "28 de Febrero, 2024",
    category: "Financiación",
    author: "Equipo Capittal",
    featured: false,
  },
];

const Blog = () => {
  const featuredArticle = articles.find(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Blog Capittal
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Artículos especializados y análisis de mercado escritos 
              por nuestros expertos en M&A.
            </p>
          </div>

          {/* Artículo Destacado */}
          {featuredArticle && (
            <div className="mb-20">
              <div className="bg-white border-0.5 border-border rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">Artículo Destacado</span>
                </div>
                <h2 className="text-3xl font-bold text-black mb-4">
                  {featuredArticle.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {featuredArticle.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredArticle.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{featuredArticle.author}</span>
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
            </div>
          )}

          {/* Grid de Artículos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article) => (
              <div 
                key={article.id}
                className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  <span className="text-sm font-medium text-gray-500 mb-3 px-3 py-1 bg-gray-100 rounded-lg self-start">
                    {article.category}
                  </span>
                  
                  <h3 className="text-xl font-bold text-black mb-3 hover:text-gray-800 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{article.date}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 hover:text-black hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>

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
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
