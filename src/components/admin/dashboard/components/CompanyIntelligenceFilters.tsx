
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface CompanyIntelligenceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  industryFilter: string;
  setIndustryFilter: (industry: string) => void;
  scoreFilter: string;
  setScoreFilter: (score: string) => void;
  industries: string[];
}

const CompanyIntelligenceFilters = ({
  searchTerm,
  setSearchTerm,
  industryFilter,
  setIndustryFilter,
  scoreFilter,
  setScoreFilter,
  industries
}: CompanyIntelligenceFiltersProps) => {
  return (
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
          {industries.map(industry => (
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
  );
};

export default CompanyIntelligenceFilters;
