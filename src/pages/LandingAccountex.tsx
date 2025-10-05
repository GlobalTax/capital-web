import { useEffect } from 'react';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import AccountexHero from '@/components/landing/accountex/AccountexHero';
import AccountexAbout from '@/components/landing/accountex/AccountexAbout';
import AccountexValueProps from '@/components/landing/accountex/AccountexValueProps';
import AccountexCTABanner from '@/components/landing/accountex/AccountexCTABanner';
import AccountexLeadForm from '@/components/landing/accountex/AccountexLeadForm';

const LandingAccountex = () => {
  useEffect(() => {
    // SEO: Meta tags
    const title = 'Nos vemos en Accountex Madrid 2025 | Capittal';
    const description = 'Descubre cómo Capittal ayuda a asesorías y empresas tecnológicas a crecer a través de operaciones de M&A. Reserva tu reunión en Accountex 2025.';
    
    document.title = title;
    
    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
    
    // Canonical URL
    const canonicalUrl = 'https://capittal.es/lp/accountex';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeaderMinimal />
      
      <main className="pt-16">
        {/* Hero Section */}
        <AccountexHero />
        
        {/* About Section */}
        <AccountexAbout />
        
        {/* Value Propositions */}
        <AccountexValueProps />
        
        {/* CTA Banner */}
        <AccountexCTABanner />
      </main>
      
      <LandingFooterMinimal />
    </div>
  );
};

export default LandingAccountex;
