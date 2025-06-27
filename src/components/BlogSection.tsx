
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const data = [
  {
    id: 1,
    title: "Tendencias en Fusiones y Adquisiciones 2024",
    description:
      "Análisis completo de las principales tendencias del mercado M&A en España. Descubre los sectores más activos, múltiplos de valoración y oportunidades de inversión para el próximo año.",
    date: "15 de Marzo, 2024",
    category: "M&A",
    link: "/blog/tendencias-ma-2024",
  },
  {
    id: 2,
    title: "Cómo Valorar una Empresa: Guía Completa",
    description:
      "Metodologías de valoración empresarial explicadas paso a paso. Aprende a aplicar múltiplos de EBITDA, DCF y otros métodos utilizados por profesionales en transacciones reales.",
    date: "12 de Marzo, 2024",
    category: "Valoración",
    link: "/blog/como-valorar-empresa",
  },
  {
    id: 3,
    title: "Due Diligence: Claves del Proceso",
    description:
      "Todo lo que necesitas saber sobre el proceso de due diligence en operaciones M&A. Desde la preparación inicial hasta los aspectos críticos que pueden determinar el éxito de la transacción.",
    date: "8 de Marzo, 2024",
    category: "Due Diligence",
    link: "/blog/due-diligence-proceso",
  },
  {
    id: 4,
    title: "Múltiplos Sectoriales en España",
    description:
      "Análisis detallado de los múltiplos de valoración por sectores en el mercado español. Datos actualizados y comparativas con mercados internacionales para tomar mejores decisiones de inversión.",
    date: "5 de Marzo, 2024",
    category: "Análisis",
    link: "/blog/multiplos-sectoriales-espana",
  },
];

const BlogSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Artículos Especializados
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Análisis profundos y perspectivas expertas sobre el mercado 
            de fusiones y adquisiciones en España.
          </p>
          <Link to="/blog">
            <Button 
              variant="outline" 
              className="bg-white text-black border-0.5 border-border rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out font-medium"
            >
              Ver Todos los Artículos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {data.map((article) => (
            <Link 
              key={article.id} 
              to={article.link} 
              className="group bg-white border-0.5 border-border rounded-lg p-6 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex flex-col h-full">
                <span className="text-sm font-medium text-gray-500 mb-3">
                  {article.category}
                </span>
                
                <h3 className="text-lg font-bold text-black mb-3 group-hover:text-gray-800 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 flex-grow leading-relaxed">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-500 font-medium">
                    {article.date}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
