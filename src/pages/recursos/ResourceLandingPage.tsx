import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import ResourceGateForm from '@/components/recursos/ResourceGateForm';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2, Download, HelpCircle, Shield, Users } from 'lucide-react';
import type { LeadMagnet } from '@/types/leadMagnets';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const GATE_FAQ = [
  {
    q: '¿Es realmente gratis?',
    a: 'Sí, 100% gratis. Solo te pedimos tus datos de contacto para enviarte el recurso y mantenerte informado sobre contenido similar.',
  },
  {
    q: '¿Por qué piden mis datos?',
    a: 'Para poder enviarte el recurso directamente y notificarte cuando publiquemos nuevos contenidos relevantes para tu sector. Nunca compartiremos tu información con terceros.',
  },
  {
    q: '¿Puedo darme de baja después?',
    a: 'Por supuesto. Todos nuestros emails incluyen un enlace de desuscripción. Puedes darte de baja en cualquier momento con un solo clic.',
  },
];

const ResourceLandingPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['lead_magnet_by_slug', slug],
    queryFn: async () => {
      // Try by slug first, then by id
      let { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('landing_page_slug', slug)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        const byId = await supabase
          .from('lead_magnets')
          .select('*')
          .eq('id', slug!)
          .eq('status', 'active')
          .single();
        if (byId.error) throw byId.error;
        data = byId.data;
      }

      return data as LeadMagnet;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error || !resource) {
    return (
      <UnifiedLayout>
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Recurso no encontrado</h1>
          <p className="text-muted-foreground mb-8">El recurso que buscas no está disponible o ha sido retirado.</p>
          <Link to="/recursos/biblioteca" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver a la biblioteca
          </Link>
        </div>
      </UnifiedLayout>
    );
  }

  const resourceSlug = resource.landing_page_slug || resource.id;

  return (
    <UnifiedLayout>
      <SEOHead
        title={resource.meta_title || `${resource.title} | Recurso Gratuito | Capittal`}
        description={resource.meta_description || resource.description}
        canonical={`https://capittal.es/recursos/biblioteca/${resourceSlug}`}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/recursos/biblioteca" className="hover:text-foreground transition-colors">
              Biblioteca
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{resource.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Split */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Left: Content */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/5 rounded-full px-3 py-1 mb-4">
                  {resource.type === 'report' ? 'Informe' : resource.type === 'whitepaper' ? 'Whitepaper' : resource.type === 'checklist' ? 'Checklist' : 'Plantilla'}
                  {resource.sector ? ` · ${resource.sector}` : ''}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
                  {resource.title}
                </h1>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {resource.description}
              </p>

              {/* Benefits */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">¿Qué vas a encontrar?</h2>
                <ul className="space-y-3">
                  {[
                    'Datos actualizados y análisis del mercado',
                    'Metodología práctica y aplicable',
                    'Casos reales y ejemplos detallados',
                    'Herramientas y plantillas descargables',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social proof */}
              {resource.download_count > 0 && (
                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Download className="w-4 h-4" />
                    <span><strong className="text-foreground">{resource.download_count.toLocaleString('es-ES')}</strong> descargas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Profesionales M&A</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>100% gratuito</span>
                  </div>
                </div>
              )}

              {/* Image preview */}
              {resource.featured_image_url && (
                <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                  <img
                    src={resource.featured_image_url}
                    alt={resource.title}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <ResourceGateForm
                resourceSlug={resourceSlug}
                fileUrl={resource.file_url}
                resourceTitle={resource.title}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Preguntas frecuentes</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {GATE_FAQ.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-5 bg-background"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </UnifiedLayout>
  );
};

export default ResourceLandingPage;
