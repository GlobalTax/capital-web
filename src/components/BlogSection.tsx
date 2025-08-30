
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
    <section className="py-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-1">
          <h1 className="text-2xl font-semibold md:text-4xl text-black">
            Artículos Especializados
          </h1>
          <Link to="/recursos/blog">
            <Button
              variant="outline"
              className="md:h-10 md:px-4 md:py-2 bg-white text-black border border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out font-medium"
              size="sm"
            >
              Ver Todos los Artículos
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {data.map((item) => (
            <Link key={item.id} to={item.link} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-500">
                {item.category}
              </span>
              <h3 className="mb-1 text-lg font-semibold text-black">{item.title}</h3>
              <p className="mb-4 text-sm text-gray-600">
                {item.description}
              </p>
              <span className="text-sm font-medium text-gray-500">
                {item.date}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
