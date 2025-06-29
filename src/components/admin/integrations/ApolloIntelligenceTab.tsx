
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar,
  Target,
  RefreshCw,
  Search,
  TrendingUp
} from 'lucide-react';
import { ApolloCompany } from '@/types/integrations';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [enrichmentDomain, setEnrichmentDomain] = useState('');

  const filteredCompanies = apolloCompanies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.company_domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrichment = async () => {
    if (enrichmentDomain.trim()) {
      await onEnrichCompany(enrichmentDomain.trim());
      setEnrichmentDomain('');
    }
  };

  const getEmployeeRangeColor = (count?: number) => {
    if (!count) return 'bg-gray-100 text-gray-800';
    if (count < 50) return 'bg-blue-100 text-blue-800';
    if (count < 200) return 'bg-green-100 text-green-800';
    if (count < 1000) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const targetAccountsCount = apolloCompanies.filter(c => c.is_target_account).length;
  const avgEmployeeCount = apolloCompanies
    .filter(c => c.employee_count)
    .reduce((acc, c) => acc + (c.employee_count || 0), 0) / 
    apolloCompanies.filter(c => c.employee_count).length || 0;

  return (
    <div className="space-y-6">
      {/* Apollo Intelligence KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enriquecidas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apolloCompanies.length}</div>
            <p className="text-xs text-muted-foreground">Empresas con datos Apollo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Accounts</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{targetAccountsCount}</div>
            <p className="text-xs text-muted-foreground">Empresas objetivo identificadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Empleados</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgEmployeeCount) || 0}</div>
            <p className="text-xs text-muted-foreground">Tamaño promedio empresa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industrias</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(apolloCompanies.map(c => c.industry).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">Sectores identificados</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrichment Tools */}
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

      {/* Search and Filter */}
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

          {/* Companies List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{company.company_name}</h3>
                      {company.is_target_account && (
                        <Badge className="bg-green-100 text-green-800">Target Account</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{company.company_domain}</p>
                  </div>
                  <Badge variant="outline">
                    {new Date(company.last_enriched).toLocaleDateString('es-ES')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {company.industry && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{company.industry}</span>
                    </div>
                  )}
                  
                  {company.employee_count && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getEmployeeRangeColor(company.employee_count)}>
                        {company.employee_count} empleados
                      </Badge>
                    </div>
                  )}
                  
                  {company.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  
                  {company.founded_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Fundada en {company.founded_year}</span>
                    </div>
                  )}
                </div>

                {company.technologies && company.technologies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tecnologías:</p>
                    <div className="flex flex-wrap gap-1">
                      {company.technologies.slice(0, 6).map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {company.technologies.length > 6 && (
                        <Badge variant="secondary" className="text-xs">
                          +{company.technologies.length - 6} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {company.revenue_range && (
                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <span className="font-medium">Rango de ingresos:</span> {company.revenue_range}
                    </p>
                  </div>
                )}
              </div>
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
    </div>
  );
};

export default ApolloIntelligenceTab;
