
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import { Mail, TrendingUp, Users, Award } from 'lucide-react';

const NewsletterPage = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Tendencias del Mercado",
      description: "Análisis semanales de las tendencias más relevantes en M&A y valoración empresarial"
    },
    {
      icon: Users,
      title: "Casos de Éxito",
      description: "Historias reales de operaciones exitosas y lecciones aprendidas"
    },
    {
      icon: Award,
      title: "Insights Exclusivos",
      description: "Información privilegiada del mercado que solo compartimos con nuestros suscriptores"
    },
    {
      icon: Mail,
      title: "Directamente en tu Email",
      description: "Contenido curado y personalizado entregado semanalmente en tu bandeja de entrada"
    }
  ];

  const recentTopics = [
    "Valoraciones en SaaS: Los múltiplos que están pagando en 2024",
    "M&A en España: Análisis del primer trimestre del año",
    "Due Diligence Digital: Las nuevas métricas que debes conocer",
    "Tendencias de Exit: Qué buscan los compradores estratégicos",
    "Financiación de operaciones: El rol del private equity"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium mb-6">
                Newsletter Semanal
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Insights M&A que Impulsan Decisiones
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                Únete a más de 2,500 empresarios, inversores y profesionales que reciben 
                nuestro análisis semanal sobre el mercado de fusiones y adquisiciones.
              </p>
              
              {/* Newsletter Component */}
              <div className="max-w-md mx-auto">
                <Newsletter />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                ¿Qué Incluye Nuestro Newsletter?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Contenido exclusivo y actionable que te ayudará a tomar mejores decisiones de negocio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="bg-background border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 ease-out">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent Topics Section */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Temas Recientes
              </h2>
              <p className="text-lg text-muted-foreground">
                Algunos de los análisis que hemos compartido recientemente
              </p>
            </div>

            <div className="bg-muted/30 rounded-xl p-8">
              <ul className="space-y-4">
                {recentTopics.map((topic, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-4 mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-foreground leading-relaxed">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-background border border-border rounded-xl p-8 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">2,500+</div>
                  <div className="text-muted-foreground">Suscriptores activos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">4.8/5</div>
                  <div className="text-muted-foreground">Valoración promedio</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-2">89%</div>
                  <div className="text-muted-foreground">Tasa de apertura</div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">
                ¿Listo para Recibir Insights de Valor?
              </h3>
              <p className="text-muted-foreground mb-6">
                Únete a nuestra comunidad de profesionales y mantente siempre un paso adelante
              </p>
              
              <div className="max-w-md mx-auto">
                <Newsletter />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default NewsletterPage;
