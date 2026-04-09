import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE = "https://capittal.es";

// ─── Multilingual page groups ───
// Each group generates one <url> per variant, all sharing the same hreflang set.
// Must stay in sync with scripts/generate-sitemap.mjs
const multilingualPages = [
  { priority: 1.0, changefreq: "weekly", variants: { es: "/", ca: "/ca", en: "/en" } },
  { priority: 0.9, changefreq: "weekly", variants: { es: "/venta-empresas", ca: "/venda-empreses", en: "/sell-companies" } },
  { priority: 0.9, changefreq: "weekly", variants: { es: "/compra-empresas", en: "/buy-companies" } },
  { priority: 0.9, changefreq: "monthly", variants: { es: "/contacto", ca: "/contacte", en: "/contact" } },
  { priority: 0.8, changefreq: "monthly", variants: { es: "/por-que-elegirnos", ca: "/per-que-triar-nos", en: "/why-choose-us" } },
  { priority: 0.7, changefreq: "monthly", variants: { es: "/equipo", ca: "/equip" } },
  { priority: 0.8, changefreq: "monthly", variants: { es: "/casos-exito", ca: "/casos-exit", en: "/success-stories" } },
  { priority: 0.7, changefreq: "monthly", variants: { es: "/programa-colaboradores", ca: "/programa-col-laboradors", en: "/collaborators-program" } },
  // Servicios
  { priority: 0.9, changefreq: "monthly", variants: { es: "/servicios/valoraciones", ca: "/serveis/valoracions", en: "/services/valuations" } },
  { priority: 0.9, changefreq: "monthly", variants: { es: "/servicios/venta-empresas", ca: "/serveis/venda-empreses", en: "/services/sell-companies" } },
  { priority: 0.85, changefreq: "monthly", variants: { es: "/servicios/due-diligence", ca: "/serveis/due-diligence", en: "/services/due-diligence" } },
  { priority: 0.85, changefreq: "monthly", variants: { es: "/servicios/asesoramiento-legal", ca: "/serveis/assessorament-legal", en: "/services/legal-advisory" } },
  { priority: 0.8, changefreq: "monthly", variants: { es: "/servicios/reestructuraciones", ca: "/serveis/reestructuracions", en: "/services/restructuring" } },
  { priority: 0.8, changefreq: "monthly", variants: { es: "/servicios/planificacion-fiscal", ca: "/serveis/planificacio-fiscal", en: "/services/tax-planning" } },
  // Sectores
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/tecnologia", ca: "/sectors/tecnologia", en: "/sectors/technology" } },
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/healthcare", ca: "/sectors/salut", en: "/sectors/healthcare" } },
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/industrial", ca: "/sectors/industrial" } },
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/retail-consumer", ca: "/sectors/retail-consum", en: "/sectors/retail-consumer" } },
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/energia", ca: "/sectors/energia", en: "/sectors/energy" } },
  { priority: 0.8, changefreq: "monthly", variants: { es: "/sectores/seguridad", ca: "/sectors/seguretat", en: "/sectors/security" } },
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/construccion", ca: "/sectors/construccio" } },
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/alimentacion", ca: "/sectors/alimentacio" } },
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/logistica", ca: "/sectors/logistica" } },
  { priority: 0.75, changefreq: "monthly", variants: { es: "/sectores/medio-ambiente", ca: "/sectors/medi-ambient" } },
];

// ─── Single-language pages ───
// Campaign landing pages (/lp/*-meta, /lp/venta-empresas*) excluded to prevent cannibalization.
const singlePages = [
  { path: "/lp/calculadora", changefreq: "weekly", priority: 0.95 },
  { path: "/lp/calculadora-fiscal", changefreq: "weekly", priority: 0.95 },
  { path: "/lp/calculadora-asesores", changefreq: "weekly", priority: 0.95 },
  { path: "/lp/suiteloop", changefreq: "monthly", priority: 0.85 },
  { path: "/recursos/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/recursos/case-studies", changefreq: "monthly", priority: 0.75 },
  { path: "/recursos/guia-vender-empresa", changefreq: "monthly", priority: 0.8 },
  { path: "/servicios/search-funds", changefreq: "monthly", priority: 0.8 },
  { path: "/search-funds", changefreq: "monthly", priority: 0.7 },
  { path: "/valoracion-empresas", changefreq: "monthly", priority: 0.8 },
  { path: "/guia-valoracion-empresas", changefreq: "monthly", priority: 0.65 },
  { path: "/oportunidades", changefreq: "weekly", priority: 0.75 },
  { path: "/search-funds/recursos", changefreq: "monthly", priority: 0.7 },
  { path: "/search-funds/recursos/guia", changefreq: "monthly", priority: 0.65 },
  { path: "/por-que-elegirnos/experiencia", changefreq: "monthly", priority: 0.65 },
  { path: "/por-que-elegirnos/metodologia", changefreq: "monthly", priority: 0.65 },
  { path: "/por-que-elegirnos/resultados", changefreq: "monthly", priority: 0.65 },
  { path: "/sectores/retail", changefreq: "monthly", priority: 0.75 },
  { path: "/de-looper-a-capittal", changefreq: "yearly", priority: 0.5 },
  { path: "/seguridad/calculadora", changefreq: "monthly", priority: 0.75 },
  { path: "/oportunidades/empleo", changefreq: "weekly", priority: 0.6 },
  { path: "/politica-privacidad", changefreq: "yearly", priority: 0.3 },
  { path: "/terminos-uso", changefreq: "yearly", priority: 0.3 },
  { path: "/cookies", changefreq: "yearly", priority: 0.3 },
];

function expandMultilingualPages(today: string): string[] {
  const entries: string[] = [];
  const seen = new Set<string>();

  for (const page of multilingualPages) {
    const variantEntries = Object.entries(page.variants) as [string, string][];
    // Build alternates including x-default
    const esHref = page.variants.es || variantEntries[0][1];
    const alternates = [
      ...variantEntries.map(([lang, href]) => ({ lang, href })),
      { lang: "x-default", href: esHref },
    ];

    for (const [lang, href] of variantEntries) {
      if (seen.has(href)) continue;
      seen.add(href);

      const hreflangTags = alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${BASE}${a.href}" />`)
        .join("\n");

      entries.push(`  <url>
    <loc>${BASE}${href}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${hreflangTags}
  </url>`);
    }
  }

  return entries;
}

async function generateSitemapXml(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  // Multilingual entries with hreflangs
  const multilingualEntries = expandMultilingualPages(today);

  // Single-language entries
  const singleEntries = singlePages.map(
    (r) => `  <url>
    <loc>${BASE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  );

  // Blog posts (dynamic from DB with real lastmod)
  let blogEntries: string[] = [];
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
      blogEntries = posts.map((p) => {
        const lastmod = new Date(p.updated_at).toISOString().split("T")[0];
        return `  <url>
    <loc>${BASE}/recursos/blog/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }
  } catch (e) {
    console.error("Error fetching blog posts for sitemap:", e);
  }

  const allEntries = [...multilingualEntries, ...singleEntries, ...blogEntries].join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allEntries}
</urlset>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // GET = public (for Cloudflare Worker, bots, browsers)
    // POST = admin-only (for manual regeneration from admin panel)
    if (req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Missing authorization" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = authHeader.replace("Bearer ", "");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: hasRole } = await serviceClient.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!hasRole) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const sitemap = await generateSitemapXml();

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("generate-sitemap error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
