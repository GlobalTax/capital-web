
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, FileText, Users, Handshake, TrendingUp, CheckCircle } from 'lucide-react';

const Metodologia = () => {
  const methodologySteps = [
    {
      icon: Search,
      title: "Análisis Estratégico",
      description: "Valoración completa del negocio y posicionamiento en el mercado",
      details: ["Análisis financiero detallado", "Valoración de la competencia", "Identificación de ventajas competitivas"]
    },
    {
      icon: FileText,
      title: "Preparación Documental",
      description: "Creación de materiales profesionales de marketing",
      details: ["Memorando de inversión", "Modelos financieros", "Due diligence prep"]
    },
    {
      icon: Users,
      title: "Identificación de Compradores",
      description: "Mapeo y contacto con compradores estratégicos",
      details: ["Base de datos propietaria", "Compradores internacionales", "Inversores financieros"]
    },
    {
      icon: Handshake,
      title: "Proceso de Negociación",
      description: "Gestión completa del proceso de venta",
      details: ["Múltiples ofertas", "Optimización de términos", "Cierre exitoso"]
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
                Nuestra Metodología
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Un proceso probado que maximiza el valor y minimiza los riesgos. 
                Cada paso está diseñado para obtener los mejores resultados.
              </p>
            </div>

            <div className="space-y-16">
              {methodologySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                    <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                      <div className="flex items-center mb-6">
                        <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold text-gray-500">
                          Paso {index + 1}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-black mb-4">
                        {step.title}
                      </h2>
                      <p className="text-xl text-gray-600 mb-6">
                        {step.description}
                      </p>
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                      <div className="bg-gray-50 rounded-2xl p-8 h-80 flex items-center justify-center">
                        <Icon className="h-32 w-32 text-gray-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Metodologia;
