
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">Artículos Populares</h2>
          <p className="text-xl text-gray-500">
            Otros recursos que pueden interesarte
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularArticles.map((articulo, index) => (
            <Card key={index} className="bg-white border-0.5 border-black shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                  <articulo.icon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-black mb-4 text-lg">{articulo.title}</h3>
                <p className="text-gray-500 mb-6">{articulo.description}</p>
                <a 
                  href={articulo.link}
                  className="text-black font-medium hover:underline flex items-center gap-2 group"
                >
                  <span>Leer más</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentacionMAPopularArticles;
