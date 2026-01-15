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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from 'lucide-react';
import { Empresa, useEmpresas } from '@/hooks/useEmpresas';
import { CompanyFormDialog } from '@/components/admin/companies/CompanyFormDialog';
import { EmpresaFinancialsCard } from '@/components/admin/companies/EmpresaFinancialsCard';
import { EmpresaContactsTable } from '@/components/admin/companies/EmpresaContactsTable';
import { EmpresaLinkContactDialog } from '@/components/admin/companies/EmpresaLinkContactDialog';
import { formatCompactCurrency } from '@/shared/utils/format';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  
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

  // Fetch associated contacts
  const { data: contacts, isLoading: isLoadingContacts, refetch: refetchContacts } = useQuery({
    queryKey: ['empresa-contacts', id],
    queryFn: async () => {
      if (!id) return [];
      
      // Get contacts from contact_leads
      const { data: contactLeads, error: contactError } = await supabase
        .from('contact_leads')
        .select('id, full_name, email, lead_status_crm, created_at')
        .eq('empresa_id', id)
        .eq('is_deleted', false);
      
      if (contactError) throw contactError;

      // Get contacts from company_valuations
      const { data: valuationLeads, error: valuationError } = await supabase
        .from('company_valuations')
        .select('id, contact_name, email, lead_status_crm, created_at')
        .eq('empresa_id', id)
        .eq('is_deleted', false);
      
      if (valuationError) throw valuationError;

      // Combine and format
      const combined = [
        ...(contactLeads || []).map(c => ({
          id: c.id,
          full_name: c.full_name,
          email: c.email,
          origin: 'contact' as const,
          status: c.lead_status_crm,
          created_at: c.created_at,
        })),
        ...(valuationLeads || []).map(v => ({
          id: v.id,
          full_name: v.contact_name,
          email: v.email,
          origin: 'valuation' as const,
          status: v.lead_status_crm,
          created_at: v.created_at,
        })),
      ];

      return combined.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!id,
  });

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
    refetchContacts();
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Financial KPIs */}
          <EmpresaFinancialsCard empresa={empresa} />

          {/* Associated Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base font-medium">
                Contactos Asociados ({contacts?.length || 0})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsLinkDialogOpen(true)}>
                + Vincular contacto
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <EmpresaContactsTable 
                contacts={contacts || []} 
                isLoading={isLoadingContacts}
                empresaId={empresa.id}
                onUnlink={refetchContacts}
              />
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

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
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

      {/* Edit Dialog */}
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
    </div>
  );
}
