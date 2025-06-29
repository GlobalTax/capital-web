
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMarketingIntelligence } from '@/hooks/useMarketingIntelligence';
import { Building2, Download } from 'lucide-react';
import { 
  CompanyVisit, 
  CompanyIntelligenceProps, 
  adaptCompanyData 
} from './types/CompanyIntelligenceTypes';
import CompanyIntelligenceFilters from './components/CompanyIntelligenceFilters';
import CompanyIntelligenceTable from './components/CompanyIntelligenceTable';
import CompanyDetailsModal from './components/CompanyDetailsModal';

const CompanyIntelligence = ({ limit, showFilters = true }: CompanyIntelligenceProps) => {
  const { companies, isLoading, enrichCompanyData } = useMarketingIntelligence();
  const [companyVisits, setCompanyVisits] = useState<CompanyVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<CompanyVisit[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyVisit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

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

  const handleViewDetails = (visit: CompanyVisit) => {
    setSelectedCompany(visit);
    setIsModalOpen(true);
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
    <>
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
            <CompanyIntelligenceFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              industryFilter={industryFilter}
              setIndustryFilter={setIndustryFilter}
              scoreFilter={scoreFilter}
              setScoreFilter={setScoreFilter}
              industries={getIndustries()}
            />
          )}

          {filteredVisits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron empresas con los filtros aplicados</p>
            </div>
          ) : (
            <CompanyIntelligenceTable
              visits={filteredVisits}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      <CompanyDetailsModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnrichCompany={handleEnrichCompany}
      />
    </>
  );
};

export default CompanyIntelligence;
