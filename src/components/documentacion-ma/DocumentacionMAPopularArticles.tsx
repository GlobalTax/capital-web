
import React from 'react';
import { Calculator, TrendingUp, Building2, ArrowRight } from 'lucide-react';

const DocumentacionMAPopularArticles = () => {
  const popularArticles = [
    {
      title: "Calculadora de Valoración",
      description: "Herramienta interactiva para valorar tu empresa",
      link: "/calculadora-valoracion",
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-black mb-4">Artículos Populares</h2>
          <p className="text-gray-500">
            Otros recursos que pueden interesarte
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularArticles.map((articulo, index) => (
            <div key={index} className="bg-white p-8 rounded-lg hover:shadow-sm transition-shadow group cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                <articulo.icon className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-medium text-black mb-3">{articulo.title}</h3>
              <p className="text-gray-500 mb-6 text-sm">{articulo.description}</p>
              <a 
                href={articulo.link}
                className="text-black font-medium hover:underline flex items-center gap-2 group text-sm"
              >
                <span>Leer más</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentacionMAPopularArticles;
