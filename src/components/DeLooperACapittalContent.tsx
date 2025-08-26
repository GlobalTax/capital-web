import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronRight, Calendar, Users, TrendingUp, Award, CheckCircle2, Play, Share2, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeLooperACapittalContent = () => {
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const timelineEvents = [
    {
      year: '2020',
      title: 'Fundación de Looper',
      description: 'Comenzamos como Looper con la visión de democratizar las valoraciones empresariales.',
      color: 'from-slate-500 to-slate-600'
    },
    {
      year: '2021-2022',
      title: 'Crecimiento y Evolución',
      description: 'Expandimos nuestros servicios y metodologías, ganando la confianza de cientos de empresarios.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      year: '2023',
      title: 'Transformación a Capittal',
      description: 'Evolucionamos a Capittal para reflejar mejor nuestra expertise en capital y valoraciones.',
      color: 'from-primary to-primary/80'
    },
    {
      year: '2024',
      title: 'Nuevo Futuro',
      description: 'Continuamos innovando con tecnología avanzada y metodologías más precisas.',
      color: 'from-green-500 to-green-600'
    }
  ];

  const beneficios = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Metodología Mejorada',
      description: 'Algoritmos más precisos y métodos de valoración actualizados con las últimas tendencias del mercado.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Equipo Especializado',
      description: 'Profesionales con mayor experiencia y especialización en diferentes sectores empresariales.'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Reconocimiento del Mercado',
      description: 'Mayor credibilidad y reconocimiento en el ecosistema empresarial español.'
    },
    {
      icon: <CheckCircle2 className="h-8 w-8" />,
      title: 'Mismos Valores',
      description: 'Mantenemos nuestro compromiso con la transparencia, precisión y excelencia en el servicio.'
    }
  ];

  const faqs = [
    {
      question: '¿Por qué cambiaron el nombre de Looper a Capittal?',
      answer: 'El cambio a Capittal refleja mejor nuestra especialización en capital empresarial y valoraciones. Queríamos un nombre que comunicara directamente nuestra expertise y fuera más fácil de recordar para nuestros clientes.'
    },
    {
      question: '¿Se mantienen los mismos servicios y calidad?',
      answer: 'Absolutamente. Todos nuestros servicios se mantienen y han mejorado. El equipo, la metodología y nuestro compromiso con la excelencia siguen siendo los mismos, pero con mejoras continuas.'
    },
    {
      question: '¿Qué pasa con mis valoraciones anteriores de Looper?',
      answer: 'Todas las valoraciones realizadas bajo la marca Looper siguen siendo válidas y accesibles. Hemos migrado todos los datos de manera segura y puedes acceder a tu historial sin problemas.'
    },
    {
      question: '¿Los precios y condiciones cambian?',
      answer: 'No, mantenemos la misma estructura de precios y condiciones. De hecho, hemos mejorado algunos de nuestros paquetes de servicios para ofrecer mayor valor a nuestros clientes.'
    },
    {
      question: '¿Cómo afecta esto a los clientes actuales?',
      answer: 'Para los clientes actuales, el cambio es completamente transparente. Seguirán recibiendo el mismo nivel de servicio premium, pero con las mejoras y innovaciones que viene con la nueva marca.'
    }
  ];

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = 'Descubre la evolución de Looper a Capittal';
    
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Nuestra Evolución
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            De <span className="text-muted-foreground">Looper</span> a{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Capittal
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Descubre la historia detrás de nuestra transformación y por qué decidimos evolucionar 
            para seguir siendo líderes en valoración empresarial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/contacto')} 
              size="lg"
              className="group"
            >
              Habla con Nosotros
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleShare('linkedin')}
              className="group"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartir Historia
            </Button>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-muted relative">
                <video
                  className="w-full h-full object-cover"
                  controls={videoPlaying}
                  poster="/videos/looper-a-capittal-thumb.jpg"
                  preload="metadata"
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                  aria-label="Video explicativo de la evolución de Looper a Capittal"
                >
                  <source src="/videos/looper-a-capittal.mp4" type="video/mp4" />
                  <p className="text-muted-foreground p-4">
                    Tu navegador no soporta la reproducción de video. 
                    <a href="/videos/looper-a-capittal.mp4" className="text-primary underline ml-1">
                      Descargar video
                    </a>
                  </p>
                </video>
                
                {!videoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer"
                       onClick={() => {
                         const video = document.querySelector('video');
                         if (video) {
                           video.play();
                           setVideoPlaying(true);
                         }
                       }}>
                    <div className="text-center">
                      <Button
                        size="lg"
                        className="mb-4 h-16 w-16 rounded-full p-0 shadow-lg hover:scale-105 transition-transform"
                      >
                        <Play className="h-6 w-6 ml-1" />
                      </Button>
                      <p className="text-muted-foreground text-sm font-medium">
                        Haz clic para ver nuestro video explicativo
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Nuestra Línea de Tiempo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un viaje de crecimiento continuo y evolución constante
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform md:-translate-x-0.5"></div>
            
            {timelineEvents.map((event, index) => (
              <div key={index} className="relative mb-12 last:mb-0">
                <div className={`flex items-start ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Punto en la línea */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary transform -translate-x-1.5 md:-translate-x-1.5 mt-6"></div>
                  
                  {/* Contenido */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`bg-gradient-to-r ${event.color} text-white`}>
                            {event.year}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{event.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Qué Mejora con Capittal?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Los mismos valores y compromiso, pero con mejoras significativas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {beneficios.map((beneficio, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary w-fit">
                  {beneficio.icon}
                </div>
                <CardTitle className="text-lg">{beneficio.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{beneficio.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resolvemos todas tus dudas sobre la transición
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Tienes Más Preguntas?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nuestro equipo está aquí para resolver cualquier duda sobre la transición 
              y explicarte cómo seguimos mejorando nuestros servicios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/contacto')} 
                size="lg"
                className="group"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contactar por Email
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = 'tel:+34900123456'}
                className="group"
              >
                <Phone className="mr-2 h-4 w-4" />
                Llamar Ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DeLooperACapittalContent;