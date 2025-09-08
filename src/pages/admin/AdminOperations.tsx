import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Download, Building2, TrendingUp, BarChart3, Target } from 'lucide-react';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
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
}

const AdminOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

    if (!editingOperation.valuation_amount || editingOperation.valuation_amount <= 0) {
      toast({
        title: 'Error de validación',
        description: 'La valoración debe ser mayor a 0',
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
        ebitda_amount: editingOperation.ebitda_amount || null,
        valuation_amount: editingOperation.valuation_amount,
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

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No definido';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
              valuation_amount: 0,
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
                  {operations.filter(op => op.is_active).length}
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
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Con Facturación</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {operations.filter(op => op.revenue_amount).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Con EBITDA</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {operations.filter(op => op.ebitda_amount).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Operations List */}
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
              {operations.length} operaciones totales
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
          ) : (
            <div className="divide-y divide-border">
              {operations.map((operation, index) => (
                <div
                  key={operation.id}
                  className="p-6 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {operation.company_name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {operation.sector}
                        </span>
                        {operation.is_featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            ⭐ Destacada
                          </span>
                        )}
                        {!operation.is_active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Inactiva
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Facturación</p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(operation.revenue_amount)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">EBITDA</p>
                          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(operation.ebitda_amount)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valoración</p>
                          <p className="text-lg font-semibold text-foreground">
                            {formatCurrency(operation.valuation_amount)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Año</p>
                          <p className="text-lg font-semibold text-muted-foreground">
                            {operation.year}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingOperation(operation)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valuation_amount">Valoración *</Label>
                    <Input
                      id="valuation_amount"
                      type="number"
                      min="1"
                      value={editingOperation.valuation_amount || ''}
                      onChange={(e) => setEditingOperation({
                        ...editingOperation,
                        valuation_amount: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0"
                    />
                  </div>
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