
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useMarketingIntelligence } from '@/hooks/useMarketingIntelligence';
import { CompanyData } from '@/utils/analytics/AnalyticsManager';
import { 
  Building2, 
  Eye, 
  Download, 
  Search, 
  Filter,
  Clock,
  Globe,
  Users,
  BarChart3,
  Mail,
  Phone
} from 'lucide-react';

interface CompanyVisit {
  companyName: string;
  industry: string;
  size: string;
  location: string;
  pagesVisited: string[];
  timeOnSite: number;
  leadScore: number;
  lastVisit: Date;
  domain: string;
  visitCount: number;
  engagementScore: number;
}

interface CompanyIntelligenceProps {
  limit?: number;
  showFilters?: boolean;
}

const CompanyIntelligence = ({ limit, showFilters = true }: CompanyIntelligenceProps) => {
  const { companies, isLoading, enrichCompanyData } = useMarketingIntelligence();
  const [companyVisits, setCompanyVisits] = useState<CompanyVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<CompanyVisit[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyVisit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  // Adapter: Convert CompanyData to CompanyVisit
  const adaptCompanyData = (company: CompanyData): CompanyVisit => ({
    companyName: company.name,
    industry: company.industry || 'Desconocido',
    size: company.size || 'No especificado',
    location: company.location || 'No especificado',
    pagesVisited: company.pagesVisited || [],
    timeOnSite: company.timeOnSite || 0,
    leadScore: company.engagementScore || 0,
    lastVisit: new Date(company.lastVisit),
    domain: company.domain,
    visitCount: company.visitCount || 1,
    engagementScore: company.engagementScore || 0
  });

  useEffect(() => {
    if (companies.length > 0) {
      const adaptedData = companies.map(adaptCompanyData);
      const sortedData = adaptedData.sort((a, b) => b.leadScore - a.leadScore);
      const limitedData = limit ? sortedData.slice(0, limit) : sortedData;
      setCompanyVisits(limitedData);
    }
  }, [companies, limit]);

  useEffect(() => {
    let filtered = companyVisits;

    if (searchTerm) {
      filtered = filtered.filter(visit => 
        visit.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(visit => visit.industry === industryFilter);
    }

    if (scoreFilter !== 'all') {
      if (scoreFilter === 'high') {
        filtered = filtered.filter(visit => visit.leadScore >= 80);
      } else if (scoreFilter === 'medium') {
        filtered = filtered.filter(visit => visit.leadScore >= 50 && visit.leadScore < 80);
      } else if (scoreFilter === 'low') {
        filtered = filtered.filter(visit => visit.leadScore < 50);
      }
    }

    setFilteredVisits(filtered);
  }, [companyVisits, searchTerm, industryFilter, scoreFilter]);

  const handleEnrichCompany = async (domain: string) => {
    try {
      await enrichCompanyData(domain);
    } catch (error) {
      console.error('Error enriching company data:', error);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredVisits, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'company-intelligence.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getIndustries = () => {
    const industries = [...new Set(companyVisits.map(visit => visit.industry))];
    return industries.filter(industry => industry !== 'Desconocido');
  };

  const getLeadScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 50) return 'secondary';
    return 'outline';
  };

  const formatTimeOnSite = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresas Interesadas
          </CardTitle>
          <CardDescription>
            Empresas que han visitado tu web en las últimas 48h
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-gray-600">Cargando empresas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresas Interesadas
            </CardTitle>
            <CardDescription>
              {filteredVisits.length} empresas han visitado tu web recientemente
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar empresa o sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {getIndustries().map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="high">Alto (80+)</SelectItem>
                <SelectItem value="medium">Medio (50-79)</SelectItem>
                <SelectItem value="low">Bajo (&lt;50)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {filteredVisits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron empresas con los filtros aplicados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Páginas</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map(visit => (
                <TableRow key={visit.domain}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{visit.companyName}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {visit.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{visit.industry}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-gray-400" />
                      {visit.pagesVisited.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {formatTimeOnSite(visit.timeOnSite)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getLeadScoreBadgeVariant(visit.leadScore)}>
                      {visit.leadScore}/100
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedCompany(visit)}
                        >
                          Ver Detalle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {selectedCompany?.companyName}
                          </DialogTitle>
                          <DialogDescription>
                            Información detallada de la empresa
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedCompany && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                <div className="text-sm text-gray-600">Lead Score</div>
                                <div className="text-lg font-bold">{selectedCompany.leadScore}/100</div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Eye className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                <div className="text-sm text-gray-600">Páginas Vistas</div>
                                <div className="text-lg font-bold">{selectedCompany.pagesVisited.length}</div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                <div className="text-sm text-gray-600">Tiempo Total</div>
                                <div className="text-lg font-bold">{formatTimeOnSite(selectedCompany.timeOnSite)}</div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                <div className="text-sm text-gray-600">Visitas</div>
                                <div className="text-lg font-bold">{selectedCompany.visitCount}</div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Información de la Empresa</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Sector:</span>
                                  <span className="ml-2 font-medium">{selectedCompany.industry}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Tamaño:</span>
                                  <span className="ml-2 font-medium">{selectedCompany.size}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Ubicación:</span>
                                  <span className="ml-2 font-medium">{selectedCompany.location}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Última visita:</span>
                                  <span className="ml-2 font-medium">
                                    {selectedCompany.lastVisit.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {selectedCompany.pagesVisited.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Páginas Visitadas</h4>
                                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                  <ul className="space-y-1 text-sm">
                                    {selectedCompany.pagesVisited.map((page, index) => (
                                      <li key={index} className="text-gray-700">
                                        • {page}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t">
                              <Button 
                                className="flex-1"
                                onClick={() => handleEnrichCompany(selectedCompany.domain)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Contactar
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => handleEnrichCompany(selectedCompany.domain)}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Llamar
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyIntelligence;
