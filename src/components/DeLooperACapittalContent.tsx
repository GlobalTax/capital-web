import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, TrendingUp, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartVideoPlayer from '@/components/video/SmartVideoPlayer';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const DeLooperACapittalContent = () => {
  const navigate = useNavigate();

  const trustMetrics = [
    { icon: <TrendingUp className="h-6 w-6" />, value: "4+ años", label: "de experiencia" },
    { icon: <Users className="h-6 w-6" />, value: "500+", label: "empresas valoradas" },
    { icon: <Award className="h-6 w-6" />, value: "100%", label: "datos migrados" }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section - Minimalista como la home */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido izquierda */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  De <span className="text-muted-foreground">Looper</span> a{' '}
                  <span className="text-primary">Capittal</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Evolucionamos para ofrecerte mejores metodologías, mayor precisión 
                  y el mismo compromiso de excelencia que nos caracteriza.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <InteractiveHoverButton
                  text="Solicitar Valoración"
                  onClick={() => navigate('/calculadora')}
                  variant="primary"
                />
                <InteractiveHoverButton
                  text="Hablar con Experto"
                  onClick={() => navigate('/contacto')}
                  variant="secondary"
                />
              </div>
            </div>

            {/* Video derecha */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <SmartVideoPlayer 
                  category="company-story"
                  showSelector={false}
                  className="w-full aspect-video"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Confianza Minimalista */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              La Misma Confianza, Mejores Resultados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nuestros clientes de Looper mantienen el mismo nivel de servicio premium, 
              ahora con las innovaciones de Capittal.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {trustMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  {metric.icon}
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué el cambio - Sección simple */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            ¿Por Qué Evolucionamos?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            El nombre Capittal refleja mejor nuestra especialización en capital empresarial y valoraciones. 
            Queríamos un nombre que comunicara directamente nuestra expertise y fuera más fácil de recordar.
          </p>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="text-base text-muted-foreground italic">
              "Todas las valoraciones realizadas bajo la marca Looper siguen siendo válidas. 
              Hemos migrado todos los datos de manera segura y mantienes acceso completo a tu historial."
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final Minimalista */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para Continuar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            El mismo equipo, la misma calidad, mejores resultados. 
            Descubre cómo podemos ayudarte hoy.
          </p>
          <InteractiveHoverButton
            text="Comenzar Valoración Gratuita"
            onClick={() => navigate('/calculadora')}
            variant="primary"
            className="text-lg px-8 py-4"
          />
        </div>
      </section>
    </div>
  );
};

export default DeLooperACapittalContent;