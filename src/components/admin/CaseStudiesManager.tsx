import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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
import { Plus, X, Pencil, Trash2, BarChart3, Eye, EyeOff, Star } from 'lucide-react';

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
  is_value_confidential?: boolean;
  logo_url?: string;
  featured_image_url?: string;
  display_locations?: string[];
  display_order?: number;
}

const availableLocations = [
  { value: 'home', label: 'Página Principal' },
  { value: 'casos-exito', label: 'Casos de Éxito' },
  { value: 'nosotros', label: 'Nosotros' },
  { value: 'venta-empresas', label: 'Venta de Empresas' },
  { value: 'compra-empresas', label: 'Compra de Empresas' },
  { value: 'servicios', label: 'Servicios' }
];

const commonHighlights = [
  'Valoración 12x ARR',
  'Due diligence tecnológica',
  'Estructuración fiscal optimizada',
  'Múltiplo de 8x EBITDA',
  'ROI del 300%',
  'Proceso completado en 6 meses',
  'Buyer internacional',
  'Sinergias operativas',
  'Incremento de valor 40%',
  'Exit estratégico'
];

type FilterTab = 'all' | 'active' | 'inactive';

const CaseStudiesManager = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
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
    is_value_confidential: false,
    logo_url: undefined,
    featured_image_url: undefined,
    display_locations: ['home', 'casos-exito'],
    display_order: 0
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
        .order('display_order', { ascending: true })
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

  // Stats
  const stats = useMemo(() => ({
    total: caseStudies.length,
    active: caseStudies.filter(c => c.is_active).length,
    inactive: caseStudies.filter(c => !c.is_active).length,
    featured: caseStudies.filter(c => c.is_featured).length,
  }), [caseStudies]);

  // Filtered list
  const filteredCases = useMemo(() => {
    if (activeTab === 'active') return caseStudies.filter(c => c.is_active);
    if (activeTab === 'inactive') return caseStudies.filter(c => !c.is_active);
    return caseStudies;
  }, [caseStudies, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isDraft = !formData.display_locations || formData.display_locations.length === 0;
    const dataToSubmit = {
      ...formData,
      highlights: formData.highlights?.filter(h => h.trim() !== '') || [],
      is_active: formData.is_active,
      display_locations: formData.display_locations || [],
      display_order: formData.display_order || 0
    };

    try {
      if (editingCase) {
        const { error } = await supabase
          .from('case_studies')
          .update(dataToSubmit)
          .eq('id', editingCase.id);
        
        if (error) throw error;
        toast({ title: isDraft ? "Caso guardado como borrador" : "Caso actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from('case_studies')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast({ title: isDraft ? "Caso creado como borrador" : "Caso creado correctamente" });
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
      display_locations: caseStudy.display_locations || ['home', 'casos-exito'],
      display_order: caseStudy.display_order || 0
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
      // Optimistic update
      setCaseStudies(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
      toast({ title: field === 'is_active' ? (value ? 'Caso activado' : 'Caso desactivado') : (value ? 'Marcado como destacado' : 'Quitado de destacados') });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateDisplayOrder = async (id: string, order: number) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .update({ display_order: order })
        .eq('id', id);

      if (error) throw error;
      setCaseStudies(prev => prev.map(c => c.id === id ? { ...c, display_order: order } : c));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const currentLocations = formData.display_locations || [];
    if (checked) {
      setFormData({ ...formData, display_locations: [...currentLocations, location] });
    } else {
      setFormData({ ...formData, display_locations: currentLocations.filter(loc => loc !== location) });
    }
  };

  const addHighlight = (highlight: string = '') => {
    const currentHighlights = formData.highlights || [];
    setFormData({ ...formData, highlights: [...currentHighlights, highlight] });
  };

  const updateHighlight = (index: number, value: string) => {
    const currentHighlights = formData.highlights || [];
    const updatedHighlights = [...currentHighlights];
    updatedHighlights[index] = value;
    setFormData({ ...formData, highlights: updatedHighlights });
  };

  const removeHighlight = (index: number) => {
    const currentHighlights = formData.highlights || [];
    setFormData({ ...formData, highlights: currentHighlights.filter((_, i) => i !== index) });
  };

  if (isLoading) {
    return <div className="p-6">Cargando casos de éxito...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Casos de Éxito</h2>
        <Button
          onClick={() => {
            setFormData(emptyCase);
            setEditingCase(null);
            setShowForm(true);
          }}
          className="bg-primary text-primary-foreground rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Caso
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <BarChart3 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Eye className="h-5 w-5 mx-auto mb-1 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-muted-foreground">Activos</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <EyeOff className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
          <div className="text-xs text-muted-foreground">Inactivos</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
          <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
          <div className="text-xs text-muted-foreground">Destacados</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {([
          { key: 'all' as FilterTab, label: `Todos (${stats.total})` },
          { key: 'active' as FilterTab, label: `Activos (${stats.active})` },
          { key: 'inactive' as FilterTab, label: `Inactivos (${stats.inactive})` },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {editingCase ? 'Editar Caso' : 'Nuevo Caso'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sector</label>
                <SectorSelect
                  value={formData.sector}
                  onChange={(value) => setFormData({...formData, sector: value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tamaño de Empresa</label>
                <Input
                  value={formData.company_size || ''}
                  onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Año</label>
                <Input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Valoración (millones)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.value_amount || ''}
                  onChange={(e) => setFormData({...formData, value_amount: parseFloat(e.target.value)})}
                  disabled={formData.is_value_confidential}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Moneda</label>
                <Input
                  value={formData.value_currency}
                  onChange={(e) => setFormData({...formData, value_currency: e.target.value})}
                  disabled={formData.is_value_confidential}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_value_confidential || false}
                  onChange={(e) => {
                    const isConfidential = e.target.checked;
                    setFormData({
                      ...formData, 
                      is_value_confidential: isConfidential,
                      ...(isConfidential && { value_amount: undefined })
                    });
                  }}
                  className="rounded"
                />
                <span className="text-sm font-medium text-foreground">Valor Transacción Confidencial</span>
              </label>
              <p className="text-xs text-muted-foreground ml-6 mt-1">
                Al marcar esta opción, se mostrará "Confidencial" en lugar del valor
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                required
              />
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Highlights
                <span className="text-muted-foreground ml-2 font-normal">(viñetas destacadas)</span>
              </label>
              <div className="space-y-2 mb-3">
                {(formData.highlights || []).map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      className="flex-1"
                      placeholder="Ej: Valoración 12x ARR"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeHighlight(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={() => addHighlight('')} className="mb-3">
                <Plus className="h-4 w-4 mr-1" /> Agregar Highlight
              </Button>
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">Agregar comunes:</span>
                <div className="flex flex-wrap gap-2">
                  {commonHighlights.map((ch) => (
                    <Button
                      key={ch} type="button" variant="outline" size="sm"
                      onClick={() => addHighlight(ch)}
                      className="text-xs"
                      disabled={(formData.highlights || []).includes(ch)}
                    >
                      {ch}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ubicaciones donde mostrar
                <span className="text-muted-foreground ml-2 font-normal">(sin selección = borrador)</span>
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
                    <span className="text-sm text-muted-foreground">{location.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
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
                placeholder="URL de la imagen destacada"
              />
            </div>

            {/* Publication controls */}
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Estado de Publicación</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Activo</div>
                    <div className="text-xs text-muted-foreground">Visible en web pública</div>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Destacado</div>
                    <div className="text-xs text-muted-foreground">Aparece primero</div>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Orden</label>
                  <Input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Menor = primero</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="bg-primary text-primary-foreground rounded-lg">
                {editingCase ? 'Actualizar' : 'Crear'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">Previsualizar</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Previsualización</DialogTitle>
                  </DialogHeader>
                  <CaseStudyPreview caseStudy={formData} />
                </DialogContent>
              </Dialog>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditingCase(null); setFormData(emptyCase); }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Cases Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Orden</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Título</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sector</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Año</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Destacado</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No hay casos de éxito en esta categoría.
                  </td>
                </tr>
              ) : (
                filteredCases.map((cs) => (
                  <tr key={cs.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={cs.display_order || 0}
                        onChange={(e) => updateDisplayOrder(cs.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {cs.logo_url && (
                          <img src={cs.logo_url} alt="" className="w-8 h-8 object-contain rounded" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">{cs.title}</div>
                          {cs.company_size && (
                            <div className="text-xs text-muted-foreground">{cs.company_size}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{cs.sector}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cs.year || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={cs.is_featured}
                        onCheckedChange={(checked) => toggleStatus(cs.id, 'is_featured', checked)}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Switch
                          checked={cs.is_active}
                          onCheckedChange={(checked) => toggleStatus(cs.id, 'is_active', checked)}
                        />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          cs.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {cs.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(cs)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(cs.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CaseStudiesManager;
