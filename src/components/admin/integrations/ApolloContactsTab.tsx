
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  Phone, 
  Linkedin,
  Crown,
  Search,
  UserCheck,
  Building2,
  Target
} from 'lucide-react';
import { ApolloContact, ApolloCompany } from '@/types/integrations';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  const filteredContacts = apolloContacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company_domain?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = !selectedCompany || contact.company_domain === selectedCompany;
    
    return matchesSearch && matchesCompany;
  });

  const decisionMakers = apolloContacts.filter(c => c.is_decision_maker);
  const totalContacts = apolloContacts.length;
  const avgContactScore = totalContacts > 0 
    ? apolloContacts.reduce((sum, c) => sum + c.contact_score, 0) / totalContacts 
    : 0;

  const getSeniorityColor = (seniority?: string) => {
    if (!seniority) return 'bg-gray-100 text-gray-800';
    switch (seniority.toLowerCase()) {
      case 'c_suite':
      case 'founder':
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'vp':
      case 'director':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-green-100 text-green-800';
      case 'manager':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContactScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-semibold';
    if (score >= 60) return 'text-blue-600 font-medium';
    if (score >= 40) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">Contactos enriquecidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Makers</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisionMakers.length}</div>
            <p className="text-xs text-muted-foreground">Altos cargos identificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgContactScore)}</div>
            <p className="text-xs text-muted-foreground">Calidad de contactos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(apolloContacts.map(c => c.company_domain)).size}
            </div>
            <p className="text-xs text-muted-foreground">Con contactos enriquecidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrich Actions */}
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

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Contactos Apollo ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
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

          {/* Contacts List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{contact.full_name}</h3>
                      {contact.is_decision_maker && (
                        <Crown className="h-4 w-4 text-purple-600" title="Decision Maker" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.title}</p>
                    <p className="text-xs text-muted-foreground">{contact.company_domain}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`text-sm ${getContactScoreColor(contact.contact_score)}`}>
                      Score: {contact.contact_score}
                    </div>
                    {contact.seniority && (
                      <Badge className={getSeniorityColor(contact.seniority)}>
                        {contact.seniority.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-blue-600 hover:underline truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  
                  {contact.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}

                  {contact.department && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.department}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Enriquecido: {new Date(contact.last_enriched).toLocaleDateString('es-ES')}
                </div>
              </div>
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
    </div>
  );
};

export default ApolloContactsTab;
