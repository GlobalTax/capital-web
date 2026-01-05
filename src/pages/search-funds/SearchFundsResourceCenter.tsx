import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { ResourceCenterHero, ResourceCenterGrid } from '@/components/search-funds-center';

const SearchFundsResourceCenter = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Centro de Recursos Search Funds | Capittal</title>
        <meta 
          name="description" 
          content="Guías, herramientas, glosario y recursos completos sobre Search Funds. Todo lo que necesitas saber sobre el modelo de adquisición empresarial en España." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos" />
      </Helmet>

      <div className="pt-24">
        <ResourceCenterHero />
        <ResourceCenterGrid />
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsResourceCenter;
