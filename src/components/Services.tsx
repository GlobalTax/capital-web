
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Search, 
  Calculator, 
  TrendingUp, 
  RefreshCw,
  ArrowRight 
} from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Building2,
      title: 'Fusiones y Adquisiciones',
      description: 'Asesoramiento integral en compraventa de empresas, desde la valoración inicial hasta el cierre de la transacción.',
      features: ['Venta de empresas', 'Adquisiciones estratégicas', 'Management buyouts'],
      link: '/servicios/fusiones-adquisiciones'
    },
    {
      icon: Search,
      title: 'Due Diligence',
      description: 'Análisis exhaustivo de aspectos financieros, legales y operativos para identificar riesgos y oportunidades.',
      features: ['DD Financiero', 'DD Comercial', 'DD Operativo'],
      link: '/servicios/due-diligence'
    },
    {
      icon: Calculator,
      title: 'Valoraciones',
      description: 'Valoraciones independientes utilizando múltiples metodologías para determinar el valor justo de mercado.',
      features: ['Valoración DCF', 'Múltiplos comparables', 'Valoración por activos'],
      link: '/servicios/valoraciones'
    },
    {
      icon: TrendingUp,
      title: 'Corporate Finance',
      description: 'Estructuración financiera y búsqueda de capital para financiar crecimiento y operaciones corporativas.',
      features: ['Búsqueda de capital', 'Refinanciación', 'Capital de crecimiento'],
      link: '/servicios/corporate-finance'
    },
    {
      icon: RefreshCw,
      title: 'Reestructuraciones',
      description: 'Asesoramiento en situaciones de crisis financiera y procesos de reorganización empresarial.',
      features: ['Reestructuración financiera', 'Planes de viabilidad', 'Turnaround'],
      link: '/servicios/reestructuraciones'
    },
  ];

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ofrecemos una gama completa de servicios de asesoramiento financiero 
            para acompañarte en las decisiones más importantes de tu empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-white border-0.5 border-black rounded-lg mr-4 group-hover:shadow-sm transition-all duration-300 ease-out">
                      <IconComponent className="h-6 w-6 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-black">
                      {service.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-white text-black border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
                    Saber más
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            ¿No encuentras exactamente lo que necesitas?
          </p>
          <Button className="bg-white text-black border-0.5 border-black rounded-lg px-8 py-4 text-lg font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Consulta Personalizada
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
