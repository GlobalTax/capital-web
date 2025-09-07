
import React, { useEffect } from 'react';
import HomeLayout from '@/components/shared/HomeLayout';
import DueDiligenceHero from '@/components/due-diligence/DueDiligenceHero';
import DueDiligenceTypes from '@/components/due-diligence/DueDiligenceTypes';
import DueDiligenceProcess from '@/components/due-diligence/DueDiligenceProcess';
import DueDiligenceBenefits from '@/components/due-diligence/DueDiligenceBenefits';
import DueDiligenceFAQ from '@/components/due-diligence/DueDiligenceFAQ';
import DueDiligenceCTA from '@/components/due-diligence/DueDiligenceCTA';

const DueDiligence = () => {
  useEffect(() => {
    // SEO Meta Tags - Professional service focus
    document.title = 'Due Diligence Profesional | Buy-side y Vendor DD | Capittal';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Due Diligence profesional Buy-side y Vendor. 150+ transacciones, €1.8B analizados. Identificamos riesgos y maximizamos valor en M&A.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Due Diligence profesional Buy-side y Vendor. 150+ transacciones, €1.8B analizados. Identificamos riesgos y maximizamos valor en M&A.';
      document.head.appendChild(meta);
    }

    // Service-focused keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'due diligence buy-side, vendor due diligence, análisis M&A, due diligence financiero, due diligence legal, Capittal');
    } else {
      const keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      keywordsMeta.content = 'due diligence buy-side, vendor due diligence, análisis M&A, due diligence financiero, due diligence legal, Capittal';
      document.head.appendChild(keywordsMeta);
    }

    return () => {
      document.title = "Capittal";
    };
  }, []);

  return (
    <HomeLayout>
      <DueDiligenceHero />
      <DueDiligenceTypes />
      <DueDiligenceProcess />
      <DueDiligenceBenefits />
      <DueDiligenceFAQ />
      <DueDiligenceCTA />
    </HomeLayout>
  );
};

export default DueDiligence;
