import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  SearchFundsHero,
  SearchFundsWhatAre,
  SearchFundsWhyCapittal,
  SearchFundsForSellers,
  SearchFundsForSearchers,
  SearchFundsProcess,
  SearchFundsFAQ,
  SearchFundsCTA
} from '@/components/search-funds';

const SearchFunds = () => {
  useEffect(() => {
    // SEO Meta tags
    document.title = 'Search Funds en España | Capittal - Venta de empresas a emprendedores';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Conectamos empresas españolas con Search Funds profesionales. Servicio especializado para empresarios que buscan vender a emprendedores comprometidos con su legado. España #1 en Europa.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Conectamos empresas españolas con Search Funds profesionales. Servicio especializado para empresarios que buscan vender a emprendedores comprometidos con su legado. España #1 en Europa.';
      document.head.appendChild(meta);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SearchFundsHero />
        <SearchFundsWhatAre />
        <SearchFundsWhyCapittal />
        <SearchFundsForSellers />
        <SearchFundsForSearchers />
        <SearchFundsProcess />
        <SearchFundsFAQ />
        <SearchFundsCTA />
      </main>
      <Footer />
    </div>
  );
};

export default SearchFunds;
