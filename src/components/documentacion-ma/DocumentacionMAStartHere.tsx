
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Calculator, 
  FileText, 
  Users, 
  Clock,
  Shield,
  ArrowRight
} from 'lucide-react';

const DocumentacionMAStartHere = () => {
  const startHereItems = [
    {
      icon: Building2,
      title: "Introducción a M&A",
      description: "Conceptos básicos, tipos de operaciones y marco estratégico",
      color: "blue"
    },
    {
      icon: Calculator,
      title: "Valoración",
      description: "Métodos DCF, múltiplos comparables y transacciones precedentes",
      color: "green"
    },
    {
      icon: FileText,
      title: "Due Diligence",
      description: "Análisis financiero, comercial, legal y operacional",
      color: "purple"
    },
    {
      icon: Clock,
      title: "Proceso M&A",
      description: "Fases del proceso desde planificación hasta cierre",
      color: "orange"
    },
    {
      icon: Shield,
      title: "Aspectos Legales",
      description: "Documentación, autorizaciones y compliance regulatorio",
      color: "red"
    },
    {
      icon: Users,
      title: "Integración",
      description: "Post-M&A, retención de talento y captura de sinergias",
      color: "teal"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">Empieza aquí</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Explora los conceptos fundamentales de M&A organizados por área de conocimiento
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {startHereItems.map((item, index) => (
            <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-10 text-center">
                <div className={`w-20 h-20 bg-${item.color}-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-${item.color}-100 transition-colors`}>
                  <item.icon className={`w-10 h-10 text-${item.color}-600`} />
                </div>
                <h3 className="text-2xl font-semibold text-black mb-4">{item.title}</h3>
                <p className="text-gray-500 mb-6 text-lg leading-relaxed">
                  {item.description}
                </p>
                <div className={`flex items-center justify-center text-${item.color}-600 font-medium group-hover:gap-2 transition-all`}>
                  <span>Leer más</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentacionMAStartHere;
