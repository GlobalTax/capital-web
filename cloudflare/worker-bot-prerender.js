/**
 * Cloudflare Worker - Bot Prerender Proxy for capittal.es
 * 
 * Intercepts bot traffic and serves pre-rendered HTML from Supabase Edge Functions
 * while normal users receive the standard SPA.
 * 
 * Environment variables required in Cloudflare:
 *   SUPABASE_URL      = https://fwhqtzkkvnjkazhaficj.supabase.co
 *   SUPABASE_ANON_KEY = (your anon key)
 * 
 * Deploy: Cloudflare Dashboard > Workers & Pages > Create Worker
 * Route:  capittal.es/*
 */

const BOT_UA_PATTERNS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebookexternalhit', 'facebookcatalog', 'twitterbot',
  'linkedinbot', 'whatsapp', 'telegrambot', 'applebot', 'semrushbot',
  'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot', 'sogou', 'ia_archiver',
  'archive.org_bot', 'screaming frog', 'lighthouse', 'chrome-lighthouse',
  'pagespeed', 'pingbot', 'rogerbot',
];

const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.otf', '.map', '.webp', '.avif',
  '.mp4', '.webm', '.mp3', '.wav', '.pdf', '.xml', '.json', '.txt',
];

const EXCLUDED_PATHS = ['/admin', '/auth', '/api/', '/supabase/'];

function isBot(ua) {
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some(p => lower.includes(p));
}

function isStaticAsset(pathname) {
  return STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext));
}

function isExcludedPath(pathname) {
  return EXCLUDED_PATHS.some(p => pathname.startsWith(p));
}

function getCacheTtl(pathname) {
  return pathname.startsWith('/blog/') ? 300 : 3600;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Static assets → origin
    if (isStaticAsset(pathname)) {
      return fetch(request);
    }

    // 2. Excluded paths → origin
    if (isExcludedPath(pathname)) {
      return fetch(request);
    }

    // 3. Check User-Agent
    const userAgent = request.headers.get('User-Agent') || '';
    if (!isBot(userAgent)) {
      return fetch(request);
    }

    // 4. Bot detected — check cache first
    const cacheKey = new URL(url.origin + pathname);
    const cache = caches.default;

    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    // 5. Fetch from prerender-proxy
    try {
      const ssrUrl = `${env.SUPABASE_URL}/functions/v1/prerender-proxy?path=${encodeURIComponent(pathname)}&ssr=1`;

      const ssrResponse = await fetch(ssrUrl, {
        redirect: 'manual',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'User-Agent': userAgent,
        },
      });

      // Propagate 301/302 redirects to the bot
      if (ssrResponse.status === 301 || ssrResponse.status === 302) {
        const location = ssrResponse.headers.get('Location');
        if (location) {
          return new Response(null, {
            status: ssrResponse.status,
            headers: {
              'Location': location,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-Prerender': '1',
            },
          });
        }
      }

      if (!ssrResponse.ok) {
        console.error(`SSR failed (${ssrResponse.status}) for ${pathname}`);
        return fetch(request); // fallback to origin
      }

      const html = await ssrResponse.text();
      const ttl = getCacheTtl(pathname);

      const response = new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': `public, max-age=${ttl}`,
          'X-Prerender': '1',
          'X-Robots-Tag': 'all',
        },
      });

      // Cache asynchronously
      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;
    } catch (err) {
      console.error('Worker error:', err);
      return fetch(request); // fallback to origin
    }
  },
};
