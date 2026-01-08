import React from 'react';
import { MessageSquare, Calculator, FileText, Scale, CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Consulta Inicial',
    subtitle: 'Gratis',
    items: [
      'Reunión confidencial para entender tu situación',
      'Análisis preliminar de viabilidad',
      'Primeras estimaciones de valor',
    ],
    youProvide: ['Información general del negocio', 'Estados financieros básicos'],
    weDo: ['Evaluamos el potencial de venta', 'Identificamos fortalezas y retos'],
    deliverables: ['Informe de viabilidad', 'Propuesta de servicio'],
    duration: '1-2 días',
  },
  {
    icon: Calculator,
    number: '02',
    title: 'Valoración Profesional',
    subtitle: '',
    items: [
      'Análisis financiero completo (3-5 años)',
      'Valoración por múltiples métodos: DCF, múltiplos, patrimonial',
      'Benchmarking con transacciones comparables',
    ],
    youProvide: ['Estados financieros completos', 'Detalle de activos y pasivos', 'Proyecciones de negocio'],
    weDo: ['Normalizamos el EBITDA', 'Aplicamos múltiples metodologías', 'Determinamos rango de valor'],
    deliverables: ['Informe de valoración completo', 'Rango de precio objetivo'],
    duration: '1-2 semanas',
  },
  {
    icon: FileText,
    number: '03',
    title: 'Preparación y Marketing',
    subtitle: '',
    items: [
      'Cuaderno de venta profesional (Information Memorandum)',
      'Teaser anónimo para primeros contactos',
      'Identificación de compradores estratégicos y financieros',
    ],
    youProvide: ['Información comercial y operativa', 'Documentación legal básica', 'Disponibilidad para reuniones'],
    weDo: ['Creamos materiales profesionales', 'Contactamos compradores cualificados', 'Gestionamos NDAs'],
    deliverables: ['Information Memorandum', 'Teaser anónimo', 'Lista de target buyers'],
    duration: '2-4 semanas',
  },
  {
    icon: Scale,
    number: '04',
    title: 'Negociación y Due Diligence',
    subtitle: '',
    items: [
      'Gestión de ofertas indicativas y vinculantes',
      'Coordinación del proceso de due diligence',
      'Negociación de precio y condiciones',
    ],
    youProvide: ['Data room documental', 'Acceso a personal clave', 'Decisiones estratégicas'],
    weDo: ['Gestionamos el proceso competitivo', 'Respondemos a solicitudes del comprador', 'Negociamos en tu nombre'],
    deliverables: ['Carta de intención (LOI)', 'Informe de ofertas recibidas', 'Términos negociados'],
    duration: '4-8 semanas',
  },
  {
    icon: CheckCircle,
    number: '05',
    title: 'Cierre de la Operación',
    subtitle: '',
    items: [
      'Revisión de contratos definitivos (SPA)',
      'Coordinación con abogados y notarios',
      'Firma y transición ordenada',
    ],
    youProvide: ['Firma de documentos', 'Colaboración en la transición'],
    weDo: ['Coordinamos todos los asesores', 'Velamos por tus intereses hasta el final', 'Gestionamos el handover'],
    deliverables: ['Contrato de compraventa firmado', 'Escritura notarial', 'Cobro del precio'],
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
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4">
            5 Pasos Para Vender Tu Empresa
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Un proceso estructurado diseñado para maximizar el valor y minimizar el estrés.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Step Header */}
              <div className="flex items-center gap-4 p-6 bg-slate-50 border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-300">{step.number}</span>
                    <h3 className="text-xl font-medium text-slate-900">
                      {step.title}
                      {step.subtitle && (
                        <span className="ml-2 text-sm font-normal text-green-600">({step.subtitle})</span>
                      )}
                    </h3>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-full text-sm text-slate-600">
                  <span>⏱️</span>
                  <span>{step.duration}</span>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                {/* Main Items */}
                <ul className="space-y-2 mb-6">
                  {step.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-slate-700">
                      <ArrowRight className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Three Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                  {/* You Provide */}
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">📋 Tú aportas</h4>
                    <ul className="space-y-1">
                      {step.youProvide.map((item, i) => (
                        <li key={i} className="text-xs text-amber-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* We Do */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">💼 Nosotros hacemos</h4>
                    <ul className="space-y-1">
                      {step.weDo.map((item, i) => (
                        <li key={i} className="text-xs text-blue-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Deliverables */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">✅ Entregables</h4>
                    <ul className="space-y-1">
                      {step.deliverables.map((item, i) => (
                        <li key={i} className="text-xs text-green-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mobile Duration */}
                <div className="md:hidden mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <span>⏱️</span>
                  <span>Duración: {step.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Summary */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center">
          <p className="text-white text-lg mb-2">
            <span className="font-semibold">Tiempo total estimado:</span>
          </p>
          <p className="text-3xl font-bold text-white mb-2">6-12 meses</p>
          <p className="text-slate-400">
            Desde la primera reunión hasta el cobro del precio de venta
          </p>
        </div>
      </div>
    </section>
  );
};

export default HubVentaProcess;
