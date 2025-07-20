
import React from 'react';

import Contact from '@/components/Contact';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CompraEmpresas = () => {
  const buyingReasons = [
    {
      title: "Expansión Estratégica",
      description: "Acelera tu crecimiento adquiriendo empresas complementarias",
      icon: "🚀"
    },
    {
      title: "Nuevos Mercados",
      description: "Accede a mercados internacionales o segmentos específicos",
      icon: "🌍"
    },
    {
      title: "Diversificación",
      description: "Reduce riesgos diversificando tu cartera de negocios",
      icon: "📊"
    },
    {
      title: "Economías de Escala",
      description: "Optimiza costes y mejora márgenes con sinergias operativas",
      icon: "⚡"
    }
  ];

  const acquisitionProcess = [
    {
      step: "1",
      title: "Definición de Estrategia",
      description: "Identificamos el perfil ideal de empresa objetivo según tus criterios"
    },
    {
      step: "2", 
      title: "Búsqueda y Análisis",
      description: "Localizamos y evaluamos empresas que se ajusten a tu estrategia"
    },
    {
      step: "3",
      title: "Due Diligence",
      description: "Realizamos análisis exhaustivo financiero, legal y operativo"
    },
    {
      step: "4",
      title: "Negociación",
      description: "Gestionamos la negociación para obtener las mejores condiciones"
    },
    {
      step: "5",
      title: "Cierre",
      description: "Acompañamos hasta el cierre exitoso de la operación"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-slate-900 to-slate-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 text-sm uppercase tracking-wide">
              Servicios de Adquisición
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Compra de<br />Empresas
            </h1>
            
            <p className="text-xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed">
              Te ayudamos a identificar, evaluar y adquirir empresas que potencien tu crecimiento estratégico. 
              Con nuestra experiencia en M&A, encontrarás las mejores oportunidades del mercado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button className="capittal-button text-lg px-8 py-4 bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                Buscar Empresas
              </Button>
              
              <Button variant="outline" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                Ver Casos de Éxito
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Buy Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              ¿Por Qué Adquirir una Empresa?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              La adquisición estratégica puede ser el catalizador que tu empresa necesita 
              para acelerar su crecimiento y alcanzar nuevos objetivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {buyingReasons.map((reason, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{reason.icon}</div>
                  <CardTitle className="text-xl">{reason.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {reason.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Nuestro Proceso de Adquisición
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Un proceso estructurado y probado que maximiza las probabilidades de éxito 
              y minimiza los riesgos en cada adquisición.
            </p>
          </div>

          <div className="space-y-8">
            {acquisitionProcess.map((process, index) => (
              <div 
                key={index}
                className="flex flex-col md:flex-row items-center gap-8 bg-background rounded-lg p-8 shadow-sm"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                    {process.step}
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {process.title}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {process.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Contact Section */}
      <Contact />
    </div>
  );
};

export default CompraEmpresas;
