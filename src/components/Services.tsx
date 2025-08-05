
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ServicesSkeleton } from '@/components/LoadingStates';

const Services = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ServicesSkeleton />;
  }
  const coreServices = [
    {
      title: 'Vender Empresa',
      description: 'Maximizamos el valor de tu empresa con nuestro proceso probado de venta.',
      features: ['Valoración precisa', 'Proceso confidencial', 'Acceso a compradores cualificados']
    },
    {
      title: 'Comprar Empresa',
      description: 'Te ayudamos a identificar, evaluar y adquirir empresas estratégicas.',
      features: ['Identificación objetivos', 'Due diligence completo', 'Negociación exitosa']
    },
    {
      title: 'Valoraciones',
      description: 'Evaluaciones precisas con metodologías probadas y análisis exhaustivo.',
      features: ['Múltiples metodologías', 'Análisis comparables', 'Informe detallado']
    },
  ];

  const complementaryServices = [
    {
      title: 'Fusiones y Adquisiciones',
      description: 'Asesoramiento integral en operaciones de M&A, desde la estrategia inicial hasta el cierre exitoso de la transacción.',
    },
    {
      title: 'Due Diligence',
      description: 'Análisis exhaustivo financiero, legal y comercial para identificar riesgos y oportunidades en cada inversión.',
    },
    {
      title: 'Corporate Finance',
      description: 'Estructuración financiera, levantamiento de capital y optimización de la estructura de balance.',
    },
    {
      title: 'Reestructuraciones',
      description: 'Procesos de reestructuración operativa y financiera para maximizar el valor empresarial.',
    },
    {
      title: 'Estrategia Corporativa',
      description: 'Definición de estrategias de crecimiento inorgánico y identificación de oportunidades de mercado.',
    },
  ];

  return (
    <ErrorBoundary fallback={<ServicesSkeleton />}>
      <section id="servicios" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground mb-6 tracking-tight">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Servicios especializados en M&A y finanzas corporativas para impulsar el crecimiento de tu empresa.
            </p>
          </div>

          {/* Core Services - Legal Style Cards */}
          <div className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {coreServices.map((service, index) => (
                <div key={index} className="group">
                  <div className="bg-card border border-border rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
                    {/* Title */}
                    <h3 className="text-xl font-light text-foreground mb-4 tracking-tight">
                      {service.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground mb-6 leading-relaxed text-base font-light">
                      {service.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                          <span className="text-muted-foreground text-sm font-light">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <Button variant="outline" className="w-full text-sm py-3 font-light">
                      Más información
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complementary Services - Legal Style */}
          <div>
            <h3 className="text-xl font-light text-foreground text-center mb-8 tracking-tight">
              Servicios Complementarios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complementaryServices.map((service, index) => (
                <Card key={index} className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-out group cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-base font-medium text-foreground mb-3">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm font-light">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default Services;
