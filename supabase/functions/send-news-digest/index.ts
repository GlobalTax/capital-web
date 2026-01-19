import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// STRUCTURED LOGGING
// =====================================================
const log = (level: 'info' | 'warn' | 'error', event: string, data: object = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    function: 'send-news-digest',
    level,
    event,
    ...data
  };
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
};

// Internal team recipients
const INTERNAL_TEAM = [
  "samuel@capittal.es",
  "marcc@capittal.es",
  "marc@capittal.es",
  "oriol@capittal.es",
  "lluis@capittal.es"
];

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  source_name: string;
  source_url: string;
  category: string;
  deal_type: string | null;
  buyer: string | null;
  seller: string | null;
  target_company: string | null;
  deal_value: string | null;
  relevance_score: number | null;
  published_at: string;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getCategoryEmoji = (category: string): string => {
  const emojis: Record<string, string> = {
    'M&A': '🤝',
    'Private Equity': '💼',
    'Venture Capital': '🚀',
    'OPA': '📈',
    'Reestructuración': '🔄'
  };
  return emojis[category] || '📰';
};

const getDealTypeLabel = (dealType: string | null): string => {
  if (!dealType) return '';
  const labels: Record<string, string> = {
    'adquisición': 'Adquisición',
    'venta': 'Venta',
    'fusión': 'Fusión',
    'opa': 'OPA',
    'desinversión': 'Desinversión',
    'mbo': 'MBO',
    'private_equity': 'Private Equity',
    'venture_capital': 'Venture Capital'
  };
  return labels[dealType] || dealType;
};

const generateEmailHtml = (news: NewsArticle[], stats: Record<string, number>, dateStr: string): string => {
  const newsCards = news.map((article, index) => {
    const dealInfo: string[] = [];
    if (article.buyer) dealInfo.push(`<strong>Comprador:</strong> ${article.buyer}`);
    if (article.seller) dealInfo.push(`<strong>Vendedor:</strong> ${article.seller}`);
    if (article.target_company) dealInfo.push(`<strong>Target:</strong> ${article.target_company}`);
    if (article.deal_value && article.deal_value !== 'no especificado') dealInfo.push(`<strong>Valor:</strong> ${article.deal_value}`);
    
    return `
      <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; margin-bottom:8px;">
          <span style="font-size:18px; margin-right:8px;">${getCategoryEmoji(article.category)}</span>
          <span style="background:#f3f4f6; color:#374151; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:600;">${article.category}</span>
          ${article.deal_type ? `<span style="background:#dbeafe; color:#1e40af; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:600; margin-left:6px;">${getDealTypeLabel(article.deal_type)}</span>` : ''}
        </div>
        <h3 style="margin:0 0 8px; font-size:15px; color:#111827; line-height:1.4;">
          <a href="${article.source_url}" target="_blank" style="color:#111827; text-decoration:none;">${article.title}</a>
        </h3>
        ${dealInfo.length > 0 ? `
          <div style="background:#f9fafb; border-radius:6px; padding:10px; margin:10px 0; font-size:13px; color:#4b5563;">
            ${dealInfo.join(' <span style="color:#d1d5db;">|</span> ')}
          </div>
        ` : ''}
        <p style="margin:0 0 10px; font-size:13px; color:#6b7280; line-height:1.5;">${article.excerpt || ''}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:#9ca3af;">${article.source_name}</span>
          <a href="${article.source_url}" target="_blank" style="font-size:12px; color:#2563eb; text-decoration:none; font-weight:600;">Ver más →</a>
        </div>
      </div>
    `;
  }).join('');

  const statsItems = Object.entries(stats)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => `
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f3f4f6;">
        <span style="color:#374151;">${getCategoryEmoji(category)} ${category}</span>
        <span style="font-weight:700; color:#111827;">${count}</span>
      </div>
    `).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumen M&A Diario - Capittal</title>
</head>
<body style="margin:0; padding:0; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f8fafc;">
  <div style="max-width:640px; margin:0 auto; padding:20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius:12px; padding:24px; margin-bottom:20px; text-align:center;">
      <h1 style="margin:0 0 4px; font-size:28px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">Capittal</h1>
      <p style="margin:0 0 16px; font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:2px;">Inteligencia de Mercado</p>
      <div style="background:rgba(255,255,255,0.1); border-radius:8px; padding:12px;">
        <p style="margin:0; font-size:20px; color:#ffffff;">📰 Resumen M&A Diario</p>
        <p style="margin:6px 0 0; font-size:14px; color:#d1d5db;">${dateStr}</p>
      </div>
    </div>

    <!-- Stats Summary -->
    <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin-bottom:20px;">
      <h2 style="margin:0 0 12px; font-size:14px; color:#374151; font-weight:600;">📊 Estadísticas del día</h2>
      <div style="display:flex; justify-content:space-around; text-align:center; margin-bottom:12px;">
        <div>
          <p style="margin:0; font-size:28px; font-weight:700; color:#111827;">${news.length}</p>
          <p style="margin:0; font-size:12px; color:#6b7280;">Noticias</p>
        </div>
        <div style="border-left:1px solid #e5e7eb; padding-left:20px;">
          <p style="margin:0; font-size:28px; font-weight:700; color:#059669;">${news.filter(n => n.deal_value && n.deal_value !== 'no especificado').length}</p>
          <p style="margin:0; font-size:12px; color:#6b7280;">Con valor</p>
        </div>
      </div>
      ${statsItems}
    </div>

    <!-- News Cards -->
    <div style="margin-bottom:20px;">
      <h2 style="margin:0 0 12px; font-size:14px; color:#374151; font-weight:600;">🔥 Operaciones destacadas</h2>
      ${news.length > 0 ? newsCards : '<p style="color:#6b7280; text-align:center; padding:20px;">No hay noticias nuevas en las últimas 24 horas.</p>'}
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:20px; border-top:1px solid #e5e7eb;">
      <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">
        Este resumen se genera automáticamente cada día a las 08:00
      </p>
      <p style="margin:0; font-size:12px; color:#9ca3af;">
        <strong>Capittal</strong> | Expertos en M&A | info@capittal.es
      </p>
    </div>
    
  </div>
</body>
</html>
  `.trim();
};

const generateTextVersion = (news: NewsArticle[], dateStr: string): string => {
  const newsItems = news.map((article, index) => {
    let text = `${index + 1}. ${article.title}\n`;
    text += `   Fuente: ${article.source_name} | Categoría: ${article.category}\n`;
    if (article.buyer) text += `   Comprador: ${article.buyer}\n`;
    if (article.seller) text += `   Vendedor: ${article.seller}\n`;
    if (article.deal_value && article.deal_value !== 'no especificado') text += `   Valor: ${article.deal_value}\n`;
    text += `   Link: ${article.source_url}\n`;
    return text;
  }).join('\n');

  return `
📰 RESUMEN M&A DIARIO - CAPITTAL
${dateStr}

${news.length} noticias de operaciones M&A

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${newsItems || 'No hay noticias nuevas en las últimas 24 horas.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este resumen se genera automáticamente cada día.
Capittal | Expertos en M&A | info@capittal.es
  `.trim();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  log('info', 'DIGEST_JOB_STARTED');

  try {
    // Parse request for hours parameter (default 24h)
    let hoursBack = 24;
    try {
      const body = await req.json();
      if (body?.hours && typeof body.hours === 'number') {
        hoursBack = body.hours;
      }
    } catch {
      // No body or invalid JSON, use default
    }

    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
    
    log('info', 'FETCHING_NEWS', { hoursBack, cutoffTime });

    // Fetch published news from the last N hours
    const { data: news, error: fetchError } = await supabase
      .from('news_articles')
      .select('id, title, excerpt, source_name, source_url, category, deal_type, buyer, seller, target_company, deal_value, relevance_score, published_at')
      .eq('is_published', true)
      .eq('is_deleted', false)
      .gte('published_at', cutoffTime)
      .order('relevance_score', { ascending: false, nullsFirst: false })
      .order('published_at', { ascending: false })
      .limit(20);

    if (fetchError) {
      log('error', 'FETCH_NEWS_FAILED', { error: fetchError.message });
      throw fetchError;
    }

    const newsArticles = (news || []) as NewsArticle[];
    
    log('info', 'NEWS_FETCHED', { count: newsArticles.length });

    // Calculate stats by category
    const stats: Record<string, number> = {};
    for (const article of newsArticles) {
      const cat = article.category || 'Otro';
      stats[cat] = (stats[cat] || 0) + 1;
    }

    // Generate email content
    const today = new Date();
    const dateStr = formatDate(today);
    const htmlContent = generateEmailHtml(newsArticles, stats, dateStr);
    const textContent = generateTextVersion(newsArticles, dateStr);

    // Send email to team
    const subject = newsArticles.length > 0
      ? `📰 Resumen M&A - ${newsArticles.length} operaciones (${today.getDate()} ${today.toLocaleDateString('es-ES', { month: 'short' })})`
      : `📰 Resumen M&A - Sin novedades (${today.getDate()} ${today.toLocaleDateString('es-ES', { month: 'short' })})`;

    log('info', 'SENDING_DIGEST', { 
      recipients: INTERNAL_TEAM.length, 
      newsCount: newsArticles.length 
    });

    const emailResponse = await resend.emails.send({
      from: "Capittal Intelligence <samuel@capittal.es>",
      to: INTERNAL_TEAM,
      subject,
      html: htmlContent,
      text: textContent,
      reply_to: "info@capittal.es",
      headers: {
        "List-Unsubscribe": "<mailto:info@capittal.es?subject=unsubscribe>",
      },
    });

    log('info', 'DIGEST_SENT', { 
      messageId: emailResponse.data?.id,
      newsCount: newsArticles.length,
      recipients: INTERNAL_TEAM.length
    });

    // Create admin notification
    await supabase.from('admin_notifications_news').insert({
      type: 'daily_digest_sent',
      title: `Digest diario enviado: ${newsArticles.length} noticias`,
      message: `Resumen M&A enviado a ${INTERNAL_TEAM.length} miembros del equipo`,
      metadata: {
        news_count: newsArticles.length,
        recipients: INTERNAL_TEAM,
        categories: stats,
        message_id: emailResponse.data?.id
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.data?.id,
        newsCount: newsArticles.length,
        recipients: INTERNAL_TEAM.length,
        categories: stats
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    log('error', 'DIGEST_JOB_FAILED', { error: error?.message, stack: error?.stack });
    
    return new Response(
      JSON.stringify({ success: false, error: error?.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
