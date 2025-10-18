import React from 'react';
import { Search, FileText, Users, Handshake, CheckCircle } from 'lucide-react';

const VentaEmpresasProcess = () => {
  const steps = [
    {
      icon: Search,
      title: 'Valoración Inicial',
      description: 'Análisis completo de tu empresa para determinar su valor de mercado real y potencial de optimización.',
      duration: '48-72 horas'
    },
    {
      icon: FileText,
      title: 'Preparación y Optimización',
      description: 'Preparamos tu empresa para maximizar su atractivo y valor ante potenciales compradores.',
      duration: '1 mes'
    },
    {
      icon: Users,
      title: 'Identificación de Compradores',
      description: 'Búsqueda y calificación de compradores estratégicos que valoren al máximo tu empresa.',
      duration: '2-3 meses'
    },
    {
      icon: Handshake,
      title: 'Negociación y Estructuración',
      description: 'Gestión profesional de ofertas y negociación de términos óptimos para la transacción.',
      duration: '1-2 meses'
    },
    {
      icon: CheckCircle,
      title: 'Cierre de Operación',
      description: 'Finalización de due diligence y firma de acuerdos definitivos para el cierre exitoso.',
      duration: '2-3 meses'
    }
  ];

  return (
    <section id="proceso" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Nuestro Proceso de Venta
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Un método probado que garantiza los mejores resultados. Cada paso está diseñado 
            para maximizar el valor de tu empresa y asegurar un proceso eficiente.
          </p>
        </div>

        {/* Layout vertical con línea conectora */}
        <div className="max-w-4xl mx-auto mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex gap-4 md:gap-6 items-start mb-8 last:mb-0">
                {/* Número grande en círculo con línea conectora */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg md:text-xl font-bold z-10 relative">
                    {index + 1}
                  </div>
                  {/* Línea conectora (excepto el último) */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-12 md:top-14 w-0.5 h-16 bg-slate-200 -translate-x-1/2"></div>
                  )}
                </div>
                
                {/* Card horizontal */}
                <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <div className="text-xs md:text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full whitespace-nowrap">
                      {step.duration}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold text-black mb-4">
            Timeline del Proceso
          </h3>
          <div className="mb-8 space-y-3">
            <p className="text-black">
              <strong className="text-primary">9-12 meses</strong> para alcanzar un{" "}
              <strong>acuerdo de intenciones (LOI)</strong> con el comprador.
            </p>
            <p className="text-black text-sm">
              Posteriormente, el periodo de due diligence y cierre final añade 3-6 meses adicionales 
              hasta la firma definitiva en el notario.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-black mb-2">98,7%</div>
              <div className="text-sm text-black">Tasa de éxito</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black mb-2">5.5x</div>
              <div className="text-sm text-black">Múltiplo promedio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black mb-2">9-12</div>
              <div className="text-sm text-black">Meses hasta LOI</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasProcess;
