import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fuentes de confianza para auto-publicación
const TRUSTED_SOURCES = [
  'Capital & Corporate',
  'Expansión',
  'Cinco Días',
  'El Economista'
];

// Categorías que requieren revisión manual
const MANUAL_REVIEW_CATEGORIES = [
  'Reestructuración'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Authentication: either CRON_SECRET header or JWT + admin check
  const cronSecret = req.headers.get('X-Cron-Secret');
  const expectedCronSecret = Deno.env.get('CRON_SECRET');
  const isScheduledCall = cronSecret && expectedCronSecret && cronSecret === expectedCronSecret;

  if (!isScheduledCall) {
    const { validateAdminRequest } = await import("../_shared/auth-guard.ts");
    const auth = await validateAdminRequest(req, corsHeaders);
    if (auth.error) return auth.error;
    console.log(`[auto-publish-news] Authenticated admin: ${auth.userEmail} (role: ${auth.role})`);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting auto-publish-news process...');

    // Buscar candidatos para auto-publicación
    const { data: candidates, error: fetchError } = await supabase
      .from('news_articles')
      .select('id, title, source_name, category, excerpt')
      .eq('is_processed', true)
      .eq('is_published', false)
      .eq('is_deleted', false)
      .in('source_name', TRUSTED_SOURCES);

    if (fetchError) {
      console.error('Error fetching candidates:', fetchError);
      throw fetchError;
    }

    console.log(`📰 Found ${candidates?.length || 0} candidates for auto-publishing`);

    // Filtrar por criterios adicionales
    const articlesToPublish = (candidates || []).filter(article => {
      // Excluir categorías que requieren revisión manual
      if (MANUAL_REVIEW_CATEGORIES.includes(article.category)) {
        console.log(`⏭️ Skipping "${article.title}" - category requires manual review`);
        return false;
      }

      // Verificar que tiene contenido suficiente
      if (!article.excerpt || article.excerpt.length < 50) {
        console.log(`⏭️ Skipping "${article.title}" - insufficient excerpt`);
        return false;
      }

      return true;
    });

    console.log(`✅ ${articlesToPublish.length} articles passed auto-publish criteria`);

    let publishedCount = 0;

    // Auto-publicar artículos que cumplen criterios
    for (const article of articlesToPublish) {
      const { error: updateError } = await supabase
        .from('news_articles')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          auto_published: true
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`Error publishing article ${article.id}:`, updateError);
      } else {
        publishedCount++;
        console.log(`📗 Auto-published: "${article.title}"`);
      }
    }

    // Crear notificación si se publicaron artículos
    if (publishedCount > 0) {
      await supabase.from('admin_notifications_news').insert({
        type: 'auto_published',
        title: `${publishedCount} noticias auto-publicadas`,
        message: `Se han publicado automáticamente ${publishedCount} noticias de fuentes de confianza`,
        metadata: {
          count: publishedCount,
          articles: articlesToPublish.map(a => ({ id: a.id, title: a.title }))
        }
      });
      console.log('📬 Admin notification created');
    }

    return new Response(
      JSON.stringify({
        success: true,
        candidates: candidates?.length || 0,
        published: publishedCount,
        message: `Auto-published ${publishedCount} articles`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-publish-news:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
