import { supabase } from '@/integrations/supabase/client';

export const generateBlogSitemap = async (): Promise<string> => {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    
    const urls = posts?.map(post => `
  <url>
    <loc>https://capittal.es/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || '';
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
    
    return sitemap;
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
    return '';
  }
};

export const downloadBlogSitemap = async () => {
  const sitemap = await generateBlogSitemap();
  if (!sitemap) return;
  
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blog-sitemap.xml';
  link.click();
  URL.revokeObjectURL(url);
};
