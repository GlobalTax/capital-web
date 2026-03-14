import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE = "https://capittal.es";

interface RouteEntry {
  path: string;
  changefreq: string;
  priority: number;
}

const staticRoutes: RouteEntry[] = [
  // Homepage
  { path: "/", changefreq: "weekly", priority: 1.0 },

  // Servicios
  { path: "/servicios/venta-empresas", changefreq: "monthly", priority: 0.9 },
  { path: "/servicios/compra-empresas", changefreq: "monthly", priority: 0.9 },
  { path: "/servicios/valoraciones", changefreq: "monthly", priority: 0.9 },
  { path: "/servicios/due-diligence", changefreq: "monthly", priority: 0.85 },
  { path: "/servicios/reestructuraciones", changefreq: "monthly", priority: 0.8 },
  { path: "/servicios/planificacion-fiscal", changefreq: "monthly", priority: 0.8 },

  // Sectores
  { path: "/sectores/seguridad", changefreq: "monthly", priority: 0.8 },
  { path: "/sectores/tecnologia", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/industrial", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/healthcare", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/energia", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/construccion", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/logistica", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/medio-ambiente", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/retail", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/alimentacion", changefreq: "monthly", priority: 0.75 },

  // Páginas estáticas
  { path: "/equipo", changefreq: "monthly", priority: 0.7 },
  { path: "/contacto", changefreq: "monthly", priority: 0.9 },
  { path: "/recursos/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/lp/calculadora", changefreq: "weekly", priority: 0.95 },
  { path: "/por-que-elegirnos", changefreq: "monthly", priority: 0.8 },
  { path: "/casos-exito", changefreq: "monthly", priority: 0.8 },
  { path: "/search-funds", changefreq: "monthly", priority: 0.7 },
  { path: "/programa-colaboradores", changefreq: "monthly", priority: 0.7 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const today = new Date().toISOString().split("T")[0];

  // Static URL entries
  const staticEntries = staticRoutes
    .map(
      (r) => `  <url>
    <loc>${BASE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join("\n");

  // Dynamic blog posts
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
          return `  <url>
    <loc>${BASE}/recursos/blog/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
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
