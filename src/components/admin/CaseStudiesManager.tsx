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
import LegalCard from '../ui/LegalCard';

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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="loading-title"></div>
          <div className="loading-card h-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="page-title">Gestión de Casos de Éxito</h2>
          <p className="page-subtitle mt-1">Administra los casos de éxito de la empresa</p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyCase);
            setEditingCase(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nuevo Caso
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <LegalCard className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title">
                {editingCase ? 'Editar Caso' : 'Nuevo Caso'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="dashboard-grid-2">
                <div className="space-y-2">
                  <label className="form-label">Título</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Sector</label>
                  <SectorSelect
                    value={formData.sector}
                    onChange={(value) => setFormData({...formData, sector: value})}
                    required
                  />
                </div>
              </div>

              <div className="dashboard-grid-2">
                <div className="space-y-2">
                  <label className="form-label">Tamaño de Empresa</label>
                  <Input
                    value={formData.company_size || ''}
                    onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Año</label>
                  <Input
                    type="number"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="dashboard-grid-2">
                <div className="space-y-2">
                  <label className="form-label">Valoración (millones)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.value_amount || ''}
                    onChange={(e) => setFormData({...formData, value_amount: parseFloat(e.target.value)})}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Moneda</label>
                  <Input
                    value={formData.value_currency}
                    onChange={(e) => setFormData({...formData, value_currency: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">
                  Ubicaciones donde mostrar
                  <span className="metadata-text ml-2">(Si no seleccionas ninguna, se guardará como borrador)</span>
                </label>
                <div className="dashboard-grid-3">
                  {availableLocations.map((location) => (
                    <label key={location.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.display_locations?.includes(location.value) || false}
                        onChange={(e) => handleLocationChange(location.value, e.target.checked)}
                        className="rounded"
                      />
                      <span className="metadata-text">{location.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="dashboard-grid-2">
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
                  <span className="metadata-text">Destacado</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="metadata-text">Activo</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCase(null);
                    setFormData(emptyCase);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="btn-secondary"
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
                  className="btn-primary"
                >
                  {editingCase ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </LegalCard>
      )}

      {/* Cases List */}
      <div className="space-y-4">
        {caseStudies.map((caseStudy) => (
          <LegalCard key={caseStudy.id}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    {caseStudy.logo_url && (
                      <img
                        src={caseStudy.logo_url}
                        alt={`Logo ${caseStudy.title}`}
                        className="w-12 h-12 object-contain rounded border border-slate-200"
                      />
                    )}
                    <div>
                      <h3 className="section-title">{caseStudy.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {caseStudy.is_featured && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Destacado
                          </span>
                        )}
                        {!caseStudy.is_active && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Borrador
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="body-text mb-3">{caseStudy.description}</p>
                  <div className="metadata-text mb-3">
                    <span className="mr-4">{caseStudy.sector}</span>
                    {caseStudy.value_amount && (
                      <span className="mr-4">{caseStudy.value_amount}M{caseStudy.value_currency}</span>
                    )}
                    {caseStudy.year && <span>{caseStudy.year}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(caseStudy.id, 'is_active', !caseStudy.is_active)}
                    className="btn-secondary"
                  >
                    {caseStudy.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(caseStudy)}
                    className="btn-secondary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(caseStudy.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </LegalCard>
        ))}
      </div>
    </div>
  );
};

export default CaseStudiesManager;
