import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import { Calendar, TrendingUp, BarChart3, Building2, ArrowRight, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { BlogPost } from '@/types/blog';

const AUTHORITY_STATS = [
  { icon: BarChart3, value: '500+', label: 'Valoraciones realizadas' },
  { icon: Building2, value: '12', label: 'Sectores analizados' },
  { icon: TrendingUp, value: '5+', label: 'Años de datos propietarios' },
  { icon: FileText, value: 'Trimestral', label: 'Frecuencia de publicación' },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Informes Trimestrales M&A España",
    description: "Informes trimestrales del mercado de fusiones y adquisiciones en España con datos propietarios de Capittal basados en más de 500 valoraciones.",
    url: "https://capittal.es/recursos/informes-ma",
    publisher: {
      "@type": "Organization",
      name: "Capittal Transacciones",
      url: "https://capittal.es",
    },
    about: {
      "@type": "Thing",
      name: "Mercado M&A España",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    name: "Datos Propietarios M&A España - Capittal",
    description: "Múltiplos EV/EBITDA por sector, volumen de operaciones y tendencias del mercado M&A español. Datos extraídos de más de 500 valoraciones realizadas por Capittal.",
    url: "https://capittal.es/recursos/informes-ma",
    creator: {
      "@type": "Organization",
      name: "Capittal Transacciones",
    },
    temporalCoverage: "2020/..",
    spatialCoverage: {
      "@type": "Place",
      name: "España",
    },
  },
];

const InformesMA: React.FC = () => {
  const { data: informes = [], isLoading } = useQuery({
    queryKey: ['informes-ma'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', 'Informes M&A')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const extractQuarter = (title: string): string => {
    const match = title.match(/Q(\d)\s*(\d{4})/i);
    return match ? `Q${match[1]} ${match[2]}` : '';
  };

  return (
    <>
      <SEOHead
        title="Informes Trimestrales M&A España | Datos Propietarios | Capittal"
        description="Informes trimestrales del mercado M&A en España con datos propietarios de Capittal: múltiplos EV/EBITDA por sector, volumen de operaciones y tendencias. Basado en +500 valoraciones."
        canonical="https://capittal.es/recursos/informes-ma"
        structuredData={structuredData}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <TrendingUp className="w-4 h-4" />
                Datos propietarios de Capittal
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Informes Trimestrales del Mercado M&A en España
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10">
                Análisis con datos propietarios extraídos de más de 500 valoraciones realizadas. 
                Múltiplos EV/EBITDA por sector, volumen de operaciones y tendencias del mercado español.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {AUTHORITY_STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-16 lg:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main: Informes grid */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-foreground mb-8">Todos los Informes</h2>
                {isLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                  </div>
                ) : informes.length === 0 ? (
                  <div className="text-center py-16 bg-muted/50 rounded-xl">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Próximamente: primer informe trimestral.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {informes.map((informe, idx) => {
                      const quarter = extractQuarter(informe.title);
                      const publishedDate = informe.published_at
                        ? new Date(informe.published_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                        : '';
                      return (
                        <Link
                          key={informe.id}
                          to={`/blog/${informe.slug}`}
                          className={`block group rounded-xl border transition-all hover:shadow-lg ${
                            idx === 0
                              ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30'
                              : 'border-border bg-card'
                          }`}
                        >
                          <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-3">
                              {quarter && (
                                <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                                  {quarter}
                                </span>
                              )}
                              {idx === 0 && (
                                <span className="inline-flex items-center bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2 py-0.5 rounded">
                                  Último
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                <Calendar className="w-3 h-3" />
                                {publishedDate}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                              {informe.title}
                            </h3>
                            {informe.excerpt && (
                              <p className="text-muted-foreground text-sm line-clamp-2">{informe.excerpt}</p>
                            )}
                            <div className="flex items-center gap-2 mt-4 text-sm font-medium text-primary">
                              Leer informe completo
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-8">
                {/* Methodology card */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-3">Metodología</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nuestros informes se basan en datos propietarios de más de 500 valoraciones realizadas por Capittal, 
                    complementados con datos públicos de TTR, SABI y el Registro Mercantil.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Múltiplos EV/EBITDA sectoriales propios
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Análisis de volumen y tendencias
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Perspectivas trimestrales
                    </li>
                  </ul>
                </div>

                {/* Newsletter CTA */}
                <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
                  <Mail className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold mb-2">Recibe cada informe</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    Suscríbete a nuestra newsletter y recibe cada informe trimestral en tu email.
                  </p>
                  <Button asChild variant="secondary" className="w-full">
                    <Link to="/recursos/newsletter">Suscribirme</Link>
                  </Button>
                </div>

                {/* CTA profesional */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-2">¿Necesitas un análisis personalizado?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Solicita una valoración profesional de tu empresa con datos sectoriales específicos.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/contacto">Solicitar valoración</Link>
                  </Button>
                </div>

                {/* Related links */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-3">Contenido relacionado</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link to="/valoracion-empresas" className="text-primary hover:underline">
                        Calculadora de Valoración
                      </Link>
                    </li>
                    <li>
                      <Link to="/guia-valoracion-empresas" className="text-primary hover:underline">
                        Guía de Métodos de Valoración
                      </Link>
                    </li>
                    <li>
                      <Link to="/recursos/blog" className="text-primary hover:underline">
                        Blog M&A
                      </Link>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default InformesMA;
