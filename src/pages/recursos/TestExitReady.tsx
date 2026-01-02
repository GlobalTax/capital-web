import React, { useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ClipboardCheck, 
  TrendingUp, 
  FileText, 
  Users, 
  ArrowRight,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { ExitReadinessTestModal } from '@/components/exit-readiness';
import { Link } from 'react-router-dom';

const TestExitReady = () => {
  const [isTestOpen, setIsTestOpen] = useState(false);

  const benefits = [
    {
      icon: TrendingUp,
      title: "Maximiza el valor",
      description: "Los empresarios que preparan su empresa obtienen hasta un 25% más en la venta"
    },
    {
      icon: Clock,
      title: "Ahorra tiempo",
      description: "Un proceso bien preparado se cierra en la mitad de tiempo"
    },
    {
      icon: Shield,
      title: "Reduce riesgos",
      description: "Identifica y mitiga problemas antes de que afecten la negociación"
    }
  ];

  const preparationSteps = [
    {
      step: 1,
      title: "Diagnóstico",
      description: "Análisis DAFO, valoración inicial y evaluación de preparación"
    },
    {
      step: 2,
      title: "Optimización",
      description: "Mejoras operativas, financieras y documentales"
    },
    {
      step: 3,
      title: "Documentación",
      description: "Preparación del data room y memorándum de venta"
    },
    {
      step: 4,
      title: "Posicionamiento",
      description: "Teaser confidencial y búsqueda de compradores cualificados"
    }
  ];

  return (
    <UnifiedLayout variant="home">
      <SEOHead 
        title="Test Exit-Ready - ¿Está tu empresa preparada para la venta? | Capittal"
        description="Descubre si tu empresa está lista para venderse con nuestro test gratuito de 8 preguntas. Evaluación en 2 minutos con recomendaciones personalizadas."
        canonical="https://capittal.es/recursos/test-exit-ready"
        keywords="test preparación venta empresa, exit ready, valoración empresa, preparar empresa para vender"
      />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <ClipboardCheck className="w-4 h-4" />
                Test gratuito • 2 minutos
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                ¿Está tu empresa preparada para la venta?
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Responde 8 preguntas y descubre tu nivel de preparación para maximizar 
                el valor en una operación de venta.
              </p>
              <Button 
                size="lg" 
                onClick={() => setIsTestOpen(true)}
                className="text-lg px-8"
              >
                Comenzar Test
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="hidden md:block">
              <Card className="bg-card border-border shadow-xl">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-muted-foreground">8 preguntas clave</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-muted-foreground">Puntuación de 0-80</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-muted-foreground">Recomendaciones personalizadas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-muted-foreground">100% confidencial</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Por qué es importante prepararse?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La preparación previa a la venta es la diferencia entre una transacción 
              exitosa y una oportunidad perdida.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              El proceso Exit-Ready
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los 4 pasos para preparar tu empresa y maximizar su valor de venta.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {preparationSteps.map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-card rounded-lg p-6 border border-border h-full">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para descubrir tu nivel de preparación?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Completa el test en 2 minutos y recibe un diagnóstico personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setIsTestOpen(true)}
            >
              Hacer el Test Exit-Ready
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link to="/lp/calculadora">
              <Button variant="outline" size="lg">
                Valorar mi empresa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Test Modal */}
      <ExitReadinessTestModal 
        isOpen={isTestOpen} 
        onClose={() => setIsTestOpen(false)} 
      />
    </UnifiedLayout>
  );
};

export default TestExitReady;
