import React from 'react';
import { MessageSquare, Calculator, FileText, Scale, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Consulta Inicial',
    subtitle: 'Gratis',
    items: [
      'Reunión confidencial para entender tu situación',
      'Análisis preliminar de viabilidad',
    ],
    duration: '1-2 días',
  },
  {
    icon: Calculator,
    number: '02',
    title: 'Valoración Profesional',
    subtitle: '',
    items: [
      'Análisis financiero completo',
      'Valoración por múltiples métodos',
      'Informe detallado de valor',
    ],
    duration: '1-2 semanas',
  },
  {
    icon: FileText,
    number: '03',
    title: 'Preparación y Marketing',
    subtitle: '',
    items: [
      'Cuaderno de venta (Information Memorandum)',
      'Identificación de compradores target',
      'Contacto confidencial con interesados',
    ],
    duration: '2-4 semanas',
  },
  {
    icon: Scale,
    number: '04',
    title: 'Negociación y Due Diligence',
    subtitle: '',
    items: [
      'Gestión de ofertas',
      'Coordinación de due diligence',
      'Negociación de términos',
    ],
    duration: '4-8 semanas',
  },
  {
    icon: CheckCircle,
    number: '05',
    title: 'Cierre de la Operación',
    subtitle: '',
    items: [
      'Contratos definitivos',
      'Firma notarial',
      'Transición ordenada',
    ],
    duration: '2-4 semanas',
  },
];

const HubVentaProcess: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Cómo trabajamos
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900">
            5 Pasos Para Vender Tu Empresa
          </h2>
        </div>

        {/* Process Timeline */}
        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 transform -translate-x-1/2"></div>

          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`relative flex flex-col lg:flex-row items-center gap-6 lg:gap-12 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                      <span className="text-2xl font-bold text-slate-300">{step.number}</span>
                      <h3 className="text-xl font-medium text-slate-900">
                        {step.title}
                        {step.subtitle && (
                          <span className="ml-2 text-sm font-normal text-green-600">({step.subtitle})</span>
                        )}
                      </h3>
                    </div>
                    <ul className={`space-y-2 mb-4 ${index % 2 === 0 ? 'lg:text-right' : ''}`}>
                      {step.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-slate-600">
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 ${
                      index % 2 === 0 ? 'lg:float-right' : ''
                    }`}>
                      <span>⏱️</span>
                      <span>{step.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <step.icon className="h-6 w-6" />
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden lg:block flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HubVentaProcess;
