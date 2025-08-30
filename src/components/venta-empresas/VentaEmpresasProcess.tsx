
import React from 'react';

const VentaEmpresasProcess = () => {
  const steps = [
    {
      title: 'Análisis Inicial',
      description: 'Evaluación completa de tu empresa, incluyendo situación financiera, posición en el mercado y potencial de crecimiento.',
      duration: '2 semanas'
    },
    {
      title: 'Preparación de Documentación',
      description: 'Creación del memorando de venta, análisis financiero detallado y documentación legal necesaria.',
      duration: '2-3 semanas'
    },
    {
      title: 'Identificación de Compradores',
      description: 'Búsqueda activa de compradores estratégicos e inversores financieros que encajen con tu empresa.',
      duration: '3-4 semanas'
    },
    {
      title: 'Marketing y Presentación',
      description: 'Presentación profesional a compradores cualificados manteniendo la confidencialidad del proceso.',
      duration: '4-6 semanas'
    },
    {
      title: 'Negociación',
      description: 'Gestión de ofertas, negociación de términos y condiciones para maximizar el valor de la transacción.',
      duration: '2-4 semanas'
    },
    {
      title: 'Cierre',
      description: 'Acompañamiento en el proceso de due diligence y cierre final de la operación.',
      duration: '4-8 semanas'
    }
  ];

  return (
    <section id="proceso" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Nuestro Proceso de Venta
          </h2>
          <p className="text-lg text-black max-w-3xl mx-auto">
            Un método probado que garantiza los mejores resultados. Cada paso está diseñado 
            para maximizar el valor de tu empresa y asegurar un proceso eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            return (
              <div key={index} className="relative">
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-gray-50 text-black rounded-lg w-8 h-8 flex items-center justify-center">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm font-semibold text-black">
                      {step.duration}
                    </div>
                  </div>
                  
                  <div className="text-xs font-medium text-black mb-2">
                    Paso {index + 1}
                  </div>
                  
                  <h3 className="text-xl font-bold text-black mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-black leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold text-black mb-6">
            Duración Total del Proceso
          </h3>
          <p className="text-black mb-8">
            El proceso completo suele durar entre <strong>8-12 meses (hasta 1 año)</strong>, 
            desde que entra hasta que se firma la compraventa en el notario.
          </p>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-black mb-2">85%</div>
              <div className="text-sm text-black">Tasa de éxito</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black mb-2">4.2x</div>
              <div className="text-sm text-black">Múltiplo promedio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black mb-2">300</div>
              <div className="text-sm text-black">Días promedio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasProcess;
