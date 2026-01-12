// ============= SF PORTFOLIO LIST PAGE =============
// Listado centralizado de empresas de Search Funds

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  ExternalLink, 
  Download,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { useSFPortfolioList, useSFPortfolioFilterOptions, SFPortfolioListFilters } from '@/hooks/useSFPortfolioList';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  portfolio: { label: 'En cartera', variant: 'default' },
  exited: { label: 'Desinvertida', variant: 'secondary' },
  unknown: { label: 'Desconocido', variant: 'outline' }
};

const DEAL_TYPE_LABELS: Record<string, string> = {
  majority: 'Mayoría',
  minority: 'Minoría',
  merger: 'Fusión',
  asset: 'Activos'
};

const SFPortfolioListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SFPortfolioListFilters>({});
  const [searchInput, setSearchInput] = useState('');

  const { data: portfolio, isLoading } = useSFPortfolioList(filters);
  const { data: filterOptions } = useSFPortfolioFilterOptions();

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  const handleExport = () => {
    if (!portfolio?.length) return;
    
    const csvContent = [
      ['Empresa', 'Search Fund', 'Sector', 'País', 'Año', 'Tipo', 'Estado', 'Website'].join(','),
      ...portfolio.map(p => [
        `"${p.company_name}"`,
        `"${p.fund_name || ''}"`,
        `"${p.sector || ''}"`,
        `"${p.country || ''}"`,
        p.acquisition_year || '',
        DEAL_TYPE_LABELS[p.deal_type || ''] || p.deal_type || '',
        STATUS_LABELS[p.status || '']?.label || p.status || '',
        p.website || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio-sf-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Portfolio Search Funds
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {portfolio?.length || 0} empresas adquiridas por Search Funds
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!portfolio?.length}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/sf-directory')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select
              value={filters.fundId || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, fundId: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Search Fund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los fondos</SelectItem>
                {filterOptions?.funds.map((fund) => (
                  <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="portfolio">En cartera</SelectItem>
                <SelectItem value="exited">Desinvertida</SelectItem>
                <SelectItem value="unknown">Desconocido</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sector || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, sector: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filterOptions?.sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.country || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, country: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filterOptions?.countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Search Fund</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]">Web</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : portfolio?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron empresas
                    </TableCell>
                  </TableRow>
                ) : (
                  portfolio?.map((company) => (
                    <TableRow 
                      key={company.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/sf-acquisitions/${company.id}`)}
                    >
                      <TableCell className="font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[200px] block">
                                {company.company_name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.company_name}</p>
                              {company.description && (
                                <p className="text-xs text-muted-foreground max-w-[300px]">
                                  {company.description}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <span 
                          className="text-primary hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (company.fund_id) navigate(`/admin/sf-directory/${company.fund_id}`);
                          }}
                        >
                          {company.fund_name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.sector || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.country || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.acquisition_year || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.deal_type ? DEAL_TYPE_LABELS[company.deal_type] || company.deal_type : '-'}
                      </TableCell>
                      <TableCell>
                        {company.status && STATUS_LABELS[company.status] ? (
                          <Badge variant={STATUS_LABELS[company.status].variant}>
                            {STATUS_LABELS[company.status].label}
                          </Badge>
                        ) : (
                          <Badge variant="outline">-</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.website && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(company.website!, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SFPortfolioListPage;
