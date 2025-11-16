import React from 'react';
import { Search, FileText, Users, Handshake, CheckCircle } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

const VentaEmpresasProcess = () => {
  const { t } = useI18n();
  const steps = [
    {
      icon: Search,
      title: t('ventaEmpresas.process.step1.title'),
      description: t('ventaEmpresas.process.step1.description'),
      duration: t('ventaEmpresas.process.step1.duration')
    },
    {
      icon: FileText,
      title: t('ventaEmpresas.process.step2.title'),
      description: t('ventaEmpresas.process.step2.description'),
      duration: t('ventaEmpresas.process.step2.duration')
    },
    {
      icon: Users,
      title: t('ventaEmpresas.process.step3.title'),
      description: t('ventaEmpresas.process.step3.description'),
      duration: t('ventaEmpresas.process.step3.duration')
    },
    {
      icon: Handshake,
      title: t('ventaEmpresas.process.step4.title'),
      description: t('ventaEmpresas.process.step4.description'),
      duration: t('ventaEmpresas.process.step4.duration')
    },
    {
      icon: CheckCircle,
      title: t('ventaEmpresas.process.step5.title'),
      description: t('ventaEmpresas.process.step5.description'),
      duration: t('ventaEmpresas.process.step5.duration')
    }
  ];

  return (
    <section id="proceso" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            {t('ventaEmpresas.process.title')}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {t('ventaEmpresas.process.subtitle')}
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
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-900">
                      {step.title}
                    </h3>
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
