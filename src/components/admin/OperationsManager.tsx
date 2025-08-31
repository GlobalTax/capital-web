import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ImageUploadField from './ImageUploadField';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import OperationPreview from './preview/OperationPreview';
import SectorSelect from './shared/SectorSelect';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  year: number;
  description: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  featured_image_url?: string;
  display_locations?: string[];
  revenue_amount?: number;
  ebitda_amount?: number;
  growth_percentage?: number;
  company_size_employees?: string;
  short_description?: string;
  highlights?: string[];
  status?: string;
  deal_type?: string;
}

const availableLocations = [
  { value: 'home', label: 'Página Principal' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'venta-empresas', label: 'Venta de Empresas' },
  { value: 'compra-empresas', label: 'Compra de Empresas' },
  { value: 'servicios', label: 'Servicios' }
];

const OperationsManager = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const emptyOperation: Omit<Operation, 'id'> = {
    company_name: '',
    sector: '',
    year: new Date().getFullYear(),
    description: '',
    is_featured: false,
    is_active: true,
    logo_url: undefined,
    featured_image_url: undefined,
    display_locations: ['home', 'operaciones'],
    revenue_amount: 0,
    ebitda_amount: 0,
    growth_percentage: 0,
    company_size_employees: '',
    short_description: '',
    highlights: [],
    status: 'available',
    deal_type: 'sale'
  };

  const [formData, setFormData] = useState(emptyOperation);

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('company_operations')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Error fetching operations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las operaciones.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si no hay ubicaciones seleccionadas, marcar como inactivo (borrador)
    const isDraft = !formData.display_locations || formData.display_locations.length === 0;
    const dataToSubmit = {
      ...formData,
      is_active: !isDraft,
      display_locations: formData.display_locations || [],
      // Add default values for database required fields we don't want in the form
      valuation_amount: 0,
      valuation_currency: '€',
      ebitda_multiple: null
    };
    
    try {
      if (editingOperation) {
        const { error } = await supabase
          .from('company_operations')
          .update(dataToSubmit)
          .eq('id', editingOperation.id);
        
        if (error) throw error;
        toast({ 
          title: isDraft ? "Operación guardada como borrador" : "Operación actualizada correctamente" 
        });
      } else {
        const { error } = await supabase
          .from('company_operations')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast({ 
          title: isDraft ? "Operación creada como borrador" : "Operación creada correctamente" 
        });
      }

      setFormData(emptyOperation);
      setEditingOperation(null);
      setShowForm(false);
      fetchOperations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation);
    setFormData({
      ...operation,
      display_locations: operation.display_locations || ['home', 'operaciones']
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta operación?')) return;

    try {
      const { error } = await supabase
        .from('company_operations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Operación eliminada correctamente" });
      fetchOperations();
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
    return <div className="p-6">Cargando operaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Operaciones</h2>
        <Button
          onClick={() => {
            setFormData(emptyOperation);
            setEditingOperation(null);
            setShowForm(true);
          }}
          className="bg-black text-white border border-black rounded-lg"
        >
          Nueva Operación
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingOperation ? 'Editar Operación' : 'Nueva Operación'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Nombre de la Empresa</label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Sector</label>
                <SectorSelect
                  value={formData.sector}
                  onChange={(value) => setFormData({...formData, sector: value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Año</label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Campos Financieros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Facturación (millones)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.revenue_amount || ''}
                  onChange={(e) => setFormData({...formData, revenue_amount: parseFloat(e.target.value) || 0})}
                  className="border border-gray-300 rounded-lg"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">EBITDA (millones)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.ebitda_amount || ''}
                  onChange={(e) => setFormData({...formData, ebitda_amount: parseFloat(e.target.value) || 0})}
                  className="border border-gray-300 rounded-lg"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Crecimiento (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.growth_percentage || ''}
                  onChange={(e) => setFormData({...formData, growth_percentage: parseFloat(e.target.value) || 0})}
                  className="border border-gray-300 rounded-lg"
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Información Adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Tamaño de Empresa (empleados)</label>
                <Input
                  value={formData.company_size_employees || ''}
                  onChange={(e) => setFormData({...formData, company_size_employees: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                  placeholder="Ej: 50-100, 100-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Estado</label>
                <select
                  value={formData.status || 'available'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="available">Disponible</option>
                  <option value="in_negotiation">En negociación</option>
                  <option value="sold">Vendida</option>
                  <option value="reserved">Reservada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Descripción Corta</label>
              <Input
                value={formData.short_description || ''}
                onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                className="border border-gray-300 rounded-lg"
                placeholder="Descripción breve para listados"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border border-gray-300 rounded-lg"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Ubicaciones donde mostrar
                <span className="text-sm text-gray-500 ml-2">(Si no seleccionas ninguna, se guardará como borrador)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploadField
                label="Logo de la Empresa"
                value={formData.logo_url}
                onChange={(url) => setFormData({...formData, logo_url: url})}
                folder="operations/logos"
                placeholder="URL del logo o sube una imagen"
              />
              
              <ImageUploadField
                label="Imagen Destacada"
                value={formData.featured_image_url}
                onChange={(url) => setFormData({...formData, featured_image_url: url})}
                folder="operations/featured"
                placeholder="URL de la imagen destacada o sube una imagen"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="mr-2"
                />
                Destacado
              </label>
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
                {editingOperation ? 'Actualizar' : 'Crear'}
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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Previsualización</DialogTitle>
                  </DialogHeader>
                  <OperationPreview operation={formData} />
                </DialogContent>
              </Dialog>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingOperation(null);
                  setFormData(emptyOperation);
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
        {operations.map((operation) => (
          <div key={operation.id} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  {operation.logo_url && (
                    <img
                      src={operation.logo_url}
                      alt={`Logo ${operation.company_name}`}
                      className="w-12 h-12 object-contain rounded"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-black">{operation.company_name}</h3>
                    <div className="flex items-center space-x-2">
                      {operation.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Destacado
                        </span>
                      )}
                      {!operation.is_active && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Borrador
                        </span>
                      )}
                      {(!operation.display_locations || operation.display_locations.length === 0) && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Sin ubicaciones
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{operation.description}</p>
                <div className="text-sm text-gray-500">
                  <span className="mr-4">{operation.sector}</span>
                  <span className="mr-4">{operation.year}</span>
                  {operation.revenue_amount && operation.revenue_amount > 0 && (
                    <span className="mr-4">Facturación: {operation.revenue_amount}M€</span>
                  )}
                  {operation.ebitda_amount && operation.ebitda_amount > 0 && (
                    <span className="mr-4">EBITDA: {operation.ebitda_amount}M€</span>
                  )}
                  {operation.growth_percentage && operation.growth_percentage > 0 && (
                    <span className="mr-4">Crecimiento: {operation.growth_percentage}%</span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Ubicaciones: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(operation.display_locations || []).map((location) => {
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
                  onClick={() => handleEdit(operation)}
                  className="border border-gray-300 rounded-lg"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(operation.id)}
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

export default OperationsManager;
