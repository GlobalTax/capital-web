
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ApolloIntelligenceTab from '../ApolloIntelligenceTab';
import { ApolloCompany } from '@/types/integrations';

interface ApolloTabContentProps {
  apolloCompanies: ApolloCompany[];
  onEnrichCompany: (domain: string) => Promise<any>;
  isLoading: boolean;
}

const ApolloTabContent = ({ 
  apolloCompanies, 
  onEnrichCompany, 
  isLoading 
}: ApolloTabContentProps) => {
  return (
    <TabsContent value="apollo">
      <ApolloIntelligenceTab 
        apolloCompanies={apolloCompanies}
        onEnrichCompany={onEnrichCompany}
        isLoading={isLoading}
      />
    </TabsContent>
  );
};

export default ApolloTabContent;
