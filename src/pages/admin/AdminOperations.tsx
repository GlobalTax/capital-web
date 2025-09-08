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
import { Loader2, Plus, Pencil, Trash2, Download, Upload } from 'lucide-react';

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
}

const AdminOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
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
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestión de Operaciones</h1>
        <div className="flex gap-2">
          <Button
            onClick={extractFinancialData}
            disabled={isExtracting}
            variant="outline"
          >
            {isExtracting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Extraer Datos Financieros
          </Button>
          <Button onClick={() => setEditingOperation({} as Operation)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Operación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{operations.length}</div>
            <div className="text-sm text-muted-foreground">Total Operaciones</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {operations.filter(op => op.is_active).length}
            </div>
            <div className="text-sm text-muted-foreground">Activas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {operations.filter(op => op.revenue_amount).length}
            </div>
            <div className="text-sm text-muted-foreground">Con Facturación</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {operations.filter(op => op.ebitda_amount).length}
            </div>
            <div className="text-sm text-muted-foreground">Con EBITDA</div>
          </CardContent>
        </Card>
      </div>

      {/* Operations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Operaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operations.map((operation) => (
              <div
                key={operation.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-lg">{operation.company_name}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {operation.sector}
                      </span>
                      {operation.is_featured && (
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Destacada
                        </span>
                      )}
                      {!operation.is_active && (
                        <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Facturación:</span>
                        <div className="font-medium text-green-600">
                          {formatCurrency(operation.revenue_amount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">EBITDA:</span>
                        <div className="font-medium text-blue-600">
                          {formatCurrency(operation.ebitda_amount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valoración:</span>
                        <div className="font-medium">
                          {formatCurrency(operation.valuation_amount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Año:</span>
                        <div className="font-medium">{operation.year}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingOperation(operation)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal - would need to implement this with Dialog */}
      {editingOperation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingOperation.id ? 'Editar Operación' : 'Nueva Operación'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Nombre de la empresa</Label>
                  <Input
                    id="company_name"
                    value={editingOperation.company_name || ''}
                    onChange={(e) => setEditingOperation({
                      ...editingOperation,
                      company_name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={editingOperation.sector || ''}
                    onChange={(e) => setEditingOperation({
                      ...editingOperation,
                      sector: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="revenue_amount">Facturación (€)</Label>
                  <Input
                    id="revenue_amount"
                    type="number"
                    value={editingOperation.revenue_amount || ''}
                    onChange={(e) => setEditingOperation({
                      ...editingOperation,
                      revenue_amount: parseFloat(e.target.value) || undefined
                    })}
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
                  />
                </div>
                <div>
                  <Label htmlFor="valuation_amount">Valoración (€)</Label>
                  <Input
                    id="valuation_amount"
                    type="number"
                    value={editingOperation.valuation_amount || ''}
                    onChange={(e) => setEditingOperation({
                      ...editingOperation,
                      valuation_amount: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={editingOperation.description || ''}
                  onChange={(e) => setEditingOperation({
                    ...editingOperation,
                    description: e.target.value
                  })}
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={editingOperation.is_active || false}
                    onCheckedChange={(checked) => setEditingOperation({
                      ...editingOperation,
                      is_active: checked
                    })}
                  />
                  <Label htmlFor="is_active">Activa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={editingOperation.is_featured || false}
                    onCheckedChange={(checked) => setEditingOperation({
                      ...editingOperation,
                      is_featured: checked
                    })}
                  />
                  <Label htmlFor="is_featured">Destacada</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setEditingOperation(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement save functionality
                    toast({
                      title: 'Funcionalidad pendiente',
                      description: 'La funcionalidad de guardado se implementará próximamente',
                    });
                  }}
                  className="flex-1"
                >
                  Guardar
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