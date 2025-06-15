
import React from 'react';
import { Search, FileText, Users, TrendingUp, Handshake, Award } from 'lucide-react';

const VentaEmpresasProcess = () => {
  const steps = [
    {
      icon: Search,
      title: 'Análisis Inicial',
      description: 'Evaluación completa de tu empresa, incluyendo situación financiera, posición en el mercado y potencial de crecimiento.',
      duration: '1-2 semanas'
    },
    {
      icon: FileText,
      title: 'Preparación de Documentación',
      description: 'Creación del memorando de venta, análisis financiero detallado y documentación legal necesaria.',
      duration: '2-3 semanas'
    },
    {
      icon: Users,
      title: 'Identificación de Compradores',
      description: 'Búsqueda activa de compradores estratégicos e inversores financieros que encajen con tu empresa.',
      duration: '3-4 semanas'
    },
    {
      icon: TrendingUp,
      title: 'Marketing y Presentación',
      description: 'Presentación profesional a compradores cualificados manteniendo la confidencialidad del proceso.',
      duration: '4-6 semanas'
    },
    {
      icon: Handshake,
      title: 'Negociación',
      description: 'Gestión de ofertas, negociación de términos y condiciones para maximizar el valor de la transacción.',
      duration: '2-4 semanas'
    },
    {
      icon: Award,
      title: 'Cierre',
      description: 'Acompañamiento en el proceso de due diligence y cierre final de la operación.',
      duration: '4-8 semanas'
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-black mb-6">
            Nuestro Proceso de Venta
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Un método probado que garantiza los mejores resultados. Cada paso está diseñado 
            para maximizar el valor de tu empresa y asegurar un proceso eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="capittal-card h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      {step.duration}
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    Paso {index + 1}
                  </div>
                  
                  <h3 className="text-lg font-bold text-black mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="capittal-card max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold text-black mb-6">
            Duración Total del Proceso
          </h3>
          <p className="text-gray-600 mb-8">
            El proceso completo suele durar entre <strong>4 a 6 meses</strong>, 
            dependiendo de la complejidad de la empresa y las condiciones del mercado.
          </p>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-black mb-2">85%</div>
              <div className="text-sm text-gray-600">Tasa de éxito</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black mb-2">4.2x</div>
              <div className="text-sm text-gray-600">Múltiplo promedio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black mb-2">120</div>
              <div className="text-sm text-gray-600">Días promedio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasProcess;
