
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ApolloContactsTab from '../ApolloContactsTab';
import { ApolloContact, ApolloCompany } from '@/types/integrations';

interface ContactsTabContentProps {
  apolloContacts: ApolloContact[];
  apolloCompanies: ApolloCompany[];
  onEnrichContacts: (companyDomain: string) => Promise<any>;
  isLoading: boolean;
}

const ContactsTabContent = ({ 
  apolloContacts, 
  apolloCompanies,
  onEnrichContacts, 
  isLoading 
}: ContactsTabContentProps) => {
  return (
    <TabsContent value="contacts">
      <ApolloContactsTab 
        apolloContacts={apolloContacts}
        apolloCompanies={apolloCompanies}
        onEnrichContacts={onEnrichContacts}
        isLoading={isLoading}
      />
    </TabsContent>
  );
};

export default ContactsTabContent;
