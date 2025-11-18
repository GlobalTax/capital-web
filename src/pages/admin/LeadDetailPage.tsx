import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  User,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  FileText,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LeadTasksQuickView } from '@/features/admin/components/leads/LeadTasksQuickView';
import { LeadAssignmentSelect } from '@/components/admin/leads/LeadAssignmentSelect';
import { LeadStatusSelect } from '@/components/admin/leads/LeadStatusSelect';
import { LeadStatusBadge } from '@/components/admin/leads/LeadStatusBadge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useBrevoSync } from '@/hooks/useBrevoSync';
import { LeadToOperationConverter } from '@/features/operations-management/components/integrations';

interface LeadData {
  id: string;
  origin: 'contact' | 'valuation' | 'collaborator';
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
  const [notes, setNotes] = useState('');

  // Fetch lead data
  const { data: lead, isLoading, refetch } = useQuery({
    queryKey: ['lead-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No lead ID provided');

      // Parse ID format: origin_uuid
      const parts = id.split('_');
      if (parts.length < 2) throw new Error('Invalid lead ID format');
      
      const origin = parts[0] as 'contact' | 'valuation' | 'collaborator';
      const leadId = parts.slice(1).join('_');

      let tableName: any = '';
      let nameField = '';
      
      if (origin === 'contact') {
        tableName = 'contact_leads';
        nameField = 'full_name';
      } else if (origin === 'valuation') {
        tableName = 'company_valuations';
        nameField = 'contact_name';
      } else if (origin === 'collaborator') {
        tableName = 'collaborator_applications';
        nameField = 'full_name';
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
      } as LeadData;
    },
    enabled: !!id,
  });

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

  const handleAssignmentChange = () => {
    refetch();
    toast({
      title: "Asignación actualizada",
      description: "El lead ha sido asignado correctamente",
    });
  };

  const handleStatusChange = () => {
    refetch();
    toast({
      title: "Estado actualizado",
      description: "El estado del lead ha sido actualizado",
    });
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
    const configs = {
      contact: { label: 'Contacto', variant: 'default' as const },
      valuation: { label: 'Valoración', variant: 'secondary' as const },
      collaborator: { label: 'Colaborador', variant: 'outline' as const },
    };
    const config = configs[lead.origin];
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
          {/* Botón "Convertir en Operación" */}
          <LeadToOperationConverter lead={lead} />

          {/* Botón "Enviar a Brevo" */}
          <Button 
            variant="outline"
            onClick={handleSyncToBrevo}
            disabled={isSyncing}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSyncing ? 'Enviando...' : 'Enviar a Brevo'}
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
                  {lead.revenue && (
                    <div>
                      <p className="text-sm font-medium mb-1">Facturación</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(lead.revenue)}
                      </p>
                    </div>
                  )}
                  {lead.final_valuation && (
                    <div>
                      <p className="text-sm font-medium mb-1">Valoración Final</p>
                      <p className="text-sm font-semibold text-primary">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(lead.final_valuation)}
                      </p>
                    </div>
                  )}
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

          {/* Control de Fase 0 - Solo para valoraciones */}
          {lead.origin === 'valuation' && (
            <LeadTasksQuickView leadId={lead.id} leadType={lead.origin} />
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
              <Button size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Guardar Nota
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
