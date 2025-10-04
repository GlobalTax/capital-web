import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, TrendingUp, Shield, CheckCircle, Target } from 'lucide-react';

const DueDiligenceTypes = () => {
  const dueDiligenceTypes = [
    {
      type: "buy-side",
      icon: <ShoppingCart size={48} />,
      title: "Due Diligence Buy-Side",
      subtitle: "Para Compradores",
      description: "Análisis exhaustivo antes de la adquisición para evaluar riesgos, confirmar la valoración y negociar mejor.",
      objectives: [
        "Validar la información financiera",
        "Identificar riesgos ocultos",
        "Confirmar sinergias potenciales",
        "Optimizar estructura de la operación"
      ],
      benefits: [
        "Decisión de compra informada",
        "Mejor capacidad de negociación", 
        "Reducción de riesgos post-adquisición",
        "Identificación de oportunidades de valor"
      ]
    },
    {
      type: "vendor",
      icon: <Eye size={48} />,
      title: "Vendor Due Diligence",
      subtitle: "Para Vendedores",
      description: "Preparación estratégica del proceso de venta con análisis previo que acelera la transacción y maximiza el valor.",
      objectives: [
        "Preparar documentación completa",
        "Identificar y resolver problemas previos",
        "Maximizar valoración de la empresa",
        "Acelerar el proceso de venta"
      ],
      benefits: [
        "Proceso de venta más eficiente",
        "Mayor transparencia con compradores",
        "Valoración optimizada",
        "Reducción de contingencias"
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Tipos de Due Diligence
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ofrecemos servicios especializados tanto para compradores como vendedores, 
            adaptando nuestro enfoque a los objetivos específicos de cada parte en la transacción.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dueDiligenceTypes.map((ddType, index) => (
            <Card key={index} className="border border-gray-300 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out h-full">
              <CardContent className="p-8">
                <div className="bg-primary text-primary-foreground p-6 rounded-lg mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-white">
                      {ddType.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{ddType.title}</h3>
                      <p className="text-lg opacity-90">{ddType.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-white/90 leading-relaxed">
                    {ddType.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-black mb-3 flex items-center">
                      <Target className="mr-2" size={20} />
                      Objetivos
                    </h4>
                    <ul className="space-y-2">
                      {ddType.objectives.map((objective, idx) => (
                        <li key={idx} className="flex items-start text-gray-600 text-sm">
                          <CheckCircle className="mr-2 mt-0.5 text-green-500 flex-shrink-0" size={16} />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-black mb-3 flex items-center">
                      <TrendingUp className="mr-2" size={20} />
                      Beneficios
                    </h4>
                    <ul className="space-y-2">
                      {ddType.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start text-gray-600 text-sm">
                          <Shield className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" size={16} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DueDiligenceTypes;