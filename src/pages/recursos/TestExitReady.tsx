import React, { useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ClipboardCheck, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Quote,
  Users,
  Target,
  FileSearch,
  BarChart3
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
      icon: FileSearch,
      title: "Diagnóstico",
      description: "Análisis exhaustivo de actividades, procesos, modelo de negocio, rendimiento financiero y estructura organizativa"
    },
    {
      step: 2,
      icon: Target,
      title: "Optimización",
      description: "Identificación de mejoras que aumenten la comerciabilidad y el valor de tu empresa"
    },
    {
      step: 3,
      icon: BarChart3,
      title: "Implementación",
      description: "Ejecución del plan de acción para abordar todas las áreas de mejora identificadas"
    },
    {
      step: 4,
      icon: CheckCircle,
      title: "Exit-Ready",
      description: "Tu empresa está preparada para conseguir el máximo valor en la operación de venta"
    }
  ];

  const relatedArticles = [
    {
      title: "¿Cuál es el mejor momento para vender tu empresa?",
      description: "Factores clave que determinan el timing óptimo para una operación de venta.",
      href: "/blog"
    },
    {
      title: "Due Diligence: Qué preparar antes de la venta",
      description: "Guía completa sobre la documentación necesaria para el proceso de due diligence.",
      href: "/blog"
    },
    {
      title: "Valoración de empresas: Métodos y factores clave",
      description: "Cómo se determina el valor de una empresa y qué factores influyen más.",
      href: "/blog"
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
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Prepara tu empresa para la venta
              </h1>
              <p className="text-xl text-primary font-medium mb-6">
                Haz el test de preparación Exit-Ready
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                ¿Alguna vez has pensado en vender tu empresa? Entonces es lógico que quieras 
                abordar el proceso de venta de la mejor manera posible. Por eso, una preparación 
                adecuada y conocer el proceso de venta son fundamentales. Muchos empresarios 
                empiezan a prepararse demasiado tarde y pierden oportunidades innecesariamente.
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
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Maximiza el valor de tu empresa
                  </h3>
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

      {/* Importance Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            La importancia de una buena preparación
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="leading-relaxed">
              Comenzar el proceso de venta bien preparado puede generar beneficios 
              significativos a largo plazo. Además de prepararte mentalmente para este 
              gran paso, puedes obtener información valiosa sobre cómo optimizar tu empresa 
              para una venta exitosa, identificando debilidades, riesgos, fortalezas, 
              oportunidades y amenazas.
            </p>
            <p className="leading-relaxed">
              Esto es lo que se conoce como conseguir que tu empresa esté <strong className="text-foreground">exit-ready</strong>. 
              Implementar estas optimizaciones a tiempo hará que tu empresa sea más 
              atractiva para los compradores potenciales y aumentará su valor. Con los 
              conocimientos adecuados y una preparación organizada, tendrás más control 
              sobre el resultado de la operación.
            </p>
            <p className="leading-relaxed font-medium text-foreground">
              Asegúrate de que vender tu empresa no sea algo que te suceda, sino que 
              tomes el control del proceso.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
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
              <Card key={index} className="border-border hover:shadow-lg transition-shadow bg-card">
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

      {/* How to Prepare Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Cómo preparar tu empresa para la venta
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="leading-relaxed">
              Una buena preparación tiene un efecto positivo en el valor de la empresa 
              y te prepara mentalmente para una posible venta. Además, las empresas con 
              una base sólida y una buena presentación son preferidas por los compradores 
              potenciales. Por eso es fundamental recorrer todos los pasos del proceso exit-ready.
            </p>
            <p className="leading-relaxed">
              Por eso es fundamental empezar por la base: analizar exhaustivamente las 
              actividades y procesos de tu empresa, el modelo de negocio, el rendimiento 
              financiero, la estructura organizativa y el valor actual de la empresa.
            </p>
            <p className="leading-relaxed">
              Una vez claro este análisis, puedes identificar las posibilidades de 
              optimización que aumenten la comerciabilidad y el valor de tu negocio. 
              Tras elaborar un plan de acción, puedes empezar a implementar estas 
              optimizaciones. Cuando se hayan abordado todas las áreas de mejora, 
              podrás conseguir un mayor valor empresarial y tú y tu empresa estaréis 
              listos para la venta.
            </p>
          </div>
        </div>
      </section>

      {/* Expert Quote Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-l-4 border-l-primary bg-card">
            <CardContent className="p-8 md:p-12">
              <Quote className="w-12 h-12 text-primary/30 mb-6" />
              <blockquote className="text-2xl md:text-3xl font-medium text-foreground mb-6 leading-relaxed">
                "Muchos empresarios empiezan a prepararse demasiado tarde 
                y pierden oportunidades innecesariamente."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Equipo Exit-Ready</p>
                  <p className="text-sm text-muted-foreground">Capittal M&A Advisory</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              El proceso Exit-Ready de Capittal
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              El equipo de Capittal está formado por profesionales con experiencia en 
              operaciones de M&A que entienden las preocupaciones de los empresarios. 
              Por eso te entendemos como nadie y te ayudaremos a prepararte a ti y a 
              tu empresa para la venta.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {preparationSteps.map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-card rounded-lg p-6 border border-border h-full hover:shadow-lg transition-shadow">
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

          <div className="text-center text-muted-foreground max-w-3xl mx-auto">
            <p className="leading-relaxed">
              Siempre analizamos las cosas desde la perspectiva de los compradores 
              potenciales, porque sabemos exactamente en qué se fijan. Aplicamos un 
              enfoque personalizado y, juntos, desarrollamos un plan para asegurarnos 
              de que obtengas el máximo beneficio de la operación. En resumen, somos 
              tu asesor de confianza en quien puedes confiar durante todo el proceso.
            </p>
          </div>
        </div>
      </section>

      {/* Main CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Está tu empresa preparada para la venta?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Descubre tu nivel de preparación en 2 minutos con nuestro test gratuito.
          </p>
          <Button 
            size="lg" 
            onClick={() => setIsTestOpen(true)}
            className="text-lg px-10 py-6"
          >
            Haz el Test
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Related Articles Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Artículos relacionados
            </h2>
            <p className="text-lg text-muted-foreground">
              Recursos adicionales para preparar tu empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedArticles.map((article, index) => (
              <Link key={index} to={article.href}>
                <Card className="border-border hover:shadow-lg transition-all hover:-translate-y-1 h-full bg-card">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {article.description}
                    </p>
                    <span className="text-primary font-medium text-sm inline-flex items-center gap-1">
                      Leer más
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ¿Prefieres hablar directamente con un experto?
          </h2>
          <p className="text-muted-foreground mb-8">
            Nuestro equipo está disponible para una consulta confidencial sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setIsTestOpen(true)}
            >
              Hacer el Test Exit-Ready
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link to="/contacto">
              <Button variant="outline" size="lg">
                Contactar con Capittal
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
