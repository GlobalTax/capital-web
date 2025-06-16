
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  year: number;
  description: string;
  is_featured: boolean;
  is_active: boolean;
}

const OperationsManager = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const emptyOperation: Omit<Operation, 'id'> = {
    company_name: '',
    sector: '',
    valuation_amount: 0,
    valuation_currency: '€',
    year: new Date().getFullYear(),
    description: '',
    is_featured: false,
    is_active: true
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
    
    try {
      if (editingOperation) {
        const { error } = await supabase
          .from('company_operations')
          .update(formData)
          .eq('id', editingOperation.id);
        
        if (error) throw error;
        toast({ title: "Operación actualizada correctamente" });
      } else {
        const { error } = await supabase
          .from('company_operations')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Operación creada correctamente" });
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
    setFormData(operation);
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
                <Input
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Valoración (millones)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.valuation_amount}
                  onChange={(e) => setFormData({...formData, valuation_amount: parseFloat(e.target.value)})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Moneda</label>
                <Input
                  value={formData.valuation_currency}
                  onChange={(e) => setFormData({...formData, valuation_currency: e.target.value})}
                  className="border border-gray-300 rounded-lg"
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
                  <h3 className="text-lg font-bold text-black">{operation.company_name}</h3>
                  {operation.is_featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Destacado
                    </span>
                  )}
                  {!operation.is_active && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{operation.description}</p>
                <div className="text-sm text-gray-500">
                  <span className="mr-4">{operation.sector}</span>
                  <span className="mr-4">{operation.valuation_amount}M{operation.valuation_currency}</span>
                  <span>{operation.year}</span>
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
