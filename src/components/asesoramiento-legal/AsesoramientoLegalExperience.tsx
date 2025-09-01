import React from 'react';
import { Award, Building, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AsesoramientoLegalExperience = () => {
  const metrics = [
    {
      icon: Building,
      value: "+200",
      label: "Operaciones Legales",
      description: "Transacciones M&A exitosas"
    },
    {
      icon: TrendingUp,
      value: "98,7%",
      label: "Contratos Sin Reclamaciones",
      description: "Tasa de éxito en documentación"
    },
    {
      icon: Users,
      value: "15+",
      label: "Años de Experiencia",
      description: "En derecho corporativo"
    },
    {
      icon: Award,
      value: "€2.5B",
      label: "Valor Total Protegido",
      description: "En operaciones asesoradas"
    }
  ];

  return (
    <>
      {/* Partnership Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Trabajamos con Navarro Legal
          </h2>
          <p className="text-lg opacity-90">
            Para ofrecer la máxima seguridad jurídica en cada transacción. Nuestra alianza estratégica 
            combina experiencia en M&A con especialización legal corporativa.
          </p>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nuestra Experiencia Legal
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              La combinación de Capittal y Navarro Legal ofrece una cobertura legal integral 
              para operaciones corporativas complejas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {metrics.map((metric, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <metric.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{metric.value}</div>
                  <div className="font-semibold text-foreground mb-2">{metric.label}</div>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Sectores de Especialización
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Tecnología y Software</li>
                  <li>• Servicios Profesionales</li>
                  <li>• Industria y Manufactura</li>
                  <li>• Retail y Distribución</li>
                  <li>• Healthcare y Biotecnología</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Credenciales Navarro Legal
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Abogados especialistas en M&A</li>
                  <li>• Certificación en derecho corporativo</li>
                  <li>• Experiencia internacional</li>
                  <li>• Miembros del Colegio de Abogados</li>
                  <li>• Formación en derecho de la competencia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AsesoramientoLegalExperience;