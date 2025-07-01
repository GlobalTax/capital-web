
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Building2 } from 'lucide-react';
import { ApolloCompany } from '@/types/integrations';
import ApolloCompanyCard from './ApolloCompanyCard';

interface ApolloCompanyListProps {
  apolloCompanies: ApolloCompany[];
}

const ApolloCompanyList = ({ apolloCompanies }: ApolloCompanyListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = apolloCompanies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.company_domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresas Enriquecidas ({filteredCompanies.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, dominio o industria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredCompanies.map((company) => (
            <ApolloCompanyCard key={company.id} company={company} />
          ))}

          {filteredCompanies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron empresas que coincidan con tu búsqueda.</p>
              <p className="text-sm">Intenta enriquecer nuevas empresas usando la herramienta de arriba.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApolloCompanyList;
