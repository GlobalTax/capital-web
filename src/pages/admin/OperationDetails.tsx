import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Building2, DollarSign, FileText, Calendar, MapPin, Settings, Loader2, Plus, Trash2, MessageSquare, Phone, Mail, Users, Linkedin, StickyNote, X } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';
import { useToast } from '@/hooks/use-toast';
import SectorSelect from '@/components/admin/shared/SectorSelect';
import { AssignmentPanel } from '@/features/operations-management/components/assignment';
import { OperationHistoryTimeline } from '@/features/operations-management/components/history';
import { OperationNotesPanel } from '@/features/operations-management/components/notes';
import { OperationDocumentsPanel } from '@/features/operations-management/components/documents';
import { useMandatoInteracciones, type CreateInteraccionInput, type TipoInteraccion } from '@/hooks/useMandatoInteracciones';
import { MandatoEquipoPanel } from '@/components/admin/mandatos/MandatoEquipoPanel';
import { MandatoContactosAuditBanner } from '@/components/admin/mandatos/MandatoContactosAuditBanner';

const TIPO_OPTIONS: { value: TipoInteraccion; label: string; icon: React.ReactNode }[] = [
  { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'llamada', label: 'Llamada', icon: <Phone className="h-4 w-4" /> },
  { value: 'reunion', label: 'Reunión', icon: <Users className="h-4 w-4" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" /> },
  { value: 'nota', label: 'Nota', icon: <StickyNote className="h-4 w-4" /> },
  { value: 'visita', label: 'Visita', icon: <MapPin className="h-4 w-4" /> },
];

const TIPO_COLORS: Record<TipoInteraccion, string> = {
  email: 'bg-blue-100 text-blue-700',
  llamada: 'bg-green-100 text-green-700',
  reunion: 'bg-purple-100 text-purple-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  linkedin: 'bg-sky-100 text-sky-700',
  nota: 'bg-yellow-100 text-yellow-700',
  visita: 'bg-orange-100 text-orange-700',
};

const RESULTADO_OPTIONS = [
  { value: 'positivo', label: '✅ Positivo' },
  { value: 'neutral', label: '➖ Neutral' },
  { value: 'negativo', label: '❌ Negativo' },
  { value: 'pendiente_seguimiento', label: '🔄 Pendiente seguimiento' },
];

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  subsector?: string;
  description: string;
  short_description: string | null;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  ebitda_multiple: number | null;
  growth_percentage: number | null;
  year: number;
  deal_type: string;
  status: string;
  company_size_employees: string | null;
  logo_url: string | null;
  featured_image_url: string | null;
  highlights: string[] | null;
  display_locations: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  assigned_to?: string | null;
  assigned_at?: string | null;
  assigned_by?: string | null;
}

const OperationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());

  // Interacciones
  const { interacciones, isLoading: loadingInteracciones, createInteraccion, isCreating, deleteInteraccion } = useMandatoInteracciones(id);
  const [isInteraccionOpen, setIsInteraccionOpen] = useState(false);
  const [interaccionForm, setInteraccionForm] = useState<CreateInteraccionInput>({
    tipo: 'email',
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().slice(0, 16),
    resultado: '',
    siguiente_accion: '',
    fecha_siguiente_accion: '',
  });

  const handleSaveInteraccion = () => {
    createInteraccion(interaccionForm, {
      onSuccess: () => {
        setIsInteraccionOpen(false);
        setInteraccionForm({
          tipo: 'email',
          titulo: '',
          descripcion: '',
          fecha: new Date().toISOString().slice(0, 16),
          resultado: '',
          siguiente_accion: '',
          fecha_siguiente_accion: '',
        });
      },
    });
  };

  useEffect(() => {
    const fetchOperation = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('company_operations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOperation(data);
      } catch (error) {
        console.error('Error fetching operation:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la operación',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOperation();
  }, [id, toast]);

  const handleFieldUpdate = async (field: string, value: any) => {
    if (!operation || !id) return;

    setSavingFields(prev => new Set(prev).add(field));

    try {
      const { error } = await supabase
        .from('company_operations')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      setOperation(prev => prev ? { ...prev, [field]: value } : null);
      
      toast({
        title: 'Guardado',
        description: 'Campo actualizado correctamente',
      });
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el campo',
        variant: 'destructive',
      });
    } finally {
      setSavingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    if (!operation) return;
    const newHighlights = [...(operation.highlights || [])];
    newHighlights[index] = value;
    setOperation({ ...operation, highlights: newHighlights });
  };

  const handleHighlightBlur = async () => {
    if (!operation) return;
    await handleFieldUpdate('highlights', operation.highlights);
  };

  const addHighlight = () => {
    if (!operation) return;
    const newHighlights = [...(operation.highlights || []), ''];
    setOperation({ ...operation, highlights: newHighlights });
  };

  const removeHighlight = async (index: number) => {
    if (!operation) return;
    const newHighlights = operation.highlights?.filter((_, i) => i !== index) || [];
    await handleFieldUpdate('highlights', newHighlights);
  };

  const toggleDisplayLocation = async (location: string) => {
    if (!operation) return;
    const newLocations = operation.display_locations.includes(location)
      ? operation.display_locations.filter(l => l !== location)
      : [...operation.display_locations, location];
    await handleFieldUpdate('display_locations', newLocations);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      available: 'Disponible',
      negotiation: 'En Negociación',
      sold: 'Vendida',
      withdrawn: 'Retirada',
    };
    return statusMap[status] || status;
  };

  const getDealTypeText = (dealType: string) => {
    const dealTypeMap: Record<string, string> = {
      sale: 'Venta',
      acquisition: 'Adquisición',
      merger: 'Fusión',
      partnership: 'Asociación',
    };
    return dealTypeMap[dealType] || dealType;
  };

  const calculateEbitdaMargin = () => {
    if (!operation?.revenue_amount || !operation?.ebitda_amount) return null;
    return ((operation.ebitda_amount / operation.revenue_amount) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando operación...</p>
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Operación no encontrada</h3>
          <Button onClick={() => navigate('/admin/operations')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Operaciones
          </Button>
        </div>
      </div>
    );
  }

  const availableLocations = ['home', 'operaciones', 'sectores'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/admin/operations')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Operaciones
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold">#{operation.id.substring(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground">Creada el {new Date(operation.created_at).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select 
              value={operation.status} 
              onValueChange={(value) => handleFieldUpdate('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="negotiation">En Negociación</SelectItem>
                <SelectItem value="sold">Vendida</SelectItem>
                <SelectItem value="withdrawn">Retirada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Empresa</Label>
                  <div className="relative">
                    <Input
                      value={operation.company_name}
                      onChange={(e) => setOperation({ ...operation, company_name: e.target.value })}
                      onBlur={() => handleFieldUpdate('company_name', operation.company_name)}
                      className="font-medium"
                    />
                    {savingFields.has('company_name') && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Sector *</Label>
                  <div className="relative">
                    <SectorSelect
                      value={operation.sector}
                      onChange={(value) => handleFieldUpdate('sector', value)}
                      placeholder="Selecciona un sector"
                      className="font-medium"
                    />
                    {savingFields.has('sector') && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Subsector / Especialización</Label>
                  <div className="relative">
                    <Input
                      value={operation.subsector || ''}
                      onChange={(e) => setOperation({ ...operation, subsector: e.target.value })}
                      onBlur={() => handleFieldUpdate('subsector', operation.subsector)}
                      placeholder="Ej: SaaS B2B, Retail de moda, etc."
                    />
                    {savingFields.has('subsector') && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tamaño (empleados)</Label>
                  <Input
                    value={operation.company_size_employees || ''}
                    onChange={(e) => setOperation({ ...operation, company_size_employees: e.target.value })}
                    onBlur={() => handleFieldUpdate('company_size_employees', operation.company_size_employees)}
                    placeholder="ej: 50-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Año</Label>
                  <Input
                    type="number"
                    value={operation.year}
                    onChange={(e) => setOperation({ ...operation, year: parseInt(e.target.value) })}
                    onBlur={() => handleFieldUpdate('year', operation.year)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs text-muted-foreground">Tipo de Deal</Label>
                  <Select 
                    value={operation.deal_type} 
                    onValueChange={(value) => handleFieldUpdate('deal_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Venta</SelectItem>
                      <SelectItem value="acquisition">Adquisición</SelectItem>
                      <SelectItem value="merger">Fusión</SelectItem>
                      <SelectItem value="partnership">Asociación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Valoración</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={operation.valuation_amount}
                      onChange={(e) => setOperation({ ...operation, valuation_amount: parseFloat(e.target.value) })}
                      onBlur={() => handleFieldUpdate('valuation_amount', operation.valuation_amount)}
                      className="font-bold"
                    />
                    <Select 
                      value={operation.valuation_currency} 
                      onValueChange={(value) => handleFieldUpdate('valuation_currency', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">€</SelectItem>
                        <SelectItem value="USD">$</SelectItem>
                        <SelectItem value="GBP">£</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Facturación</Label>
                  <Input
                    type="number"
                    value={operation.revenue_amount || ''}
                    onChange={(e) => setOperation({ ...operation, revenue_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    onBlur={() => handleFieldUpdate('revenue_amount', operation.revenue_amount)}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">EBITDA</Label>
                  <Input
                    type="number"
                    value={operation.ebitda_amount || ''}
                    onChange={(e) => setOperation({ ...operation, ebitda_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    onBlur={() => handleFieldUpdate('ebitda_amount', operation.ebitda_amount)}
                    placeholder="Opcional"
                  />
                </div>
                {calculateEbitdaMargin() && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Margen EBITDA (auto)</Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md">
                      <span className="text-sm font-bold">{calculateEbitdaMargin()}%</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Múltiplo EBITDA</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={operation.ebitda_multiple || ''}
                    onChange={(e) => setOperation({ ...operation, ebitda_multiple: e.target.value ? parseFloat(e.target.value) : null })}
                    onBlur={() => handleFieldUpdate('ebitda_multiple', operation.ebitda_multiple)}
                    placeholder="ej: 5.2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Crecimiento (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={operation.growth_percentage || ''}
                    onChange={(e) => setOperation({ ...operation, growth_percentage: e.target.value ? parseFloat(e.target.value) : null })}
                    onBlur={() => handleFieldUpdate('growth_percentage', operation.growth_percentage)}
                    placeholder="ej: 15.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative">
                <Textarea
                  value={operation.description}
                  onChange={(e) => setOperation({ ...operation, description: e.target.value })}
                  onBlur={() => handleFieldUpdate('description', operation.description)}
                  className="min-h-[200px] leading-relaxed"
                  placeholder="Descripción detallada de la operación..."
                />
                {savingFields.has('description') && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>🎯 Highlights</span>
                <Button
                  onClick={addHighlight}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {(operation.highlights || []).map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <Input
                      value={highlight}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                      onBlur={handleHighlightBlur}
                      className="flex-1"
                      placeholder="Introduce un highlight..."
                    />
                    <Button
                      onClick={() => removeHighlight(index)}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!operation.highlights || operation.highlights.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay highlights. Haz clic en "Añadir" para crear uno.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notas y Comentarios */}
          <OperationNotesPanel operationId={id!} />

          {/* Documentos */}
          <OperationDocumentsPanel operationId={id!} />

          {/* Interacciones */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  Interacciones
                  {interacciones.length > 0 && (
                    <Badge variant="secondary" className="text-xs">{interacciones.length}</Badge>
                  )}
                </div>
                <Button
                  onClick={() => setIsInteraccionOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingInteracciones ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : interacciones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No hay interacciones registradas.
                </p>
              ) : (
                <div className="space-y-3">
                  {interacciones.map((interaccion) => (
                    <div key={interaccion.id} className="border rounded-lg p-3 space-y-1.5 relative group">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIPO_COLORS[interaccion.tipo]}`}>
                            {TIPO_OPTIONS.find(t => t.value === interaccion.tipo)?.label ?? interaccion.tipo}
                          </span>
                          <span className="text-sm font-medium">{interaccion.titulo}</span>
                        </div>
                        <button
                          onClick={() => deleteInteraccion(interaccion.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {interaccion.descripcion && (
                        <p className="text-xs text-muted-foreground">{interaccion.descripcion}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(interaccion.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialog Nueva Interacción */}
          <Dialog open={isInteraccionOpen} onOpenChange={setIsInteraccionOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nueva Interacción</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={interaccionForm.tipo}
                    onValueChange={(v) => setInteraccionForm({ ...interaccionForm, tipo: v as TipoInteraccion })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">{opt.icon}{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={interaccionForm.titulo}
                    onChange={(e) => setInteraccionForm({ ...interaccionForm, titulo: e.target.value })}
                    placeholder="Ej: Envío de datapack y IM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={interaccionForm.descripcion}
                    onChange={(e) => setInteraccionForm({ ...interaccionForm, descripcion: e.target.value })}
                    placeholder="Detalles de la interacción..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha y Hora</Label>
                  <Input
                    type="datetime-local"
                    value={interaccionForm.fecha}
                    onChange={(e) => setInteraccionForm({ ...interaccionForm, fecha: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resultado</Label>
                  <Select
                    value={interaccionForm.resultado || ''}
                    onValueChange={(v) => setInteraccionForm({ ...interaccionForm, resultado: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar resultado..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RESULTADO_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Siguiente acción</Label>
                  <Input
                    value={interaccionForm.siguiente_accion}
                    onChange={(e) => setInteraccionForm({ ...interaccionForm, siguiente_accion: e.target.value })}
                    placeholder="¿Qué viene después?"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInteraccionOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveInteraccion} disabled={isCreating}>
                  {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Creada</p>
                <p className="text-sm font-medium">
                  {new Date(operation.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Última actualización</p>
                <p className="text-sm font-medium">
                  {new Date(operation.updated_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Locations */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Ubicaciones de Display
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {availableLocations.map((location) => (
                  <div key={location} className="flex items-center gap-2">
                    <Checkbox
                      id={location}
                      checked={operation.display_locations.includes(location)}
                      onCheckedChange={() => toggleDisplayLocation(location)}
                    />
                    <Label htmlFor={location} className="text-sm cursor-pointer">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Panel */}
          <AssignmentPanel
            operationId={id!}
            currentAssignedTo={operation.assigned_to}
            assignedAt={operation.assigned_at}
          />

          {/* Mandato Team Panel */}
          <MandatoEquipoPanel mandatoId={id!} />

          {/* Audit banner: contactos perdidos en compradores */}
          <MandatoContactosAuditBanner mandatoId={id!} />

          {/* Configuration */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-muted-foreground" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="text-sm cursor-pointer">
                  Operación Activa
                </Label>
                <Switch
                  id="is_active"
                  checked={operation.is_active}
                  onCheckedChange={(checked) => handleFieldUpdate('is_active', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured" className="text-sm cursor-pointer">
                  Operación Destacada
                </Label>
                <Switch
                  id="is_featured"
                  checked={operation.is_featured}
                  onCheckedChange={(checked) => handleFieldUpdate('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Operation History Timeline */}
          <OperationHistoryTimeline operationId={id!} />
        </div>
      </div>
    </div>
  );
};

export default OperationDetails;
