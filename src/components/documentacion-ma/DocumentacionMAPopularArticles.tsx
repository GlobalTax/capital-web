
import React from 'react';
import { Calculator, TrendingUp, Building2, ArrowRight } from 'lucide-react';

const DocumentacionMAPopularArticles = () => {
  const popularArticles = [
    {
      title: "Calculadora de Valoración",
      description: "Herramienta interactiva para valorar tu empresa",
      link: "/lp/calculadora",
      icon: Calculator
    },
    {
      title: "Casos de Éxito",
      description: "Ejemplos reales de transacciones exitosas",
      link: "/casos-exito", 
      icon: TrendingUp
    },
    {
      title: "Venta de Empresas",
      description: "Guía completa para vender tu empresa",
      link: "/venta-empresas",
      icon: Building2
    }
  ];

  return (
    <section className="py-24 bg-gray-50/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-6">Recursos relacionados</h2>
          <p className="text-lg text-gray-500 font-light">
            Herramientas y guías que complementan tu conocimiento en M&A
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularArticles.map((articulo, index) => (
            <div key={index} className="bg-white p-12 rounded-2xl hover:shadow-sm transition-all duration-300 group cursor-pointer">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-8 group-hover:bg-gray-100 transition-colors duration-300">
                <articulo.icon className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{articulo.title}</h3>
              <p className="text-gray-500 mb-8 font-light leading-relaxed">{articulo.description}</p>
              <a 
                href={articulo.link}
                className="text-gray-900 font-medium hover:text-gray-600 flex items-center gap-3 group-hover:gap-4 transition-all duration-300"
              >
                <span>Explorar</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentacionMAPopularArticles;
