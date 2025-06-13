
import React from 'react';
import { Button } from '@/components/ui/button';

const PorQueElegirnosResults = () => {
  const stats = [
    {
      number: "€5.2B",
      label: "Valor Total Gestionado",
      description: "En transacciones completadas"
    },
    {
      number: "500+",
      label: "Empresas Vendidas",
      description: "Operaciones exitosas"
    },
    {
      number: "4.2x",
      label: "Múltiplo Promedio",
      description: "Superior a la media del mercado"
    },
    {
      number: "95%",
      label: "Tasa de Éxito",
      description: "Operaciones completadas"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">
            Resultados que Hablan por Nosotros
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 25 años de experiencia se reflejan en resultados excepcionales 
            para nuestros clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold text-black mb-2">
                {stat.number}
              </div>
              <div className="text-xl font-semibold text-gray-800 mb-2">
                {stat.label}
              </div>
              <p className="text-gray-600">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-black text-white rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">
            ¿Listo para Maximizar el Valor de tu Empresa?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a los cientos de empresarios que han confiado en nuestra experiencia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3">
              Solicitar Consulta Gratuita
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
              Descargar Dossier
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnosResults;
