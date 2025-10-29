import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Settings } from 'lucide-react';
import AdvisorMultiplePreview from './preview/AdvisorMultiplePreview';
import SectorSelect from './shared/SectorSelect';

interface AdvisorMultiple {
  id: string;
  sector_name: string;
  revenue_multiple_min: number;
  revenue_multiple_max: number;
  revenue_multiple_median: number;
  ebitda_multiple_min: number;
  ebitda_multiple_max: number;
  ebitda_multiple_median: number;
  net_profit_multiple_min: number;
  net_profit_multiple_max: number;
  net_profit_multiple_median: number;
  description?: string;
  display_order: number;
  is_active: boolean;
}

const AdvisorMultiplesManager = () => {
  const [multiples, setMultiples] = useState<AdvisorMultiple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMultiple, setEditingMultiple] = useState<AdvisorMultiple | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const emptyMultiple: Omit<AdvisorMultiple, 'id'> = {
    sector_name: '',
    revenue_multiple_min: 0,
    revenue_multiple_max: 0,
    revenue_multiple_median: 0,
    ebitda_multiple_min: 0,
    ebitda_multiple_max: 0,
    ebitda_multiple_median: 0,
    net_profit_multiple_min: 0,
    net_profit_multiple_max: 0,
    net_profit_multiple_median: 0,
    description: '',
    display_order: 0,
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyMultiple);

  useEffect(() => {
    fetchMultiples();
  }, []);

  const fetchMultiples = async () => {
    try {
      const { data, error } = await supabase
        .from('advisor_valuation_multiples')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setMultiples(data || []);
    } catch (error) {
      console.error('Error fetching advisor multiples:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los múltiplos de asesores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    // Validar Revenue
    if (formData.revenue_multiple_min >= formData.revenue_multiple_median) {
      toast({ title: "Error", description: "Revenue: Mínimo debe ser menor que Mediana", variant: "destructive" });
      return false;
    }
    if (formData.revenue_multiple_median >= formData.revenue_multiple_max) {
      toast({ title: "Error", description: "Revenue: Mediana debe ser menor que Máximo", variant: "destructive" });
      return false;
    }

    // Validar EBITDA
    if (formData.ebitda_multiple_min >= formData.ebitda_multiple_median) {
      toast({ title: "Error", description: "EBITDA: Mínimo debe ser menor que Mediana", variant: "destructive" });
      return false;
    }
    if (formData.ebitda_multiple_median >= formData.ebitda_multiple_max) {
      toast({ title: "Error", description: "EBITDA: Mediana debe ser menor que Máximo", variant: "destructive" });
      return false;
    }

    // Validar Net Profit
    if (formData.net_profit_multiple_min >= formData.net_profit_multiple_median) {
      toast({ title: "Error", description: "Resultado Neto: Mínimo debe ser menor que Mediana", variant: "destructive" });
      return false;
    }
    if (formData.net_profit_multiple_median >= formData.net_profit_multiple_max) {
      toast({ title: "Error", description: "Resultado Neto: Mediana debe ser menor que Máximo", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingMultiple) {
        const { error } = await supabase
          .from('advisor_valuation_multiples')
          .update(formData)
          .eq('id', editingMultiple.id);
        
        if (error) throw error;
        toast({ title: "Múltiplo de asesor actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from('advisor_valuation_multiples')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Múltiplo de asesor creado correctamente" });
      }

      setFormData(emptyMultiple);
      setEditingMultiple(null);
      setShowForm(false);
      fetchMultiples();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (multiple: AdvisorMultiple) => {
    setEditingMultiple(multiple);
    setFormData(multiple);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este múltiplo de asesor?')) return;

    try {
      const { error } = await supabase
        .from('advisor_valuation_multiples')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Múltiplo de asesor eliminado correctamente" });
      fetchMultiples();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Cargando múltiplos de asesores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Múltiplos para Asesores</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestión de múltiplos de valoración por Facturación, EBITDA y Resultado Neto</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/admin/advisor-multiples-ranges')}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar Rangos
          </Button>
          <Button
            onClick={() => {
              setFormData(emptyMultiple);
              setEditingMultiple(null);
              setShowForm(true);
            }}
            className="bg-primary text-primary-foreground"
          >
            Nuevo Múltiplo
          </Button>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-medium text-foreground mb-1">💡 Sistema de Rangos Avanzado</p>
            <p className="text-sm text-muted-foreground">
              Para valoraciones más precisas, configura múltiplos específicos según el tamaño de la empresa. 
              Los rangos permiten aplicar múltiplos diferentes según facturación, EBITDA o resultado neto.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/admin/advisor-multiples-ranges')}
            size="sm"
            className="bg-primary text-primary-foreground whitespace-nowrap"
          >
            Configurar Rangos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </AlertDescription>
      </Alert>

      {showForm && (
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {editingMultiple ? 'Editar Múltiplo de Asesor' : 'Nuevo Múltiplo de Asesor'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sector y configuración */}
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
                  className="border-border"
                />
              </div>
            </div>

            {/* Múltiplo de Facturación */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                📊 Múltiplo de Facturación
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Mínimo</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.revenue_multiple_min}
                    onChange={(e) => setFormData({...formData, revenue_multiple_min: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Mediana</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.revenue_multiple_median}
                    onChange={(e) => setFormData({...formData, revenue_multiple_median: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Máximo</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.revenue_multiple_max}
                    onChange={(e) => setFormData({...formData, revenue_multiple_max: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Múltiplo de EBITDA */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                💰 Múltiplo de EBITDA
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Peso: 50%</span>
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Mínimo</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.ebitda_multiple_min}
                    onChange={(e) => setFormData({...formData, ebitda_multiple_min: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Mediana</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.ebitda_multiple_median}
                    onChange={(e) => setFormData({...formData, ebitda_multiple_median: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Máximo</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.ebitda_multiple_max}
                    onChange={(e) => setFormData({...formData, ebitda_multiple_max: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Múltiplo de Resultado Neto */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                📈 Múltiplo de Resultado Neto
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Mínimo</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.net_profit_multiple_min}
                    onChange={(e) => setFormData({...formData, net_profit_multiple_min: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Mediana</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.net_profit_multiple_median}
                    onChange={(e) => setFormData({...formData, net_profit_multiple_median: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Máximo</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.net_profit_multiple_max}
                    onChange={(e) => setFormData({...formData, net_profit_multiple_max: parseFloat(e.target.value)})}
                    className="border-border"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border-border"
                rows={2}
                placeholder="Notas adicionales sobre este sector..."
              />
            </div>

            {/* Activo */}
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

            {/* Botones */}
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
              >
                {editingMultiple ? 'Actualizar' : 'Crear'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border"
                  >
                    Previsualizar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Previsualización de Múltiplos</DialogTitle>
                  </DialogHeader>
                  <AdvisorMultiplePreview multiple={formData} />
                </DialogContent>
              </Dialog>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingMultiple(null);
                  setFormData(emptyMultiple);
                }}
                className="border-border"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de múltiplos */}
      <div className="grid grid-cols-1 gap-4">
        {multiples.map((multiple) => (
          <div key={multiple.id} className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <h3 className="text-lg font-bold text-foreground">{multiple.sector_name}</h3>
                  {!multiple.is_active && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Inactivo
                    </span>
                  )}
                </div>
                
                {/* Tabla de múltiplos */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="border border-border rounded p-3">
                    <div className="text-xs text-muted-foreground mb-1">Facturación</div>
                    <div className="font-semibold text-foreground">{multiple.revenue_multiple_median}x</div>
                    <div className="text-xs text-muted-foreground">
                      {multiple.revenue_multiple_min}x - {multiple.revenue_multiple_max}x
                    </div>
                  </div>
                  
                  <div className="border border-border rounded p-3 bg-primary/5">
                    <div className="text-xs text-muted-foreground mb-1">EBITDA</div>
                    <div className="font-semibold text-foreground">{multiple.ebitda_multiple_median}x</div>
                    <div className="text-xs text-muted-foreground">
                      {multiple.ebitda_multiple_min}x - {multiple.ebitda_multiple_max}x
                    </div>
                  </div>
                  
                  <div className="border border-border rounded p-3">
                    <div className="text-xs text-muted-foreground mb-1">Resultado Neto</div>
                    <div className="font-semibold text-foreground">{multiple.net_profit_multiple_median}x</div>
                    <div className="text-xs text-muted-foreground">
                      {multiple.net_profit_multiple_min}x - {multiple.net_profit_multiple_max}x
                    </div>
                  </div>
                </div>
                
                {multiple.description && (
                  <p className="text-sm text-muted-foreground mb-2">{multiple.description}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  Orden: {multiple.display_order}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(multiple)}
                  className="border-border"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(multiple.id)}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvisorMultiplesManager;
