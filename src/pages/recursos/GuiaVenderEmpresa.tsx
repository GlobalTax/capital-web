import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getBreadcrumbSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLeadMagnetDownloads } from '@/hooks/useLeadMagnets';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, Download, CheckCircle2, Shield, FileText, 
  TrendingUp, Scale, ClipboardList, Users, ArrowRight,
  Building2, BadgeCheck
} from 'lucide-react';

const GUIDE_PDF_URL = '/downloads/guia-vender-empresa-capittal.pdf';

const chapters = [
  { icon: TrendingUp, title: '¿Cuánto vale tu empresa?', desc: 'Métodos de valoración y múltiplos sectoriales' },
  { icon: ClipboardList, title: 'Preparación pre-venta', desc: 'Checklist de 20+ puntos para maximizar valor' },
  { icon: FileText, title: 'Due Diligence', desc: 'Qué revisan los compradores y cómo prepararte' },
  { icon: Scale, title: 'Fiscalidad de la venta', desc: 'Impacto fiscal y estrategias de optimización' },
  { icon: Users, title: 'Búsqueda de compradores', desc: 'Cómo encontrar al comprador ideal' },
  { icon: Shield, title: 'Confidencialidad y NDA', desc: 'Protege tu información durante el proceso' },
  { icon: Building2, title: 'Negociación y cierre', desc: 'Claves para cerrar en las mejores condiciones' },
  { icon: BadgeCheck, title: 'Post-venta y transición', desc: 'Garantías, permanencia y traspaso operativo' },
];

const GuiaVenderEmpresa = () => {
  const location = useLocation();
  useHreflang();
  const { toast } = useToast();
  const { recordDownload } = useLeadMagnetDownloads();
  
  const [formData, setFormData] = useState({
    user_email: '',
    user_name: '',
    user_company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_email) return;

    setIsSubmitting(true);
    try {
      await recordDownload('guia-vender-empresa', {
        user_email: formData.user_email,
        user_name: formData.user_name || undefined,
        user_company: formData.user_company || undefined,
      });
      
      // Open PDF
      window.open(GUIDE_PDF_URL, '_blank');
      setIsDownloaded(true);
      
      toast({
        title: '¡Descarga iniciada!',
        description: 'La guía se ha abierto en una nueva pestaña.',
      });
    } catch (error) {
      console.error('Error recording download:', error);
      // Still allow download even if tracking fails
      window.open(GUIDE_PDF_URL, '_blank');
      setIsDownloaded(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Guía Gratuita para Vender tu Empresa | Capittal"
        description="Descarga gratis la guía completa de 12 capítulos para vender tu empresa: valoración, due diligence, fiscalidad, negociación y checklist."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="guía vender empresa, cómo vender empresa, proceso venta empresa, valoración empresa, due diligence"
        structuredData={[
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Recursos', url: 'https://capittal.es/recursos/blog' },
            { name: 'Guía para Vender tu Empresa', url: `https://capittal.es${location.pathname}` }
          ])
        ]}
      />
      <UnifiedLayout variant="home">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-20 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm text-white/80 mb-6">
                  <BookOpen className="h-4 w-4" />
                  Recurso gratuito · PDF descargable
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight mb-6">
                  Vende tu empresa al{' '}
                  <span className="text-blue-400">precio que realmente vale</span>
                </h1>

                <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
                  El 78% de los empresarios que venden sin preparación pierden entre un 15% y un 25% del valor real. Esta guía de 8 capítulos te enseña a evitarlo.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                    8 capítulos clave
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                    +20 páginas
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                    Checklist descargable
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                    100% gratuita
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                {!isDownloaded ? (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-primary/10 rounded-lg">
                        <Download className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Descarga gratuita</h2>
                        <p className="text-sm text-muted-foreground">Accede al PDF completo ahora</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="guide-email" className="block text-sm font-medium text-foreground mb-1.5">
                          Email profesional *
                        </label>
                        <Input
                          id="guide-email"
                          type="email"
                          required
                          placeholder="tu@empresa.com"
                          value={formData.user_email}
                          onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label htmlFor="guide-name" className="block text-sm font-medium text-foreground mb-1.5">
                          Nombre
                        </label>
                        <Input
                          id="guide-name"
                          type="text"
                          placeholder="Tu nombre"
                          value={formData.user_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label htmlFor="guide-company" className="block text-sm font-medium text-foreground mb-1.5">
                          Empresa
                        </label>
                        <Input
                          id="guide-company"
                          type="text"
                          placeholder="Nombre de tu empresa"
                          value={formData.user_company}
                          onChange={(e) => setFormData(prev => ({ ...prev, user_company: e.target.value }))}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-base font-semibold"
                      >
                        {isSubmitting ? 'Procesando...' : 'Descargar Guía Gratis'}
                        <Download className="ml-2 h-5 w-5" />
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        Sin spam. Política de privacidad. Puedes darte de baja en cualquier momento.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      ¡Descarga completada!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      La guía se ha abierto en una nueva pestaña. Si no se abrió automáticamente:
                    </p>
                    <Button
                      onClick={() => window.open(GUIDE_PDF_URL, '_blank')}
                      variant="outline"
                      className="mb-4"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Abrir PDF de nuevo
                    </Button>
                    <div className="border-t pt-6 mt-6">
                      <p className="text-sm font-medium text-foreground mb-3">
                        ¿Quieres saber cuánto vale tu empresa?
                      </p>
                      <Button asChild className="w-full">
                        <a href="/lp/calculadora">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Calcular Valoración Gratis
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Chapters */}
        <section className="py-20 bg-background">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-normal text-foreground tracking-tight mb-4">
                Qué encontrarás en la guía
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Contenido práctico y directo, basado en nuestra experiencia asesorando la venta de más de 100 empresas.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {chapters.map((chapter, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="p-2.5 bg-primary/5 rounded-lg w-fit mb-4 group-hover:bg-primary/10 transition-colors">
                    <chapter.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1.5 text-sm">
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {chapter.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof + secondary CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <blockquote className="text-lg sm:text-xl text-foreground italic leading-relaxed mb-6 max-w-3xl mx-auto">
              "El 78% de los empresarios que no se preparan adecuadamente para la venta acaban aceptando un precio entre un 15% y un 25% inferior al valor real de su empresa."
            </blockquote>
            <p className="text-sm text-muted-foreground mb-8">
              — Datos de nuestros procesos de M&A
            </p>

            {!isDownloaded && (
              <Button
                size="lg"
                onClick={() => document.getElementById('guide-email')?.focus()}
                className="h-12 px-8"
              >
                Descargar Guía Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </section>
      </UnifiedLayout>
    </>
  );
};

export default GuiaVenderEmpresa;
