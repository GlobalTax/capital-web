import { supabase } from '@/integrations/supabase/client';

const BASE = 'https://capittal.es';

interface RouteEntry {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const staticRoutes: RouteEntry[] = [
  // Homepage
  { path: '/', changefreq: 'weekly', priority: 1.0 },

  // Servicios
  { path: '/servicios/venta-empresas', changefreq: 'monthly', priority: 0.9 },
  { path: '/servicios/compra-empresas', changefreq: 'monthly', priority: 0.9 },
  { path: '/servicios/valoraciones', changefreq: 'monthly', priority: 0.9 },
  { path: '/servicios/due-diligence', changefreq: 'monthly', priority: 0.85 },
  { path: '/servicios/reestructuraciones', changefreq: 'monthly', priority: 0.8 },
  { path: '/servicios/planificacion-fiscal', changefreq: 'monthly', priority: 0.8 },

  // Sectores
  { path: '/sectores/seguridad', changefreq: 'monthly', priority: 0.8 },
  { path: '/sectores/tecnologia', changefreq: 'monthly', priority: 0.75 },
  { path: '/sectores/industrial', changefreq: 'monthly', priority: 0.75 },
  { path: '/sectores/healthcare', changefreq: 'monthly', priority: 0.75 },
  { path: '/sectores/energia', changefreq: 'monthly', priority: 0.75 },
  { path: '/sectores/construccion', changefreq: 'monthly', priority: 0.75 },
  { path: '/sectores/logistica', changefreq: 'monthly', priority: 0.75 },
  { path: '/sectores/medio-ambiente', changefreq: 'monthly', priority: 0.75 },
  { path: '/sectores/retail', changefreq: 'monthly', priority: 0.75 },
  { path: '/sectores/alimentacion', changefreq: 'monthly', priority: 0.75 },

  // Páginas estáticas
  { path: '/equipo', changefreq: 'monthly', priority: 0.7 },
  { path: '/contacto', changefreq: 'monthly', priority: 0.9 },
  { path: '/recursos/blog', changefreq: 'weekly', priority: 0.8 },
  { path: '/lp/calculadora', changefreq: 'weekly', priority: 0.95 },
  { path: '/por-que-elegirnos', changefreq: 'monthly', priority: 0.8 },
  { path: '/casos-exito', changefreq: 'monthly', priority: 0.8 },
  { path: '/search-funds', changefreq: 'monthly', priority: 0.7 },
  { path: '/programa-colaboradores', changefreq: 'monthly', priority: 0.7 },
];

export const generateFullSitemap = async (): Promise<string> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Static entries
    const staticEntries = staticRoutes.map(r =>
      `  <url>\n    <loc>${BASE}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    ).join('\n');

    // Dynamic blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    const blogEntries = posts?.map(post => {
      const lastmod = new Date(post.updated_at).toISOString().split('T')[0];
      return `  <url>\n    <loc>${BASE}/recursos/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }).join('\n') || '';
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
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
