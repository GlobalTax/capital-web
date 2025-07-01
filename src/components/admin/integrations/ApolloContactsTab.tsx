
import React from 'react';
import { ApolloContact, ApolloCompany } from '@/types/integrations';
import ApolloContactsKPICards from './apollo/ApolloContactsKPICards';
import ApolloContactsEnrichmentPanel from './apollo/ApolloContactsEnrichmentPanel';
import ApolloContactsList from './apollo/ApolloContactsList';

interface ApolloContactsTabProps {
  apolloContacts: ApolloContact[];
  apolloCompanies: ApolloCompany[];
  onEnrichContacts: (domain: string) => Promise<void>;
  isLoading: boolean;
}

const ApolloContactsTab = ({ 
  apolloContacts, 
  apolloCompanies,
  onEnrichContacts, 
  isLoading 
}: ApolloContactsTabProps) => {
  return (
    <div className="space-y-6">
      <ApolloContactsKPICards apolloContacts={apolloContacts} />
      <ApolloContactsEnrichmentPanel 
        apolloCompanies={apolloCompanies}
        onEnrichContacts={onEnrichContacts} 
        isLoading={isLoading} 
      />
      <ApolloContactsList apolloContacts={apolloContacts} />
    </div>
  );
};

export default ApolloContactsTab;
