
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TrendingUp, Award, Target, Users } from 'lucide-react';

const Resultados = () => {
  const caseStudies = [
    {
      sector: "Tecnología",
      company: "SaaS Enterprise",
      revenue: "€15M",
      multiple: "6.2x",
      salePrice: "€93M",
      description: "Plataforma de gestión empresarial con fuerte crecimiento en Europa"
    },
    {
      sector: "Healthcare", 
      company: "MedTech Innovation",
      revenue: "€8M",
      multiple: "4.8x",
      salePrice: "€38M",
      description: "Dispositivos médicos innovadores con patentes internacionales"
    },
    {
      sector: "Industrial",
      company: "Green Energy Solutions",
      revenue: "€22M", 
      multiple: "3.2x",
      salePrice: "€70M",
      description: "Soluciones de energía renovable con contratos a largo plazo"
    }
  ];

  const metrics = [
    {
      icon: TrendingUp,
      value: "4.2x",
      label: "Múltiplo promedio",
      description: "Superior a la media del mercado"
    },
    {
      icon: Award,
      value: "95%",
      label: "Tasa de éxito",
      description: "Operaciones completadas exitosamente"
    },
    {
      icon: Target,
      value: "+28%",
      label: "Premium obtenido",
      description: "Por encima de valoraciones iniciales"
    },
    {
      icon: Users,
      value: "120",
      label: "Días promedio",
      description: "Tiempo medio hasta el cierre"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-black mb-6">
                Nuestros Resultados
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Los números hablan por sí solos. Nuestro track record demuestra 
                nuestro compromiso con la excelencia y los resultados excepcionales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                    <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold text-black mb-2">
                      {metric.value}
                    </div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      {metric.label}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {metric.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-black text-center mb-12">
                Casos de Éxito Recientes
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {caseStudies.map((study, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                      {study.sector}
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">
                      {study.company}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {study.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Facturación:</span>
                        <span className="font-semibold">{study.revenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Múltiplo:</span>
                        <span className="font-semibold">{study.multiple}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Precio de venta:</span>
                        <span className="font-bold text-green-600 text-lg">{study.salePrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-black text-black rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para maximizar el valor de tu empresa?
              </h2>
              <p className="text-xl mb-6 text-gray-600">
                Únete a los cientos de empresarios que han confiado en nosotros
              </p>
              <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Solicitar Consulta Gratuita
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Resultados;
