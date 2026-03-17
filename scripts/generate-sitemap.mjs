#!/usr/bin/env node
/**
 * Genera sitemap.xml con rutas estáticas + posts dinámicos del blog.
 * Ejecutar antes del build: node scripts/generate-sitemap.mjs
 *
 * FUENTE DE VERDAD — estas rutas deben coincidir con:
 *   supabase/functions/generate-sitemap/index.ts
 *   src/utils/seo/generateSitemap.ts
 *
 * IMPORTANTE: Para páginas multilingües, cada variante de idioma genera
 * su propia entrada <url> con hreflang apuntando a TODAS las variantes.
 * Cada URL aparece EXACTAMENTE UNA VEZ en el sitemap.
 * NO incluir rutas que redirigen (Navigate/redirect).
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fwhqtzkkvnjkazhaficj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I";

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const today = new Date().toISOString().split('T')[0];
const BASE = 'https://capittal.es';

// ─── Multilingual page groups ───
// Each group generates one <url> per variant, all sharing the same hreflang set.
// Only include routes that render content (NOT redirects like /team → /equipo).
const multilingualPages = [
  { priority: 1.0, changefreq: 'weekly', variants: { es: '/', ca: '/ca', en: '/en', 'x-default': '/' } },
  { priority: 0.9, changefreq: 'weekly', variants: { es: '/venta-empresas', ca: '/venda-empreses', en: '/sell-companies' } },
  { priority: 0.9, changefreq: 'weekly', variants: { es: '/compra-empresas', en: '/buy-companies' } },
  { priority: 0.9, changefreq: 'monthly', variants: { es: '/contacto', ca: '/contacte', en: '/contact' } },
  { priority: 0.8, changefreq: 'monthly', variants: { es: '/por-que-elegirnos', ca: '/per-que-triar-nos', en: '/why-choose-us' } },
  { priority: 0.7, changefreq: 'monthly', variants: { es: '/equipo', ca: '/equip' } },
  { priority: 0.8, changefreq: 'monthly', variants: { es: '/casos-exito', ca: '/casos-exit', en: '/success-stories' } },
  { priority: 0.7, changefreq: 'monthly', variants: { es: '/programa-colaboradores', ca: '/programa-col-laboradors', en: '/collaborators-program' } },
  // Servicios
  { priority: 0.9, changefreq: 'monthly', variants: { es: '/servicios/valoraciones', ca: '/serveis/valoracions', en: '/services/valuations' } },
  { priority: 0.9, changefreq: 'monthly', variants: { es: '/servicios/venta-empresas', ca: '/serveis/venda-empreses', en: '/services/sell-companies' } },
  { priority: 0.85, changefreq: 'monthly', variants: { es: '/servicios/due-diligence', ca: '/serveis/due-diligence', en: '/services/due-diligence' } },
  { priority: 0.85, changefreq: 'monthly', variants: { es: '/servicios/asesoramiento-legal', ca: '/serveis/assessorament-legal', en: '/services/legal-advisory' } },
  { priority: 0.8, changefreq: 'monthly', variants: { es: '/servicios/reestructuraciones', ca: '/serveis/reestructuracions', en: '/services/restructuring' } },
  { priority: 0.8, changefreq: 'monthly', variants: { es: '/servicios/planificacion-fiscal', ca: '/serveis/planificacio-fiscal', en: '/services/tax-planning' } },
  // Sectores
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/tecnologia', ca: '/sectors/tecnologia', en: '/sectors/technology' } },
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/healthcare', ca: '/sectors/salut', en: '/sectors/healthcare' } },
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/industrial', ca: '/sectors/industrial' } },
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/retail-consumer', ca: '/sectors/retail-consum', en: '/sectors/retail-consumer' } },
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/energia', ca: '/sectors/energia', en: '/sectors/energy' } },
  { priority: 0.8, changefreq: 'monthly', variants: { es: '/sectores/seguridad', ca: '/sectors/seguretat', en: '/sectors/security' } },
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/construccion', ca: '/sectors/construccio' } },
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/alimentacion', ca: '/sectors/alimentacio' } },
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/logistica', ca: '/sectors/logistica' } },
  { priority: 0.75, changefreq: 'monthly', variants: { es: '/sectores/medio-ambiente', ca: '/sectors/medi-ambient' } },
];

// ─── Single-language pages ───
// NOTE: Do NOT include pages that have noindex (they should not be in sitemap).
//       Removed: /lp/valoracion-2026 (noindex), /lp/rod-linkedin (noindex),
//                /recursos/noticias (noindex)
const singlePages = [
  { loc: '/lp/calculadora', priority: 0.95, changefreq: 'weekly' },
  { loc: '/lp/calculadora-fiscal', priority: 0.95, changefreq: 'weekly' },
  { loc: '/lp/calculadora-asesores', priority: 0.95, changefreq: 'weekly' },
  { loc: '/lp/calculadora-meta', priority: 0.9, changefreq: 'monthly' },
  { loc: '/lp/venta-empresas', priority: 0.9, changefreq: 'monthly' },
  { loc: '/lp/venta-empresas-v2', priority: 0.9, changefreq: 'monthly' },
  { loc: '/lp/suiteloop', priority: 0.85, changefreq: 'monthly' },
  { loc: '/lp/accountex', priority: 0.8, changefreq: 'monthly' },
  { loc: '/recursos/blog', priority: 0.8, changefreq: 'weekly' },
  { loc: '/recursos/case-studies', priority: 0.75, changefreq: 'monthly' },
  { loc: '/recursos/guia-vender-empresa', priority: 0.8, changefreq: 'monthly' },
  { loc: '/servicios/search-funds', priority: 0.8, changefreq: 'monthly' },
  { loc: '/search-funds', priority: 0.7, changefreq: 'monthly' },
  { loc: '/valoracion-empresas', priority: 0.8, changefreq: 'monthly' },
  { loc: '/guia-valoracion-empresas', priority: 0.65, changefreq: 'monthly' },
  { loc: '/oportunidades', priority: 0.75, changefreq: 'weekly' },
  { loc: '/search-funds/recursos', priority: 0.7, changefreq: 'monthly' },
  { loc: '/search-funds/recursos/guia', priority: 0.65, changefreq: 'monthly' },
  { loc: '/por-que-elegirnos/experiencia', priority: 0.65, changefreq: 'monthly' },
  { loc: '/por-que-elegirnos/metodologia', priority: 0.65, changefreq: 'monthly' },
  { loc: '/por-que-elegirnos/resultados', priority: 0.65, changefreq: 'monthly' },
  { loc: '/sectores/retail', priority: 0.75, changefreq: 'monthly' },
  { loc: '/de-looper-a-capittal', priority: 0.5, changefreq: 'yearly' },
  { loc: '/seguridad/calculadora', priority: 0.75, changefreq: 'monthly' },
  { loc: '/oportunidades/empleo', priority: 0.6, changefreq: 'weekly' },
  { loc: '/politica-privacidad', priority: 0.3, changefreq: 'yearly' },
  { loc: '/terminos-uso', priority: 0.3, changefreq: 'yearly' },
  { loc: '/cookies', priority: 0.3, changefreq: 'yearly' },
];

// ─── Expand multilingual pages into individual URL entries ───
function expandMultilingualPages() {
  const urls = [];
  const seen = new Set();

  for (const page of multilingualPages) {
    // Build alternates list including x-default (defaults to 'es' variant)
    const alternates = Object.entries(page.variants).map(([lang, href]) => ({ lang, href }));
    // Add x-default pointing to Spanish variant if not explicitly set
    if (!page.variants['x-default']) {
      const esHref = page.variants.es || Object.values(page.variants)[0];
      alternates.push({ lang: 'x-default', href: esHref });
    }

    for (const [lang, href] of Object.entries(page.variants)) {
      if (lang === 'x-default') continue;
      if (seen.has(href)) continue;
      seen.add(href);

      urls.push({
        loc: href,
        priority: page.priority,
        changefreq: page.changefreq,
        alternates,
      });
    }
  }

  return urls;
}

function buildUrlEntry(url) {
  let entry = `  <url>\n    <loc>${BASE}${url.loc}</loc>`;
  entry += `\n    <lastmod>${url.lastmod || today}</lastmod>`;
  entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
  entry += `\n    <priority>${url.priority}</priority>`;
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

async function main() {
  console.log('Generating sitemap...');

  const blogPosts = await fetchBlogPosts();
  const multilingualUrls = expandMultilingualPages();

  console.log(`  Multilingual URLs: ${multilingualUrls.length}`);
  console.log(`  Single-language pages: ${singlePages.length}`);
  console.log(`  Blog posts: ${blogPosts.length}`);

  const blogUrls = blogPosts.map(p => ({
    loc: `/recursos/blog/${p.slug}`,
    lastmod: new Date(p.updated_at).toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.7,
  }));

  // Deduplicate
  const seen = new Set(multilingualUrls.map(u => u.loc));
  const dedupedSinglePages = singlePages.filter(u => {
    if (seen.has(u.loc)) return false;
    seen.add(u.loc);
    return true;
  });

  const allUrls = [...multilingualUrls, ...dedupedSinglePages, ...blogUrls];
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
