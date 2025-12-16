import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
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
import type { Column } from '@/components/shared/VirtualizedTable';
import { formatCurrency } from '@/shared/utils/format';
import { formatDate } from '@/shared/utils/date';
import { Loader2, Plus, Pencil, Download, Search, Filter, Eye, Calendar, Hash, ChevronDown, Building2, MoreVertical, Copy, Archive, FileText, Trash2, BarChart3, Kanban, User } from 'lucide-react';
import { OperationsStatsCards } from '@/components/operations/OperationsStatsCards';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OperationFilters, OperationFiltersType } from '@/components/operations/OperationFilters';
import { BulkActionsToolbar } from '@/components/operations/BulkActionsToolbar';
import { BulkProjectStatusModal } from '@/components/operations/BulkProjectStatusModal';
import { BulkAssignModal } from '@/components/operations/BulkAssignModal';
import { Checkbox } from '@/components/ui/checkbox';
import { OperationsTableMobile } from '@/components/operations/OperationsTableMobile';
import OperationDetailsModalEnhanced from '@/components/operations/OperationDetailsModalEnhanced';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import SectorSelect from '@/components/admin/shared/SectorSelect';
import { SellerGuideDialog } from '@/components/operations/SellerGuideDialog';
import { AdvancedSearchPanel } from '@/features/operations-management/components/search';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import * as XLSX from 'xlsx';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  subsector?: string;
  description: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  valuation_amount: number;
  valuation_currency: string;
  year: number;
  is_active: boolean;
  is_featured: boolean;
  display_locations: string[];
  company_size_employees?: string;
  short_description?: string;
  deal_type?: string;
  status?: string;
  logo_url?: string;
  highlights?: string[];
  created_at?: string;
  updated_at?: string;
  assigned_to?: string | null;
  assigned_at?: string | null;
  project_status?: string;
  expected_market_text?: string;
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
  const [selectedOperations, setSelectedOperations] = useState<Set<string>>(new Set());
  const [viewingOperation, setViewingOperation] = useState<Operation | null>(null);
  const [showSellerGuide, setShowSellerGuide] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showProjectStatusModal, setShowProjectStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const { toast } = useToast();
  const { users: adminUsers } = useAdminUsers();

  useEffect(() => {
    fetchOperations();
  }, []);

  // Auto-open seller guide on first visit
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('seller-guide-shown');
    const isDisabled = localStorage.getItem('seller-guide-disabled');
    
    if (!hasSeenGuide && !isDisabled) {
      setShowSellerGuide(true);
      localStorage.setItem('seller-guide-shown', 'true');
    }
  }, []);

  // Clear selection when changing tabs
  useEffect(() => {
    setSelectedOperations(new Set());
  }, [activeTab]);

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('company_operations')
        .select('*')
        .is('is_deleted', false)
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
      
      // Project status filter
      const matchesProjectStatus = !filters.projectStatus || filters.projectStatus === 'all' || operation.project_status === filters.projectStatus;
      
      // Assigned to filter
      const matchesAssignedTo = !filters.assignedTo || filters.assignedTo === 'all' || 
        (filters.assignedTo === 'unassigned' ? !operation.assigned_to : operation.assigned_to === filters.assignedTo);
      
      // Featured filter
      const matchesFeatured = filters.isFeatured === undefined || operation.is_featured === filters.isFeatured;
      
      return matchesSearch && matchesStatus && matchesDealType && matchesYearFrom && 
             matchesYearTo && matchesSector && matchesValuationMin && matchesValuationMax && 
             matchesLocation && matchesProjectStatus && matchesAssignedTo && matchesFeatured;
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
      const operationData: Database['public']['Tables']['company_operations']['Insert'] = {
        company_name: editingOperation.company_name.trim(),
        sector: editingOperation.sector.trim(),
        subsector: editingOperation.subsector?.trim() || null,
        description: editingOperation.description.trim(),
        revenue_amount: (editingOperation.revenue_amount ?? null),
        ebitda_amount: (editingOperation.ebitda_amount ?? null),
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
        project_status: editingOperation.project_status || 'in_market',
        expected_market_text: editingOperation.project_status === 'in_progress' 
          ? editingOperation.expected_market_text?.trim() || null 
          : null,
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

  const handleDelete = async (operation: Operation) => {
    if (!confirm(`¿Estás seguro de eliminar "${operation.company_name}"? Esta acción se puede deshacer.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_operations')
        .update({ is_deleted: true })
        .eq('id', operation.id);

      if (error) throw error;

      toast({
        title: 'Operación eliminada',
        description: `"${operation.company_name}" se eliminó correctamente`,
      });
      
      await fetchOperations();
    } catch (error) {
      console.error('Error deleting operation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la operación',
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

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedOperations.size === tabFilteredOperations.length) {
      setSelectedOperations(new Set());
    } else {
      setSelectedOperations(new Set(tabFilteredOperations.map(op => op.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedOperations);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedOperations(newSet);
  };

  // Bulk actions
  const handleBulkActivate = async () => {
    try {
      const ids = Array.from(selectedOperations);
      const { error } = await supabase
        .from('company_operations')
        .update({ is_active: true })
        .in('id', ids);

      if (error) throw error;

      toast({
        title: 'Operaciones activadas',
        description: `Se activaron ${ids.length} operaciones correctamente`,
      });

      await fetchOperations();
    } catch (error) {
      console.error('Error activating operations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron activar las operaciones',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const ids = Array.from(selectedOperations);
      const { error } = await supabase
        .from('company_operations')
        .update({ is_active: false })
        .in('id', ids);

      if (error) throw error;

      toast({
        title: 'Operaciones desactivadas',
        description: `Se desactivaron ${ids.length} operaciones correctamente`,
      });

      await fetchOperations();
    } catch (error) {
      console.error('Error deactivating operations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron desactivar las operaciones',
        variant: 'destructive',
      });
    }
  };

  const handleBulkFeature = async () => {
    try {
      const ids = Array.from(selectedOperations);
      const { error } = await supabase
        .from('company_operations')
        .update({ is_featured: true })
        .in('id', ids);

      if (error) throw error;

      toast({
        title: 'Operaciones destacadas',
        description: `Se marcaron ${ids.length} operaciones como destacadas`,
      });

      await fetchOperations();
    } catch (error) {
      console.error('Error featuring operations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron destacar las operaciones',
        variant: 'destructive',
      });
    }
  };

  const handleBulkUnfeature = async () => {
    try {
      const ids = Array.from(selectedOperations);
      const { error } = await supabase
        .from('company_operations')
        .update({ is_featured: false })
        .in('id', ids);

      if (error) throw error;

      toast({
        title: 'Operaciones desmarcadas',
        description: `Se quitó el destacado de ${ids.length} operaciones`,
      });

      await fetchOperations();
    } catch (error) {
      console.error('Error unfeaturing operations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron desmarcar las operaciones',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedOperations);
    
    if (!confirm(`¿Eliminar ${ids.length} operaciones seleccionadas? Esta acción se puede deshacer.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_operations')
        .update({ is_deleted: true })
        .in('id', ids);

      if (error) throw error;

      toast({
        title: 'Operaciones eliminadas',
        description: `Se eliminaron ${ids.length} operaciones correctamente`,
      });

      await fetchOperations();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron eliminar las operaciones',
        variant: 'destructive',
      });
    }
  };

  const handleBulkExport = () => {
    const ids = Array.from(selectedOperations);
    const selected = operations.filter(op => ids.includes(op.id));
    
    // Create CSV content
    const headers = ['Empresa', 'Sector', 'Año', 'Valoración', 'Facturación', 'EBITDA', 'Estado', 'Tipo'];
    const rows = selected.map(op => [
      op.company_name,
      op.sector,
      op.year,
      op.valuation_amount || '',
      op.revenue_amount || '',
      op.ebitda_amount || '',
      getStatusText(op.status),
      getDealTypeText(op.deal_type)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `operaciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Exportación completada',
      description: `Se exportaron ${ids.length} operaciones`,
    });
  };

  const handleBulkChangeDisplayLocations = () => {
    toast({
      title: 'En desarrollo',
      description: 'Esta funcionalidad estará disponible próximamente',
    });
  };

  // Bulk change project status
  const handleBulkChangeProjectStatus = async (status: string, expectedMarketText?: string) => {
    setIsBulkUpdating(true);
    try {
      const ids = Array.from(selectedOperations);
      const { error } = await supabase
        .from('company_operations')
        .update({
          project_status: status,
          expected_market_text: status === 'in_progress' ? expectedMarketText || null : null,
        })
        .in('id', ids);

      if (error) throw error;

      toast({
        title: 'Estado del proyecto actualizado',
        description: `Se actualizaron ${ids.length} operaciones`,
      });

      setShowProjectStatusModal(false);
      setSelectedOperations(new Set());
      await fetchOperations();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del proyecto',
        variant: 'destructive',
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Bulk assign operations
  const handleBulkAssign = async (userId: string | null) => {
    setIsBulkUpdating(true);
    try {
      const ids = Array.from(selectedOperations);
      const { data: authUser } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('company_operations')
        .update({
          assigned_to: userId,
          assigned_at: userId ? new Date().toISOString() : null,
          assigned_by: userId ? authUser.user?.id : null,
        })
        .in('id', ids);

      if (error) throw error;

      toast({
        title: userId ? 'Operaciones asignadas' : 'Asignaciones eliminadas',
        description: `Se actualizaron ${ids.length} operaciones`,
      });

      setShowAssignModal(false);
      setSelectedOperations(new Set());
      await fetchOperations();
    } catch (error) {
      console.error('Error assigning operations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron asignar las operaciones',
        variant: 'destructive',
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Export to Excel
  const handleBulkExportExcel = () => {
    const ids = Array.from(selectedOperations);
    const selected = operations.filter(op => ids.includes(op.id));
    
    const getProjectStatusText = (status?: string) => {
      switch (status) {
        case 'negotiating': return 'En negociaciones';
        case 'in_market': return 'En el mercado';
        case 'in_progress': return 'In progress';
        default: return 'Sin estado';
      }
    };

    const data = selected.map(op => ({
      'ID': op.id,
      'Empresa': op.company_name,
      'Sector': op.sector,
      'Subsector': op.subsector || '',
      'Año': op.year,
      'Valoración': op.valuation_amount || '',
      'Facturación': op.revenue_amount || '',
      'EBITDA': op.ebitda_amount || '',
      'Estado': getStatusText(op.status),
      'Estado Proyecto': getProjectStatusText(op.project_status),
      'Entrada Mercado': op.expected_market_text || '',
      'Tipo': getDealTypeText(op.deal_type),
      'Destacada': op.is_featured ? 'Sí' : 'No',
      'Activa': op.is_active ? 'Sí' : 'No',
      'Creada': op.created_at ? formatDate(op.created_at) : '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Operaciones');
    XLSX.writeFile(wb, `operaciones_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: 'Exportación Excel completada',
      description: `Se exportaron ${ids.length} operaciones a Excel`,
    });
  };

  // Table columns configuration
  const tableColumns = [
    {
      key: 'select',
      title: (
        <Checkbox
          checked={selectedOperations.size === tabFilteredOperations.length && tabFilteredOperations.length > 0}
          onCheckedChange={handleSelectAll}
          aria-label="Seleccionar todas"
        />
      ),
      width: 40,
      render: (operation: Operation) => (
        <Checkbox
          checked={selectedOperations.has(operation.id)}
          onCheckedChange={() => handleSelectOne(operation.id)}
          aria-label={`Seleccionar ${operation.company_name}`}
        />
      ),
    },
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
      key: 'project_status',
      title: 'ESTADO PROYECTO',
      width: 180,
      render: (operation: Operation) => {
        const getProjectStatusBadge = (status?: string) => {
          switch (status) {
            case 'negotiating':
              return { className: 'bg-purple-100 text-purple-700 hover:bg-purple-100', text: 'En negociaciones' };
            case 'in_market':
              return { className: 'bg-green-100 text-green-700 hover:bg-green-100', text: 'En el mercado' };
            case 'in_progress':
              return { className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100', text: 'In progress' };
            default:
              return { className: 'bg-gray-100 text-gray-600 hover:bg-gray-100', text: 'Sin estado' };
          }
        };
        
        const badgeInfo = getProjectStatusBadge(operation.project_status);
        
        return (
          <div className="space-y-1">
            <Badge className={badgeInfo.className}>
              {badgeInfo.text}
            </Badge>
            {operation.project_status === 'in_progress' && operation.expected_market_text && (
              <div className="text-xs text-gray-500 mt-1">
                📅 Entrada: {operation.expected_market_text}
              </div>
            )}
          </div>
        );
      },
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
      key: 'assigned_to',
      title: 'ASIGNADO A',
      width: 150,
      render: (operation: Operation) => {
        const assignedUser = adminUsers.find(u => u.user_id === operation.assigned_to);
        
        if (!assignedUser) {
          return <Badge variant="outline" className="text-xs">Sin asignar</Badge>;
        }
        
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {assignedUser.full_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate max-w-[100px]">
              {assignedUser.full_name || assignedUser.email}
            </span>
          </div>
        );
      },
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
            onClick={() => setViewingOperation(operation)}
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
              <DropdownMenuItem onClick={() => setViewingOperation(operation)}>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(operation)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestión de Operaciones</h1>
          <p className="text-muted-foreground mt-2">
            Administra y supervisa todas las operaciones de M&A, inversiones y transacciones corporativas
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/admin/operations/dashboard')}
            variant="outline"
            className="border-accent/20 hover:bg-accent/10 text-accent"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => navigate('/admin/operations/kanban')}
            variant="outline"
            className="border-purple-200 hover:bg-purple-50 text-purple-600"
          >
            <Kanban className="h-4 w-4 mr-2" />
            Vista Kanban
          </Button>
          <Button
            onClick={() => setShowAdvancedSearch(true)}
            variant="outline"
            className="border-blue-200 hover:bg-blue-50 text-blue-600"
          >
            <Filter className="h-4 w-4 mr-2" />
            Búsqueda Avanzada
          </Button>
          <Button
            onClick={() => setShowSellerGuide(true)}
            variant="outline"
            className="border-primary/20 hover:bg-primary/10 text-primary"
          >
            <FileText className="h-4 w-4 mr-2" />
            Guía de Publicación
          </Button>
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
            valuation_amount: 0,
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
        adminUsers={adminUsers}
      />

      {/* Bulk Actions Toolbar */}
      {selectedOperations.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedOperations.size}
          onClearSelection={() => setSelectedOperations(new Set())}
          onActivate={handleBulkActivate}
          onDeactivate={handleBulkDeactivate}
          onFeature={handleBulkFeature}
          onUnfeature={handleBulkUnfeature}
          onExport={handleBulkExport}
          onExportExcel={handleBulkExportExcel}
          onChangeDisplayLocations={handleBulkChangeDisplayLocations}
          onDelete={handleBulkDelete}
          onChangeProjectStatus={() => setShowProjectStatusModal(true)}
          onBulkAssign={() => setShowAssignModal(true)}
        />
      )}

      {/* Operations Table - Desktop */}
      <div className="hidden md:block">
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
                <Building2 className="h-16 w-16 text-gray-300 mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay operaciones registradas</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Comienza añadiendo tu primera operación para construir el portafolio de transacciones.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setEditingOperation({
                  company_name: '',
                  sector: '',
                  description: '',
                  valuation_amount: 0,
                  valuation_currency: '€',
                    year: new Date().getFullYear(),
                    is_active: true,
                    is_featured: false,
                    display_locations: ['home', 'operaciones'],
                    deal_type: 'sale',
                    status: 'available'
                  } as Operation)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Operación
                </Button>
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
      </div>

      {/* Operations Table - Mobile */}
      <div className="md:hidden">
        {operations.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center text-center">
              <Building2 className="h-16 w-16 text-gray-300 mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay operaciones</h3>
              <p className="text-sm text-gray-500 max-w-md mb-4">
                Comienza añadiendo tu primera operación.
              </p>
              <Button
                onClick={() => setEditingOperation({
                company_name: '',
                sector: '',
                description: '',
                valuation_amount: 0,
                valuation_currency: '€',
                  year: new Date().getFullYear(),
                  is_active: true,
                  is_featured: false,
                  display_locations: ['home', 'operaciones'],
                  deal_type: 'sale',
                  status: 'available'
                } as Operation)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Operación
              </Button>
            </div>
          </Card>
        ) : tabFilteredOperations.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center text-center">
              <Search className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin resultados</h3>
              <p className="text-sm text-gray-500">
                Ajusta los filtros para ver operaciones.
              </p>
            </div>
          </Card>
        ) : (
          <OperationsTableMobile
            operations={tabFilteredOperations}
            selectedOperations={selectedOperations}
            onSelectOne={handleSelectOne}
            onViewDetails={setViewingOperation}
            onEdit={setEditingOperation}
            onDuplicate={handleDuplicate}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* View Details Modal */}
      {viewingOperation && (
        <OperationDetailsModalEnhanced
          operation={viewingOperation}
          isOpen={!!viewingOperation}
          onClose={() => setViewingOperation(null)}
          onEdit={() => {
            setEditingOperation(viewingOperation);
            setViewingOperation(null);
          }}
        />
      )}

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

                {/* Estado del Proyecto */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project_status" className="text-xs text-gray-600">Estado del Proyecto</Label>
                    <Select
                      value={editingOperation.project_status || 'in_market'}
                      onValueChange={(value) => setEditingOperation({
                        ...editingOperation,
                        project_status: value,
                        expected_market_text: value === 'in_progress' 
                          ? editingOperation.expected_market_text 
                          : undefined
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_market">En el mercado</SelectItem>
                        <SelectItem value="negotiating">En negociaciones</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {editingOperation.project_status === 'in_progress' && (
                    <div>
                      <Label htmlFor="expected_market_text" className="text-xs text-gray-600">Entrada estimada a mercado</Label>
                      <Input
                        id="expected_market_text"
                        value={editingOperation.expected_market_text || ''}
                        onChange={(e) => setEditingOperation({
                          ...editingOperation,
                          expected_market_text: e.target.value
                        })}
                        placeholder="Ej: Q1 2026, H2 2025, Enero 2026"
                      />
                    </div>
                  )}
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
                
                {/* Fila 1: Facturación y EBITDA */}
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

                {/* Fila 2: Valoración y Moneda */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valuation_amount" className="text-xs text-gray-600">
                      Valoración (€)
                    </Label>
                    <Input
                      id="valuation_amount"
                      type="number"
                      min="0"
                      value={editingOperation.valuation_amount || ''}
                      onChange={(e) => setEditingOperation({
                        ...editingOperation,
                        valuation_amount: parseFloat(e.target.value) || undefined
                      })}
                      placeholder="Ej: 1500000"
                    />
                  </div>
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

      {/* Seller Guide Dialog */}
      <SellerGuideDialog 
        open={showSellerGuide}
        onOpenChange={setShowSellerGuide}
      />

      {/* Advanced Search Dialog */}
      <Dialog open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Búsqueda Avanzada de Operaciones
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <AdvancedSearchPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Project Status Modal */}
      <BulkProjectStatusModal
        isOpen={showProjectStatusModal}
        onClose={() => setShowProjectStatusModal(false)}
        selectedCount={selectedOperations.size}
        onConfirm={handleBulkChangeProjectStatus}
        isLoading={isBulkUpdating}
      />

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedCount={selectedOperations.size}
        users={adminUsers}
        onConfirm={handleBulkAssign}
        isLoading={isBulkUpdating}
      />
    </div>
  );
};

export default AdminOperations;