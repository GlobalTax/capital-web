import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import Hero from '@/components/suiteloop/Hero';
import ExecutiveSummary from '@/components/suiteloop/ExecutiveSummary';
import MarketAnalysis from '@/components/suiteloop/MarketAnalysis';
import PainPoints from '@/components/suiteloop/PainPoints';
import ValueProposition from '@/components/suiteloop/ValueProposition';
import CompetitiveMatrix from '@/components/suiteloop/CompetitiveMatrix';
import RegulatoryTimeline from '@/components/suiteloop/RegulatoryTimeline';
import ProductDemo from '@/components/suiteloop/ProductDemo';
import ROICalculator from '@/components/suiteloop/ROICalculator';
import FAQ from '@/components/suiteloop/FAQ';
import TrustSignals from '@/components/suiteloop/TrustSignals';
import { seoConfig } from '@/data/suiteloop-data';
import { SEOHead } from '@/components/seo';

const LandingSuiteLoop: React.FC = () => {
  const handleDownloadReport = () => {
    console.log('Downloading SuiteLoop report...');
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'download_report',
        source: 'suiteloop_landing',
        timestamp: new Date().toISOString()
      });
    }
  };

  const structuredData = {
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

  return (
    <>
      <SEOHead 
        title={seoConfig.title}
        description={seoConfig.description}
        canonical={seoConfig.canonical}
        keywords={seoConfig.keywords}
        structuredData={structuredData}
      />
      <UnifiedLayout variant="home">
        <Hero onDownloadReport={handleDownloadReport} />
        <ExecutiveSummary />
        <MarketAnalysis />
        <PainPoints />
        <ValueProposition />
        <CompetitiveMatrix />
        <RegulatoryTimeline />
        <ProductDemo />
        <ROICalculator />
        <TrustSignals />
        <FAQ />
      </UnifiedLayout>
    </>
  );
};

export default LandingSuiteLoop;