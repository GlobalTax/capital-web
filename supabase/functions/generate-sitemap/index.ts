import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE = "https://capittal.es";

// ─── Multilingual route map: es -> { ca, en } ───
const HREFLANG_MAP: Record<string, { ca?: string; en?: string }> = {
  "/": { ca: "/ca", en: "/en" },
  "/venta-empresas": { ca: "/venda-empreses", en: "/sell-companies" },
  "/compra-empresas": { ca: "/compra-empreses", en: "/buy-companies" },
  "/contacto": { ca: "/contacte", en: "/contact" },
  "/por-que-elegirnos": { ca: "/per-que-triar-nos", en: "/why-choose-us" },
  "/equipo": { ca: "/equip", en: "/team" },
  "/casos-exito": { ca: "/casos-exit", en: "/success-stories" },
  "/programa-colaboradores": { ca: "/programa-col-laboradors", en: "/collaborators-program" },
  "/servicios/valoraciones": { ca: "/serveis/valoracions", en: "/services/valuations" },
  "/servicios/venta-empresas": { ca: "/serveis/venda-empreses", en: "/services/sell-companies" },
  "/servicios/due-diligence": { ca: "/serveis/due-diligence", en: "/services/due-diligence" },
  "/servicios/asesoramiento-legal": { ca: "/serveis/assessorament-legal", en: "/services/legal-advisory" },
  "/servicios/reestructuraciones": { ca: "/serveis/reestructuracions", en: "/services/restructuring" },
  "/servicios/planificacion-fiscal": { ca: "/serveis/planificacio-fiscal", en: "/services/tax-planning" },
};

// Build reverse map: given any path (es/ca/en), find its group
const PATH_TO_GROUP: Record<string, { es: string; ca?: string; en?: string }> = {};
for (const [esPath, variants] of Object.entries(HREFLANG_MAP)) {
  const group = { es: esPath, ...variants };
  PATH_TO_GROUP[esPath] = group;
  if (variants.ca) PATH_TO_GROUP[variants.ca] = group;
  if (variants.en) PATH_TO_GROUP[variants.en] = group;
}

interface RouteEntry {
  path: string;
  changefreq: string;
  priority: number;
}

const staticRoutes: RouteEntry[] = [
  // ─── Core pages ───
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/venta-empresas", changefreq: "weekly", priority: 0.9 },
  { path: "/compra-empresas", changefreq: "weekly", priority: 0.9 },
  { path: "/contacto", changefreq: "monthly", priority: 0.9 },
  { path: "/por-que-elegirnos", changefreq: "monthly", priority: 0.8 },
  { path: "/equipo", changefreq: "monthly", priority: 0.7 },
  { path: "/casos-exito", changefreq: "monthly", priority: 0.8 },
  { path: "/programa-colaboradores", changefreq: "monthly", priority: 0.7 },
  { path: "/de-looper-a-capittal", changefreq: "yearly", priority: 0.5 },

  // ─── Landing pages ───
  { path: "/lp/calculadora", changefreq: "weekly", priority: 0.95 },
  { path: "/lp/calculadora-fiscal", changefreq: "weekly", priority: 0.95 },
  { path: "/lp/calculadora-asesores", changefreq: "weekly", priority: 0.95 },
  { path: "/lp/venta-empresas", changefreq: "monthly", priority: 0.9 },
  { path: "/lp/suiteloop", changefreq: "monthly", priority: 0.85 },

  // ─── Servicios (ES) ───
  { path: "/servicios/valoraciones", changefreq: "monthly", priority: 0.9 },
  { path: "/servicios/venta-empresas", changefreq: "monthly", priority: 0.9 },
  { path: "/servicios/due-diligence", changefreq: "monthly", priority: 0.85 },
  { path: "/servicios/asesoramiento-legal", changefreq: "monthly", priority: 0.85 },
  { path: "/servicios/reestructuraciones", changefreq: "monthly", priority: 0.8 },
  { path: "/servicios/planificacion-fiscal", changefreq: "monthly", priority: 0.8 },

  // ─── Sectores ───
  { path: "/sectores/seguridad", changefreq: "monthly", priority: 0.8 },
  { path: "/sectores/tecnologia", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/healthcare", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/industrial", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/retail-consumer", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/energia", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/construccion", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/logistica", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/alimentacion", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/medio-ambiente", changefreq: "monthly", priority: 0.75 },

  // ─── Recursos ───
  { path: "/recursos/blog", changefreq: "weekly", priority: 0.8 },

  // ─── Multilingual: English ───
  { path: "/sell-companies", changefreq: "monthly", priority: 0.7 },
  { path: "/buy-companies", changefreq: "monthly", priority: 0.7 },
  { path: "/team", changefreq: "monthly", priority: 0.6 },
  { path: "/contact", changefreq: "monthly", priority: 0.6 },
  { path: "/why-choose-us", changefreq: "monthly", priority: 0.6 },
  { path: "/success-stories", changefreq: "monthly", priority: 0.6 },
  { path: "/collaborators-program", changefreq: "monthly", priority: 0.5 },

  // ─── Multilingual: Catalan ───
  { path: "/venda-empreses", changefreq: "monthly", priority: 0.7 },
  { path: "/compra-empreses", changefreq: "monthly", priority: 0.7 },
  { path: "/equip", changefreq: "monthly", priority: 0.6 },
  { path: "/contacte", changefreq: "monthly", priority: 0.6 },
  { path: "/per-que-triar-nos", changefreq: "monthly", priority: 0.6 },
  { path: "/casos-exit", changefreq: "monthly", priority: 0.6 },

  // ─── Multilingual: Catalan services ───
  { path: "/serveis/valoracions", changefreq: "monthly", priority: 0.7 },
  { path: "/serveis/venda-empreses", changefreq: "monthly", priority: 0.7 },
  { path: "/serveis/due-diligence", changefreq: "monthly", priority: 0.65 },
  { path: "/serveis/assessorament-legal", changefreq: "monthly", priority: 0.65 },
  { path: "/serveis/reestructuracions", changefreq: "monthly", priority: 0.6 },
  { path: "/serveis/planificacio-fiscal", changefreq: "monthly", priority: 0.6 },

  // ─── Multilingual: English services ───
  { path: "/services/valuations", changefreq: "monthly", priority: 0.7 },
  { path: "/services/sell-companies", changefreq: "monthly", priority: 0.7 },
  { path: "/services/due-diligence", changefreq: "monthly", priority: 0.65 },
  { path: "/services/legal-advisory", changefreq: "monthly", priority: 0.65 },
  { path: "/services/restructuring", changefreq: "monthly", priority: 0.6 },
  { path: "/services/tax-planning", changefreq: "monthly", priority: 0.6 },

  // ─── Legal ───
  { path: "/politica-privacidad", changefreq: "yearly", priority: 0.3 },
  { path: "/terminos-uso", changefreq: "yearly", priority: 0.3 },
  { path: "/cookies", changefreq: "yearly", priority: 0.3 },
];

function buildUrlEntry(path: string, changefreq: string, priority: number, lastmod: string): string {
  const loc = `${BASE}${path}`;
  const group = PATH_TO_GROUP[path];

  let hreflangTags = "";
  if (group) {
    const tags: string[] = [];
    tags.push(`    <xhtml:link rel="alternate" hreflang="es" href="${BASE}${group.es}" />`);
    if (group.ca) tags.push(`    <xhtml:link rel="alternate" hreflang="ca" href="${BASE}${group.ca}" />`);
    if (group.en) tags.push(`    <xhtml:link rel="alternate" hreflang="en" href="${BASE}${group.en}" />`);
    // x-default only for the home page group
    if (group.es === "/") {
      tags.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/" />`);
    }
    hreflangTags = "\n" + tags.join("\n");
  }

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${hreflangTags}
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const today = new Date().toISOString().split("T")[0];

  // Generate static URL entries with hreflang
  const staticEntries = staticRoutes
    .map((r) => buildUrlEntry(r.path, r.changefreq, r.priority, today))
    .join("\n");

  // Fetch blog posts dynamically (no hreflang - Spanish only)
  let blogEntries = "";
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug, published_at, updated_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (!error && posts?.length) {
      blogEntries = posts
        .map((p) => {
          const lastmod = new Date(p.updated_at).toISOString().split("T")[0];
          return `  <url>\n    <loc>${BASE}/blog/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
        })
        .join("\n");
    }
  } catch (e) {
    console.error("Error fetching blog posts for sitemap:", e);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticEntries}
${blogEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
