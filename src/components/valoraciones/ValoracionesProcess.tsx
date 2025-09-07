import React from 'react';
import { MessageSquare, FileSearch, Calculator, Presentation, FileText, CheckCircle } from 'lucide-react';

const ValoracionesProcess = () => {
const steps = [
    {
      icon: MessageSquare,
      titulo: 'Consulta Inicial',
      descripcion: 'Reunión de diagnóstico para entender objetivos, contexto y definir alcance del proyecto',
      duracion: '2-3 días',
      entregables: ['Propuesta comercial detallada', 'Plan de trabajo específico', 'Acuerdo de confidencialidad']
    },
    {
      icon: FileSearch,
      titulo: 'Due Diligence',
      descripcion: 'Revisión exhaustiva de estados financieros, documentación legal y análisis operativo',
      duracion: '1-2 semanas',
      entregables: ['Checklist de información', 'Análisis preliminar de riesgos', 'Informe de due diligence']
    },
    {
      icon: Calculator,
      titulo: 'Análisis de Valoración',
      descripcion: 'Aplicación de metodologías DCF, múltiplos comparables y análisis de sensibilidad',
      duracion: '1-2 semanas',
      entregables: ['Modelo financiero completo', 'Análisis de múltiplos sectoriales', 'Proyecciones DCF validadas']
    },
    {
      icon: Presentation,
      titulo: 'Presentación',
      descripcion: 'Presentación de resultados, validación de supuestos y incorporación de feedback',
      duracion: '3-5 días',
      entregables: ['Presentación ejecutiva', 'Sesión de validación', 'Ajustes incorporados']
    },
    {
      icon: FileText,
      titulo: 'Informe Final',
      descripcion: 'Elaboración del informe certificado con todas las metodologías y conclusiones',
      duracion: '1 semana',
      entregables: ['Informe de valoración certificado', 'Anexos técnicos detallados', 'Certificación profesional']
    },
    {
      icon: CheckCircle,
      titulo: 'Seguimiento',
      descripcion: 'Soporte técnico, actualizaciones menores y consultas sobre el informe entregado',
      duracion: '30 días iniciales',
      entregables: ['Actualizaciones puntuales', 'Resolución de consultas', 'Soporte técnico incluido']
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6">
            Proceso de Valoración Profesional
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Un proceso estructurado y transparente que garantiza la máxima precisión 
            y objetividad en la valoración de tu empresa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-primary transition-colors h-full">
                  {/* Step number */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-medium text-xs">
                    {index + 1}
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center mr-3">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {step.titulo}
                      </h3>
                      <span className="text-xs font-medium text-primary">
                        {step.duracion}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                    {step.descripcion}
                  </p>
                  
                  <div>
                    <h4 className="text-xs font-medium text-slate-900 mb-2">Entregables:</h4>
                    <ul className="space-y-1">
                      {step.entregables.map((entregable, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                          <div className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
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

      </div>
    </section>
  );
};

export default ValoracionesProcess;