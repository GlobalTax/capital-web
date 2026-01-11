// ============= SF DIRECTORY PAGE =============
// Directorio de Search Funds

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, MapPin, TrendingUp, Users, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSFFunds, useDeleteSFFund } from '@/hooks/useSFFunds';
import { Skeleton } from '@/components/ui/skeleton';
import { SFStatus } from '@/types/searchFunds';

const statusColors: Record<SFStatus, string> = {
  searching: 'bg-blue-100 text-blue-800',
  acquired: 'bg-green-100 text-green-800',
  holding: 'bg-yellow-100 text-yellow-800',
  exited: 'bg-purple-100 text-purple-800',
  inactive: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<SFStatus, string> = {
  searching: 'Buscando',
  acquired: 'Adquirido',
  holding: 'En cartera',
  exited: 'Salido',
  inactive: 'Inactivo',
};

export const SFDirectoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SFStatus | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const { data: funds, isLoading } = useSFFunds({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    country_base: countryFilter !== 'all' ? countryFilter : undefined,
  });

  const deleteMutation = useDeleteSFFund();

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Extract unique countries from funds
  const countries = React.useMemo(() => {
    if (!funds) return [];
    const unique = [...new Set(funds.map(f => f.country_base).filter(Boolean))];
    return unique.sort();
  }, [funds]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Directorio Search Funds</h1>
          <p className="text-muted-foreground">
            Gestiona y explora el directorio de Search Funds
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/sf-directory/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Fund
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funds</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funds?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buscando</CardTitle>
            <Search className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funds?.filter(f => f.status === 'searching').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adquiridos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funds?.filter(f => f.status === 'acquired').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Países</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, thesis, sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SFStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="searching">Buscando</SelectItem>
                <SelectItem value="acquired">Adquirido</SelectItem>
                <SelectItem value="holding">En cartera</SelectItem>
                <SelectItem value="exited">Salido</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los países</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country!}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Sectores</TableHead>
                  <TableHead>EBITDA Target</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron Search Funds
                    </TableCell>
                  </TableRow>
                ) : (
                  funds?.map((fund) => (
                    <TableRow key={fund.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fund.name}</div>
                          {fund.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {fund.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {fund.country_base || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {fund.sector_focus?.slice(0, 2).map((sector, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                          {(fund.sector_focus?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(fund.sector_focus?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {fund.ebitda_min || fund.ebitda_max ? (
                            <>
                              {formatCurrency(fund.ebitda_min)} - {formatCurrency(fund.ebitda_max)}
                            </>
                          ) : (
                            '-'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[fund.status] || 'bg-gray-100'}>
                          {statusLabels[fund.status] || fund.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/sf-directory/${fund.id}`}>
                                Ver detalle
                              </Link>
                            </DropdownMenuItem>
                            {fund.website && (
                              <DropdownMenuItem asChild>
                                <a href={fund.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Sitio web
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('¿Eliminar este Search Fund?')) {
                                  deleteMutation.mutate(fund.id);
                                }
                              }}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SFDirectoryPage;
