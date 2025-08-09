import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  structuredData?: Record<string, any> | Record<string, any>[];
}

const clamp = (text: string, max: number) => (text.length > max ? text.slice(0, max - 1) + '…' : text);

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  noindex = false,
  ogImage,
  structuredData,
}) => {
  const safeDescription = description ? clamp(description, 160) : undefined;
  const computedCanonical = canonical || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined);
  const siteName = 'Capittal';
  const pageTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      {safeDescription && <meta name="description" content={safeDescription} />}
      {computedCanonical && <link rel="canonical" href={computedCanonical} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      {safeDescription && <meta property="og:description" content={safeDescription} />} 
      {computedCanonical && <meta property="og:url" content={computedCanonical} />}
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={pageTitle} />
      {safeDescription && <meta name="twitter:description" content={safeDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {Array.isArray(structuredData)
            ? JSON.stringify(structuredData)
            : JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
