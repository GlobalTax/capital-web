
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import { ApolloCompany } from '@/types/integrations';

interface ApolloContactsEnrichmentPanelProps {
  apolloCompanies: ApolloCompany[];
  onEnrichContacts: (domain: string) => Promise<void>;
  isLoading: boolean;
}

const ApolloContactsEnrichmentPanel = ({ 
  apolloCompanies, 
  onEnrichContacts, 
  isLoading 
}: ApolloContactsEnrichmentPanelProps) => {
  const [selectedCompany, setSelectedCompany] = React.useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Enriquecer Contactos por Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <select 
            className="flex-1 px-3 py-2 border rounded-md"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">Seleccionar empresa...</option>
            {apolloCompanies.map(company => (
              <option key={company.id} value={company.company_domain}>
                {company.company_name} ({company.company_domain})
              </option>
            ))}
          </select>
          <Button 
            onClick={() => selectedCompany && onEnrichContacts(selectedCompany)}
            disabled={isLoading || !selectedCompany}
          >
            {isLoading ? 'Enriqueciendo...' : 'Enriquecer Contactos'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Busca automáticamente decision makers y contactos clave en la empresa seleccionada.
        </p>
      </CardContent>
    </Card>
  );
};

export default ApolloContactsEnrichmentPanel;
