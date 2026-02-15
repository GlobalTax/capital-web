import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeJsonLd(str: string): string {
  return str.replace(/</g, "\\u003c");
}

// ─── Organization JSON-LD (shared, matches pages-ssr) ───
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Capittal Transacciones",
  "legalName": "Capittal Transacciones S.L.",
  "url": "https://capittal.es",
  "logo": "https://capittal.es/logo.png",
  "description": "Firma de asesoramiento en M&A, valoraciones y due diligence especializada en el sector seguridad",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ausiàs March 36, Principal",
    "addressLocality": "Barcelona",
    "postalCode": "08010",
    "addressCountry": "ES",
  },
  "sameAs": ["https://www.linkedin.com/company/capittal-transacciones"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(buildErrorHtml("Artículo no encontrado", "No se proporcionó un slug válido."), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, content, meta_title, meta_description, featured_image_url, author_name, published_at, updated_at, tags, category")
      .eq("slug", slug)
      .eq("is_published", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("DB error:", error);
      return new Response(buildErrorHtml("Error interno", "No se pudo cargar el artículo."), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (!post) {
      return new Response(buildErrorHtml("Artículo no encontrado", `No se encontró ningún artículo con el slug "${escapeHtml(slug)}".`), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const canonicalUrl = `https://capittal.es/blog/${post.slug}`;
    const title = escapeHtml(post.meta_title || post.title);
    const description = escapeHtml(post.meta_description || post.excerpt || "");
    const image = post.featured_image_url || "https://capittal.es/og-image.png";
    const authorName = escapeHtml(post.author_name);
    const category = escapeHtml(post.category);
    const publishedAt = post.published_at || post.updated_at;
    const updatedAt = post.updated_at;
    const tags = post.tags || [];

    // Article structured data with full publisher
    const articleJsonLd = safeJsonLd(JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || "",
      image: image,
      author: { "@type": "Person", name: post.author_name },
      publisher: {
        "@type": "Organization",
        name: "Capittal Transacciones",
        legalName: "Capittal Transacciones S.L.",
        url: "https://capittal.es",
        logo: { "@type": "ImageObject", url: "https://capittal.es/logo.png" },
        description: "Firma de asesoramiento en M&A, valoraciones y due diligence especializada en el sector seguridad",
        sameAs: ["https://www.linkedin.com/company/capittal-transacciones"],
      },
      datePublished: publishedAt,
      dateModified: updatedAt,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      keywords: tags.join(", "),
      articleSection: post.category,
    }));

    // Global Organization schema
    const orgJsonLd = safeJsonLd(JSON.stringify(ORG_JSONLD));

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Capittal</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="Capittal Transacciones">
  <meta property="og:locale" content="es_ES">
  <meta property="article:published_time" content="${publishedAt}">
  <meta property="article:modified_time" content="${updatedAt}">
  <meta property="article:author" content="${authorName}">
  <meta property="article:section" content="${category}">
  ${tags.map((t: string) => `<meta property="article:tag" content="${escapeHtml(t)}">`).join("\n  ")}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <script type="application/ld+json">${orgJsonLd}</script>
  <script type="application/ld+json">${articleJsonLd}</script>
  <meta http-equiv="refresh" content="3;url=${canonicalUrl}">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1a1a2e;background:#fff;line-height:1.7;max-width:800px;margin:0 auto;padding:24px 16px}
    header{padding:16px 0;border-bottom:1px solid #e2e8f0;margin-bottom:32px}
    header a{color:#1a1a2e;text-decoration:none;font-weight:700;font-size:1.25rem}
    .meta{color:#64748b;font-size:.875rem;margin-bottom:24px}
    h1{font-size:2rem;line-height:1.3;margin-bottom:12px;color:#0f172a}
    img.hero{width:100%;border-radius:8px;margin-bottom:24px;max-height:400px;object-fit:cover}
    .content{font-size:1.05rem}
    .content h2,.content h3{margin:24px 0 12px;color:#0f172a}
    .content p{margin-bottom:16px}
    .content img{max-width:100%;border-radius:4px}
    .content a{color:#3b82f6}
    footer{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:.875rem;color:#64748b;text-align:center}
    footer a{color:#3b82f6}
    .redirect-note{background:#f1f5f9;padding:12px 16px;border-radius:6px;font-size:.875rem;color:#475569;margin-bottom:24px}
  </style>
</head>
<body>
  <header><a href="https://capittal.es">Capittal</a></header>
  <main>
    <article>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="meta">${authorName} · ${category} · ${publishedAt ? new Date(publishedAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) : ""}</div>
      ${post.featured_image_url ? `<img class="hero" src="${escapeHtml(post.featured_image_url)}" alt="${title}">` : ""}
      <p class="redirect-note">Redirigiendo a la versión completa en <a href="${canonicalUrl}">capittal.es</a>…</p>
      <div class="content">${post.content}</div>
    </article>
  </main>
  <footer>© ${new Date().getFullYear()} <a href="https://capittal.es">Capittal</a> · <a href="${canonicalUrl}">Ver versión completa</a></footer>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(buildErrorHtml("Error interno", "Ocurrió un error inesperado."), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

function buildErrorHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Capittal</title>
  <style>body{font-family:sans-serif;max-width:600px;margin:80px auto;text-align:center;color:#1a1a2e}h1{margin-bottom:16px}a{color:#3b82f6}</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${message}</p>
  <p><a href="https://capittal.es/blog">Volver al blog</a></p>
</body>
</html>`;
}
