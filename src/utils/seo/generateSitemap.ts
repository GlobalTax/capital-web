import { supabase } from '@/integrations/supabase/client';
import { siteRoutes, SITE_BASE_URL } from '@/data/siteRoutes';

export const generateFullSitemap = async (): Promise<string> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Static entries from centralized registry
    const staticEntries = siteRoutes.map(r =>
      `  <url>\n    <loc>${SITE_BASE_URL}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    ).join('\n');

    // Dynamic blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    const blogEntries = posts?.map(post => {
      const lastmod = new Date(post.updated_at).toISOString().split('T')[0];
      return `  <url>\n    <loc>${SITE_BASE_URL}/recursos/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }).join('\n') || '';
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
</urlset>`;
    
    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return '';
  }
};

export const downloadSitemap = async () => {
  const sitemap = await generateFullSitemap();
  if (!sitemap) return;
  
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  link.click();
  URL.revokeObjectURL(url);
};
