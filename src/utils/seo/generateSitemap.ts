import { supabase } from '@/integrations/supabase/client';

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: {
    lang: string;
    href: string;
  }[];
}

// Rutas estáticas con soporte multilingüe
const staticRoutes: SitemapURL[] = [
  // === HOME ===
  {
    loc: 'https://capittal.es/',
    changefreq: 'weekly',
    priority: 1.0,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/' },
      { lang: 'ca', href: 'https://capittal.es/ca' },
      { lang: 'en', href: 'https://capittal.es/en' },
      { lang: 'x-default', href: 'https://capittal.es/' }
    ]
  },
  
  // === MAIN PAGES ===
  {
    loc: 'https://capittal.es/venta-empresas',
    changefreq: 'weekly',
    priority: 0.9,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/venta-empresas' },
      { lang: 'ca', href: 'https://capittal.es/venda-empreses' },
      { lang: 'en', href: 'https://capittal.es/sell-companies' }
    ]
  },
  {
    loc: 'https://capittal.es/compra-empresas',
    changefreq: 'weekly',
    priority: 0.9,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/compra-empresas' },
      { lang: 'ca', href: 'https://capittal.es/compra-empreses' },
      { lang: 'en', href: 'https://capittal.es/buy-companies' }
    ]
  },
  {
    loc: 'https://capittal.es/contacto',
    changefreq: 'monthly',
    priority: 0.9,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/contacto' },
      { lang: 'ca', href: 'https://capittal.es/contacte' },
      { lang: 'en', href: 'https://capittal.es/contact' }
    ]
  },
  {
    loc: 'https://capittal.es/por-que-elegirnos',
    changefreq: 'monthly',
    priority: 0.8,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/por-que-elegirnos' },
      { lang: 'ca', href: 'https://capittal.es/per-que-triar-nos' },
      { lang: 'en', href: 'https://capittal.es/why-choose-us' }
    ]
  },
  {
    loc: 'https://capittal.es/equipo',
    changefreq: 'monthly',
    priority: 0.7,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/equipo' },
      { lang: 'ca', href: 'https://capittal.es/equip' },
      { lang: 'en', href: 'https://capittal.es/team' }
    ]
  },
  {
    loc: 'https://capittal.es/casos-exito',
    changefreq: 'monthly',
    priority: 0.8,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/casos-exito' },
      { lang: 'ca', href: 'https://capittal.es/casos-exit' },
      { lang: 'en', href: 'https://capittal.es/success-stories' }
    ]
  },
  {
    loc: 'https://capittal.es/programa-colaboradores',
    changefreq: 'monthly',
    priority: 0.7,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/programa-colaboradores' },
      { lang: 'ca', href: 'https://capittal.es/programa-col-laboradors' },
      { lang: 'en', href: 'https://capittal.es/collaborators-program' }
    ]
  },
  
  // === LANDING PAGES - Alta Prioridad ===
  {
    loc: 'https://capittal.es/lp/calculadora',
    changefreq: 'weekly',
    priority: 0.95
  },
  {
    loc: 'https://capittal.es/lp/calculadora-fiscal',
    changefreq: 'weekly',
    priority: 0.95
  },
  {
    loc: 'https://capittal.es/lp/calculadora-asesores',
    changefreq: 'weekly',
    priority: 0.95
  },
  {
    loc: 'https://capittal.es/lp/venta-empresas',
    changefreq: 'monthly',
    priority: 0.9
  },
  {
    loc: 'https://capittal.es/lp/suiteloop',
    changefreq: 'monthly',
    priority: 0.85
  },
  
  // === SERVICIOS ===
  {
    loc: 'https://capittal.es/servicios/valoraciones',
    changefreq: 'monthly',
    priority: 0.9,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/servicios/valoraciones' },
      { lang: 'ca', href: 'https://capittal.es/serveis/valoracions' },
      { lang: 'en', href: 'https://capittal.es/services/valuations' }
    ]
  },
  {
    loc: 'https://capittal.es/servicios/venta-empresas',
    changefreq: 'monthly',
    priority: 0.9,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/servicios/venta-empresas' },
      { lang: 'ca', href: 'https://capittal.es/serveis/venda-empreses' },
      { lang: 'en', href: 'https://capittal.es/services/sell-companies' }
    ]
  },
  {
    loc: 'https://capittal.es/servicios/due-diligence',
    changefreq: 'monthly',
    priority: 0.85,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/servicios/due-diligence' },
      { lang: 'ca', href: 'https://capittal.es/serveis/due-diligence' },
      { lang: 'en', href: 'https://capittal.es/services/due-diligence' }
    ]
  },
  {
    loc: 'https://capittal.es/servicios/asesoramiento-legal',
    changefreq: 'monthly',
    priority: 0.85,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/servicios/asesoramiento-legal' },
      { lang: 'ca', href: 'https://capittal.es/serveis/assessorament-legal' },
      { lang: 'en', href: 'https://capittal.es/services/legal-advisory' }
    ]
  },
  {
    loc: 'https://capittal.es/servicios/reestructuraciones',
    changefreq: 'monthly',
    priority: 0.8,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/servicios/reestructuraciones' },
      { lang: 'ca', href: 'https://capittal.es/serveis/reestructuracions' },
      { lang: 'en', href: 'https://capittal.es/services/restructuring' }
    ]
  },
  {
    loc: 'https://capittal.es/servicios/planificacion-fiscal',
    changefreq: 'monthly',
    priority: 0.8,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/servicios/planificacion-fiscal' },
      { lang: 'ca', href: 'https://capittal.es/serveis/planificacio-fiscal' },
      { lang: 'en', href: 'https://capittal.es/services/tax-planning' }
    ]
  },
  
  // === SECTORES ===
  {
    loc: 'https://capittal.es/sectores/tecnologia',
    changefreq: 'monthly',
    priority: 0.75,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/sectores/tecnologia' },
      { lang: 'ca', href: 'https://capittal.es/sectors/tecnologia' },
      { lang: 'en', href: 'https://capittal.es/sectors/technology' }
    ]
  },
  {
    loc: 'https://capittal.es/sectores/healthcare',
    changefreq: 'monthly',
    priority: 0.75,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/sectores/healthcare' },
      { lang: 'ca', href: 'https://capittal.es/sectors/salut' },
      { lang: 'en', href: 'https://capittal.es/sectors/healthcare' }
    ]
  },
  {
    loc: 'https://capittal.es/sectores/industrial',
    changefreq: 'monthly',
    priority: 0.75,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/sectores/industrial' },
      { lang: 'ca', href: 'https://capittal.es/sectors/industrial' },
      { lang: 'en', href: 'https://capittal.es/sectors/industrial' }
    ]
  },
  {
    loc: 'https://capittal.es/sectores/retail-consumer',
    changefreq: 'monthly',
    priority: 0.75,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/sectores/retail-consumer' },
      { lang: 'ca', href: 'https://capittal.es/sectors/retail-consum' },
      { lang: 'en', href: 'https://capittal.es/sectors/retail-consumer' }
    ]
  },
  {
    loc: 'https://capittal.es/sectores/energia',
    changefreq: 'monthly',
    priority: 0.75,
    alternates: [
      { lang: 'es', href: 'https://capittal.es/sectores/energia' },
      { lang: 'ca', href: 'https://capittal.es/sectors/energia' },
      { lang: 'en', href: 'https://capittal.es/sectors/energy' }
    ]
  },
  
  // === RECURSOS ===
  {
    loc: 'https://capittal.es/recursos/blog',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    loc: 'https://capittal.es/recursos/case-studies',
    changefreq: 'monthly',
    priority: 0.75
  },
  
  // === LEGAL ===
  {
    loc: 'https://capittal.es/politica-privacidad',
    changefreq: 'yearly',
    priority: 0.3
  },
  {
    loc: 'https://capittal.es/terminos-uso',
    changefreq: 'yearly',
    priority: 0.3
  },
  {
    loc: 'https://capittal.es/cookies',
    changefreq: 'yearly',
    priority: 0.3
  }
];

const generateUrlEntry = (url: SitemapURL): string => {
  const { loc, lastmod, changefreq, priority, alternates } = url;
  const today = new Date().toISOString().split('T')[0];
  
  let entry = `  <url>\n    <loc>${loc}</loc>`;
  
  if (lastmod) {
    entry += `\n    <lastmod>${lastmod}</lastmod>`;
  } else {
    entry += `\n    <lastmod>${today}</lastmod>`;
  }
  
  if (changefreq) {
    entry += `\n    <changefreq>${changefreq}</changefreq>`;
  }
  
  if (priority !== undefined) {
    entry += `\n    <priority>${priority}</priority>`;
  }
  
  // Añadir hreflang alternates si existen
  if (alternates && alternates.length > 0) {
    alternates.forEach(alt => {
      entry += `\n    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`;
    });
  }
  
  entry += `\n  </url>`;
  
  return entry;
};

export const generateFullSitemap = async (): Promise<string> => {
  try {
    // Obtener blog posts dinámicos
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }
    
    // Generar URLs de blog
    const blogUrls: SitemapURL[] = posts?.map(post => ({
      loc: `https://capittal.es/blog/${post.slug}`,
      lastmod: new Date(post.updated_at).toISOString().split('T')[0],
      changefreq: 'monthly' as const,
      priority: 0.7
    })) || [];
    
    // Combinar rutas estáticas y dinámicas
    const allUrls = [...staticRoutes, ...blogUrls];
    
    // Generar XML
    const urlEntries = allUrls.map(generateUrlEntry).join('\n');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
    
    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return '';
  }
};

export const downloadSitemap = async () => {
  const sitemap = await generateFullSitemap();
  if (!sitemap) return;
  
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  link.click();
  URL.revokeObjectURL(url);
};
