
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { ApolloContact } from '@/types/integrations';
import ApolloContactCard from './ApolloContactCard';
import ApolloContactsFilters from './ApolloContactsFilters';

interface ApolloContactsListProps {
  apolloContacts: ApolloContact[];
}

const ApolloContactsList = ({ apolloContacts }: ApolloContactsListProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCompany, setSelectedCompany] = React.useState('');

  const filteredContacts = apolloContacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company_domain?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = !selectedCompany || contact.company_domain === selectedCompany;
    
    return matchesSearch && matchesCompany;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contactos Apollo ({filteredContacts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ApolloContactsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          apolloContacts={apolloContacts}
        />

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <ApolloContactCard key={contact.id} contact={contact} />
          ))}

          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron contactos que coincidan con tu búsqueda.</p>
              <p className="text-sm">Enriquece empresas con Apollo para obtener contactos clave.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApolloContactsList;
