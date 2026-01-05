import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import {
  SearchFundsHubHero,
  TableOfContents,
  SearchFundsModels,
  SearchFundsIdealTarget,
  SearchFundsDealStructure,
  SearchFundsFinancing,
  SearchFundsSpainEcosystem,
  SearchFundsHubFAQ,
  SearchFundsHubCTA,
} from '@/components/search-funds-hub';

const SearchFundsGuide = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Guía Completa de Search Funds en España | Capittal</title>
        <meta 
          name="description" 
          content="Aprende todo sobre Search Funds: qué son, cómo funcionan, modelos de financiación, proceso de adquisición y por qué España es líder europeo." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos/guia" />
      </Helmet>

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-64 flex-shrink-0">
              <TableOfContents />
            </aside>
            
            <main className="flex-1 max-w-4xl">
              <SearchFundsHubHero />
              <SearchFundsModels />
              <SearchFundsIdealTarget />
              <SearchFundsDealStructure />
              <SearchFundsFinancing />
              <SearchFundsSpainEcosystem />
              <SearchFundsHubFAQ />
              <SearchFundsHubCTA />
            </main>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsGuide;
