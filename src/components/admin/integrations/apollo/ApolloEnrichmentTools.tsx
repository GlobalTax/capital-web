
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';

interface ApolloEnrichmentToolsProps {
  onEnrichCompany: (domain: string) => Promise<void>;
  isLoading: boolean;
}

const ApolloEnrichmentTools = ({ onEnrichCompany, isLoading }: ApolloEnrichmentToolsProps) => {
  const [enrichmentDomain, setEnrichmentDomain] = useState('');

  const handleEnrichment = async () => {
    if (enrichmentDomain.trim()) {
      await onEnrichCompany(enrichmentDomain.trim());
      setEnrichmentDomain('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Enriquecer Nueva Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Introduce dominio (ej: empresa.com)"
            value={enrichmentDomain}
            onChange={(e) => setEnrichmentDomain(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleEnrichment}
            disabled={isLoading || !enrichmentDomain.trim()}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Enriquecer'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Apollo enriquecerá automáticamente los datos de la empresa incluyendo tamaño, industria, tecnologías y más.
        </p>
      </CardContent>
    </Card>
  );
};

export default ApolloEnrichmentTools;
