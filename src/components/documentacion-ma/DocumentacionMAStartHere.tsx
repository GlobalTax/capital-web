
import React from 'react';
import { 
  Building2, 
  Calculator, 
  FileText, 
  Users, 
  Clock,
  Shield
} from 'lucide-react';

const DocumentacionMAStartHere = () => {
  const startHereItems = [
    {
      icon: Building2,
      title: "Introducción a M&A",
      description: "Conceptos básicos, tipos de operaciones y marco estratégico"
    },
    {
      icon: Calculator,
      title: "Valoración",
      description: "Métodos DCF, múltiplos comparables y transacciones precedentes"
    },
    {
      icon: FileText,
      title: "Due Diligence",
      description: "Análisis financiero, comercial, legal y operacional"
    },
    {
      icon: Clock,
      title: "Proceso M&A",
      description: "Fases del proceso desde planificación hasta cierre"
    },
    {
      icon: Shield,
      title: "Aspectos Legales",
      description: "Documentación, autorizaciones y compliance regulatorio"
    },
    {
      icon: Users,
      title: "Integración",
      description: "Post-M&A, retención de talento y captura de sinergias"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-6">Empieza aquí</h2>
          <p className="text-lg text-gray-500 font-light">
            Los conceptos fundamentales que necesitas dominar
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {startHereItems.map((item, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="bg-gray-50/50 hover:bg-gray-50 transition-all duration-300 ease-out p-10 rounded-2xl hover:shadow-sm">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-8 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <item.icon className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 leading-tight">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentacionMAStartHere;
