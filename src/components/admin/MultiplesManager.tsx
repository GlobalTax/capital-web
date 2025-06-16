import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import MultiplePreview from './preview/MultiplePreview';

interface Multiple {
  id: string;
  sector_name: string;
  multiple_range: string;
  median_multiple: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  display_locations?: string[];
}

const availableLocations = [
  { value: 'home', label: 'Página Principal' },
  { value: 'multiplos', label: 'Múltiplos' },
  { value: 'calculadora-valoracion', label: 'Calculadora de Valoración' },
  { value: 'servicios', label: 'Servicios' }
];

const MultiplesManager = () => {
  const [multiples, setMultiples] = useState<Multiple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMultiple, setEditingMultiple] = useState<Multiple | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const emptyMultiple: Omit<Multiple, 'id'> = {
    sector_name: '',
    multiple_range: '',
    median_multiple: '',
    description: '',
    display_order: 0,
    is_active: true,
    display_locations: ['home', 'multiplos']
  };

  const [formData, setFormData] = useState(emptyMultiple);

  useEffect(() => {
    fetchMultiples();
  }, []);

  const fetchMultiples = async () => {
    try {
      const { data, error } = await supabase
        .from('sector_valuation_multiples')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setMultiples(data || []);
    } catch (error) {
      console.error('Error fetching multiples:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los múltiplos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMultiple) {
        const { error } = await supabase
          .from('sector_valuation_multiples')
          .update(formData)
          .eq('id', editingMultiple.id);
        
        if (error) throw error;
        toast({ title: "Múltiplo actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from('sector_valuation_multiples')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Múltiplo creado correctamente" });
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

  const handleEdit = (multiple: Multiple) => {
    setEditingMultiple(multiple);
    setFormData({
      ...multiple,
      display_locations: multiple.display_locations || ['home', 'multiplos']
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este múltiplo?')) return;

    try {
      const { error } = await supabase
        .from('sector_valuation_multiples')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Múltiplo eliminado correctamente" });
      fetchMultiples();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const currentLocations = formData.display_locations || [];
    if (checked) {
      setFormData({
        ...formData,
        display_locations: [...currentLocations, location]
      });
    } else {
      setFormData({
        ...formData,
        display_locations: currentLocations.filter(loc => loc !== location)
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Cargando múltiplos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Múltiplos por Sector</h2>
        <Button
          onClick={() => {
            setFormData(emptyMultiple);
            setEditingMultiple(null);
            setShowForm(true);
          }}
          className="bg-black text-white border border-black rounded-lg"
        >
          Nuevo Múltiplo
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingMultiple ? 'Editar Múltiplo' : 'Nuevo Múltiplo'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Sector</label>
                <Input
                  value={formData.sector_name}
                  onChange={(e) => setFormData({...formData, sector_name: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Rango (ej: 3.6x - 8.3x)</label>
                <Input
                  value={formData.multiple_range}
                  onChange={(e) => setFormData({...formData, multiple_range: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Mediana (ej: 7.2x)</label>
                <Input
                  value={formData.median_multiple}
                  onChange={(e) => setFormData({...formData, median_multiple: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Orden de Visualización</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Descripción</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Ubicaciones donde mostrar</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableLocations.map((location) => (
                  <label key={location.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.display_locations?.includes(location.value) || false}
                      onChange={(e) => handleLocationChange(location.value, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{location.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                Activo
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="bg-black text-white border border-black rounded-lg"
              >
                {editingMultiple ? 'Actualizar' : 'Crear'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-gray-300 rounded-lg"
                  >
                    Previsualizar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Previsualización</DialogTitle>
                  </DialogHeader>
                  <MultiplePreview multiple={formData} />
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
                className="border border-gray-300 rounded-lg"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {multiples.map((multiple) => (
          <div key={multiple.id} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-lg font-bold text-black">{multiple.sector_name}</h3>
                  {!multiple.is_active && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Inactivo
                    </span>
                  )}
                </div>
                <div className="text-gray-600 mb-2">
                  <span className="font-semibold text-black mr-2">{multiple.median_multiple}</span>
                  <span className="text-sm">({multiple.multiple_range})</span>
                </div>
                {multiple.description && (
                  <p className="text-gray-600 mb-2">{multiple.description}</p>
                )}
                <div className="text-sm text-gray-500 mb-2">
                  Orden: {multiple.display_order}
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Ubicaciones: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(multiple.display_locations || []).map((location) => {
                      const locationLabel = availableLocations.find(loc => loc.value === location)?.label || location;
                      return (
                        <span key={location} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {locationLabel}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(multiple)}
                  className="border border-gray-300 rounded-lg"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(multiple.id)}
                  className="border border-red-300 text-red-600 rounded-lg"
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

export default MultiplesManager;
