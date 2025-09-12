import React, { useEffect } from 'react';
import LandingLayout from '@/components/shared/LandingLayout';
import Hero from '@/components/suiteloop/Hero';
import ExecutiveSummary from '@/components/suiteloop/ExecutiveSummary';
import MarketAnalysis from '@/components/suiteloop/MarketAnalysis';
import PainPoints from '@/components/suiteloop/PainPoints';
import CompetitiveMatrix from '@/components/suiteloop/CompetitiveMatrix';
import ValueProposition from '@/components/suiteloop/ValueProposition';
import ProductDemo from '@/components/suiteloop/ProductDemo';
import ROICalculator from '@/components/suiteloop/ROICalculator';
import FAQ from '@/components/suiteloop/FAQ';
import { seoConfig } from '@/data/suiteloop-data';

const LandingSuiteLoop: React.FC = () => {
  
  useEffect(() => {
    // SEO Meta tags
    document.title = seoConfig.title;
    
    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seoConfig.description);

    // Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seoConfig.keywords);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', seoConfig.canonical);

    // JSON-LD Structured Data
    const jsonLD = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": seoConfig.title,
      "description": seoConfig.description,
      "url": seoConfig.canonical,
      "about": {
        "@type": "SoftwareApplication",
        "name": "SuiteLoop",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": "Plataforma post-on-premise para asesorías que convive con A3/Sage",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "EUR",
          "price": "299",
          "priceValidUntil": "2025-12-31"
        }
      },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question", 
            "name": "¿SuiteLoop sustituye a A3 o Sage?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. SuiteLoop es una capa post-on-premise que convive con tu ERP actual."
            }
          }
        ]
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"][data-suiteloop]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-suiteloop', 'true');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLD);

    return () => {
      // Cleanup on unmount
      const elements = document.querySelectorAll('[data-suiteloop]');
      elements.forEach(el => el.remove());
    };
  }, []);

  const handleDownloadReport = () => {
    // Simulate PDF download
    console.log('Downloading SuiteLoop report...');
    
    // Analytics tracking
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'download_report',
        source: 'suiteloop_landing',
        report_type: 'sector_analysis'
      });
    }
  };

  return (
    <LandingLayout mainClassName="pt-0">
      <Hero onDownloadReport={handleDownloadReport} />
      <ExecutiveSummary />
      <MarketAnalysis />
      <PainPoints />
      <ValueProposition />
      <CompetitiveMatrix />
      <ProductDemo />
      <ROICalculator />
      <FAQ />
    </LandingLayout>
  );
};

export default LandingSuiteLoop;