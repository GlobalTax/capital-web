#!/usr/bin/env node
/**
 * Genera sitemap.xml con rutas estáticas + posts dinámicos del blog.
 * Ejecutar antes del build: node scripts/generate-sitemap.mjs
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fwhqtzkkvnjkazhaficj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I";

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const today = new Date().toISOString().split('T')[0];

// Rutas estáticas (mismas que generateSitemap.ts)
const staticUrls = [
  { loc: '/', priority: 1.0, changefreq: 'weekly', alternates: [{ lang: 'es', href: '/' }, { lang: 'ca', href: '/ca' }, { lang: 'en', href: '/en' }, { lang: 'x-default', href: '/' }] },
  { loc: '/venta-empresas', priority: 0.9, changefreq: 'weekly', alternates: [{ lang: 'es', href: '/venta-empresas' }, { lang: 'ca', href: '/venda-empreses' }, { lang: 'en', href: '/sell-companies' }] },
  { loc: '/compra-empresas', priority: 0.9, changefreq: 'weekly', alternates: [{ lang: 'es', href: '/compra-empresas' }, { lang: 'ca', href: '/compra-empreses' }, { lang: 'en', href: '/buy-companies' }] },
  { loc: '/contacto', priority: 0.9, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/contacto' }, { lang: 'ca', href: '/contacte' }, { lang: 'en', href: '/contact' }] },
  { loc: '/por-que-elegirnos', priority: 0.8, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/por-que-elegirnos' }, { lang: 'ca', href: '/per-que-triar-nos' }, { lang: 'en', href: '/why-choose-us' }] },
  { loc: '/equipo', priority: 0.7, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/equipo' }, { lang: 'ca', href: '/equip' }, { lang: 'en', href: '/team' }] },
  { loc: '/casos-exito', priority: 0.8, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/casos-exito' }, { lang: 'ca', href: '/casos-exit' }, { lang: 'en', href: '/success-stories' }] },
  { loc: '/programa-colaboradores', priority: 0.7, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/programa-colaboradores' }, { lang: 'ca', href: '/programa-col-laboradors' }, { lang: 'en', href: '/collaborators-program' }] },
  // Landing pages
  { loc: '/lp/calculadora', priority: 0.95, changefreq: 'weekly' },
  { loc: '/lp/calculadora-fiscal', priority: 0.95, changefreq: 'weekly' },
  { loc: '/lp/calculadora-asesores', priority: 0.95, changefreq: 'weekly' },
  { loc: '/lp/venta-empresas', priority: 0.9, changefreq: 'monthly' },
  { loc: '/lp/suiteloop', priority: 0.85, changefreq: 'monthly' },
  // Servicios
  { loc: '/servicios/valoraciones', priority: 0.9, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/servicios/valoraciones' }, { lang: 'ca', href: '/serveis/valoracions' }, { lang: 'en', href: '/services/valuations' }] },
  { loc: '/servicios/venta-empresas', priority: 0.9, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/servicios/venta-empresas' }, { lang: 'ca', href: '/serveis/venda-empreses' }, { lang: 'en', href: '/services/sell-companies' }] },
  { loc: '/servicios/due-diligence', priority: 0.85, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/servicios/due-diligence' }, { lang: 'ca', href: '/serveis/due-diligence' }, { lang: 'en', href: '/services/due-diligence' }] },
  { loc: '/servicios/asesoramiento-legal', priority: 0.85, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/servicios/asesoramiento-legal' }, { lang: 'ca', href: '/serveis/assessorament-legal' }, { lang: 'en', href: '/services/legal-advisory' }] },
  { loc: '/servicios/reestructuraciones', priority: 0.8, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/servicios/reestructuraciones' }, { lang: 'ca', href: '/serveis/reestructuracions' }, { lang: 'en', href: '/services/restructuring' }] },
  { loc: '/servicios/planificacion-fiscal', priority: 0.8, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/servicios/planificacion-fiscal' }, { lang: 'ca', href: '/serveis/planificacio-fiscal' }, { lang: 'en', href: '/services/tax-planning' }] },
  // Sectores
  { loc: '/sectores/tecnologia', priority: 0.75, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/sectores/tecnologia' }, { lang: 'ca', href: '/sectors/tecnologia' }, { lang: 'en', href: '/sectors/technology' }] },
  { loc: '/sectores/healthcare', priority: 0.75, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/sectores/healthcare' }, { lang: 'ca', href: '/sectors/salut' }, { lang: 'en', href: '/sectors/healthcare' }] },
  { loc: '/sectores/financial-services', priority: 0.75, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/sectores/financial-services' }, { lang: 'ca', href: '/sectors/serveis-financers' }, { lang: 'en', href: '/sectors/financial-services' }] },
  { loc: '/sectores/industrial', priority: 0.75, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/sectores/industrial' }, { lang: 'ca', href: '/sectors/industrial' }, { lang: 'en', href: '/sectors/industrial' }] },
  { loc: '/sectores/retail-consumer', priority: 0.75, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/sectores/retail-consumer' }, { lang: 'ca', href: '/sectors/retail-consum' }, { lang: 'en', href: '/sectors/retail-consumer' }] },
  { loc: '/sectores/energia', priority: 0.75, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/sectores/energia' }, { lang: 'ca', href: '/sectors/energia' }, { lang: 'en', href: '/sectors/energy' }] },
  { loc: '/sectores/inmobiliario', priority: 0.75, changefreq: 'monthly', alternates: [{ lang: 'es', href: '/sectores/inmobiliario' }, { lang: 'ca', href: '/sectors/immobiliari' }, { lang: 'en', href: '/sectors/real-estate' }] },
  // Recursos
  { loc: '/recursos/blog', priority: 0.8, changefreq: 'weekly' },
  { loc: '/recursos/noticias', priority: 0.75, changefreq: 'daily' },
  { loc: '/recursos/case-studies', priority: 0.75, changefreq: 'monthly' },
  // Legal
  { loc: '/politica-privacidad', priority: 0.3, changefreq: 'yearly' },
  { loc: '/terminos-uso', priority: 0.3, changefreq: 'yearly' },
  { loc: '/cookies', priority: 0.3, changefreq: 'yearly' },
];

const BASE = 'https://capittal.es';

function buildUrlEntry(url) {
  let entry = `  <url>\n    <loc>${BASE}${url.loc}</loc>`;
  entry += `\n    <lastmod>${url.lastmod || today}</lastmod>`;
  if (url.changefreq) entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
  if (url.priority !== undefined) entry += `\n    <priority>${url.priority}</priority>`;
  if (url.alternates) {
    for (const alt of url.alternates) {
      entry += `\n    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${BASE}${alt.href}" />`;
    }
  }
  entry += `\n  </url>`;
  return entry;
}

async function fetchBlogPosts() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,published_at,updated_at&is_published=eq.true&order=published_at.desc`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('Warning: Could not fetch blog posts for sitemap:', e.message);
    return [];
  }
}

async function fetchNewsArticles() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/news_articles?select=slug,published_at,updated_at&is_published=eq.true&is_deleted=eq.false&order=published_at.desc`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('Warning: Could not fetch news articles for sitemap:', e.message);
    return [];
  }
}

async function main() {
  console.log('Generating sitemap...');

  const [blogPosts, newsArticles] = await Promise.all([
    fetchBlogPosts(),
    fetchNewsArticles(),
  ]);

  console.log(`  Static routes: ${staticUrls.length}`);
  console.log(`  Blog posts: ${blogPosts.length}`);
  console.log(`  News articles: ${newsArticles.length}`);

  const blogUrls = blogPosts.map(p => ({
    loc: `/blog/${p.slug}`,
    lastmod: new Date(p.updated_at).toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.7,
  }));

  const newsUrls = newsArticles.map(a => ({
    loc: `/recursos/noticias/${a.slug}`,
    lastmod: new Date(a.updated_at).toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.6,
  }));

  const allUrls = [...staticUrls, ...blogUrls, ...newsUrls];
  const entries = allUrls.map(buildUrlEntry).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;

  const outPath = resolve(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outPath, sitemap, 'utf-8');
  console.log(`Sitemap written to ${outPath} (${allUrls.length} URLs)`);
}

main().catch(e => {
  console.error('Failed to generate sitemap:', e);
  process.exit(1);
});
