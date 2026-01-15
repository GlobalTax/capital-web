import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Users,
  Euro,
  Target,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import { CompanyFormDialog } from '@/components/admin/companies/CompanyFormDialog';
import { formatCompactCurrency } from '@/shared/utils/format';

export default function EmpresasPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  const { 
    empresas, 
    isLoading, 
    sectors, 
    refetch,
    deleteEmpresa 
  } = useEmpresas({
    search: searchQuery,
    sector: sectorFilter !== 'all' ? sectorFilter : undefined,
    esTarget: targetFilter === 'target' ? true : targetFilter === 'no-target' ? false : undefined,
  });

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsFormOpen(true);
  };

  const handleDelete = async (empresa: Empresa) => {
    if (confirm(`¿Eliminar la empresa "${empresa.nombre}"? Esta acción no se puede deshacer.`)) {
      await deleteEmpresa(empresa.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingEmpresa(null);
    refetch();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmpresa(null);
  };

  const calculateMargin = (empresa: Empresa) => {
    if (!empresa.ebitda || !empresa.facturacion) return null;
    return ((empresa.ebitda / empresa.facturacion) * 100).toFixed(1);
  };

  // Stats
  const totalEmpresas = empresas.length;
  const targetEmpresas = empresas.filter(e => e.es_target).length;
  const totalFacturacion = empresas.reduce((sum, e) => sum + (e.facturacion || 0), 0);
  const avgEbitda = empresas.length > 0 
    ? empresas.reduce((sum, e) => sum + (e.ebitda || 0), 0) / empresas.filter(e => e.ebitda).length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Empresas
          </h1>
          <p className="text-sm text-muted-foreground">
            Base de datos de empresas con datos financieros
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Empresas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalEmpresas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Targets</span>
            </div>
            <p className="text-2xl font-bold mt-1">{targetEmpresas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Facturación Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCompactCurrency(totalFacturacion)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">EBITDA Medio</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {avgEbitda > 0 ? formatCompactCurrency(avgEbitda) : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o CIF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="target">Solo Targets</SelectItem>
                <SelectItem value="no-target">No Targets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : empresas.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No se encontraron empresas</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primera empresa
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Facturación</TableHead>
                    <TableHead className="text-right">EBITDA</TableHead>
                    <TableHead className="text-right">Margen</TableHead>
                    <TableHead className="text-center">Empleados</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{empresa.nombre}</div>
                          {empresa.cif && (
                            <div className="text-xs text-muted-foreground">
                              CIF: {empresa.cif}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit">
                            {empresa.sector}
                          </Badge>
                          {empresa.subsector && (
                            <span className="text-xs text-muted-foreground">
                              {empresa.subsector}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {empresa.ubicacion || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {empresa.facturacion 
                          ? formatCompactCurrency(empresa.facturacion) 
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {empresa.ebitda 
                          ? formatCompactCurrency(empresa.ebitda) 
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {calculateMargin(empresa) 
                          ? `${calculateMargin(empresa)}%` 
                          : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {empresa.empleados ?? '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {empresa.es_target && (
                            <Badge className="bg-green-100 text-green-800">
                              Target
                            </Badge>
                          )}
                          {empresa.potencial_search_fund && (
                            <Badge className="bg-purple-100 text-purple-800">
                              SF
                            </Badge>
                          )}
                          {!empresa.es_target && !empresa.potencial_search_fund && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {empresa.sitio_web && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(
                                empresa.sitio_web?.startsWith('http') 
                                  ? empresa.sitio_web 
                                  : `https://${empresa.sitio_web}`,
                                '_blank'
                              )}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(empresa)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(empresa)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CompanyFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
        empresa={editingEmpresa}
      />
    </div>
  );
}
