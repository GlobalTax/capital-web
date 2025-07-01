
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ApolloContact } from '@/types/integrations';

interface ApolloContactsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCompany: string;
  setSelectedCompany: (value: string) => void;
  apolloContacts: ApolloContact[];
}

const ApolloContactsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCompany,
  setSelectedCompany,
  apolloContacts
}: ApolloContactsFiltersProps) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, título o empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <select 
        className="px-3 py-2 border rounded-md"
        value={selectedCompany}
        onChange={(e) => setSelectedCompany(e.target.value)}
      >
        <option value="">Todas las empresas</option>
        {Array.from(new Set(apolloContacts.map(c => c.company_domain))).map(domain => (
          <option key={domain} value={domain}>{domain}</option>
        ))}
      </select>
    </div>
  );
};

export default ApolloContactsFilters;
