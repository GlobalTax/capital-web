import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Building2,
  Edit,
  Trash2,
  ExternalLink,
  Target,
  Euro,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  Calendar,
  Globe,
  Save,
  FileText,
  Search,
  Scale,
  PauseCircle,
  Zap,
  User,
  Mail,
  Phone,
  Unlink,
  X,
  Check,
  MessageSquare,
  Plus,
  Loader2,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCreateServicio } from '@/hooks/useCreateServicio';
import { useActivePause } from '@/hooks/useDealsPaused';
import { DealPausedDialog } from '@/components/admin/companies/DealPausedDialog';
import { Empresa, useEmpresas } from '@/hooks/useEmpresas';
import { CompanyFormDialog } from '@/components/admin/companies/CompanyFormDialog';
import { EmpresaFinancialsCard } from '@/components/admin/companies/EmpresaFinancialsCard';
import { EmpresaContactsTable } from '@/components/admin/companies/EmpresaContactsTable';
import { useEmpresaContactos } from '@/hooks/useEmpresaContactos';
import { EmpresaLinkContactDialog } from '@/components/admin/companies/EmpresaLinkContactDialog';
import { formatCompactCurrency } from '@/shared/utils/format';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  useEmpresaInteracciones,
  type Interaccion,
  type TipoInteraccion,
  type ResultadoInteraccion,
  type CreateInteraccionInput,
} from '@/hooks/useEmpresaInteracciones';

// ============= CONSTANTS =============
const TIPO_OPTIONS: { value: TipoInteraccion; label: string }[] = [
  { value: 'llamada',  label: '📞 Llamada' },
  { value: 'email',    label: '📧 Email' },
  { value: 'reunion',  label: '🤝 Reunión' },
  { value: 'nota',     label: '📝 Nota interna' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'linkedin', label: '🔗 LinkedIn' },
  { value: 'visita',   label: '🏢 Visita' },
];

const RESULTADO_OPTIONS: { value: ResultadoInteraccion; label: string }[] = [
  { value: 'positivo',              label: '✅ Positivo' },
  { value: 'neutral',               label: '➖ Neutral' },
  { value: 'negativo',              label: '❌ Negativo' },
  { value: 'pendiente_seguimiento', label: '⏰ Pendiente seguimiento' },
];

const TIPO_COLORS: Record<TipoInteraccion, string> = {
  llamada:  'bg-green-500/10 text-green-700 border-green-200',
  email:    'bg-blue-500/10 text-blue-700 border-blue-200',
  reunion:  'bg-purple-500/10 text-purple-700 border-purple-200',
  nota:     'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  whatsapp: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  linkedin: 'bg-sky-500/10 text-sky-700 border-sky-200',
  visita:   'bg-orange-500/10 text-orange-700 border-orange-200',
};

const RESULTADO_COLORS: Record<ResultadoInteraccion, string> = {
  positivo:              'bg-green-100 text-green-800',
  neutral:               'bg-gray-100 text-gray-700',
  negativo:              'bg-red-100 text-red-800',
  pendiente_seguimiento: 'bg-amber-100 text-amber-800',
};

// ============= INTERACCION CARD =============
function InteraccionCard({
  interaccion,
  onDelete,
}: {
  interaccion: Interaccion;
  onDelete: (id: string) => void;
}) {
  const tipoLabel = TIPO_OPTIONS.find(o => o.value === interaccion.tipo)?.label || interaccion.tipo;
  const resultadoLabel = interaccion.resultado
    ? RESULTADO_OPTIONS.find(o => o.value === interaccion.resultado)?.label || interaccion.resultado
    : null;

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2 rounded-lg border ${TIPO_COLORS[interaccion.tipo]}`}>
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className={`text-xs border ${TIPO_COLORS[interaccion.tipo]}`}>
                {tipoLabel}
              </Badge>
              {interaccion.resultado && (
                <Badge className={`text-xs ${RESULTADO_COLORS[interaccion.resultado]}`}>
                  {resultadoLabel}
                </Badge>
              )}
            </div>
            <p className="font-medium text-sm">{interaccion.titulo}</p>
            {interaccion.descripcion && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {interaccion.descripcion}
              </p>
            )}
            {interaccion.siguiente_accion && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span><span className="font-medium">Siguiente:</span> {interaccion.siguiente_accion}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(interaccion.fecha), { addSuffix: true, locale: es })}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm('¿Eliminar esta interacción?')) onDelete(interaccion.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
        {format(new Date(interaccion.fecha), "d MMM yyyy 'a las' HH:mm", { locale: es })}
      </div>
    </div>
  );
}

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isDealPausedOpen, setIsDealPausedOpen] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [editingContact, setEditingContact] = useState(false);
  const [contactEditValues, setContactEditValues] = useState({ nombre: '', apellidos: '', email: '', telefono: '', cargo: '' });

  // Interacciones state
  const [isInteraccionOpen, setIsInteraccionOpen] = useState(false);
  const [interaccionForm, setInteraccionForm] = useState<CreateInteraccionInput>({
    tipo: 'llamada',
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().slice(0, 16),
    resultado: '' as ResultadoInteraccion,
    siguiente_accion: '',
    fecha_siguiente_accion: '',
  });

  const { deleteEmpresa, updateEmpresa } = useEmpresas();

  // Fetch empresa by ID
  const { data: empresa, isLoading: isLoadingEmpresa, refetch: refetchEmpresa } = useQuery({
    queryKey: ['empresa-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Empresa | null;
    },
    enabled: !!id,
  });

  // Contactos count from hook
  const { contactos: empresaContactos, unlinkContacto, updateContacto } = useEmpresaContactos(id);
  const contactoPrincipal = empresaContactos[0] || null;

  // Service creation hook
  const { createServicio, isPending: isCreatingServicio } = useCreateServicio(id, empresa?.nombre);

  // Active pause check
  const { data: activePause } = useActivePause(id);

  // Interacciones
  const { interacciones, isLoading: isLoadingInteracciones, createInteraccion, isCreating, deleteInteraccion } = useEmpresaInteracciones(id);

  const handleSaveInteraccion = () => {
    createInteraccion(interaccionForm, {
      onSuccess: () => {
        setIsInteraccionOpen(false);
        setInteraccionForm({
          tipo: 'llamada',
          titulo: '',
          descripcion: '',
          fecha: new Date().toISOString().slice(0, 16),
          resultado: '' as ResultadoInteraccion,
          siguiente_accion: '',
          fecha_siguiente_accion: '',
        });
      },
    });
  };

  // Update mutation for quick fields
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Empresa>) => {
      if (!id) throw new Error('No empresa ID');
      const { error } = await supabase
        .from('empresas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast({ title: '✅ Empresa actualizada' });
    },
    onError: (error) => {
      console.error('Error updating empresa:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    },
  });

  const handleDelete = async () => {
    if (!empresa) return;
    if (confirm(`¿Eliminar la empresa "${empresa.nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteEmpresa(empresa.id);
        navigate('/admin/empresas');
      } catch (error) {
        console.error('Error deleting empresa:', error);
      }
    }
  };

  const handleToggleTarget = (checked: boolean) => {
    updateMutation.mutate({ es_target: checked });
  };

  const handleToggleSearchFund = (checked: boolean) => {
    updateMutation.mutate({ potencial_search_fund: checked });
  };

  const handleStatusChange = (value: string) => {
    updateMutation.mutate({ estado_target: value });
  };

  const handleInterestChange = (value: string) => {
    updateMutation.mutate({ nivel_interes: value });
  };

  const handleSaveDescription = () => {
    updateMutation.mutate({ descripcion: descriptionValue });
    setEditingDescription(false);
  };

  const handleEditDialogSuccess = () => {
    setIsEditDialogOpen(false);
    refetchEmpresa();
  };

  const handleLinkSuccess = () => {
    setIsLinkDialogOpen(false);
  };

  if (isLoadingEmpresa) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">Empresa no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/empresas')}>
          Volver al listado
        </Button>
      </div>
    );
  }

  const margin = empresa.ebitda && empresa.facturacion 
    ? ((empresa.ebitda / empresa.facturacion) * 100).toFixed(1) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/empresas')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{empresa.nombre}</h1>
              {empresa.es_target && (
                <Badge className="bg-green-100 text-green-800">Target</Badge>
              )}
              {empresa.potencial_search_fund && (
                <Badge className="bg-purple-100 text-purple-800">SF</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {empresa.cif && <span>CIF: {empresa.cif}</span>}
              {empresa.cif && empresa.sector && <span>•</span>}
              <span>{empresa.sector}</span>
              {empresa.ubicacion && (
                <>
                  <span>•</span>
                  <span>{empresa.ubicacion}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {empresa.sitio_web && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(
                empresa.sitio_web?.startsWith('http') 
                  ? empresa.sitio_web 
                  : `https://${empresa.sitio_web}`,
                '_blank'
              )}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Web
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información General</TabsTrigger>
          <TabsTrigger value="interacciones" className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Interacciones
            {interacciones.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{interacciones.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Contacto Principal */}
              <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Contacto Principal
              </CardTitle>
              {contactoPrincipal && !editingContact && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setContactEditValues({
                        nombre: contactoPrincipal.nombre || '',
                        apellidos: contactoPrincipal.apellidos || '',
                        email: contactoPrincipal.email || '',
                        telefono: contactoPrincipal.telefono || '',
                        cargo: contactoPrincipal.cargo || '',
                      });
                      setEditingContact(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm('¿Desasociar este contacto de la empresa?')) {
                        unlinkContacto.mutate(contactoPrincipal.id);
                      }
                    }}
                  >
                    <Unlink className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!contactoPrincipal ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sin contacto principal</span>
                  <Button size="sm" variant="outline" onClick={() => setIsLinkDialogOpen(true)}>
                    + Añadir
                  </Button>
                </div>
              ) : editingContact ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Nombre"
                      value={contactEditValues.nombre}
                      onChange={(e) => setContactEditValues(v => ({ ...v, nombre: e.target.value }))}
                    />
                    <Input
                      placeholder="Apellidos"
                      value={contactEditValues.apellidos}
                      onChange={(e) => setContactEditValues(v => ({ ...v, apellidos: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={contactEditValues.email}
                    onChange={(e) => setContactEditValues(v => ({ ...v, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Teléfono"
                    value={contactEditValues.telefono}
                    onChange={(e) => setContactEditValues(v => ({ ...v, telefono: e.target.value }))}
                  />
                  <Input
                    placeholder="Cargo"
                    value={contactEditValues.cargo}
                    onChange={(e) => setContactEditValues(v => ({ ...v, cargo: e.target.value }))}
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingContact(false)}>
                      <X className="h-3 w-3 mr-1" /> Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateContacto.mutate({
                          id: contactoPrincipal.id,
                          nombre: contactEditValues.nombre,
                          apellidos: contactEditValues.apellidos || null,
                          email: contactEditValues.email,
                          telefono: contactEditValues.telefono || null,
                          cargo: contactEditValues.cargo || null,
                        });
                        setEditingContact(false);
                      }}
                      disabled={updateContacto.isPending}
                    >
                      <Check className="h-3 w-3 mr-1" /> Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">{contactoPrincipal.nombre} {contactoPrincipal.apellidos || ''}</span>
                    {contactoPrincipal.cargo && (
                      <span className="text-muted-foreground ml-2">· {contactoPrincipal.cargo}</span>
                    )}
                  </div>
                  {contactoPrincipal.email && (
                    <a href={`mailto:${contactoPrincipal.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                      <Mail className="h-3.5 w-3.5" /> {contactoPrincipal.email}
                    </a>
                  )}
                  {contactoPrincipal.telefono && (
                    <a href={`tel:${contactoPrincipal.telefono}`} className="flex items-center gap-1.5 text-primary hover:underline">
                      <Phone className="h-3.5 w-3.5" /> {contactoPrincipal.telefono}
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial KPIs */}
          <EmpresaFinancialsCard empresa={empresa} />

          {/* Associated Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base font-medium">
                Contactos Asociados ({empresaContactos?.length || 0})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsLinkDialogOpen(true)}>
                + Añadir Contacto
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <EmpresaContactsTable empresaId={empresa.id} />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base font-medium">Descripción</CardTitle>
              {!editingDescription && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setDescriptionValue(empresa.descripcion || '');
                    setEditingDescription(true);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingDescription ? (
                <div className="space-y-3">
                  <Textarea
                    value={descriptionValue}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    placeholder="Descripción de la empresa, actividad principal, etc."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingDescription(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveDescription}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {empresa.descripcion || 'Sin descripción'}
                </p>
              )}
            </CardContent>
          </Card>
            </div>

        <div className="space-y-4">
          {/* Acciones Card */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Acciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start"
                onClick={() => createServicio('operacion_ma')}
                disabled={isCreatingServicio}
              >
                <FileText className="h-4 w-4 mr-2" />
                Crear Mandato
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => createServicio('valoracion')}
                disabled={isCreatingServicio}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Crear Valoración
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => createServicio('due_diligence')}
                disabled={isCreatingServicio}
              >
                <Search className="h-4 w-4 mr-2" />
                Crear Due Diligence
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => createServicio('asesoria')}
                disabled={isCreatingServicio}
              >
                <Scale className="h-4 w-4 mr-2" />
                Crear Legal
              </Button>

              <Separator className="my-2" />

              <Button
                variant={activePause ? 'secondary' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsDealPausedOpen(true)}
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                {activePause ? 'Deal Pausado ⏸️' : 'Marcar Deal Paused'}
              </Button>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="es-target" className="text-sm">Es Target</Label>
                <Switch
                  id="es-target"
                  checked={empresa.es_target || false}
                  onCheckedChange={handleToggleTarget}
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="search-fund" className="text-sm">Potencial SF</Label>
                <Switch
                  id="search-fund"
                  checked={empresa.potencial_search_fund || false}
                  onCheckedChange={handleToggleSearchFund}
                  disabled={updateMutation.isPending}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm">Estado Target</Label>
                <Select 
                  value={empresa.estado_target || ''} 
                  onValueChange={handleStatusChange}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                    <SelectItem value="en_analisis">En análisis</SelectItem>
                    <SelectItem value="en_negociacion">En negociación</SelectItem>
                    <SelectItem value="descartado">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Nivel de Interés</Label>
                <Select 
                  value={empresa.nivel_interes || ''} 
                  onValueChange={handleInterestChange}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bajo">Bajo</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sector</span>
                <span className="font-medium">{empresa.sector}</span>
              </div>
              {empresa.subsector && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subsector</span>
                  <span className="font-medium">{empresa.subsector}</span>
                </div>
              )}
              {empresa.ubicacion && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación</span>
                  <span className="font-medium">{empresa.ubicacion}</span>
                </div>
              )}
              {empresa.sitio_web && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Web</span>
                  <a 
                    href={empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline truncate max-w-[140px]"
                  >
                    {empresa.sitio_web.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creada</span>
                <span className="font-medium">
                  {empresa.created_at 
                    ? format(new Date(empresa.created_at), 'dd MMM yyyy', { locale: es })
                    : '-'}
                </span>
              </div>
              {empresa.updated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actualizada</span>
                  <span className="font-medium">
                    {format(new Date(empresa.updated_at), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </div>
        </TabsContent>

        {/* Interacciones Tab */}
        <TabsContent value="interacciones" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Historial de Interacciones</h3>
                <p className="text-sm text-muted-foreground">
                  {interacciones.length === 0
                    ? 'Sin interacciones registradas'
                    : `${interacciones.length} interacción${interacciones.length !== 1 ? 'es' : ''} registrada${interacciones.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Button size="sm" onClick={() => setIsInteraccionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />Nueva Interacción
              </Button>
            </div>

            {isLoadingInteracciones ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : interacciones.length === 0 ? (
              <div className="text-center py-16 border rounded-lg">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No hay interacciones registradas</p>
                <p className="text-xs text-muted-foreground mt-1">Haz click en "Nueva Interacción" para empezar</p>
                <Button size="sm" variant="outline" className="mt-4" onClick={() => setIsInteraccionOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />Registrar primera interacción
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {interacciones.map((interaccion) => (
                  <InteraccionCard key={interaccion.id} interaccion={interaccion} onDelete={deleteInteraccion} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Nueva Interaccion Dialog */}
      <Dialog open={isInteraccionOpen} onOpenChange={setIsInteraccionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Interacción</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select value={interaccionForm.tipo} onValueChange={(v) => setInteraccionForm(f => ({ ...f, tipo: v as TipoInteraccion }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input
                placeholder="Ej: Llamada inicial de presentación"
                value={interaccionForm.titulo}
                onChange={(e) => setInteraccionForm(f => ({ ...f, titulo: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Notas de la interacción..."
                rows={3}
                value={interaccionForm.descripcion}
                onChange={(e) => setInteraccionForm(f => ({ ...f, descripcion: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha y hora *</Label>
              <Input
                type="datetime-local"
                value={interaccionForm.fecha}
                onChange={(e) => setInteraccionForm(f => ({ ...f, fecha: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Resultado</Label>
              <Select value={interaccionForm.resultado as string || ''} onValueChange={(v) => setInteraccionForm(f => ({ ...f, resultado: v as ResultadoInteraccion }))}>
                <SelectTrigger><SelectValue placeholder="Sin resultado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin resultado</SelectItem>
                  {RESULTADO_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Siguiente Acción</Label>
              <Textarea
                placeholder="¿Qué hay que hacer a continuación?"
                rows={2}
                value={interaccionForm.siguiente_accion}
                onChange={(e) => setInteraccionForm(f => ({ ...f, siguiente_accion: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha Siguiente Acción</Label>
              <Input
                type="date"
                value={interaccionForm.fecha_siguiente_accion}
                onChange={(e) => setInteraccionForm(f => ({ ...f, fecha_siguiente_accion: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInteraccionOpen(false)} disabled={isCreating}>Cancelar</Button>
            <Button onClick={handleSaveInteraccion} disabled={isCreating || !interaccionForm.titulo.trim()}>
              {isCreating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : 'Guardar Interacción'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <CompanyFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditDialogSuccess}
        empresa={empresa}
      />

      {/* Link Contact Dialog */}
      <EmpresaLinkContactDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        empresaId={empresa.id}
        onSuccess={handleLinkSuccess}
      />

      {/* Deal Paused Dialog */}
      <DealPausedDialog
        open={isDealPausedOpen}
        onOpenChange={setIsDealPausedOpen}
        companyId={empresa.id}
        companyName={empresa.nombre}
      />
    </div>
  );
}
