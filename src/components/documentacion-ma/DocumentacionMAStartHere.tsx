
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
    <section className="mb-16">
      <h2 className="text-3xl font-light text-black mb-8">Empieza aquí</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startHereItems.map((item, index) => (
          <div key={index} className="bg-gray-50 p-8 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
              <item.icon className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-black mb-3">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DocumentacionMAStartHere;
