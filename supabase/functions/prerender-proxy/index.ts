const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Bot User-Agent patterns for dynamic rendering
const BOT_UA_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "facebookcatalog",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "applebot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "petalbot",
  "sogou",
  "ia_archiver",
  "archive.org_bot",
  "screaming frog",
  "lighthouse",
  "chrome-lighthouse",
  "pagespeed",
  "pingbot",
  "rogerbot",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const userAgent = req.headers.get("user-agent") || "";
    const forceSSR = url.searchParams.get("ssr") === "1";

    // Only serve SSR for bots or when explicitly requested
    if (!isBot(userAgent) && !forceSSR) {
      return new Response(
        JSON.stringify({
          bot: false,
          message: "Not a bot. Serve SPA normally.",
          path,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Determine which SSR function to call
    let ssrFunctionUrl: string;
    let ssrParams: string;

    if (path.startsWith("/blog/") && path.length > 6) {
      // Blog post: /blog/my-post-slug → blog-ssr?slug=my-post-slug
      const slug = path.replace("/blog/", "");
      ssrFunctionUrl = `${supabaseUrl}/functions/v1/blog-ssr`;
      ssrParams = `?slug=${encodeURIComponent(slug)}`;
    } else {
      // All other pages → pages-ssr?path=/the-path
      ssrFunctionUrl = `${supabaseUrl}/functions/v1/pages-ssr`;
      ssrParams = `?path=${encodeURIComponent(path)}`;
    }

    const ssrResponse = await fetch(`${ssrFunctionUrl}${ssrParams}`, {
      redirect: "manual",
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "User-Agent": userAgent,
      },
    });

    // Propagate 301/302 redirects from pages-ssr to the bot
    if (ssrResponse.status === 301 || ssrResponse.status === 302) {
      const location = ssrResponse.headers.get("Location");
      if (location) {
        return new Response(null, {
          status: ssrResponse.status,
          headers: {
            ...corsHeaders,
            "Location": location,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    if (!ssrResponse.ok) {
      console.error(
        `SSR function returned ${ssrResponse.status} for path: ${path}`
      );
      // Fallback: return a basic HTML with meta refresh to SPA
      return new Response(
        buildFallbackHtml(path),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        }
      );
    }

    const html = await ssrResponse.text();

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Robots-Tag": "all",
        "X-Prerender": "1",
      },
    });
  } catch (err) {
    console.error("prerender-proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildFallbackHtml(path: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Capittal - Especialistas en M&amp;A</title>
  <meta name="description" content="Capittal Transacciones asesora en fusiones, adquisiciones, valoraciones y due diligence. Especialistas en el sector seguridad.">
  <link rel="canonical" href="https://capittal.es${path}">
  <meta http-equiv="refresh" content="0;url=https://capittal.es${path}">
</head>
<body>
  <h1>Capittal - Especialistas en Fusiones y Adquisiciones</h1>
  <p>Redirigiendo a <a href="https://capittal.es${path}">capittal.es${path}</a>...</p>
</body>
</html>`;
}
