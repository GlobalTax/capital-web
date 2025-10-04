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
import { Loader2, Plus, Pencil, Download, Search, Filter, Eye, Calendar, Hash, ChevronDown, Building2, MoreVertical, Copy, Archive, FileText } from 'lucide-react';
import { OperationsBreadcrumbs } from '@/components/operations/OperationsBreadcrumbs';
import { OperationsStatsCards } from '@/components/operations/OperationsStatsCards';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OperationFilters, OperationFiltersType } from '@/components/operations/OperationFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import SectorSelect from '@/components/admin/shared/SectorSelect';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  subsector?: string;
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
  const navigate = useNavigate();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filters, setFilters] = useState<OperationFiltersType>({
    search: '',
    status: 'all',
    dealType: 'all',
  });
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

  // Available sectors for filter dropdown
  const availableSectors = useMemo(() => {
    return Array.from(new Set(operations.map(op => op.sector))).sort();
  }, [operations]);

  // Filter operations based on search and filters
  const filteredOperations = useMemo(() => {
    return operations.filter(operation => {
      // Search filter
      const matchesSearch = !filters.search || 
        operation.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        operation.sector.toLowerCase().includes(filters.search.toLowerCase()) ||
        operation.description.toLowerCase().includes(filters.search.toLowerCase());
      
      // Status filter
      const matchesStatus = filters.status === 'all' || operation.status === filters.status;
      
      // Deal type filter
      const matchesDealType = filters.dealType === 'all' || operation.deal_type === filters.dealType;
      
      // Year range filter
      const matchesYearFrom = !filters.yearFrom || operation.year >= filters.yearFrom;
      const matchesYearTo = !filters.yearTo || operation.year <= filters.yearTo;
      
      // Sector filter
      const matchesSector = !filters.sector || operation.sector === filters.sector;
      
      // Valuation range filter (convert k to actual amount)
      const matchesValuationMin = !filters.valuationMin || (operation.valuation_amount && operation.valuation_amount >= filters.valuationMin * 1000);
      const matchesValuationMax = !filters.valuationMax || (operation.valuation_amount && operation.valuation_amount <= filters.valuationMax * 1000);
      
      // Display location filter
      const matchesLocation = !filters.displayLocation || operation.display_locations?.includes(filters.displayLocation);
      
      return matchesSearch && matchesStatus && matchesDealType && matchesYearFrom && 
             matchesYearTo && matchesSector && matchesValuationMin && matchesValuationMax && matchesLocation;
    });
  }, [operations, filters]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: filteredOperations.length,
    active: filteredOperations.filter(op => op.is_active).length,
    featured: filteredOperations.filter(op => op.is_featured).length,
    sales: filteredOperations.filter(op => op.deal_type === 'sale').length,
    acquisitions: filteredOperations.filter(op => op.deal_type === 'acquisition').length,
    thisYear: filteredOperations.filter(op => op.year === new Date().getFullYear()).length,
    inactive: filteredOperations.filter(op => !op.is_active).length,
  }), [filteredOperations]);

  // Tab filtered operations
  const tabFilteredOperations = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return filteredOperations.filter(op => op.is_active);
      case 'featured':
        return filteredOperations.filter(op => op.is_featured);
      case 'sales':
        return filteredOperations.filter(op => op.deal_type === 'sale');
      case 'acquisitions':
        return filteredOperations.filter(op => op.deal_type === 'acquisition');
      case 'thisYear':
        return filteredOperations.filter(op => op.year === new Date().getFullYear());
      case 'inactive':
        return filteredOperations.filter(op => !op.is_active);
      default:
        return filteredOperations;
    }
  }, [filteredOperations, activeTab]);

  // Statistics calculations
  const stats = useMemo(() => {
    const active = operations.filter(op => op.is_active).length;
    const thisYear = operations.filter(op => op.year === new Date().getFullYear()).length;
    const withRevenue = operations.filter(op => op.revenue_amount && op.revenue_amount > 0).length;
    const withEbitda = operations.filter(op => op.ebitda_amount && op.ebitda_amount > 0).length;
    const featured = operations.filter(op => op.is_featured).length;
    const totalValuation = operations
      .filter(op => op.is_active && op.valuation_amount)
      .reduce((sum, op) => sum + (op.valuation_amount || 0), 0);
    
    return { active, thisYear, withRevenue, withEbitda, featured, totalValuation };
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
        subsector: editingOperation.subsector?.trim() || null,
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

  // Quick update for inline editing
  const handleQuickUpdate = async (id: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('company_operations')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Actualizado',
        description: 'Cambio guardado correctamente',
      });
      
      await fetchOperations();
    } catch (error) {
      console.error('Error updating operation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar',
        variant: 'destructive',
      });
    }
  };

  // Duplicate operation
  const handleDuplicate = async (operation: Operation) => {
    try {
      const { id, created_at, updated_at, ...restData } = operation;
      
      const newOperation = {
        ...restData,
        company_name: `${operation.company_name} (Copia)`,
        valuation_amount: operation.valuation_amount || 0,
        is_active: false,
        is_featured: false,
      };

      const { error } = await supabase
        .from('company_operations')
        .insert([newOperation]);

      if (error) throw error;

      toast({
        title: 'Operación duplicada',
        description: 'La operación se ha duplicado correctamente',
      });
      
      await fetchOperations();
    } catch (error) {
      console.error('Error duplicating operation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo duplicar la operación',
        variant: 'destructive',
      });
    }
  };

  // Toggle active status
  const handleToggleActive = async (operation: Operation) => {
    try {
      const { error } = await supabase
        .from('company_operations')
        .update({ is_active: !operation.is_active })
        .eq('id', operation.id);

      if (error) throw error;

      toast({
        title: operation.is_active ? 'Operación desactivada' : 'Operación activada',
        description: `La operación se ha ${operation.is_active ? 'desactivado' : 'activado'} correctamente`,
      });
      
      await fetchOperations();
    } catch (error) {
      console.error('Error toggling operation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado',
        variant: 'destructive',
      });
    }
  };

  // Get status badge classes
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'under_negotiation': return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'sold': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'withdrawn': return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-600 hover:bg-gray-100';
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
      title: '# OPORTUNIDAD',
      width: 120,
      render: (operation: Operation, index: number) => (
        <div className="flex items-center gap-2">
          <Hash className="h-3 w-3 text-gray-400" />
          <span className="font-mono text-xs font-medium text-gray-900">
            {generateOpportunityNumber(operation.created_at || '', index)}
          </span>
        </div>
      ),
    },
    {
      key: 'company_info',
      title: 'EMPRESA',
      width: 250,
      render: (operation: Operation) => (
        <div className="space-y-1">
          <div className="font-semibold text-sm text-gray-900">{operation.company_name}</div>
          <div className="text-xs text-gray-500">
            {operation.sector}
            {operation.subsector && (
              <span className="text-gray-400"> › {operation.subsector}</span>
            )}
          </div>
          {operation.company_size_employees && (
            <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
              {operation.company_size_employees}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'financial_info',
      title: 'INFORMACIÓN FINANCIERA',
      width: 200,
      render: (operation: Operation) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-gray-500">Facturación:</span>{' '}
            <span className="font-semibold text-green-600">
              {operation.revenue_amount ? formatCurrency(operation.revenue_amount) : 'N/D'}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">EBITDA:</span>{' '}
            <span className="font-semibold text-blue-600">
              {operation.ebitda_amount ? formatCurrency(operation.ebitda_amount) : 'N/D'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'status_info',
      title: 'ESTADO Y TIPO',
      width: 150,
      render: (operation: Operation) => (
        <div className="space-y-2">
          <Badge className={getStatusBadgeClass(operation.status)}>
            {getStatusText(operation.status)}
          </Badge>
          <div className="text-xs text-gray-500">
            {getDealTypeText(operation.deal_type)}
          </div>
        </div>
      ),
    },
    {
      key: 'date_info',
      title: 'FECHAS',
      width: 120,
      render: (operation: Operation) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Alta:</span>
          </div>
          <div className="text-xs font-medium text-gray-900">
            {operation.created_at ? formatDate(operation.created_at) : 'N/D'}
          </div>
          <div className="text-xs text-gray-500">
            Año: {operation.year}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'ACCIONES',
      width: 120,  
      render: (operation: Operation) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/operations/${operation.id}`)}
            className="h-8 w-8 p-0 hover:bg-blue-50"
            title="Ver ficha completa"
          >
            <FileText className="h-3 w-3 text-blue-600" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(`/admin/operations/${operation.id}`)}>
                <FileText className="mr-2 h-4 w-4" />
                Ver ficha completa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingOperation(operation)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(operation)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleToggleActive(operation)}
                className="text-amber-600"
              >
                <Archive className="mr-2 h-4 w-4" />
                {operation.is_active ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <OperationsBreadcrumbs />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestión de Operaciones</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Administra y supervisa todas las operaciones de M&A, inversiones y transacciones corporativas
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={extractFinancialData}
            disabled={isExtracting}
            variant="outline"
            className="border-gray-200 hover:bg-gray-50"
          >
            {isExtracting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Extraer
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Operación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <OperationsStatsCards 
        totalOperations={operations.length}
        activeOperations={stats.active}
        thisYearOperations={stats.thisYear}
        withFinancialData={Math.max(stats.withRevenue, stats.withEbitda)}
        featuredOperations={stats.featured}
        totalValuation={formatCurrency(stats.totalValuation)}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="all">
            Todas ({tabCounts.all})
          </TabsTrigger>
          <TabsTrigger value="active">
            Activas ({tabCounts.active})
          </TabsTrigger>
          <TabsTrigger value="featured">
            Destacadas ({tabCounts.featured})
          </TabsTrigger>
          <TabsTrigger value="sales">
            Ventas ({tabCounts.sales})
          </TabsTrigger>
          <TabsTrigger value="acquisitions">
            Adquisiciones ({tabCounts.acquisitions})
          </TabsTrigger>
          <TabsTrigger value="thisYear">
            Este Año ({tabCounts.thisYear})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactivas ({tabCounts.inactive})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Advanced Filters */}
      <OperationFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalOperations={tabFilteredOperations.length}
        availableSectors={availableSectors}
      />

      {/* Operations Table */}
      <Card className="bg-white border border-gray-100">
        <CardHeader className="border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Operaciones Registradas</CardTitle>
            </div>
            <div className="text-xs text-gray-500">
              Mostrando {tabFilteredOperations.length} de {operations.length} operaciones
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {operations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay operaciones registradas</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Comienza añadiendo tu primera operación para construir el portafolio de transacciones.
              </p>
            </div>
          ) : tabFilteredOperations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron operaciones</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Intenta ajustar los filtros de búsqueda para encontrar las operaciones que necesitas.
              </p>
            </div>
          ) : (
            <VirtualizedTable
              data={tabFilteredOperations}
              columns={tableColumns}
              itemHeight={80}
              height={Math.min(600, tabFilteredOperations.length * 80 + 50)}
              className="border-none [&_thead]:bg-gray-50 [&_thead_th]:text-[10px] [&_thead_th]:font-semibold [&_thead_th]:text-gray-600 [&_thead_th]:uppercase [&_thead_th]:tracking-wider [&_tbody_tr]:hover:bg-gray-50 [&_tbody_tr]:border-b [&_tbody_tr]:border-gray-100"
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingOperation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {editingOperation.id ? 'Editar Operación' : 'Nueva Operación'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Operation Info - Show for existing operations */}
              {editingOperation.id && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Información de la Oportunidad</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Número de Oportunidad</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash className="h-3 w-3 text-gray-400" />
                        <span className="font-mono text-xs font-medium text-gray-900">
                          {generateOpportunityNumber(
                            editingOperation.created_at || new Date().toISOString(), 
                            operations.findIndex(op => op.id === editingOperation.id)
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Fecha de Alta</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-900">
                          {editingOperation.created_at ? formatDate(editingOperation.created_at) : 'N/D'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name" className="text-xs text-gray-600">Nombre de la empresa *</Label>
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
                    <Label htmlFor="sector" className="text-xs text-gray-600">Sector *</Label>
                    <SectorSelect
                      value={editingOperation.sector || ''}
                      onChange={(value) => setEditingOperation({
                        ...editingOperation,
                        sector: value
                      })}
                      placeholder="Selecciona un sector"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subsector" className="text-xs text-gray-600">Subsector / Especialización</Label>
                  <Input
                    id="subsector"
                    value={editingOperation.subsector || ''}
                    onChange={(e) => setEditingOperation({
                      ...editingOperation,
                      subsector: e.target.value
                    })}
                    placeholder="Ej: SaaS B2B, Retail de moda, etc."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="year" className="text-xs text-gray-600">Año *</Label>
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
                    <Label htmlFor="deal_type" className="text-xs text-gray-600">Tipo de Operación</Label>
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
                    <Label htmlFor="status" className="text-xs text-gray-600">Estado</Label>
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
                  <Label htmlFor="company_size_employees" className="text-xs text-gray-600">Tamaño de la Empresa</Label>
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
                <h3 className="text-sm font-semibold text-gray-900">Información Financiera</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revenue_amount" className="text-xs text-gray-600">Facturación (€)</Label>
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
                    <Label htmlFor="ebitda_amount" className="text-xs text-gray-600">EBITDA (€)</Label>
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
                    <Label htmlFor="valuation_currency" className="text-xs text-gray-600">Moneda</Label>
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
                <h3 className="text-sm font-semibold text-gray-900">Descripción</h3>
                <div>
                  <Label htmlFor="short_description" className="text-xs text-gray-600">Descripción Corta</Label>
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
                  <Label htmlFor="description" className="text-xs text-gray-600">Descripción Completa *</Label>
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
                <h3 className="text-sm font-semibold text-gray-900">Configuración</h3>
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
                    <Label htmlFor="is_active" className="text-xs text-gray-700 font-medium">Operación Activa</Label>
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
                    <Label htmlFor="is_featured" className="text-xs text-gray-700 font-medium">Operación Destacada</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setEditingOperation(null)}
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveOperation}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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