
import React from 'react';
import { ApolloCompany } from '@/types/integrations';
import ApolloKPICards from './apollo/ApolloKPICards';
import ApolloEnrichmentTools from './apollo/ApolloEnrichmentTools';
import ApolloCompanyList from './apollo/ApolloCompanyList';

interface ApolloIntelligenceTabProps {
  apolloCompanies: ApolloCompany[];
  onEnrichCompany: (domain: string) => Promise<void>;
  isLoading: boolean;
}

const ApolloIntelligenceTab = ({ 
  apolloCompanies, 
  onEnrichCompany, 
  isLoading 
}: ApolloIntelligenceTabProps) => {
  return (
    <div className="space-y-6">
      <ApolloKPICards apolloCompanies={apolloCompanies} />
      <ApolloEnrichmentTools 
        onEnrichCompany={onEnrichCompany} 
        isLoading={isLoading} 
      />
      <ApolloCompanyList apolloCompanies={apolloCompanies} />
    </div>
  );
};

export default ApolloIntelligenceTab;
