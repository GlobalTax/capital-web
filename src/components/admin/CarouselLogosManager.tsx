
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus, Edit, Save, X, MoveUp, MoveDown } from 'lucide-react';
import ImageUploadField from './ImageUploadField';

interface CarouselLogo {
  id: string;
  company_name: string;
  logo_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CarouselLogosManager = () => {
  const [logos, setLogos] = useState<CarouselLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CarouselLogo>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLogo, setNewLogo] = useState<Partial<CarouselLogo>>({
    company_name: '',
    logo_url: '',
    display_order: 0,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_logos')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error('Error fetching logos:', error);
      toast({
        title: "Error",
        description: "Error al cargar los logos del carrusel.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newLogo.company_name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la empresa es obligatorio.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('carousel_logos')
        .insert([newLogo]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Logo creado correctamente.",
      });
      
      setNewLogo({
        company_name: '',
        logo_url: '',
        display_order: 0,
        is_active: true
      });
      setShowAddForm(false);
      fetchLogos();
    } catch (error) {
      console.error('Error creating logo:', error);
      toast({
        title: "Error",
        description: "Error al crear el logo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('carousel_logos')
        .update(editForm)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Logo actualizado correctamente.",
      });
      
      setEditingId(null);
      setEditForm({});
      fetchLogos();
    } catch (error) {
      console.error('Error updating logo:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el logo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este logo?')) return;

    try {
      const { error } = await supabase
        .from('carousel_logos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Logo eliminado correctamente.",
      });
      
      fetchLogos();
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el logo.",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = async (logo: CarouselLogo) => {
    const newOrder = Math.max(1, logo.display_order - 1);
    await updateOrder(logo.id, newOrder);
  };

  const handleMoveDown = async (logo: CarouselLogo) => {
    const newOrder = logo.display_order + 1;
    await updateOrder(logo.id, newOrder);
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('carousel_logos')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      fetchLogos();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el orden.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (logo: CarouselLogo) => {
    setEditingId(logo.id);
    setEditForm({ ...logo });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-0.5 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Logos del Carrusel</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Logo
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-black">Nuevo Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nombre de la Empresa *
              </label>
              <Input
                value={newLogo.company_name || ''}
                onChange={(e) => setNewLogo({ ...newLogo, company_name: e.target.value })}
                className="border-0.5 border-black rounded-lg"
                placeholder="Nombre de la empresa"
              />
            </div>

            <ImageUploadField
              label="Logo"
              value={newLogo.logo_url || ''}
              onChange={(url) => setNewLogo({ ...newLogo, logo_url: url })}
              placeholder="URL del logo"
              bucketName="logos"
            />

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Orden de Visualización
              </label>
              <Input
                type="number"
                min="0"
                value={newLogo.display_order || 0}
                onChange={(e) => setNewLogo({ ...newLogo, display_order: parseInt(e.target.value) || 0 })}
                className="border-0.5 border-black rounded-lg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="newActive"
                checked={newLogo.is_active}
                onChange={(e) => setNewLogo({ ...newLogo, is_active: e.target.checked })}
                className="rounded border-0.5 border-black"
              />
              <label htmlFor="newActive" className="text-sm text-black">
                Activo
              </label>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreate}
                className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {logos.map((logo) => (
          <Card key={logo.id} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              {editingId === logo.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Nombre de la Empresa *
                    </label>
                    <Input
                      value={editForm.company_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                      className="border-0.5 border-black rounded-lg"
                    />
                  </div>

                  <ImageUploadField
                    label="Logo"
                    value={editForm.logo_url || ''}
                    onChange={(url) => setEditForm({ ...editForm, logo_url: url })}
                    placeholder="URL del logo"
                    bucketName="logos"
                  />

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Orden de Visualización
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.display_order || 0}
                      onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                      className="border-0.5 border-black rounded-lg"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`active-${logo.id}`}
                      checked={editForm.is_active}
                      onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                      className="rounded border-0.5 border-black"
                    />
                    <label htmlFor={`active-${logo.id}`} className="text-sm text-black">
                      Activo
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleUpdate(logo.id)}
                      className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={cancelEdit}
                      className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {logo.logo_url && (
                      <img 
                        src={logo.logo_url} 
                        alt={logo.company_name}
                        className="h-12 w-auto object-contain"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-black">{logo.company_name}</h3>
                      <p className="text-sm text-gray-600">
                        Orden: {logo.display_order} | {logo.is_active ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveUp(logo)}
                      className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <MoveUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveDown(logo)}
                      className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <MoveDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(logo)}
                      className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(logo.id)}
                      className="text-red-600 border-red-500 hover:bg-red-50 border-0.5 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {logos.length === 0 && (
        <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No hay logos configurados aún.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CarouselLogosManager;
