import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ImageUploadField from './ImageUploadField';

interface CaseStudy {
  id: string;
  title: string;
  sector: string;
  company_size?: string;
  value_amount?: number;
  value_currency: string;
  description: string;
  highlights?: string[];
  year?: number;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  featured_image_url?: string;
  display_locations?: string[];
}

const availableLocations = [
  { value: 'home', label: 'Página Principal' },
  { value: 'casos-exito', label: 'Casos de Éxito' },
  { value: 'nosotros', label: 'Nosotros' },
  { value: 'venta-empresas', label: 'Venta de Empresas' },
  { value: 'compra-empresas', label: 'Compra de Empresas' },
  { value: 'servicios', label: 'Servicios' }
];

const CaseStudiesManager = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const emptyCase: Omit<CaseStudy, 'id'> = {
    title: '',
    sector: '',
    company_size: '',
    value_amount: undefined,
    value_currency: '€',
    description: '',
    highlights: [],
    year: new Date().getFullYear(),
    is_featured: false,
    is_active: true,
    logo_url: undefined,
    featured_image_url: undefined,
    display_locations: ['home', 'casos-exito']
  };

  const [formData, setFormData] = useState(emptyCase);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCaseStudies(data || []);
    } catch (error) {
      console.error('Error fetching case studies:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los casos de éxito.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        highlights: formData.highlights?.filter(h => h.trim() !== '') || []
      };

      if (editingCase) {
        const { error } = await supabase
          .from('case_studies')
          .update(dataToSubmit)
          .eq('id', editingCase.id);
        
        if (error) throw error;
        toast({ title: "Caso actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from('case_studies')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast({ title: "Caso creado correctamente" });
      }

      setFormData(emptyCase);
      setEditingCase(null);
      setShowForm(false);
      fetchCaseStudies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (caseStudy: CaseStudy) => {
    setEditingCase(caseStudy);
    setFormData({
      ...caseStudy,
      display_locations: caseStudy.display_locations || ['home', 'casos-exito']
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este caso?')) return;

    try {
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Caso eliminado correctamente" });
      fetchCaseStudies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, field: 'is_active' | 'is_featured', value: boolean) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      fetchCaseStudies();
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
    return <div className="p-6">Cargando casos de éxito...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Casos de Éxito</h2>
        <Button
          onClick={() => {
            setFormData(emptyCase);
            setEditingCase(null);
            setShowForm(true);
          }}
          className="bg-black text-white border border-black rounded-lg"
        >
          Nuevo Caso
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingCase ? 'Editar Caso' : 'Nuevo Caso'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                <label className="block text-sm font-medium text-black mb-2">Tamaño de Empresa</label>
                <Input
                  value={formData.company_size || ''}
                  onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Año</label>
                <Input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Valoración (millones)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.value_amount || ''}
                  onChange={(e) => setFormData({...formData, value_amount: parseFloat(e.target.value)})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Moneda</label>
                <Input
                  value={formData.value_currency}
                  onChange={(e) => setFormData({...formData, value_currency: e.target.value})}
                  className="border border-gray-300 rounded-lg"
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

            <div>
              <label className="block text-sm font-medium text-black mb-2">Ubicaciones donde mostrar</label>
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
                folder="case-studies/logos"
                placeholder="URL del logo o sube una imagen"
              />
              
              <ImageUploadField
                label="Imagen Destacada"
                value={formData.featured_image_url}
                onChange={(url) => setFormData({...formData, featured_image_url: url})}
                folder="case-studies/featured"
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
                {editingCase ? 'Actualizar' : 'Crear'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingCase(null);
                  setFormData(emptyCase);
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
        {caseStudies.map((caseStudy) => (
          <div key={caseStudy.id} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  {caseStudy.logo_url && (
                    <img
                      src={caseStudy.logo_url}
                      alt={`Logo ${caseStudy.title}`}
                      className="w-12 h-12 object-contain rounded"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-black">{caseStudy.title}</h3>
                    <div className="flex items-center space-x-2">
                      {caseStudy.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Destacado
                        </span>
                      )}
                      {!caseStudy.is_active && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{caseStudy.description}</p>
                <div className="text-sm text-gray-500 mb-2">
                  <span className="mr-4">{caseStudy.sector}</span>
                  {caseStudy.value_amount && (
                    <span className="mr-4">{caseStudy.value_amount}M{caseStudy.value_currency}</span>
                  )}
                  {caseStudy.year && <span>{caseStudy.year}</span>}
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Ubicaciones: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(caseStudy.display_locations || []).map((location) => {
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
                  onClick={() => handleEdit(caseStudy)}
                  className="border border-gray-300 rounded-lg"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleStatus(caseStudy.id, 'is_active', !caseStudy.is_active)}
                  className="border border-gray-300 rounded-lg"
                >
                  {caseStudy.is_active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(caseStudy.id)}
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

export default CaseStudiesManager;
