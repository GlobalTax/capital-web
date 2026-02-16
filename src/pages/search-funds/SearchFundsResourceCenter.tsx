import { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { ResourceCenterHero, ResourceCenterGrid } from '@/components/search-funds-center';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';

const SearchFundsResourceCenter = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <SEOHead
        title="Centro de Recursos Search Funds | Capittal"
        description="Guías, herramientas, glosario y recursos completos sobre Search Funds. Todo lo que necesitas saber sobre el modelo de adquisición empresarial en España."
        canonical="https://capittal.es/search-funds/recursos"
        structuredData={getWebPageSchema('Centro de Recursos Search Funds', 'Guías, herramientas, glosario y recursos completos sobre Search Funds en España.', 'https://capittal.es/search-funds/recursos')}
      />

      <div className="bg-white">
        <ResourceCenterHero />
        <ResourceCenterGrid />
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsResourceCenter;
