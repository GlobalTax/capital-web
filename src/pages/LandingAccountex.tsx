import React from 'react';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import AccountexHero from '@/components/landing/accountex/AccountexHero';
import AccountexAbout from '@/components/landing/accountex/AccountexAbout';
import AccountexValueProps from '@/components/landing/accountex/AccountexValueProps';
import AccountexCTABanner from '@/components/landing/accountex/AccountexCTABanner';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';

const LandingAccountex = () => {
  return (
    <>
      <SEOHead 
        title="Nos vemos en Accountex Madrid 2025 | Capittal"
        description="Descubre cómo Capittal ayuda a asesorías y empresas tecnológicas a crecer a través de operaciones de M&A. Reserva tu reunión en Accountex 2025."
        canonical="https://capittal.es/lp/accountex"
        keywords="Accountex Madrid 2025, M&A asesorías, fusiones adquisiciones tecnología"
        structuredData={getWebPageSchema(
          "Accountex Madrid 2025",
          "Capittal en Accountex 2025 - M&A para asesorías y empresas tecnológicas",
          "https://capittal.es/lp/accountex"
        )}
      />
      <div className="min-h-screen bg-background">
        <LandingHeaderMinimal />
        
        <main className="pt-16">
          <AccountexHero />
          <AccountexAbout />
          <AccountexValueProps />
          <AccountexCTABanner />
        </main>
        
        <LandingFooterMinimal />
      </div>
    </>
  );
};

export default LandingAccountex;
