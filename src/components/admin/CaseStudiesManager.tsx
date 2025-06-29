
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CaseStudyPreview from './preview/CaseStudyPreview';
import SectorSelect from './shared/SectorSelect';

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
    
    const isDraft = !formData.display_locations || formData.display_locations.length === 0;
    const dataToSubmit = {
      ...formData,
      highlights: formData.highlights?.filter(h => h.trim() !== '') || [],
      is_active: !isDraft,
      display_locations: formData.display_locations || []
    };

    try {
      if (editingCase) {
        const { error } = await supabase
          .from('case_studies')
          .update(dataToSubmit)
          .eq('id', editingCase.id);
        
        if (error) throw error;
        toast({ 
          title: isDraft ? "Caso guardado como borrador" : "Caso actualizado correctamente" 
        });
      } else {
        const { error } = await supabase
          .from('case_studies')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast({ 
          title: isDraft ? "Caso creado como borrador" : "Caso creado correctamente" 
        });
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
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-title"></div>
          <div className="admin-loading-card h-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-flex-between">
        <div>
          <h2 className="admin-title">Gestión de Casos de Éxito</h2>
          <p className="admin-text mt-1">Administra los casos de éxito de la empresa</p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyCase);
            setEditingCase(null);
            setShowForm(true);
          }}
          className="admin-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nuevo Caso
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-section">
          <div className="admin-flex-between mb-6">
            <h3 className="admin-subtitle">
              {editingCase ? 'Editar Caso' : 'Nuevo Caso'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="admin-input"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Sector</label>
                <SectorSelect
                  value={formData.sector}
                  onChange={(value) => setFormData({...formData, sector: value})}
                  required
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Tamaño de Empresa</label>
                <Input
                  value={formData.company_size || ''}
                  onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                  className="admin-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Año</label>
                <Input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Valoración (millones)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.value_amount || ''}
                  onChange={(e) => setFormData({...formData, value_amount: parseFloat(e.target.value)})}
                  className="admin-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Moneda</label>
                <Input
                  value={formData.value_currency}
                  onChange={(e) => setFormData({...formData, value_currency: e.target.value})}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="admin-textarea"
                rows={3}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">
                Ubicaciones donde mostrar
                <span className="admin-text-sm ml-2">(Si no seleccionas ninguna, se guardará como borrador)</span>
              </label>
              <div className="admin-grid-3">
                {availableLocations.map((location) => (
                  <label key={location.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.display_locations?.includes(location.value) || false}
                      onChange={(e) => handleLocationChange(location.value, e.target.checked)}
                      className="rounded"
                    />
                    <span className="admin-text-sm">{location.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="admin-form-row">
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

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="mr-2"
                />
                <span className="admin-text-sm">Destacado</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <span className="admin-text-sm">Activo</span>
              </label>
            </div>

            <div className="admin-form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingCase(null);
                  setFormData(emptyCase);
                }}
                className="admin-btn-secondary"
              >
                Cancelar
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="admin-btn-secondary"
                  >
                    <Eye className="h-4 w-4" />
                    Previsualizar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Previsualización</DialogTitle>
                  </DialogHeader>
                  <CaseStudyPreview caseStudy={formData} />
                </DialogContent>
              </Dialog>
              <Button
                type="submit"
                className="admin-btn-primary"
              >
                {editingCase ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Cases List */}
      <div className="admin-space-y">
        {caseStudies.map((caseStudy) => (
          <div key={caseStudy.id} className="admin-card">
            <div className="admin-card-body">
              <div className="admin-flex-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    {caseStudy.logo_url && (
                      <img
                        src={caseStudy.logo_url}
                        alt={`Logo ${caseStudy.title}`}
                        className="w-12 h-12 object-contain rounded border border-gray-200"
                      />
                    )}
                    <div>
                      <h3 className="admin-subtitle">{caseStudy.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {caseStudy.is_featured && (
                          <span className="admin-badge-warning">Destacado</span>
                        )}
                        {!caseStudy.is_active && (
                          <span className="admin-badge-info">Borrador</span>
                        )}
                        {(!caseStudy.display_locations || caseStudy.display_locations.length === 0) && (
                          <span className="admin-badge-danger">Sin ubicaciones</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="admin-text mb-3">{caseStudy.description}</p>
                  <div className="admin-text-sm mb-3">
                    <span className="mr-4">{caseStudy.sector}</span>
                    {caseStudy.value_amount && (
                      <span className="mr-4">{caseStudy.value_amount}M{caseStudy.value_currency}</span>
                    )}
                    {caseStudy.year && <span>{caseStudy.year}</span>}
                  </div>
                  <div className="mb-3">
                    <span className="admin-text-sm font-medium">Ubicaciones: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(caseStudy.display_locations || []).map((location) => {
                        const locationLabel = availableLocations.find(loc => loc.value === location)?.label || location;
                        return (
                          <span key={location} className="admin-badge-info">
                            {locationLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(caseStudy.id, 'is_active', !caseStudy.is_active)}
                    className="admin-btn-sm admin-btn-secondary"
                  >
                    {caseStudy.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(caseStudy)}
                    className="admin-btn-sm admin-btn-secondary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(caseStudy.id)}
                    className="admin-btn-sm text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudiesManager;
