import React from 'react';
import { MessageSquare, FileSearch, Calculator, Presentation, FileText, CheckCircle } from 'lucide-react';

const ValoracionesProcess = () => {
  const steps = [
    {
      icon: MessageSquare,
      titulo: 'Consulta Inicial',
      descripcion: 'Reunión para entender objetivos y revisar información preliminar',
      duracion: '1-2 días',
      entregables: ['Propuesta comercial', 'Plan de trabajo', 'Carta de confidencialidad']
    },
    {
      icon: FileSearch,
      titulo: 'Due Diligence',
      descripcion: 'Análisis exhaustivo de información financiera, legal y operativa',
      duracion: '1-2 semanas',
      entregables: ['Lista de información requerida', 'Análisis preliminary', 'Identificación de riesgos']
    },
    {
      icon: Calculator,
      titulo: 'Análisis de Valoración',
      descripcion: 'Aplicación de múltiples metodologías y análisis de sensibilidad',
      duracion: '1 semana',
      entregables: ['Modelo financiero', 'Análisis de múltiplos', 'Proyecciones DCF']
    },
    {
      icon: Presentation,
      titulo: 'Presentación',
      descripcion: 'Revisión de resultados y ajustes basados en feedback',
      duracion: '2-3 días',
      entregables: ['Presentación ejecutiva', 'Sesión de Q&A', 'Recomendaciones']
    },
    {
      icon: FileText,
      titulo: 'Informe Final',
      descripcion: 'Entrega del informe completo de valoración certificado',
      duracion: '2-3 días',
      entregables: ['Informe de valoración', 'Anexos técnicos', 'Certificación profesional']
    },
    {
      icon: CheckCircle,
      titulo: 'Seguimiento',
      descripcion: 'Soporte post-entrega y actualizaciones si es necesario',
      duracion: '3 meses',
      entregables: ['Actualizaciones menores', 'Consultas adicionales', 'Soporte operativo']
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Proceso de Valoración Profesional
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Un proceso estructurado y transparente que garantiza la máxima precisión 
            y objetividad en la valoración de tu empresa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 h-full">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black group-hover:text-blue-600 transition-colors">
                        {step.titulo}
                      </h3>
                      <span className="text-sm font-semibold text-blue-600">
                        {step.duracion}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {step.descripcion}
                  </p>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-black mb-3">Entregables:</h4>
                    <ul className="space-y-1">
                      {step.entregables.map((entregable, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span>{entregable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Summary */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-black mb-4">
              Cronograma Típico
            </h3>
            <p className="text-gray-600">
              El proceso completo de valoración profesional suele completarse en 4-6 semanas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                1-2
              </div>
              <h4 className="font-semibold text-black mb-2">Semanas 1-2</h4>
              <p className="text-sm text-gray-600">Consulta inicial y due diligence</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold text-black mb-2">Semana 3</h4>
              <p className="text-sm text-gray-600">Análisis y modelización</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                4
              </div>
              <h4 className="font-semibold text-black mb-2">Semana 4</h4>
              <p className="text-sm text-gray-600">Presentación y ajustes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                5-6
              </div>
              <h4 className="font-semibold text-black mb-2">Semanas 5-6</h4>
              <p className="text-sm text-gray-600">Informe final y seguimiento</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesProcess;