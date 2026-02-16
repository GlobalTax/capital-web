import { useEffect } from 'react';
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
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';

const SearchFundsGuide = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <SEOHead
        title="Guía Completa de Search Funds en España | Capittal"
        description="Aprende todo sobre Search Funds: qué son, cómo funcionan, modelos de financiación, proceso de adquisición y por qué España es líder europeo."
        canonical="https://capittal.es/search-funds/recursos/guia"
        structuredData={getWebPageSchema('Guía Completa de Search Funds en España', 'Aprende todo sobre Search Funds: qué son, cómo funcionan, modelos de financiación y proceso de adquisición.', 'https://capittal.es/search-funds/recursos/guia')}
      />

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
