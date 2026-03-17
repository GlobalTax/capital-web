import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://webcapittal.lovable.app";
const BASE = "https://capittal.es";

// Duplicated from src/data/siteRoutes.ts (edge functions can't import from src/)
const SITE_ROUTES = [
  { path: "/", title: "Capittal | Asesoramiento M&A en Barcelona", description: "Asesoramiento M&A en Barcelona: venta de empresas, valoraciones y due diligence. +70 profesionales especializados en mid-market español.", h1: "Especialistas en Fusiones y Adquisiciones", changefreq: "weekly", priority: 1.0 },
  { path: "/venta-empresas", title: "Venta de Empresas | Capittal M&A", description: "Asesoramiento integral en la venta de empresas. Proceso confidencial, maximización del valor y acompañamiento hasta el cierre.", h1: "Venta de Empresas", changefreq: "monthly", priority: 0.9 },
  { path: "/compra-empresas", title: "Compra de Empresas | Capittal M&A", description: "Identificación de oportunidades de adquisición y asesoramiento buy-side para inversores, fondos y corporates.", h1: "Compra de Empresas", changefreq: "monthly", priority: 0.9 },
  { path: "/contacto", title: "Contacto | Capittal M&A", description: "Contacta con Capittal para asesoramiento en operaciones M&A.", h1: "Contacto", changefreq: "monthly", priority: 0.9 },
  { path: "/equipo", title: "Equipo | Capittal M&A", description: "Conoce al equipo de profesionales de Capittal.", h1: "Nuestro Equipo", changefreq: "monthly", priority: 0.7 },
  { path: "/por-que-elegirnos", title: "Por Qué Elegirnos | Capittal M&A", description: "Descubre por qué Capittal es la firma de M&A de referencia.", h1: "Por Qué Elegirnos", changefreq: "monthly", priority: 0.8 },
  { path: "/casos-exito", title: "Casos de Éxito | Capittal M&A", description: "Operaciones de M&A exitosas realizadas por Capittal.", h1: "Casos de Éxito", changefreq: "monthly", priority: 0.8 },
  { path: "/programa-colaboradores", title: "Programa de Colaboradores | Capittal", description: "Únete al programa de colaboradores de Capittal.", h1: "Programa de Colaboradores", changefreq: "monthly", priority: 0.7 },
  { path: "/servicios/venta-empresas", title: "Servicio de Venta de Empresas | Capittal", description: "Servicio especializado en la venta de empresas.", h1: "Venta de Empresas", changefreq: "monthly", priority: 0.9 },
  { path: "/servicios/valoraciones", title: "Valoración de Empresas | Capittal", description: "Informes de valoración profesional con múltiplos sectoriales.", h1: "Valoración de Empresas", changefreq: "monthly", priority: 0.9 },
  { path: "/servicios/due-diligence", title: "Due Diligence | Capittal M&A", description: "Análisis financiero, fiscal y legal para operaciones de M&A.", h1: "Due Diligence", changefreq: "monthly", priority: 0.85 },
  { path: "/servicios/asesoramiento-legal", title: "Asesoramiento Legal M&A | Capittal", description: "Asesoramiento legal especializado en fusiones y adquisiciones.", h1: "Asesoramiento Legal", changefreq: "monthly", priority: 0.8 },
  { path: "/servicios/reestructuraciones", title: "Reestructuraciones Empresariales | Capittal", description: "Soluciones para empresas en situaciones especiales.", h1: "Reestructuraciones", changefreq: "monthly", priority: 0.8 },
  { path: "/servicios/planificacion-fiscal", title: "Planificación Fiscal M&A | Capittal", description: "Optimización fiscal en operaciones de compraventa.", h1: "Planificación Fiscal", changefreq: "monthly", priority: 0.8 },
  { path: "/servicios/search-funds", title: "Search Funds | Capittal M&A", description: "Conectamos empresas con emprendedores de élite.", h1: "Search Funds", changefreq: "monthly", priority: 0.7 },
  { path: "/sectores/tecnologia", title: "M&A Sector Tecnología | Capittal", description: "Operaciones de M&A en el sector tecnológico.", h1: "Sector Tecnología", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/healthcare", title: "M&A Sector Healthcare | Capittal", description: "Operaciones de M&A en el sector salud.", h1: "Sector Healthcare", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/industrial", title: "M&A Sector Industrial | Capittal", description: "Operaciones de M&A en el sector industrial.", h1: "Sector Industrial", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/retail-consumer", title: "M&A Sector Retail y Consumo | Capittal", description: "Asesoramiento M&A en retail y consumo. Distribución, franquicias, e-commerce y marcas de consumo en España.", h1: "Sector Retail y Consumo", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/energia", title: "M&A Sector Energía | Capittal", description: "Operaciones de M&A en el sector energético.", h1: "Sector Energía", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/seguridad", title: "M&A Sector Seguridad | Capittal", description: "M&A en el sector de seguridad privada.", h1: "Sector Seguridad Privada", changefreq: "monthly", priority: 0.8 },
  { path: "/sectores/construccion", title: "M&A Sector Construcción | Capittal", description: "M&A en construcción e infraestructuras.", h1: "Sector Construcción", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/alimentacion", title: "M&A Sector Alimentación | Capittal", description: "M&A en alimentación y bebidas.", h1: "Sector Alimentación", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/logistica", title: "M&A Sector Logística | Capittal", description: "M&A en logística y transporte.", h1: "Sector Logística", changefreq: "monthly", priority: 0.75 },
  { path: "/sectores/medio-ambiente", title: "M&A Sector Medio Ambiente | Capittal", description: "M&A en gestión ambiental y reciclaje.", h1: "Sector Medio Ambiente", changefreq: "monthly", priority: 0.75 },
  { path: "/recursos/blog", title: "Blog M&A | Capittal", description: "Artículos sobre fusiones, adquisiciones y valoración.", h1: "Blog", changefreq: "weekly", priority: 0.8 },
  { path: "/recursos/test-exit-ready", title: "Test Exit Ready | Capittal", description: "Evalúa si tu empresa está preparada para vender.", h1: "Test Exit Ready", changefreq: "monthly", priority: 0.7 },
  { path: "/search-funds", title: "Search Funds España | Capittal", description: "Conectamos empresas con Search Funds.", h1: "Search Funds", changefreq: "monthly", priority: 0.7 },
  { path: "/lp/calculadora", title: "Calculadora de Valoración Gratis | Capittal", description: "Calcula el valor de tu empresa gratis con nuestra calculadora online.", h1: "Calculadora de Valoración", changefreq: "weekly", priority: 0.95 },
  
  { path: "/guia-valoracion-empresas", title: "Guía de Valoración de Empresas | Capittal", description: "Guía profesional de valoración empresarial.", h1: "Guía de Valoración", changefreq: "monthly", priority: 0.65 },
];

function validatePath(path: string): boolean {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  if (path.includes("@") || path.includes("//") || path.includes("\\")) return false;
  if (/^[a-zA-Z]+:/.test(path)) return false;
  return true;
}

function extractFromHtml(html: string) {
  const notes: { field: string; source: string; detail: string }[] = [];

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || null;
  if (title) notes.push({ field: "title", source: "fetched", detail: "Extracted from <title> tag" });

  // Meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const metaDescription = descMatch?.[1]?.trim() || null;
  if (metaDescription) notes.push({ field: "meta_description", source: "fetched", detail: "Extracted from meta description" });

  // H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match?.[1]?.replace(/<[^>]*>/g, "").trim() || null;
  if (h1) notes.push({ field: "h1", source: "fetched", detail: "Extracted from first <h1> tag" });

  // H2s
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const h2s: string[] = [];
  let h2Match;
  while ((h2Match = h2Regex.exec(html)) !== null) {
    const text = h2Match[1].replace(/<[^>]*>/g, "").trim();
    if (text) h2s.push(text);
  }
  if (h2s.length) notes.push({ field: "h2s", source: "fetched", detail: `Found ${h2s.length} H2 tags` });

  // Internal links
  const linkRegex = /<a[^>]*href=["'](\/[^"'#]*?)["'][^>]*>/gi;
  const linksSet = new Set<string>();
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1].replace(/\/+$/, "") || "/";
    linksSet.add(href);
  }
  const internalLinks = Array.from(linksSet);
  if (internalLinks.length) notes.push({ field: "internal_links", source: "fetched", detail: `Found ${internalLinks.length} internal links` });

  return { title, metaDescription, h1, h2s, internalLinks, notes };
}

function computeHealth(title: string | null, description: string | null, h1: string | null, linksCount: number): string {
  const hasTitle = !!title;
  const hasDesc = !!description;
  const hasH1 = !!h1;
  const hasLinks = linksCount > 0;

  if (hasTitle && hasDesc && hasH1 && hasLinks) return "green";
  if (hasTitle && hasH1) return "yellow";
  return "red";
}

async function checkRateLimit(supabase: any, userId: string, scanType: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const limit = scanType === "bulk" ? 5 : 60;

  const { count } = await supabase
    .from("prerender_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("scan_type", scanType)
    .gte("created_at", oneHourAgo);

  return (count || 0) < limit;
}

async function recordRateLimit(supabase: any, userId: string, scanType: string) {
  await supabase.from("prerender_rate_limits").insert({ user_id: userId, scan_type: scanType });
}

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing authorization");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Invalid token");

  // Check admin role
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: hasRole } = await serviceClient.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (!hasRole) throw new Error("Admin access required");

  return { user, serviceClient };
}

async function scanSinglePath(serviceClient: any, path: string) {
  const notes: { field: string; source: string; detail: string }[] = [];
  const routeEntry = SITE_ROUTES.find((r) => r.path === path);

  // Try fetching the published URL
  let fetchedData = { title: null as string | null, metaDescription: null as string | null, h1: null as string | null, h2s: [] as string[], internalLinks: [] as string[] };
  let htmlSnapshot: string | null = null;

  try {
    const res = await fetch(`${SITE_URL}${path}`, {
      headers: { "User-Agent": "CapittalPrerenderScanner/1.0" },
      redirect: "manual",
    });
    const html = await res.text();
    htmlSnapshot = html;
    const extracted = extractFromHtml(html);
    fetchedData = { title: extracted.title, metaDescription: extracted.metaDescription, h1: extracted.h1, h2s: extracted.h2s, internalLinks: extracted.internalLinks };
    notes.push(...extracted.notes);
  } catch (e) {
    notes.push({ field: "fetch", source: "error", detail: `Failed to fetch: ${e.message}` });
  }

  // Fallback to registry if SPA returned empty shell
  let source = "fetched";
  const isSpaShell = !fetchedData.title || fetchedData.title === "" || !fetchedData.h1;

  if (isSpaShell && routeEntry) {
    source = "registry-fallback";
    if (!fetchedData.title) {
      fetchedData.title = routeEntry.title;
      notes.push({ field: "title", source: "registry-fallback", detail: "SPA returned empty, using registry" });
    }
    if (!fetchedData.metaDescription) {
      fetchedData.metaDescription = routeEntry.description;
      notes.push({ field: "meta_description", source: "registry-fallback", detail: "Using registry description" });
    }
    if (!fetchedData.h1) {
      fetchedData.h1 = routeEntry.h1;
      notes.push({ field: "h1", source: "registry-fallback", detail: "Using registry H1" });
    }
  }

  const health = computeHealth(fetchedData.title, fetchedData.metaDescription, fetchedData.h1, fetchedData.internalLinks.length);

  const record = {
    path,
    html_snapshot: htmlSnapshot?.substring(0, 50000) || null,
    title: fetchedData.title,
    meta_description: fetchedData.metaDescription,
    h1: fetchedData.h1,
    h2s: fetchedData.h2s,
    internal_links: fetchedData.internalLinks,
    internal_links_count: fetchedData.internalLinks.length,
    status: "scanned",
    rendered_at: new Date().toISOString(),
    source,
    health,
    extraction_notes: notes,
    full_record: health === "green",
    updated_at: new Date().toISOString(),
  };

  // Upsert into cache
  await serviceClient.from("prerender_cache").upsert(record, { onConflict: "path" });

  return record;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, serviceClient } = await verifyAdmin(req);
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const refresh = url.searchParams.get("refresh") === "true";
    const bulk = url.searchParams.get("bulk") === "true";

    if (bulk) {
      // Rate limit check
      const allowed = await checkRateLimit(serviceClient, user.id, "bulk");
      if (!allowed) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded (5 bulk scans/hour)" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await recordRateLimit(serviceClient, user.id, "bulk");

      const results = [];
      for (const route of SITE_ROUTES) {
        try {
          const result = await scanSinglePath(serviceClient, route.path);
          results.push({ path: route.path, health: result.health, source: result.source });
        } catch (e) {
          results.push({ path: route.path, health: "red", error: e.message });
        }
      }

      return new Response(JSON.stringify({ success: true, scanned: results.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single path scan
    if (!path) {
      return new Response(JSON.stringify({ error: "Missing ?path= parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validatePath(path)) {
      return new Response(JSON.stringify({ error: "Invalid path (SSRF protection)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache unless refresh
    if (!refresh) {
      const { data: cached } = await serviceClient
        .from("prerender_cache")
        .select("*")
        .eq("path", path)
        .single();

      if (cached && cached.status === "scanned") {
        return new Response(JSON.stringify({ ...cached, from_cache: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Rate limit check
    const allowed = await checkRateLimit(serviceClient, user.id, "single");
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded (60 scans/hour)" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await recordRateLimit(serviceClient, user.id, "single");

    const result = await scanSinglePath(serviceClient, path);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const status = e.message.includes("authorization") || e.message.includes("Admin") ? 401 : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
