#!/usr/bin/env node
/**
 * Genera sitemap.xml con rutas estáticas + posts dinámicos del blog.
 * Ejecutar antes del build: node scripts/generate-sitemap.mjs
 *
 * FUENTE DE VERDAD — estas rutas deben coincidir con:
 *   supabase/functions/generate-sitemap/index.ts
 *   src/utils/seo/generateSitemap.ts
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fwhqtzkkvnjkazhaficj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I";

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const today = new Date().toISOString().split('T')[0];
const BASE = 'https://capittal.es';

// ── Rutas estáticas aprobadas ──────────────────────────────────────
const staticUrls = [
  // Homepage
  { loc: '/', priority: 1.0, changefreq: 'weekly' },

  // Servicios
  { loc: '/servicios/venta-empresas', priority: 0.9, changefreq: 'monthly' },
  { loc: '/servicios/compra-empresas', priority: 0.9, changefreq: 'monthly' },
  { loc: '/servicios/valoraciones', priority: 0.9, changefreq: 'monthly' },
  { loc: '/servicios/due-diligence', priority: 0.85, changefreq: 'monthly' },
  { loc: '/servicios/reestructuraciones', priority: 0.8, changefreq: 'monthly' },
  { loc: '/servicios/planificacion-fiscal', priority: 0.8, changefreq: 'monthly' },

  // Sectores
  { loc: '/sectores/seguridad', priority: 0.8, changefreq: 'monthly' },
  { loc: '/sectores/tecnologia', priority: 0.75, changefreq: 'monthly' },
  { loc: '/sectores/industrial', priority: 0.75, changefreq: 'monthly' },
  { loc: '/sectores/healthcare', priority: 0.75, changefreq: 'monthly' },
  { loc: '/sectores/energia', priority: 0.75, changefreq: 'monthly' },
  { loc: '/sectores/construccion', priority: 0.75, changefreq: 'monthly' },
  { loc: '/sectores/logistica', priority: 0.75, changefreq: 'monthly' },
  { loc: '/sectores/medio-ambiente', priority: 0.75, changefreq: 'monthly' },
  { loc: '/sectores/retail', priority: 0.75, changefreq: 'monthly' },
  { loc: '/sectores/alimentacion', priority: 0.75, changefreq: 'monthly' },

  // Páginas estáticas
  { loc: '/equipo', priority: 0.7, changefreq: 'monthly' },
  { loc: '/contacto', priority: 0.9, changefreq: 'monthly' },
  { loc: '/recursos/blog', priority: 0.8, changefreq: 'weekly' },
  { loc: '/lp/calculadora', priority: 0.95, changefreq: 'weekly' },
  { loc: '/por-que-elegirnos', priority: 0.8, changefreq: 'monthly' },
  { loc: '/casos-exito', priority: 0.8, changefreq: 'monthly' },
  { loc: '/search-funds', priority: 0.7, changefreq: 'monthly' },
  { loc: '/programa-colaboradores', priority: 0.7, changefreq: 'monthly' },
];

function buildUrlEntry(url) {
  return `  <url>
    <loc>${BASE}${url.loc}</loc>
    <lastmod>${url.lastmod || today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
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

  console.log(`  Static routes: ${staticUrls.length}`);
  console.log(`  Blog posts: ${blogPosts.length}`);

  const blogUrls = blogPosts.map(p => ({
    loc: `/recursos/blog/${p.slug}`,
    lastmod: new Date(p.updated_at).toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.7,
  }));

  const allUrls = [...staticUrls, ...blogUrls];
  const entries = allUrls.map(buildUrlEntry).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
