import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      banners: {
        Row: {
          id: string;
          name: string;
          slug: string;
          title: string;
          subtitle: string | null;
          cta_text: string | null;
          cta_href: string | null;
          variant: 'solid' | 'gradient' | 'soft' | 'outline';
          color_primary: string;
          color_secondary: string | null;
          text_on_primary: string | null;
          position: 'top' | 'bottom';
          dismissible: boolean;
          rounded: string;
          shadow: boolean;
          align: 'left' | 'center';
          max_width: 'none' | '7xl';
          visible: boolean;
          audience: string[];
          pages: string[];
          start_at: string | null;
          end_at: string | null;
          priority: number;
          version: number;
          exclusive: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['banners']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['banners']['Insert']>;
      };
    };
  };
}

// Helper function to check if user is admin
async function isUserAdmin(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error || !data) return false;
    return ['admin', 'super_admin'].includes(data.role);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Helper function to transform banner data for UI
function transformBannerForUI(banner: Database['public']['Tables']['banners']['Row']) {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    ctaText: banner.cta_text,
    ctaHref: banner.cta_href,
    variant: banner.variant,
    colorScheme: {
      primary: banner.color_primary,
      secondary: banner.color_secondary,
      textOnPrimary: banner.text_on_primary,
    },
    position: banner.position,
    dismissible: banner.dismissible,
    rounded: banner.rounded,
    shadow: banner.shadow,
    align: banner.align,
    maxWidth: banner.max_width,
    show: banner.visible,
    version: banner.version.toString(),
    priority: banner.priority,
    exclusive: banner.exclusive,
  };
}

// Helper function to check audience match
function matchesAudience(bannerAudience: string[], requestedAudience: string): boolean {
  if (bannerAudience.includes('all')) return true;
  if (bannerAudience.includes(requestedAudience)) return true;
  return false;
}

// Helper function to check page match
function matchesPage(bannerPages: string[], requestedPath: string): boolean {
  if (bannerPages.includes('all')) return true;
  if (bannerPages.includes(requestedPath)) return true;
  return false;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`Processing ${req.method} ${path}`);

    // GET /banners/active - Public endpoint for active banners
    if (req.method === 'GET' && path === '/banners/active') {
      const requestedPath = url.searchParams.get('path') || '/';
      const audience = url.searchParams.get('audience') || 'anon';
      
      console.log(`Fetching active banners for path: ${requestedPath}, audience: ${audience}`);

      // Fetch visible banners with basic filters only
      const { data: banners, error } = await supabaseClient
        .from('banners')
        .select('*')
        .eq('visible', true);

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch banners' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Apply time window and audience filtering
      const now = new Date();
      const candidateBanners = banners.filter(banner => {
        // Check time window
        const startOk = !banner.start_at || new Date(banner.start_at) <= now;
        const endOk = !banner.end_at || new Date(banner.end_at) >= now;
        
        // Check audience
        const audienceMatch = matchesAudience(banner.audience, audience);
        
        return startOk && endOk && audienceMatch;
      });

      // Group banners by specific pages they match
      const pageGroups = new Map<string, typeof candidateBanners>();
      
      candidateBanners.forEach(banner => {
        // Determine which specific pages this banner matches
        const matchingPages: string[] = [];
        
        if (banner.pages.includes('all')) {
          matchingPages.push('all');
        } else {
          banner.pages.forEach((page: string) => {
            if (matchesPage([page], requestedPath)) {
              matchingPages.push(page);
            }
          });
        }
        
        // Add banner to each matching page group
        matchingPages.forEach(page => {
          if (!pageGroups.has(page)) {
            pageGroups.set(page, []);
          }
          pageGroups.get(page)!.push(banner);
        });
      });

      // Process each page group and apply ordering + exclusive logic
      const finalBanners = new Map<string, any>(); // Use banner ID as key to avoid duplicates
      
      for (const [page, pageBanners] of pageGroups.entries()) {
        // Sort by priority DESC, then start_at DESC (null start_at treated as oldest)
        pageBanners.sort((a, b) => {
          // First sort by priority
          if (a.priority !== b.priority) {
            return b.priority - a.priority; // DESC
          }
          
          // Then by start_at (more recent first, null last)
          const aDate = a.start_at ? new Date(a.start_at).getTime() : 0;
          const bDate = b.start_at ? new Date(b.start_at).getTime() : 0;
          return bDate - aDate; // DESC
        });
        
        // Get the top banner(s) for this page
        if (pageBanners.length > 0) {
          const topBanner = pageBanners[0];
          
          if (topBanner.exclusive) {
            // If top banner is exclusive, only return that one for this page
            finalBanners.set(topBanner.id, topBanner);
            
            // If exclusive banner affects 'all' pages, clear everything else
            if (page === 'all') {
              finalBanners.clear();
              finalBanners.set(topBanner.id, topBanner);
              break; // Exit loop, this banner overrides everything
            }
          } else {
            // Not exclusive: return all banners with the same highest priority
            const highestPriority = topBanner.priority;
            const samePriorityBanners = pageBanners.filter(b => b.priority === highestPriority);
            
            samePriorityBanners.forEach(banner => {
              finalBanners.set(banner.id, banner);
            });
          }
        }
      }

      // Transform final banners for UI
      const transformedBanners = Array.from(finalBanners.values())
        .map(transformBannerForUI)
        .sort((a, b) => b.priority - a.priority); // Final sort by priority for consistent ordering

      console.log(`Returning ${transformedBanners.length} active banners`);
      
      return new Response(
        JSON.stringify(transformedBanners),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All other endpoints require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(supabaseClient, user.id);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set auth context for subsequent queries
    supabaseClient.auth.setSession({ access_token: token, refresh_token: '' });

    // GET /banners - Admin endpoint for all banners with pagination
    if (req.method === 'GET' && path === '/banners') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = (page - 1) * limit;

      const { data: banners, error, count } = await supabaseClient
        .from('banners')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch banners' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          data: banners, 
          total: count, 
          page, 
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /banners - Create new banner
    if (req.method === 'POST' && path === '/banners') {
      const bannerData = await req.json();
      
      const { data: banner, error } = await supabaseClient
        .from('banners')
        .insert([bannerData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create banner' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(banner),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PATCH /banners/:id - Update banner
    const patchMatch = path.match(/^\/banners\/([^\/]+)$/);
    if (req.method === 'PATCH' && patchMatch) {
      const bannerId = patchMatch[1];
      const updateData = await req.json();
      
      const { data: banner, error } = await supabaseClient
        .from('banners')
        .update(updateData)
        .eq('id', bannerId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update banner' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(banner),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /banners/:id/toggle - Toggle banner visibility
    const toggleMatch = path.match(/^\/banners\/([^\/]+)\/toggle$/);
    if (req.method === 'POST' && toggleMatch) {
      const bannerId = toggleMatch[1];
      
      // First get current visibility state
      const { data: currentBanner, error: fetchError } = await supabaseClient
        .from('banners')
        .select('visible')
        .eq('id', bannerId)
        .single();

      if (fetchError) {
        console.error('Database error:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Banner not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Toggle visibility
      const { data: banner, error } = await supabaseClient
        .from('banners')
        .update({ visible: !currentBanner.visible })
        .eq('id', bannerId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to toggle banner visibility' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(banner),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /banners/:id/track - Track banner events (impression/click)
    const trackMatch = path.match(/^\/banners\/([^\/]+)\/track$/);
    if (req.method === 'POST' && trackMatch) {
      const bannerId = trackMatch[1];
      const { event } = await req.json();
      
      // Validate event type
      if (!event || !['impression', 'click'].includes(event)) {
        return new Response(
          JSON.stringify({ error: 'Invalid event type. Must be "impression" or "click"' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get request metadata
      const url = new URL(req.url);
      const currentPath = url.searchParams.get('path') || '/';
      const userAgent = req.headers.get('user-agent') || null;
      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                        req.headers.get('x-real-ip') || null;

      // Get user ID if authenticated (but don't require authentication)
      let userId = null;
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user } } = await supabaseClient.auth.getUser(token);
          if (user) {
            userId = user.id;
          }
        } catch (error) {
          // Ignore auth errors for tracking - we allow anonymous tracking
          console.log('Auth error in tracking (ignored):', error);
        }
      }

      // Insert banner event
      const { error: insertError } = await supabaseClient
        .from('banner_events')
        .insert({
          banner_id: bannerId,
          event: event,
          path: currentPath,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (insertError) {
        console.error('Error inserting banner event:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to track banner event' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Tracked ${event} event for banner ${bannerId} on path ${currentPath}`);
      
      return new Response(
        JSON.stringify({ success: true, event, banner_id: bannerId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});