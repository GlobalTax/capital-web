import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { CampaignValuationForm } from '@/components/campaign/CampaignValuationForm';
import { TrendingUp, Calendar, Target } from 'lucide-react';

const LandingValoracion2026 = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Valoración Cierre de Año 2025 | Capittal</title>
        <meta
          name="description"
          content="Planifica tu 2026 con una valoración profesional de tu empresa. Conoce el valor real de tu negocio antes de cerrar el año."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://capittal.es/lp/valoracion-2026" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-4">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <h1 className="text-xl font-bold tracking-tight">CAPITTAL</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Left Column - Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Campaña Cierre de Año 2025
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  Planifica tu 2026 conociendo el valor de tu empresa
                </h2>

                <p className="text-muted-foreground text-lg">
                  El cierre de año es el momento perfecto para reflexionar sobre el valor de tu negocio y tomar decisiones estratégicas para el próximo año.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Valoración Profesional</h3>
                      <p className="text-muted-foreground text-sm">
                        Análisis detallado basado en metodología EBITDA y múltiplos de mercado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Planificación Estratégica</h3>
                      <p className="text-muted-foreground text-sm">
                        Identifica oportunidades y prepara tu empresa para el nuevo año
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">¿Por qué ahora?</strong> Los datos de cierre de 2025 te permiten obtener la valoración más precisa y actual de tu empresa.
                  </p>
                </div>
              </div>

              {/* Right Column - Form */}
              <div>
                <CampaignValuationForm />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-muted/30 border-t border-border py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Capittal</strong> – Asesoramiento en M&A y valoración de empresas
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <a href="https://capittal.es" className="hover:underline">
                capittal.es
              </a>{' '}
              |{' '}
              <a href="mailto:info@capittal.es" className="hover:underline">
                info@capittal.es
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingValoracion2026;
