
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCountAnimation } from '@/hooks/useCountAnimation';

const PorQueElegirnosResults = () => {
  const valueCount = useCountAnimation(5.2, 2000, 'B');
  const companiesCount = useCountAnimation(500, 2500, '+');
  const multipleCount = useCountAnimation(5.5, 2000, 'x');
  const successCount = useCountAnimation(95, 1800, '%');

  const stats = [
    {
      count: valueCount,
      prefix: "€",
      label: "Valor Total Gestionado",
      description: "En transacciones completadas",
      color: "from-blue-500 to-blue-600"
    },
    {
      count: companiesCount,
      prefix: "",
      label: "Empresas Vendidas",
      description: "Operaciones exitosas",
      color: "from-green-500 to-green-600"
    },
    {
      count: multipleCount,
      prefix: "",
      label: "Múltiplo Promedio",
      description: "Superior a la media del mercado",
      color: "from-purple-500 to-purple-600"
    },
    {
      count: successCount,
      prefix: "",
      label: "Tasa de Éxito",
      description: "Operaciones completadas",
      color: "from-black to-gray-800"
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
            <div 
              key={index} 
              className="group text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <div className="text-white font-bold text-xl">{stat.prefix}</div>
              </div>
              
              <div 
                ref={stat.count.ref}
                className="text-5xl font-bold text-black mb-3 group-hover:scale-105 transition-transform duration-300"
              >
                {stat.prefix}{stat.count.count}
              </div>
              
              <div className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-black transition-colors">
                {stat.label}
              </div>
              
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">
              ¿Listo para Maximizar el Valor de tu Empresa?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Únete a los cientos de empresarios que han confiado en nuestra experiencia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg">
                Consulta
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-300">
                Descargar Dossier
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnosResults;
