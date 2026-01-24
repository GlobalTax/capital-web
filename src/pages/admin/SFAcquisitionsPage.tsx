// ============= SF ACQUISITIONS PAGE =============
// Listado completo de operaciones de Search Funds

import React, { useState, useMemo } from 'react';
import { Download, Search, Building2, TrendingUp, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { SFAcquisitionsTable } from '@/components/admin/search-funds/SFAcquisitionsTable';
import { 
  useSFAcquisitionsWithFunds, 
  useSFAcquisitionsStats,
  useSFAcquisitionsSectors,
  useSFAcquisitionsYears 
} from '@/hooks/useSFAcquisitionsWithFunds';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const SFAcquisitionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Data queries
  const { data: stats, isLoading: loadingStats } = useSFAcquisitionsStats();
  const { data: sectors } = useSFAcquisitionsSectors();
  const { data: years } = useSFAcquisitionsYears();
  const { data: acquisitions, isLoading: loadingAcquisitions } = useSFAcquisitionsWithFunds({
    search: search || undefined,
    year: yearFilter !== 'all' ? parseInt(yearFilter) : undefined,
    sector: sectorFilter !== 'all' ? sectorFilter : undefined,
    status: statusFilter !== 'all' ? (statusFilter as 'owned' | 'exited' | 'unknown') : undefined,
  });

  // Filtered count
  const filteredCount = acquisitions?.length || 0;
  const hasFilters = search || yearFilter !== 'all' || sectorFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setYearFilter('all');
    setSectorFilter('all');
    setStatusFilter('all');
  };

  // Export to Excel
  const handleExport = () => {
    if (!acquisitions || acquisitions.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const exportData = acquisitions.map(a => ({
      'Año': a.deal_year || '',
      'Empresa': a.company_name,
      'Sector': a.sector || '',
      'CNAE': a.cnae || '',
      'Fondo': a.fund?.name || a.fund_name || '',
      'País': a.country || '',
      'Región': a.region || '',
      'Estado': a.status === 'owned' ? 'En cartera' : a.status === 'exited' ? 'Exit' : a.status || 'Desconocido',
      'Tipo Operación': a.deal_type || '',
      'Año Exit': a.exit_year || '',
      'Web': a.website || '',
      'Fuente': a.source_url || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Adquisiciones SF');
    
    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 6 },  // Año
      { wch: 30 }, // Empresa
      { wch: 20 }, // Sector
      { wch: 10 }, // CNAE
      { wch: 25 }, // Fondo
      { wch: 12 }, // País
      { wch: 15 }, // Región
      { wch: 12 }, // Estado
      { wch: 15 }, // Tipo Operación
      { wch: 8 },  // Año Exit
      { wch: 35 }, // Web
      { wch: 35 }, // Fuente
    ];

    XLSX.writeFile(wb, `adquisiciones-search-funds-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel exportado correctamente');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-normal tracking-tight">Operaciones Search Funds</h1>
          <p className="text-sm text-muted-foreground">
            {hasFilters ? `${filteredCount} de ${stats?.total || 0}` : `${stats?.total || 0}`} adquisiciones registradas
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={loadingAcquisitions || !acquisitions?.length}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{loadingStats ? '-' : stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total operaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{loadingStats ? '-' : stats?.thisYear || 0}</p>
                <p className="text-xs text-muted-foreground">Este año ({new Date().getFullYear()})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{loadingStats ? '-' : stats?.owned || 0}</p>
                <p className="text-xs text-muted-foreground">En cartera</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ArrowRightLeft className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{loadingStats ? '-' : stats?.exited || 0}</p>
                <p className="text-xs text-muted-foreground">Exits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa, sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los años</SelectItem>
            {years?.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores</SelectItem>
            {sectors?.map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="owned">En cartera</SelectItem>
            <SelectItem value="exited">Exit</SelectItem>
            <SelectItem value="unknown">Desconocido</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <SFAcquisitionsTable 
        acquisitions={acquisitions || []}
        isLoading={loadingAcquisitions}
      />
    </div>
  );
};

export default SFAcquisitionsPage;
