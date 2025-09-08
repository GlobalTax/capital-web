import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { VirtualizedTable } from '@/components/shared/VirtualizedTable';
import { formatDate, formatCurrency } from '@/shared/utils/format';
import { Loader2, Plus, Pencil, Download, Building2, TrendingUp, BarChart3, Target, Search, Filter, Eye, Calendar, Hash } from 'lucide-react';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  description: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  valuation_amount?: number;
  valuation_currency: string;
  year: number;
  is_active: boolean;
  is_featured: boolean;
  display_locations: string[];
  company_size_employees?: string;
  short_description?: string;
  deal_type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const AdminOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dealTypeFilter, setDealTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('company_operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Error fetching operations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las operaciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate opportunity number based on creation date
  const generateOpportunityNumber = (createdAt: string, index: number): string => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const paddedIndex = String(index + 1).padStart(3, '0');
    return `OP-${year}-${paddedIndex}`;
  };

  // Filter operations based on search and filters
  const filteredOperations = useMemo(() => {
    return operations.filter(operation => {
      const matchesSearch = !searchTerm || 
        operation.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || operation.status === statusFilter;
      const matchesDealType = dealTypeFilter === 'all' || operation.deal_type === dealTypeFilter;
      
      return matchesSearch && matchesStatus && matchesDealType;
    });
  }, [operations, searchTerm, statusFilter, dealTypeFilter]);

  // Statistics calculations
  const stats = useMemo(() => {
    const active = operations.filter(op => op.is_active).length;
    const thisYear = operations.filter(op => op.year === new Date().getFullYear()).length;
    const withRevenue = operations.filter(op => op.revenue_amount && op.revenue_amount > 0).length;
    const withEbitda = operations.filter(op => op.ebitda_amount && op.ebitda_amount > 0).length;
    
    return { active, thisYear, withRevenue, withEbitda };
  }, [operations]);

  const extractFinancialData = async () => {
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-financial-data');
      
      if (error) throw error;
      
      toast({
        title: 'Éxito',
        description: `Se extrajeron los datos financieros de ${data.updatedCount} operaciones`,
      });
      
      // Refresh the operations
      await fetchOperations();
    } catch (error) {
      console.error('Error extracting financial data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron extraer los datos financieros',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const saveOperation = async () => {
    if (!editingOperation) return;

    // Validation
    if (!editingOperation.company_name?.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre de la empresa es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    if (!editingOperation.sector?.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El sector es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    if (!editingOperation.description?.trim()) {
      toast({
        title: 'Error de validación',
        description: 'La descripción es obligatoria',
        variant: 'destructive',
      });
      return;
    }

    if (!editingOperation.year || editingOperation.year < 1900 || editingOperation.year > new Date().getFullYear() + 5) {
      toast({
        title: 'Error de validación',
        description: 'El año debe ser válido',
        variant: 'destructive',
      });
      return;
    }


    setIsSaving(true);
    try {
      const operationData = {
        company_name: editingOperation.company_name.trim(),
        sector: editingOperation.sector.trim(),
        description: editingOperation.description.trim(),
        revenue_amount: editingOperation.revenue_amount || null,
        valuation_amount: editingOperation.valuation_amount || null,
        
        valuation_currency: editingOperation.valuation_currency || '€',
        year: editingOperation.year,
        is_active: editingOperation.is_active ?? true,
        is_featured: editingOperation.is_featured ?? false,
        display_locations: editingOperation.display_locations || ['home', 'operaciones'],
        company_size_employees: editingOperation.company_size_employees || null,
        short_description: editingOperation.short_description?.trim() || null,
        deal_type: editingOperation.deal_type || 'sale',
        status: editingOperation.status || 'available',
      };

      let result;
      if (editingOperation.id) {
        // Update existing
        result = await supabase
          .from('company_operations')
          .update(operationData)
          .eq('id', editingOperation.id);
      } else {
        // Create new
        result = await supabase
          .from('company_operations')
          .insert(operationData);
      }

      if (result.error) throw result.error;

      toast({
        title: 'Éxito',
        description: editingOperation.id ? 'Operación actualizada correctamente' : 'Operación creada correctamente',
      });

      setEditingOperation(null);
      await fetchOperations();
    } catch (error) {
      console.error('Error saving operation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la operación',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'under_negotiation': return 'secondary';
      case 'sold': return 'success';
      case 'withdrawn': return 'destructive';
      default: return 'outline';
    }
  };

  // Get status display text
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'under_negotiation': return 'En Negociación';
      case 'sold': return 'Vendida';
      case 'withdrawn': return 'Retirada';
      default: return 'Sin Estado';
    }
  };

  // Get deal type display text
  const getDealTypeText = (dealType?: string) => {
    switch (dealType) {
      case 'sale': return 'Venta';
      case 'acquisition': return 'Adquisición';
      case 'merger': return 'Fusión';
      case 'restructuring': return 'Reestructuración';
      default: return 'No Definido';
    }
  };

  // Table columns configuration
  const tableColumns = [
    {
      key: 'opportunity_number',
      title: 'Nº Oportunidad',
      width: 120,
      render: (operation: Operation, index: number) => (
        <div className="flex items-center gap-2">
          <Hash className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-sm font-medium">
            {generateOpportunityNumber(operation.created_at || '', index)}
          </span>
        </div>
      ),
    },
    {
      key: 'company_info',
      title: 'Empresa',
      width: 250,
      render: (operation: Operation) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">{operation.company_name}</div>
          <div className="text-sm text-muted-foreground">{operation.sector}</div>
          {operation.company_size_employees && (
            <Badge variant="outline" className="text-xs">
              {operation.company_size_employees}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'financial_info',
      title: 'Información Financiera',
      width: 200,
      render: (operation: Operation) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-muted-foreground">Facturación:</span>{' '}
            <span className="font-medium text-green-600 dark:text-green-400">
              {operation.revenue_amount ? formatCurrency(operation.revenue_amount) : 'N/D'}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">EBITDA:</span>{' '}
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {operation.ebitda_amount ? formatCurrency(operation.ebitda_amount) : 'N/D'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'status_info',
      title: 'Estado y Tipo',
      width: 150,
      render: (operation: Operation) => (
        <div className="space-y-2">
          <Badge variant={getStatusBadgeVariant(operation.status)}>
            {getStatusText(operation.status)}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {getDealTypeText(operation.deal_type)}
          </div>
        </div>
      ),
    },
    {
      key: 'date_info',
      title: 'Fechas',
      width: 120,
      render: (operation: Operation) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Alta:</span>
          </div>
          <div className="text-sm font-medium">
            {operation.created_at ? formatDate(operation.created_at) : 'N/D'}
          </div>
          <div className="text-xs text-muted-foreground">
            Año: {operation.year}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Acciones',
      width: 100,  
      render: (operation: Operation) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingOperation(operation)}
            className="h-8 w-8 p-0"
            title="Editar"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* TODO: Add preview functionality */}}
            className="h-8 w-8 p-0"
            title="Vista previa"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Gestión de Operaciones</h1>
          <p className="text-muted-foreground mt-2">
            Administra y supervisa todas las operaciones de M&A, inversiones y transacciones corporativas
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={extractFinancialData}
            disabled={isExtracting}
            variant="outline"
            className="bg-card hover:bg-accent"
          >
            {isExtracting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Extraer Datos Financieros
          </Button>
          <Button 
            onClick={() => setEditingOperation({
              company_name: '',
              sector: '',
              description: '',
              
              valuation_currency: '€',
              year: new Date().getFullYear(),
              is_active: true,
              is_featured: false,
              display_locations: ['home', 'operaciones'],
              deal_type: 'sale',
              status: 'available'
            } as Operation)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Operación
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Operaciones</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{operations.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Activas</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {stats.active}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Este Año</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.thisYear}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Con Datos Financieros</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.withRevenue}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa, sector o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {(statusFilter !== 'all' || dealTypeFilter !== 'all') && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {(statusFilter !== 'all' ? 1 : 0) + (dealTypeFilter !== 'all' ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
          
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t">
              <div className="flex-1">
                <Label htmlFor="status-filter" className="text-sm font-medium">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="under_negotiation">En Negociación</SelectItem>
                    <SelectItem value="sold">Vendida</SelectItem>
                    <SelectItem value="withdrawn">Retirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="deal-type-filter" className="text-sm font-medium">Tipo de Operación</Label>
                <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
                  <SelectTrigger id="deal-type-filter">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="sale">Venta</SelectItem>
                    <SelectItem value="acquisition">Adquisición</SelectItem>
                    <SelectItem value="merger">Fusión</SelectItem>
                    <SelectItem value="restructuring">Reestructuración</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Operations Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-card/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Operaciones Registradas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona el portafolio completo de transacciones y oportunidades de inversión
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredOperations.length} de {operations.length} operaciones
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {operations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No hay operaciones registradas</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Comienza añadiendo tu primera operación para construir el portafolio de transacciones.
              </p>
            </div>
          ) : filteredOperations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No se encontraron operaciones</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Intenta ajustar los filtros de búsqueda para encontrar las operaciones que necesitas.
              </p>
            </div>
          ) : (
            <VirtualizedTable
              data={filteredOperations}
              columns={tableColumns}
              itemHeight={80}
              height={Math.min(600, filteredOperations.length * 80 + 50)}
              className="border-none"
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingOperation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingOperation.id ? 'Editar Operación' : 'Nueva Operación'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Operation Info - Show for existing operations */}
              {editingOperation.id && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold">Información de la Oportunidad</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Número de Oportunidad</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium">
                          {generateOpportunityNumber(
                            editingOperation.created_at || new Date().toISOString(), 
                            operations.findIndex(op => op.id === editingOperation.id)
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de Alta</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {editingOperation.created_at ? formatDate(editingOperation.created_at) : 'N/D'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nombre de la empresa *</Label>
                    <Input
                      id="company_name"
                      value={editingOperation.company_name || ''}
                      onChange={(e) => setEditingOperation({
                        ...editingOperation,
                        company_name: e.target.value
                      })}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector *</Label>
                    <Input
                      id="sector"
                      value={editingOperation.sector || ''}
                      onChange={(e) => setEditingOperation({
                        ...editingOperation,
                        sector: e.target.value
                      })}
                      placeholder="Ej: Tecnología, Retail, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="year">Año *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      value={editingOperation.year || ''}
                      onChange={(e) => setEditingOperation({
                        ...editingOperation,
                        year: parseInt(e.target.value) || new Date().getFullYear()
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deal_type">Tipo de Operación</Label>
                    <Select
                      value={editingOperation.deal_type || 'sale'}
                      onValueChange={(value) => setEditingOperation({
                        ...editingOperation,
                        deal_type: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Venta</SelectItem>
                        <SelectItem value="acquisition">Adquisición</SelectItem>
                        <SelectItem value="merger">Fusión</SelectItem>
                        <SelectItem value="restructuring">Reestructuración</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={editingOperation.status || 'available'}
                      onValueChange={(value) => setEditingOperation({
                        ...editingOperation,
                        status: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="under_negotiation">En Negociación</SelectItem>
                        <SelectItem value="sold">Vendida</SelectItem>
                        <SelectItem value="withdrawn">Retirada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="company_size_employees">Tamaño de la Empresa</Label>
                  <Select
                    value={editingOperation.company_size_employees || ''}
                    onValueChange={(value) => setEditingOperation({
                      ...editingOperation,
                      company_size_employees: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 empleados</SelectItem>
                      <SelectItem value="11-50">11-50 empleados</SelectItem>
                      <SelectItem value="51-200">51-200 empleados</SelectItem>
                      <SelectItem value="201-500">201-500 empleados</SelectItem>
                      <SelectItem value="500+">500+ empleados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Financiera</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revenue_amount">Facturación (€)</Label>
                    <Input
                      id="revenue_amount"
                      type="number"
                      min="0"
                      value={editingOperation.revenue_amount || ''}
                      onChange={(e) => setEditingOperation({
                        ...editingOperation,
                        revenue_amount: parseFloat(e.target.value) || undefined
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ebitda_amount">EBITDA (€)</Label>
                    <Input
                      id="ebitda_amount"
                      type="number"
                      value={editingOperation.ebitda_amount || ''}
                      onChange={(e) => setEditingOperation({
                        ...editingOperation,
                        ebitda_amount: parseFloat(e.target.value) || undefined
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="valuation_currency">Moneda</Label>
                    <Select
                      value={editingOperation.valuation_currency || '€'}
                      onValueChange={(value) => setEditingOperation({
                        ...editingOperation,
                        valuation_currency: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="€">€ (Euro)</SelectItem>
                        <SelectItem value="$">$ (Dólar)</SelectItem>
                        <SelectItem value="£">£ (Libra)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descripción</h3>
                <div>
                  <Label htmlFor="short_description">Descripción Corta</Label>
                  <Input
                    id="short_description"
                    value={editingOperation.short_description || ''}
                    onChange={(e) => setEditingOperation({
                      ...editingOperation,
                      short_description: e.target.value
                    })}
                    placeholder="Breve descripción de la operación"
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción Completa *</Label>
                  <Textarea
                    id="description"
                    value={editingOperation.description || ''}
                    onChange={(e) => setEditingOperation({
                      ...editingOperation,
                      description: e.target.value
                    })}
                    rows={6}
                    placeholder="Descripción detallada de la operación"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={editingOperation.is_active ?? true}
                      onCheckedChange={(checked) => setEditingOperation({
                        ...editingOperation,
                        is_active: checked
                      })}
                    />
                    <Label htmlFor="is_active">Operación Activa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={editingOperation.is_featured ?? false}
                      onCheckedChange={(checked) => setEditingOperation({
                        ...editingOperation,
                        is_featured: checked
                      })}
                    />
                    <Label htmlFor="is_featured">Operación Destacada</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setEditingOperation(null)}
                  variant="outline"
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveOperation}
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminOperations;