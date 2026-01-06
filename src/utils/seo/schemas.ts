// Schema.org structured data generators for Capittal

/**
 * Organization schema for Capittal
 */
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Capittal",
  "url": "https://capittal.es",
  "logo": "https://capittal.es/logo.png",
  "description": "Especialistas en M&A, valoraciones empresariales, due diligence y reestructuraciones en España",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ES"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": ["Spanish", "Catalan", "English"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/104311808"
  ]
});

/**
 * WebPage schema - generic page
 */
export const getWebPageSchema = (title: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "isPartOf": {
    "@type": "WebSite",
    "name": "Capittal",
    "url": "https://capittal.es"
  }
});

/**
 * Service schema for specific services
 */
export const getServiceSchema = (name: string, description: string, serviceType?: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": name,
  "serviceType": serviceType || name,
  "description": description,
  "provider": getOrganizationSchema(),
  "areaServed": {
    "@type": "Country",
    "name": "Spain"
  }
});

/**
 * BlogPosting schema for blog posts
 */
export const getBlogPostingSchema = (
  title: string,
  description: string,
  url: string,
  imageUrl: string,
  publishedDate: string,
  modifiedDate: string,
  authorName: string
) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "image": imageUrl,
  "url": url,
  "datePublished": publishedDate,
  "dateModified": modifiedDate,
  "author": {
    "@type": "Person",
    "name": authorName
  },
  "publisher": getOrganizationSchema()
});

/**
 * Article schema for articles
 */
export const getArticleSchema = (
  title: string,
  description: string,
  url: string,
  imageUrl: string,
  publishedDate: string,
  modifiedDate: string,
  authorName: string
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "image": imageUrl,
  "url": url,
  "datePublished": publishedDate,
  "dateModified": modifiedDate,
  "author": {
    "@type": "Person",
    "name": authorName
  },
  "publisher": getOrganizationSchema()
});

/**
 * FAQ schema for FAQ sections
 */
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

/**
 * Breadcrumb schema for navigation
 */
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

/**
 * Product schema (for valuation services as products)
 */
export const getProductSchema = (
  name: string,
  description: string,
  imageUrl: string
) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": name,
  "description": description,
  "image": imageUrl,
  "brand": {
    "@type": "Organization",
    "name": "Capittal"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "EUR"
  }
});

/**
 * LocalBusiness schema (if Capittal has physical location)
 */
export const getLocalBusinessSchema = (
  address: string,
  city: string,
  postalCode: string,
  phone?: string
) => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Capittal",
  "image": "https://capittal.es/logo.png",
  "url": "https://capittal.es",
  "telephone": phone,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": address,
    "addressLocality": city,
    "postalCode": postalCode,
    "addressCountry": "ES"
  }
});

/**
 * HowTo schema for step-by-step processes (improves Rich Snippets)
 */
export const getHowToSchema = (
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; url?: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": name,
  "description": description,
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.url && { "url": step.url })
  }))
});

/**
 * ProfessionalService schema - more specific than generic Service
 */
export const getProfessionalServiceSchema = (
  name: string,
  description: string,
  serviceType: string,
  areaServed: string = "España"
) => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": name,
  "description": description,
  "serviceType": serviceType,
  "provider": getOrganizationSchema(),
  "areaServed": {
    "@type": "Country",
    "name": areaServed
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de M&A para Search Funds",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Valoración empresarial gratuita"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Matching con Search Funds verificados"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Asesoramiento en negociación y due diligence"
        }
      }
    ]
  }
});
