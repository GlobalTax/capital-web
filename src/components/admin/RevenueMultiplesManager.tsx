import React, { useState } from 'react';
import { useAdvisorRevenueMultiplesByRange, AdvisorRevenueMultiple } from '@/hooks/useAdvisorRevenueMultiplesByRange';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import SectorSelect from './shared/SectorSelect';
import { Pencil, Trash2, Plus } from 'lucide-react';

const RevenueMultiplesManager = () => {
  const { ranges, isLoading, refetch } = useAdvisorRevenueMultiplesByRange();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingRange, setEditingRange] = useState<AdvisorRevenueMultiple | null>(null);

  const emptyRange: Omit<AdvisorRevenueMultiple, 'id'> = {
    sector_name: '',
    range_min: 0,
    range_max: null,
    multiple: 1.0,
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
    if (formData.range_max !== null && formData.range_max <= formData.range_min) {
      toast({ title: "Error", description: "Rango máximo debe ser mayor que mínimo", variant: "destructive" });
      return false;
    }
    if (formData.multiple <= 0) {
      toast({ title: "Error", description: "Múltiplo debe ser positivo", variant: "destructive" });
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
          .from('advisor_revenue_multiples_by_range')
          .update(formData)
          .eq('id', editingRange.id);
        
        if (error) throw error;
        toast({ title: "✅ Rango actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from('advisor_revenue_multiples_by_range')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "✅ Rango creado correctamente" });
      }

      setFormData(emptyRange);
      setEditingRange(null);
      setShowForm(false);
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este rango?')) return;

    try {
      const { error } = await supabase
        .from('advisor_revenue_multiples_by_range')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "✅ Rango eliminado" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '∞';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  const groupedRanges = ranges.reduce((acc, range) => {
    if (!acc[range.sector_name]) acc[range.sector_name] = [];
    acc[range.sector_name].push(range);
    return acc;
  }, {} as Record<string, AdvisorRevenueMultiple[]>);

  if (isLoading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">📊 Múltiplos por Facturación</h3>
          <p className="text-sm text-muted-foreground">Configura múltiplos según el volumen de facturación</p>
        </div>
        <Button onClick={() => { setFormData(emptyRange); setEditingRange(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Rango
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">{editingRange ? 'Editar Rango' : 'Nuevo Rango'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Sector</label>
                <SectorSelect value={formData.sector_name} onChange={(value) => setFormData({...formData, sector_name: value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Desde (€)</label>
                <Input type="number" step="1000" value={formData.range_min} onChange={(e) => setFormData({...formData, range_min: parseFloat(e.target.value) || 0})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hasta (€) <span className="text-xs text-muted-foreground">(vacío = ∞)</span></label>
                <Input type="number" step="1000" value={formData.range_max || ''} onChange={(e) => setFormData({...formData, range_max: e.target.value ? parseFloat(e.target.value) : null})} placeholder="Infinito" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Múltiplo (x)</label>
                <Input type="number" step="0.1" value={formData.multiple} onChange={(e) => setFormData({...formData, multiple: parseFloat(e.target.value)})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Orden</label>
                <Input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} />
            </div>
            <div className="flex items-center">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="mr-2" />
              <span className="text-sm">Activo</span>
            </div>
            <div className="flex space-x-4">
              <Button type="submit">{editingRange ? 'Actualizar' : 'Crear'}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingRange(null); setFormData(emptyRange); }}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {Object.entries(groupedRanges).map(([sectorName, sectorRanges]) => (
          <Card key={sectorName} className="p-4">
            <h4 className="font-bold mb-3">{sectorName}</h4>
            {sectorRanges.sort((a, b) => a.display_order - b.display_order).map((range) => (
              <div key={range.id} className="flex justify-between items-center border-b py-2 last:border-0">
                <div>
                  <div className="font-semibold">{range.multiple}x</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(range.range_min)} - {formatCurrency(range.range_max)}</div>
                  {range.description && <div className="text-xs text-muted-foreground">{range.description}</div>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingRange(range); setFormData(range); setShowForm(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(range.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </Card>
        ))}
        {Object.keys(groupedRanges).length === 0 && <Card className="p-8 text-center text-muted-foreground">No hay rangos configurados</Card>}
      </div>
    </div>
  );
};

export default RevenueMultiplesManager;
