import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const staticRoutes = [
  // ─── Core pages ───
  { loc: "https://capittal.es/", changefreq: "weekly", priority: 1.0 },
  { loc: "https://capittal.es/venta-empresas", changefreq: "weekly", priority: 0.9 },
  { loc: "https://capittal.es/compra-empresas", changefreq: "weekly", priority: 0.9 },
  { loc: "https://capittal.es/contacto", changefreq: "monthly", priority: 0.9 },
  { loc: "https://capittal.es/por-que-elegirnos", changefreq: "monthly", priority: 0.8 },
  { loc: "https://capittal.es/equipo", changefreq: "monthly", priority: 0.7 },
  { loc: "https://capittal.es/casos-exito", changefreq: "monthly", priority: 0.8 },
  { loc: "https://capittal.es/programa-colaboradores", changefreq: "monthly", priority: 0.7 },
  { loc: "https://capittal.es/de-looper-a-capittal", changefreq: "yearly", priority: 0.5 },

  // ─── Landing pages ───
  { loc: "https://capittal.es/lp/calculadora", changefreq: "weekly", priority: 0.95 },
  { loc: "https://capittal.es/lp/calculadora-fiscal", changefreq: "weekly", priority: 0.95 },
  { loc: "https://capittal.es/lp/calculadora-asesores", changefreq: "weekly", priority: 0.95 },
  { loc: "https://capittal.es/lp/venta-empresas", changefreq: "monthly", priority: 0.9 },
  { loc: "https://capittal.es/lp/suiteloop", changefreq: "monthly", priority: 0.85 },

  // ─── Servicios ───
  { loc: "https://capittal.es/servicios/valoraciones", changefreq: "monthly", priority: 0.9 },
  { loc: "https://capittal.es/servicios/venta-empresas", changefreq: "monthly", priority: 0.9 },
  { loc: "https://capittal.es/servicios/due-diligence", changefreq: "monthly", priority: 0.85 },
  { loc: "https://capittal.es/servicios/asesoramiento-legal", changefreq: "monthly", priority: 0.85 },
  { loc: "https://capittal.es/servicios/reestructuraciones", changefreq: "monthly", priority: 0.8 },
  { loc: "https://capittal.es/servicios/planificacion-fiscal", changefreq: "monthly", priority: 0.8 },

  // ─── Sectores (all active) ───
  { loc: "https://capittal.es/sectores/seguridad", changefreq: "monthly", priority: 0.8 },
  { loc: "https://capittal.es/sectores/tecnologia", changefreq: "monthly", priority: 0.75 },
  { loc: "https://capittal.es/sectores/healthcare", changefreq: "monthly", priority: 0.75 },
  { loc: "https://capittal.es/sectores/industrial", changefreq: "monthly", priority: 0.75 },
  { loc: "https://capittal.es/sectores/retail-consumer", changefreq: "monthly", priority: 0.75 },
  { loc: "https://capittal.es/sectores/energia", changefreq: "monthly", priority: 0.75 },
  { loc: "https://capittal.es/sectores/construccion", changefreq: "monthly", priority: 0.75 },
  { loc: "https://capittal.es/sectores/logistica", changefreq: "monthly", priority: 0.75 },
  { loc: "https://capittal.es/sectores/alimentacion", changefreq: "monthly", priority: 0.75 },
  { loc: "https://capittal.es/sectores/medio-ambiente", changefreq: "monthly", priority: 0.75 },

  // ─── Recursos ───
  { loc: "https://capittal.es/recursos/blog", changefreq: "weekly", priority: 0.8 },

  // ─── Multilingual: English ───
  { loc: "https://capittal.es/sell-companies", changefreq: "monthly", priority: 0.7 },
  { loc: "https://capittal.es/buy-companies", changefreq: "monthly", priority: 0.7 },
  { loc: "https://capittal.es/team", changefreq: "monthly", priority: 0.6 },
  { loc: "https://capittal.es/contact", changefreq: "monthly", priority: 0.6 },
  { loc: "https://capittal.es/why-choose-us", changefreq: "monthly", priority: 0.6 },
  { loc: "https://capittal.es/success-stories", changefreq: "monthly", priority: 0.6 },
  { loc: "https://capittal.es/collaborators-program", changefreq: "monthly", priority: 0.5 },

  // ─── Multilingual: Catalan ───
  { loc: "https://capittal.es/venda-empreses", changefreq: "monthly", priority: 0.7 },
  { loc: "https://capittal.es/compra-empreses", changefreq: "monthly", priority: 0.7 },
  { loc: "https://capittal.es/equip", changefreq: "monthly", priority: 0.6 },
  { loc: "https://capittal.es/contacte", changefreq: "monthly", priority: 0.6 },
  { loc: "https://capittal.es/per-que-triar-nos", changefreq: "monthly", priority: 0.6 },
  { loc: "https://capittal.es/casos-exit", changefreq: "monthly", priority: 0.6 },

  // ─── Legal ───
  { loc: "https://capittal.es/politica-privacidad", changefreq: "yearly", priority: 0.3 },
  { loc: "https://capittal.es/terminos-uso", changefreq: "yearly", priority: 0.3 },
  { loc: "https://capittal.es/cookies", changefreq: "yearly", priority: 0.3 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const today = new Date().toISOString().split("T")[0];

  // Generate static URL entries
  const staticEntries = staticRoutes
    .map(
      (r) =>
        `  <url>\n    <loc>${r.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    )
    .join("\n");

  // Fetch blog posts dynamically
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
          return `  <url>\n    <loc>https://capittal.es/blog/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
        })
        .join("\n");
    }
  } catch (e) {
    console.error("Error fetching blog posts for sitemap:", e);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
