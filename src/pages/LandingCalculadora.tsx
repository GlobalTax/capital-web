import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { CompanyDataV4 } from '@/types/valuationV4';
import StandaloneCompanyForm from '@/components/standalone/StandaloneCompanyForm';
import StandaloneCalculator from '@/components/standalone/StandaloneCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  Zap, 
  Shield, 
  CheckCircle, 
  Star,
  Users,
  Timer,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingCalculadora = () => {
  const [companyData, setCompanyData] = useState<CompanyDataV4 | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleFormSubmit = (data: CompanyDataV4) => {
    setCompanyData(data);
    // Scroll to calculator
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setCompanyData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Resultados Instantáneos",
      description: "Obtén tu valoración en menos de 2 minutos"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Cálculo Fiscal Español",
      description: "Incluye simulación completa de impuestos"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Múltiples Escenarios",
      description: "Conservador, base, optimista y personalizado"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Metodología Profesional",
      description: "Basado en múltiplos de mercado reales"
    }
  ];

  const stats = [
    { number: "500+", label: "Empresas Valoradas" },
    { number: "€2.5B", label: "En Transacciones" },
    { number: "98%", label: "Precisión" },
    { number: "24h", label: "Respuesta" }
  ];

  const testimonials = [
    {
      name: "Carlos Mendoza",
      company: "TechStart SL",
      text: "La calculadora me ayudó a entender el valor real de mi empresa antes de negociar con inversores.",
      rating: 5
    },
    {
      name: "María González", 
      company: "Distribuciones Norte",
      text: "Excelente herramienta. Los cálculos fiscales son muy precisos y me ahorraron tiempo.",
      rating: 5
    }
  ];

  if (companyData) {
    return (
      <>
        <Helmet>
          <title>Calculadora de Valoración - Resultado | Capittal</title>
          <meta name="description" content="Resultado de valoración personalizado para tu empresa con análisis fiscal completo." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <StandaloneCalculator companyData={companyData} onReset={handleReset} />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Calculadora Gratuita de Valoración de Empresas | Capittal</title>
        <meta name="description" content="Calcula gratis el valor de tu empresa en 2 minutos. Incluye análisis fiscal español, múltiples escenarios y metodología profesional. ¡Más de 500 empresas valoradas!" />
        <meta name="keywords" content="valoración empresas, calculadora gratuita, valor empresa, venta empresa, múltiplos EBITDA, análisis fiscal" />
        <link rel="canonical" href="https://capittal.com/calculadora-gratuita" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Calculadora Gratuita de Valoración de Empresas | Capittal" />
        <meta property="og:description" content="Descubre el valor de tu empresa gratis en 2 minutos con nuestra calculadora profesional" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://capittal.com/calculadora-gratuita" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Calculadora de Valoración Capittal",
            "description": "Herramienta gratuita para valorar empresas con análisis fiscal español",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
                <Star className="h-4 w-4 mr-2" />
                Herramienta #1 en España
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Calcula el Valor de tu Empresa
                <span className="block text-foreground mt-2">en 2 Minutos</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Herramienta profesional <strong>100% gratuita</strong> que incluye análisis fiscal español completo y múltiples escenarios de valoración.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                  <Timer className="h-4 w-4 text-primary" />
                  2 minutos
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                  500+ empresas
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                  <Shield className="h-4 w-4 text-primary" />
                  100% seguro
                </div>
              </div>
            </motion.div>

            {/* Calculator Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Datos de tu Empresa</h2>
                    <p className="text-muted-foreground">Completa la información para obtener tu valoración personalizada</p>
                  </div>
                  
                  <StandaloneCompanyForm onSubmit={handleFormSubmit} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">¿Por qué elegir nuestra calculadora?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                La herramienta más completa y precisa del mercado español
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground text-sm lg:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="p-6">
                    <CardContent className="p-0">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">¿Listo para conocer el valor de tu empresa?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Únete a más de 500 empresarios que ya han valorado su negocio con nuestra herramienta
              </p>
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg"
                onClick={() => {
                  document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Calcular Ahora Gratis
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <section className="py-8 border-t bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground max-w-4xl mx-auto">
              <strong>Aviso Legal:</strong> Esta calculadora proporciona una estimación orientativa basada en múltiplos de mercado. 
              El valor final puede variar según factores específicos de la empresa y las condiciones del mercado. 
              Para una valoración oficial, consulte con nuestros expertos.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingCalculadora;