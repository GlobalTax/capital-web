import React, { useState } from 'react';
import { useAdvisorValuationMultiplesByRange, AdvisorMultipleByRange } from '@/hooks/useAdvisorValuationMultiplesByRange';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectorSelect from './shared/SectorSelect';
import { Pencil, Trash2, Plus } from 'lucide-react';

const AdvisorMultiplesByRangeManager = () => {
  const { ranges, isLoading, refetch } = useAdvisorValuationMultiplesByRange();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingRange, setEditingRange] = useState<AdvisorMultipleByRange | null>(null);

  const emptyRange: Omit<AdvisorMultipleByRange, 'id'> = {
    sector_name: '',
    revenue_range_min: 0,
    revenue_range_max: null,
    revenue_multiple: 1.0,
    ebitda_range_min: 0,
    ebitda_range_max: null,
    ebitda_multiple: 5.0,
    net_profit_range_min: 0,
    net_profit_range_max: null,
    net_profit_multiple: 8.0,
    description: '',
    display_order: 0,
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyRange);

  const validateForm = (): boolean => {
    if (!formData.sector_name) {
      toast({ title: "Error", description: "Selecciona un sector", variant: "destructive" });
      return false;
    }

    // Validar Revenue
    if (formData.revenue_range_max !== null && formData.revenue_range_max <= formData.revenue_range_min) {
      toast({ title: "Error", description: "Revenue: Rango máximo debe ser mayor que mínimo", variant: "destructive" });
      return false;
    }
    if (formData.revenue_multiple <= 0) {
      toast({ title: "Error", description: "Revenue: Múltiplo debe ser positivo", variant: "destructive" });
      return false;
    }

    // Validar EBITDA
    if (formData.ebitda_range_max !== null && formData.ebitda_range_max <= formData.ebitda_range_min) {
      toast({ title: "Error", description: "EBITDA: Rango máximo debe ser mayor que mínimo", variant: "destructive" });
      return false;
    }
    if (formData.ebitda_multiple <= 0) {
      toast({ title: "Error", description: "EBITDA: Múltiplo debe ser positivo", variant: "destructive" });
      return false;
    }

    // Validar Net Profit
    if (formData.net_profit_range_max !== null && formData.net_profit_range_max <= formData.net_profit_range_min) {
      toast({ title: "Error", description: "Resultado Neto: Rango máximo debe ser mayor que mínimo", variant: "destructive" });
      return false;
    }
    if (formData.net_profit_multiple <= 0) {
      toast({ title: "Error", description: "Resultado Neto: Múltiplo debe ser positivo", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingRange) {
        const { error } = await supabase
          .from('advisor_valuation_multiples_by_range')
          .update(formData)
          .eq('id', editingRange.id);
        
        if (error) throw error;
        toast({ title: "✅ Rango actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from('advisor_valuation_multiples_by_range')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "✅ Rango creado correctamente" });
      }

      setFormData(emptyRange);
      setEditingRange(null);
      setShowForm(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (range: AdvisorMultipleByRange) => {
    setEditingRange(range);
    setFormData(range);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este rango de múltiplos?')) return;

    try {
      const { error } = await supabase
        .from('advisor_valuation_multiples_by_range')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "✅ Rango eliminado correctamente" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '∞';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  const groupedRanges = ranges.reduce((acc, range) => {
    if (!acc[range.sector_name]) {
      acc[range.sector_name] = [];
    }
    acc[range.sector_name].push(range);
    return acc;
  }, {} as Record<string, AdvisorMultipleByRange[]>);

  if (isLoading) {
    return <div className="p-6">Cargando rangos de múltiplos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-normal text-foreground">Múltiplos por Rangos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configura múltiplos específicos según tamaño de facturación, EBITDA y resultado neto
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyRange);
            setEditingRange(null);
            setShowForm(true);
          }}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Rango
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-normal text-foreground mb-4">
            {editingRange ? 'Editar Rango' : 'Nuevo Rango'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Sector</label>
                <SectorSelect
                  value={formData.sector_name}
                  onChange={(value) => setFormData({...formData, sector_name: value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Orden</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revenue">📊 Facturación</TabsTrigger>
                <TabsTrigger value="ebitda">💰 EBITDA</TabsTrigger>
                <TabsTrigger value="netprofit">📈 Resultado Neto</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Desde (€)</label>
                    <Input
                      type="number"
                      step="1000"
                      value={formData.revenue_range_min}
                      onChange={(e) => setFormData({...formData, revenue_range_min: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Hasta (€) <span className="text-xs">(vacío = ∞)</span>
                    </label>
                    <Input
                      type="number"
                      step="1000"
                      value={formData.revenue_range_max || ''}
                      onChange={(e) => setFormData({...formData, revenue_range_max: e.target.value ? parseFloat(e.target.value) : null})}
                      placeholder="Infinito"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Múltiplo (x)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.revenue_multiple}
                      onChange={(e) => setFormData({...formData, revenue_multiple: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ebitda" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Desde (€)</label>
                    <Input
                      type="number"
                      step="1000"
                      value={formData.ebitda_range_min}
                      onChange={(e) => setFormData({...formData, ebitda_range_min: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Hasta (€) <span className="text-xs">(vacío = ∞)</span>
                    </label>
                    <Input
                      type="number"
                      step="1000"
                      value={formData.ebitda_range_max || ''}
                      onChange={(e) => setFormData({...formData, ebitda_range_max: e.target.value ? parseFloat(e.target.value) : null})}
                      placeholder="Infinito"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Múltiplo (x)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.ebitda_multiple}
                      onChange={(e) => setFormData({...formData, ebitda_multiple: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="netprofit" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Desde (€)</label>
                    <Input
                      type="number"
                      step="1000"
                      value={formData.net_profit_range_min}
                      onChange={(e) => setFormData({...formData, net_profit_range_min: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Hasta (€) <span className="text-xs">(vacío = ∞)</span>
                    </label>
                    <Input
                      type="number"
                      step="1000"
                      value={formData.net_profit_range_max || ''}
                      onChange={(e) => setFormData({...formData, net_profit_range_max: e.target.value ? parseFloat(e.target.value) : null})}
                      placeholder="Infinito"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Múltiplo (x)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.net_profit_multiple}
                      onChange={(e) => setFormData({...formData, net_profit_multiple: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                placeholder="Notas sobre este rango..."
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-foreground">Activo</span>
              </label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="bg-primary text-primary-foreground">
                {editingRange ? 'Actualizar' : 'Crear'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingRange(null);
                  setFormData(emptyRange);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-6">
        {Object.entries(groupedRanges).map(([sectorName, sectorRanges]) => (
          <Card key={sectorName} className="p-6">
            <h3 className="text-xl font-normal text-foreground mb-4">{sectorName}</h3>
            <div className="space-y-4">
              {sectorRanges.sort((a, b) => a.display_order - b.display_order).map((range) => (
                <div key={range.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Orden: {range.display_order}</span>
                      {!range.is_active && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Inactivo</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(range)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(range.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-border rounded p-3">
                      <div className="text-xs text-muted-foreground mb-1">📊 Facturación</div>
                      <div className="font-semibold text-foreground">{range.revenue_multiple}x</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(range.revenue_range_min)} - {formatCurrency(range.revenue_range_max)}
                      </div>
                    </div>

                    <div className="border border-border rounded p-3 bg-primary/5">
                      <div className="text-xs text-muted-foreground mb-1">💰 EBITDA</div>
                      <div className="font-semibold text-foreground">{range.ebitda_multiple}x</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(range.ebitda_range_min)} - {formatCurrency(range.ebitda_range_max)}
                      </div>
                    </div>

                    <div className="border border-border rounded p-3">
                      <div className="text-xs text-muted-foreground mb-1">📈 Resultado Neto</div>
                      <div className="font-semibold text-foreground">{range.net_profit_multiple}x</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(range.net_profit_range_min)} - {formatCurrency(range.net_profit_range_max)}
                      </div>
                    </div>
                  </div>

                  {range.description && (
                    <p className="text-sm text-muted-foreground mt-3">{range.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        {Object.keys(groupedRanges).length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No hay rangos configurados. Crea el primero.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvisorMultiplesByRangeManager;
