import { BlogPost } from '@/types/blog';

export const useBlogRSS = () => {
  const generateRSSFeed = (posts: BlogPost[], siteUrl: string = window.location.origin) => {
    const now = new Date().toISOString();
    
    // Filtrar solo posts publicados y ordenar por fecha
    const publishedPosts = posts
      .filter(post => post.is_published)
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at);
        const dateB = new Date(b.published_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 20); // Máximo 20 posts en el RSS

    const rssItems = publishedPosts.map(post => {
      const pubDate = new Date(post.published_at || post.created_at).toUTCString();
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      const content = post.excerpt || post.content.substring(0, 300) + '...';
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${content}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author><![CDATA[${post.author_name}]]></author>
      <category><![CDATA[${post.category}]]></category>
      ${post.featured_image_url ? `<enclosure url="${post.featured_image_url}" type="image/jpeg" />` : ''}
      ${post.tags?.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ') || ''}
    </item>`.trim();
    }).join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Capittal - Análisis M&amp;A</title>
    <link>${siteUrl}/recursos/blog</link>
    <description>Artículos especializados y análisis de mercado escritos por nuestros expertos en M&amp;A</description>
    <language>es-ES</language>
    <lastBuildDate>${now}</lastBuildDate>
    <managingEditor>info@capittal.es (Equipo Capittal)</managingEditor>
    <webMaster>info@capittal.es (Equipo Capittal)</webMaster>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>Blog Capittal</title>
      <link>${siteUrl}/recursos/blog</link>
    </image>
${rssItems}
  </channel>
</rss>`;

    return rssXml;
  };

  const downloadRSSFeed = (posts: BlogPost[]) => {
    const rssContent = generateRSSFeed(posts);
    const blob = new Blob([rssContent], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blog-rss.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateSitemap = (posts: BlogPost[], siteUrl: string = window.location.origin) => {
    const publishedPosts = posts.filter(post => post.is_published);
    
    const urlEntries = publishedPosts.map(post => {
      const lastmod = (post.published_at || post.created_at).split('T')[0];
      return `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`.trim();
    }).join('\n');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/recursos/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urlEntries}
</urlset>`;

    return sitemapXml;
  };

  const generateOpenGraphTags = (post: BlogPost, siteUrl: string = window.location.origin) => {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const imageUrl = post.featured_image_url || `${siteUrl}/og-default-blog.jpg`;
    
    return {
      'og:title': post.meta_title || post.title,
      'og:description': post.meta_description || post.excerpt || '',
      'og:type': 'article',
      'og:url': postUrl,
      'og:image': imageUrl,
      'og:site_name': 'Capittal',
      'article:author': post.author_name,
      'article:published_time': post.published_at || post.created_at,
      'article:section': post.category,
      'article:tag': post.tags?.join(', ') || '',
      'twitter:card': 'summary_large_image',
      'twitter:title': post.meta_title || post.title,
      'twitter:description': post.meta_description || post.excerpt || '',
      'twitter:image': imageUrl
    };
  };

  const applyOpenGraphTags = (post: BlogPost) => {
    const tags = generateOpenGraphTags(post);
    
    // Limpiar tags existentes
    const existingTags = document.querySelectorAll('meta[property^="og:"], meta[property^="article:"], meta[name^="twitter:"]');
    existingTags.forEach(tag => tag.remove());
    
    // Agregar nuevos tags
    Object.entries(tags).forEach(([property, content]) => {
      if (content) {
        const meta = document.createElement('meta');
        if (property.startsWith('twitter:')) {
          meta.setAttribute('name', property);
        } else {
          meta.setAttribute('property', property);
        }
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });
  };

  return {
    generateRSSFeed,
    downloadRSSFeed,
    generateSitemap,
    generateOpenGraphTags,
    applyOpenGraphTags
  };
};