import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  CalendarIcon,
  User,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Archive,
  Plus
} from 'lucide-react';
import { EditableCurrency } from '@/components/admin/shared/EditableCurrency';
import { useContactInlineUpdate } from '@/hooks/useInlineUpdate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ActivityClassificationBlock } from '@/components/admin/contacts/ActivityClassificationBlock';
import { LeadAssignmentSelect } from '@/components/admin/leads/LeadAssignmentSelect';
import { LeadStatusSelect } from '@/components/admin/leads/LeadStatusSelect';
import { LeadStatusBadge } from '@/components/admin/leads/LeadStatusBadge';
import { AcquisitionChannelSelect } from '@/components/admin/contacts/AcquisitionChannelSelect';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useBrevoSync } from '@/hooks/useBrevoSync';
import { useBrevoSyncStatus } from '@/hooks/useBrevoSyncStatus';
import { LeadToOperationConverter } from '@/features/operations-management/components/integrations';
import { useBrevoEvents } from '@/hooks/useBrevoEvents';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CompanyLinkCard } from '@/components/admin/companies/CompanyLinkCard';
import PotentialBuyersCard from '@/components/admin/leads/PotentialBuyersCard';

interface LeadData {
  id: string;
  origin: 'contact' | 'valuation' | 'collaborator' | 'general' | 'acquisition' | 'company_acquisition' | 'advisor';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
  status: string;
  lead_status_crm?: string;
  assigned_to?: string;
  assigned_at?: string;
  assigned_admin?: {
    full_name: string;
    email: string;
  };
  // Campos específicos por origen
  [key: string]: any;
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { syncSingleContact, isSyncing } = useBrevoSync();
  const { trackLeadStatusChange, trackNoteAdded, trackCompanyLinked } = useBrevoEvents();
  const { update: updateLeadField } = useContactInlineUpdate();
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [acquisitionChannelId, setAcquisitionChannelId] = useState<string | null>(null);
  const [leadEntryDate, setLeadEntryDate] = useState<Date | undefined>(undefined);
  
  // Extract actual lead ID for sync status check (remove origin prefix)
  const actualLeadId = id ? id.split('_').slice(1).join('_') : undefined;
  const { isSynced, syncedAt, isLoading: isSyncStatusLoading } = useBrevoSyncStatus(actualLeadId);

  // Fetch lead data
  const { data: lead, isLoading, refetch } = useQuery({
    queryKey: ['lead-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No lead ID provided');

      // Parse ID format: origin_uuid
      const parts = id.split('_');
      if (parts.length < 2) throw new Error('Invalid lead ID format');
      
      const origin = parts[0] as LeadData['origin'];
      const leadId = parts.slice(1).join('_');

      let tableName: any = '';
      let nameField = '';
      
      switch (origin) {
        case 'contact':
          tableName = 'contact_leads';
          nameField = 'full_name';
          break;
        case 'valuation':
          tableName = 'company_valuations';
          nameField = 'contact_name';
          break;
        case 'collaborator':
          tableName = 'collaborator_applications';
          nameField = 'full_name';
          break;
        case 'general':
          tableName = 'general_contact_leads';
          nameField = 'full_name';
          break;
        case 'acquisition':
          tableName = 'acquisition_leads';
          nameField = 'full_name';
          break;
        case 'company_acquisition':
          tableName = 'company_acquisition_inquiries';
          nameField = 'full_name';
          break;
        case 'advisor':
          tableName = 'advisor_valuations';
          nameField = 'contact_name';
          break;
        default:
          throw new Error(`Unknown lead origin: ${origin}`);
      }

      // Fetch lead data - simplified to avoid TypeScript errors
      const { data: rawData, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', leadId)
        .maybeSingle();

      if (error) throw error;
      if (!rawData) throw new Error('Lead not found');

      const data = rawData as any;

      // Fetch assigned admin if exists
      let assignedAdmin = null;
      if (data.assigned_to) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('full_name, email')
          .eq('user_id', data.assigned_to)
          .maybeSingle();
        
        assignedAdmin = adminData;
      }

      return {
        ...data,
        id: leadId,
        origin,
        name: data[nameField] || data.full_name || data.contact_name || 'Sin nombre',
        company: data.company || data.company_name || '',
        assigned_admin: assignedAdmin,
        acquisition_channel_id: data.acquisition_channel_id || null,
        lead_entry_date: data.lead_entry_date || null,
      } as LeadData;
    },
    enabled: !!id,
    staleTime: 0,
  });
  
  // Update local state when lead loads
  React.useEffect(() => {
    if (lead?.acquisition_channel_id) {
      setAcquisitionChannelId(lead.acquisition_channel_id);
    }
    if (lead?.lead_entry_date) {
      setLeadEntryDate(new Date(lead.lead_entry_date));
    }
    if (lead?.notes !== undefined) {
      setNotes(lead.notes || '');
    }
  }, [lead?.acquisition_channel_id, lead?.lead_entry_date, lead?.notes]);

  const handleSyncToBrevo = async () => {
    if (!lead) return;
    
    try {
      await syncSingleContact(lead.id, lead.origin);
      toast({
        title: "✅ Contacto enviado a Brevo",
        description: `${lead.email} sincronizado correctamente`,
      });
    } catch (error) {
      toast({
        title: "❌ Error al sincronizar",
        description: "No se pudo enviar el contacto a Brevo",
        variant: "destructive"
      });
    }
  };

  const handleArchive = async () => {
    if (!lead) return;
    
    const confirmed = window.confirm(
      `¿Archivar "${lead.name}"?\n\nSe puede restaurar después desde la sección de archivados.`
    );
    if (!confirmed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const tableMap: Record<string, string> = {
        contact: 'contact_leads',
        valuation: 'company_valuations',
        collaborator: 'collaborator_applications',
        general: 'general_contact_leads',
        acquisition: 'acquisition_leads',
        company_acquisition: 'company_acquisition_inquiries',
        advisor: 'advisor_valuations',
      };
      
      const table = tableMap[lead.origin] as any;
      if (!table) throw new Error('Tipo de lead no soportado');
      
      const { error } = await supabase
        .from(table)
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
          deletion_reason: 'Archivado desde ficha de lead'
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: "Contacto archivado",
        description: "Redirigiendo a la lista de contactos...",
      });
      
      navigate('/admin/contacts');
    } catch (error) {
      console.error('Error archiving lead:', error);
      toast({
        title: "Error",
        description: "No se pudo archivar el contacto",
        variant: "destructive",
      });
    }
  };

  const handleAssignmentChange = () => {
    refetch();
    toast({
      title: "Asignación actualizada",
      description: "El lead ha sido asignado correctamente",
    });
  };

  const handleStatusChange = async (oldStatus?: string, newStatus?: string) => {
    refetch();
    toast({
      title: "Estado actualizado",
      description: "El estado del lead ha sido actualizado",
    });
    
    // Track status change in Brevo
    if (lead?.email && oldStatus && newStatus && oldStatus !== newStatus) {
      await trackLeadStatusChange(lead.email, lead.id, oldStatus, newStatus, lead.origin);
    }
  };

  const handleAcquisitionChannelChange = async (channelId: string | null) => {
    if (!lead) return;
    
    const tableMap: Record<string, string> = {
      contact: 'contact_leads',
      valuation: 'company_valuations',
    };
    
    const table = tableMap[lead.origin] as any;
    if (!table) {
      toast({ title: 'Este tipo de lead no soporta canal de adquisición', variant: 'destructive' });
      return;
    }
    
    try {
      const { error } = await supabase
        .from(table)
        .update({ acquisition_channel_id: channelId })
        .eq('id', lead.id);

      if (error) throw error;
      
      setAcquisitionChannelId(channelId);
      toast({ title: 'Canal de adquisición actualizado' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el canal', variant: 'destructive' });
    }
  };

  const handleLeadEntryDateChange = async (date: Date | undefined) => {
    if (!lead) return;
    
    const tableMap: Record<string, string> = {
      contact: 'contact_leads',
      valuation: 'company_valuations',
    };
    
    const table = tableMap[lead.origin] as any;
    if (!table) {
      toast({ title: 'Este tipo de lead no soporta fecha de entrada', variant: 'destructive' });
      return;
    }
    
    try {
      const { error } = await supabase
        .from(table)
        .update({ lead_entry_date: date ? date.toISOString() : null })
        .eq('id', lead.id);

      if (error) throw error;
      
      setLeadEntryDate(date);
      toast({ title: 'Fecha de entrada actualizada' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar la fecha', variant: 'destructive' });
    }
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    
    const tableMap: Record<string, string> = {
      contact: 'contact_leads',
      valuation: 'company_valuations',
      general: 'general_contact_leads',
    };
    
    const table = tableMap[lead.origin] as any;
    if (!table) {
      toast({ title: 'Este tipo de lead no soporta notas internas', variant: 'destructive' });
      return;
    }
    
    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from(table)
        .update({ notes })
        .eq('id', lead.id);

      if (error) throw error;
      
      toast({ title: '✅ Nota guardada' });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({ title: 'Error', description: 'No se pudo guardar la nota', variant: 'destructive' });
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Handler para actualizar campos financieros inline
  const handleFinancialUpdate = async (field: string, value: number) => {
    if (!lead) return;
    await updateLeadField(lead.id, lead.origin, field, value || null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lead no encontrado</h2>
          <Button onClick={() => navigate('/admin/contacts')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Leads
          </Button>
        </div>
      </div>
    );
  }

  const getOriginBadge = () => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      contact: { label: 'Contacto', variant: 'default' },
      valuation: { label: 'Valoración', variant: 'secondary' },
      collaborator: { label: 'Colaborador', variant: 'outline' },
      general: { label: 'General', variant: 'default' },
      acquisition: { label: 'Adquisición', variant: 'destructive' },
      company_acquisition: { label: 'Consulta Compra', variant: 'destructive' },
      advisor: { label: 'Asesor', variant: 'secondary' },
    };
    const config = configs[lead.origin] || { label: 'Otro', variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/contacts')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{lead.name}</h1>
              {getOriginBadge()}
              <LeadStatusBadge status={lead.lead_status_crm || 'nuevo'} />
            </div>
            <p className="text-sm text-muted-foreground">
              Lead #{lead.id.slice(0, 8)} • Creado {format(new Date(lead.created_at), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón "Nuevo Lead" */}
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/contacts', { state: { openNewLead: true } })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Lead
          </Button>

          {/* Botón "Convertir en Operación" */}
          <LeadToOperationConverter lead={lead} />

          {/* Botón "Enviar a Brevo" */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={handleSyncToBrevo}
                  disabled={isSyncing || isSynced || isSyncStatusLoading}
                  className={cn(
                    isSynced && "border-green-500/30 text-green-600 hover:bg-green-50/50"
                  )}
                >
                  {isSynced ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                      Enviado a Brevo
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {isSyncing ? 'Enviando...' : 'Enviar a Brevo'}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {isSynced && syncedAt && (
                <TooltipContent>
                  <p>Sincronizado el {format(new Date(syncedAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Botón "Archivar" */}
          <Button 
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={handleArchive}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archivar
          </Button>

          {/* Botón "Pasar a Fase 1" solo para valoraciones */}
          {lead.origin === 'valuation' && lead.lead_status_crm !== 'calificado' && lead.lead_status_crm !== 'ganado' && (
            <Button 
              variant="default"
              onClick={() => {
                // Actualizar estado a 'calificado' (Fase 1)
                supabase
                  .from('company_valuations')
                  .update({ 
                    lead_status_crm: 'calificado',
                    status_updated_at: new Date().toISOString()
                  })
                  .eq('id', lead.id)
                  .then(() => {
                    refetch();
                    toast({
                      title: "Lead pasado a Fase 1",
                      description: "El lead ha sido calificado y está listo para ROD",
                    });
                  });
              }}
              disabled={lead.lead_status_crm === 'calificado'}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Pasar a Fase 1 (ROD)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nombre</p>
                    <p className="text-sm text-muted-foreground">{lead.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">
                      {lead.email}
                    </a>
                  </div>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Teléfono</p>
                      <a href={`tel:${lead.phone}`} className="text-sm text-primary hover:underline">
                        {lead.phone}
                      </a>
                    </div>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Empresa</p>
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Empresa Vinculada */}
          <CompanyLinkCard
            contactId={lead.id}
            contactOrigin={lead.origin}
            empresaId={lead.empresa_id}
            companyName={lead.company}
            onCompanyLinked={refetch}
          />

          {/* Descripción de actividad + Etiquetas sectoriales (IA) */}
          {lead.company && (
            <Card>
              <CardHeader>
                <CardTitle>Descripción y Clasificación de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityClassificationBlock
                  contactId={lead.id}
                  origin={lead.origin}
                  companyName={lead.company || lead.company_name}
                  cif={lead.cif}
                  empresaId={lead.empresa_id}
                  initialDescription={lead.ai_company_summary}
                  initialSectorTags={{
                    ai_sector_pe: lead.ai_sector_pe,
                    ai_sector_name: lead.ai_sector_name,
                    ai_tags: lead.ai_tags,
                    ai_business_model_tags: lead.ai_business_model_tags,
                    ai_negative_tags: lead.ai_negative_tags,
                    ai_classification_confidence: lead.ai_classification_confidence,
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Compradores Potenciales */}
          <PotentialBuyersCard
            leadId={lead.id}
            leadOrigin={lead.origin}
          />

          {/* Datos específicos según origen */}
          {lead.origin === 'valuation' && (
            <Card>
              <CardHeader>
                <CardTitle>Datos de Valoración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {lead.industry && (
                    <div>
                      <p className="text-sm font-medium mb-1">Industria</p>
                      <p className="text-sm text-muted-foreground">{lead.industry}</p>
                    </div>
                  )}
                  {lead.employee_range && (
                    <div>
                      <p className="text-sm font-medium mb-1">Empleados</p>
                      <p className="text-sm text-muted-foreground">{lead.employee_range}</p>
                    </div>
                  )}
                  {/* Facturación - EDITABLE */}
                  <div>
                    <p className="text-sm font-medium mb-1">Facturación</p>
                    <EditableCurrency
                      value={lead.revenue}
                      onSave={(v) => handleFinancialUpdate('revenue', v)}
                      emptyText="Clic para añadir"
                      compact
                    />
                  </div>
                  {/* EBITDA - EDITABLE */}
                  <div>
                    <p className="text-sm font-medium mb-1">EBITDA</p>
                    <EditableCurrency
                      value={lead.ebitda}
                      onSave={(v) => handleFinancialUpdate('ebitda', v)}
                      emptyText="Clic para añadir"
                      compact
                    />
                  </div>
                  {/* Valoración Final - EDITABLE */}
                  <div className="col-span-2">
                    <p className="text-sm font-medium mb-1">Valoración Final</p>
                    <EditableCurrency
                      value={lead.final_valuation}
                      onSave={(v) => handleFinancialUpdate('final_valuation', v)}
                      emptyText="Clic para añadir"
                      compact
                      displayClassName="text-primary font-semibold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {lead.origin === 'collaborator' && (
            <Card>
              <CardHeader>
                <CardTitle>Datos de Colaborador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.profession && (
                  <div>
                    <p className="text-sm font-medium mb-1">Profesión</p>
                    <p className="text-sm text-muted-foreground">{lead.profession}</p>
                  </div>
                )}
                {lead.experience && (
                  <div>
                    <p className="text-sm font-medium mb-1">Experiencia</p>
                    <p className="text-sm text-muted-foreground">{lead.experience}</p>
                  </div>
                )}
                {lead.motivation && (
                  <div>
                    <p className="text-sm font-medium mb-1">Motivación</p>
                    <p className="text-sm text-muted-foreground">{lead.motivation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(lead.origin === 'acquisition' || lead.origin === 'company_acquisition') && (
            <Card>
              <CardHeader>
                <CardTitle>Datos de Adquisición</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.sectors_of_interest && (
                  <div>
                    <p className="text-sm font-medium mb-1">Sectores de Interés</p>
                    <p className="text-sm text-muted-foreground">{lead.sectors_of_interest}</p>
                  </div>
                )}
                {lead.investment_range && (
                  <div>
                    <p className="text-sm font-medium mb-1">Rango de Inversión</p>
                    <p className="text-sm text-muted-foreground">{lead.investment_range}</p>
                  </div>
                )}
                {lead.investment_budget && (
                  <div>
                    <p className="text-sm font-medium mb-1">Presupuesto</p>
                    <p className="text-sm text-muted-foreground">{lead.investment_budget}</p>
                  </div>
                )}
                {lead.target_timeline && (
                  <div>
                    <p className="text-sm font-medium mb-1">Timeline</p>
                    <p className="text-sm text-muted-foreground">{lead.target_timeline}</p>
                  </div>
                )}
                {lead.acquisition_type && (
                  <div>
                    <p className="text-sm font-medium mb-1">Tipo de Adquisición</p>
                    <p className="text-sm text-muted-foreground">{lead.acquisition_type}</p>
                  </div>
                )}
                {lead.message && (
                  <div>
                    <p className="text-sm font-medium mb-1">Mensaje</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {lead.origin === 'advisor' && (
            <Card>
              <CardHeader>
                <CardTitle>Datos de Valoración Asesor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {lead.firm_type && (
                    <div>
                      <p className="text-sm font-medium mb-1">Tipo de Empresa</p>
                      <p className="text-sm text-muted-foreground">{lead.firm_type}</p>
                    </div>
                  )}
                  {lead.employee_range && (
                    <div>
                      <p className="text-sm font-medium mb-1">Empleados</p>
                      <p className="text-sm text-muted-foreground">{lead.employee_range}</p>
                    </div>
                  )}
                  {/* Facturación - EDITABLE */}
                  <div>
                    <p className="text-sm font-medium mb-1">Facturación</p>
                    <EditableCurrency
                      value={lead.revenue}
                      onSave={(v) => handleFinancialUpdate('revenue', v)}
                      emptyText="Clic para añadir"
                      compact
                    />
                  </div>
                  {/* EBITDA - EDITABLE */}
                  <div>
                    <p className="text-sm font-medium mb-1">EBITDA</p>
                    <EditableCurrency
                      value={lead.ebitda}
                      onSave={(v) => handleFinancialUpdate('ebitda', v)}
                      emptyText="Clic para añadir"
                      compact
                    />
                  </div>
                  {/* Valoración Final - EDITABLE */}
                  <div className="col-span-2">
                    <p className="text-sm font-medium mb-1">Valoración Final</p>
                    <EditableCurrency
                      value={lead.final_valuation}
                      onSave={(v) => handleFinancialUpdate('final_valuation', v)}
                      emptyText="Clic para añadir"
                      compact
                      displayClassName="text-primary font-semibold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {lead.origin === 'general' && lead.message && (
            <Card>
              <CardHeader>
                <CardTitle>Mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Notas internas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Internas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Añade notas sobre este lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mb-3"
              />
              <Button 
                size="sm" 
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {isSavingNotes ? 'Guardando...' : 'Guardar Nota'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Asignación y Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión del Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <LeadStatusSelect
                  leadId={lead.id}
                  leadType={lead.origin}
                  currentStatus={lead.lead_status_crm || 'nuevo'}
                  onStatusChange={handleStatusChange}
                />
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium mb-2 block">Asignado a</label>
                <LeadAssignmentSelect
                  leadId={lead.id}
                  leadType={lead.origin}
                  currentAssignedTo={lead.assigned_to}
                  onAssignmentChange={handleAssignmentChange}
                />
                {lead.assigned_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Asignado el {format(new Date(lead.assigned_at), "d MMM yyyy", { locale: es })}
                  </p>
                )}
              </div>
              {/* Canal de adquisición - para contact y valuation leads */}
              {(lead.origin === 'contact' || lead.origin === 'valuation') && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Canal de adquisición</label>
                    <AcquisitionChannelSelect
                      value={acquisitionChannelId}
                      onChange={handleAcquisitionChannelChange}
                    />
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha de entrada del lead</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !leadEntryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {leadEntryDate ? format(leadEntryDate, "d 'de' MMMM, yyyy", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={leadEntryDate}
                          onSelect={handleLeadEntryDateChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground mt-1">
                      Puede diferir de la fecha de registro automático
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline de actividad */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lead creado</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(lead.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
                {lead.email_sent && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email enviado</p>
                      {lead.email_sent_at && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(lead.email_sent_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {lead.email_opened && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email abierto</p>
                      {lead.email_opened_at && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(lead.email_opened_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
