import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { useContactNavigation } from '@/hooks/useContactNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { EditableField } from '@/components/admin/contacts/EditableField';
import { ContactTagsManager } from '@/components/admin/contacts/ContactTagsManager';
import { ContactListsManager } from '@/components/admin/contacts/ContactListsManager';
import { ContactNotesManager } from '@/components/admin/contacts/ContactNotesManager';
import { ContactTasksManager } from '@/components/admin/contacts/ContactTasksManager';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Tag,
  List,
  Zap,
  CheckSquare,
  StickyNote,
  Paperclip,
  Mail,
  MessageSquare,
  Activity,
  CircleUser
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ContactPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contact, setContact] = useState<UnifiedContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    hasPrevious, 
    hasNext, 
    goToPrevious, 
    goToNext,
    currentIndex,
    totalContacts
  } = useContactNavigation();

  useEffect(() => {
    if (id) {
      fetchContactDetails();
    }
  }, [id]);

  const fetchContactDetails = async () => {
    try {
      setIsLoading(true);
      
      // Intentar encontrar en contact_leads primero
      const { data: contactData, error } = await supabase
        .from('contact_leads')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && contactData) {
        const unifiedContact: UnifiedContact = {
          id: contactData.id,
          name: contactData.full_name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          status: contactData.status as any,
          source: 'contact_lead',
          location: contactData.country,
          created_at: contactData.created_at,
          updated_at: contactData.updated_at
        };
        setContact(unifiedContact);
        return;
      }

      // Si no se encuentra, buscar en apollo_contacts
      const { data: apolloData, error: apolloError } = await supabase
        .from('apollo_contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (!apolloError && apolloData) {
        const unifiedContact: UnifiedContact = {
          id: apolloData.id,
          name: apolloData.full_name || `${apolloData.first_name} ${apolloData.last_name}`,
          email: apolloData.email || '',
          phone: apolloData.phone,
          company: apolloData.company_domain,
          status: 'new',
          source: 'apollo',
          score: apolloData.contact_score || 0,
          created_at: apolloData.created_at,
          updated_at: apolloData.updated_at,
          title: apolloData.title,
          department: apolloData.department,
          linkedin_url: apolloData.linkedin_url,
          company_domain: apolloData.company_domain
        };
        setContact(unifiedContact);
        return;
      }

      // Si no se encuentra en ningún sitio
      toast({
        title: "Error",
        description: "No se pudo encontrar el contacto",
        variant: "destructive"
      });
      navigate('/admin/contacts');
      
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast({
        title: "Error",
        description: "Error al cargar el contacto",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateContactField = async (field: string, value: string) => {
    if (!contact) return;

    setIsSaving(true);
    try {
      if (contact.source === 'contact_lead') {
        const updateData: any = {};
        
        if (field === 'firstName' || field === 'lastName') {
          const firstName = field === 'firstName' ? value : contact.name?.split(' ')[0] || '';
          const lastName = field === 'lastName' ? value : contact.name?.split(' ').slice(1).join(' ') || '';
          updateData.full_name = `${firstName} ${lastName}`.trim();
        } else if (field === 'email') {
          updateData.email = value;
        } else if (field === 'phone') {
          updateData.phone = value;
        } else if (field === 'company') {
          updateData.company = value;
        } else if (field === 'location') {
          updateData.country = value;
        }

        const { error } = await supabase
          .from('contact_leads')
          .update(updateData)
          .eq('id', contact.id);

        if (error) throw error;

        // Update local state
        setContact(prev => prev ? {
          ...prev,
          name: updateData.full_name || prev.name,
          email: updateData.email || prev.email,
          phone: updateData.phone || prev.phone,
          company: updateData.company || prev.company,
          location: updateData.country || prev.location,
          updated_at: new Date().toISOString()
        } : null);

      } else if (contact.source === 'apollo') {
        const updateData: any = {};
        
        if (field === 'firstName') {
          updateData.first_name = value;
          updateData.full_name = `${value} ${contact.name?.split(' ').slice(1).join(' ') || ''}`.trim();
        } else if (field === 'lastName') {
          updateData.last_name = value;
          updateData.full_name = `${contact.name?.split(' ')[0] || ''} ${value}`.trim();
        } else if (field === 'email') {
          updateData.email = value;
        } else if (field === 'phone') {
          updateData.phone = value;
        } else if (field === 'company') {
          updateData.company_domain = value;
        } else if (field === 'title') {
          updateData.title = value;
        }

        const { error } = await supabase
          .from('apollo_contacts')
          .update(updateData)
          .eq('id', contact.id);

        if (error) throw error;

        // Update local state
        setContact(prev => prev ? {
          ...prev,
          name: updateData.full_name || prev.name,
          email: updateData.email || prev.email,
          phone: updateData.phone || prev.phone,
          company: updateData.company_domain || prev.company,
          title: updateData.title || prev.title,
          updated_at: new Date().toISOString()
        } : null);
      }

      toast({
        title: "Guardado",
        description: "Los cambios se han guardado correctamente",
      });

    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'secondary',
      contacted: 'outline',
      qualified: 'default',
      opportunity: 'default',
      customer: 'default',
      lost: 'destructive'
    };
    
    const labels: Record<string, string> = {
      new: 'Nuevo',
      contacted: 'Contactado',
      qualified: 'Calificado',
      opportunity: 'Oportunidad',
      customer: 'Cliente',
      lost: 'Perdido'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-8">
        <p>Contacto no encontrado</p>
        <Button onClick={() => navigate('/admin/contacts')} className="mt-4">
          Volver a Contactos
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button 
            onClick={() => navigate('/admin/contacts')}
            className="hover:text-gray-900"
          >
            Contactos
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{contact.name}</span>
        </div>

        {/* Header con email y navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {contact.email}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navegación entre contactos */}
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500 px-2">
                {currentIndex + 1} de {totalContacts}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToNext}
                disabled={!hasNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Column - Contact Info */}
        <div className="w-1/2 bg-white border-r border-gray-200 p-6">
          {/* Contact Information */}
          <div className="space-y-6">
              {/* Contact Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <EditableField
                    value={contact.name?.split(' ')[0] || ''}
                    placeholder="Nombre"
                    label="Nombre"
                    onSave={(value) => updateContactField('firstName', value)}
                    disabled={isSaving}
                  />
                  <EditableField
                    value={contact.name?.split(' ').slice(1).join(' ') || ''}
                    placeholder="Apellidos"
                    label="Apellidos"
                    onSave={(value) => updateContactField('lastName', value)}
                    disabled={isSaving}
                  />
                </div>

                <EditableField
                  value={contact.email}
                  placeholder="Email"
                  label="Email"
                  onSave={(value) => updateContactField('email', value)}
                  disabled={isSaving}
                />

                <EditableField
                  value={contact.phone || ''}
                  placeholder="Teléfono"
                  label="Teléfono"
                  onSave={(value) => updateContactField('phone', value)}
                  disabled={isSaving}
                />

                <EditableField
                  value={contact.company || ''}
                  placeholder="Empresa"
                  label="Empresa"
                  onSave={(value) => updateContactField('company', value)}
                  disabled={isSaving}
                />

                <EditableField
                  value={contact.title || ''}
                  placeholder="Cargo"
                  label="Cargo"
                  onSave={(value) => updateContactField('title', value)}
                  disabled={isSaving}
                />

                <EditableField
                  value={contact.location || ''}
                  placeholder="Ciudad, País"
                  label="Ubicación"
                  onSave={(value) => updateContactField('location', value)}
                  disabled={isSaving}
                />
              </div>

              {/* Tags Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Etiquetas
                  </label>
                </div>
                <ContactTagsManager
                  contactId={contact.id}
                  contactSource={contact.source === 'lead_score' ? 'contact_lead' : contact.source}
                  onTagsChange={() => {}}
                />
              </div>

              {/* Lists Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Listas
                  </label>
                </div>
                <ContactListsManager
                  contactId={contact.id}
                  contactSource={contact.source === 'lead_score' ? 'contact_lead' : contact.source}
                  onListsChange={() => {}}
                />
              </div>

              {/* Automations Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Automatizaciones
                  </label>
                </div>
                <div className="text-sm text-gray-500">Sin automatizaciones activas</div>
              </div>

              {/* Tasks Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Tareas
                  </label>
                </div>
                <ContactTasksManager
                  contactId={contact.id}
                  contactSource={contact.source === 'lead_score' ? 'contact_lead' : contact.source}
                  onTasksChange={() => {}}
                />
              </div>

              {/* Bottom Tabs */}
              <div className="border-t pt-6">
                <Tabs defaultValue="notes" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="notes" className="flex items-center gap-1">
                      <StickyNote className="h-4 w-4" />
                      Notas
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center gap-1">
                      <Paperclip className="h-4 w-4" />
                      Archivos
                    </TabsTrigger>
                    <TabsTrigger value="emails" className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Emails
                    </TabsTrigger>
                    <TabsTrigger value="sms" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="notes" className="mt-4">
                    <ContactNotesManager
                      contactId={contact.id}
                      contactSource={contact.source === 'lead_score' ? 'contact_lead' : contact.source}
                      onNotesChange={() => {}}
                    />
                  </TabsContent>

                  <TabsContent value="files" className="mt-4">
                    <div className="text-center py-8 text-gray-500">
                      <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay archivos</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="emails" className="mt-4">
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay emails</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="sms" className="mt-4">
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay mensajes SMS</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
        </div>

        {/* Right Column - Activity Timeline */}
        <div className="w-1/2 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Actividades recientes</h2>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              Todo
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CircleUser className="h-4 w-4 text-green-600" />
                </div>
                <div className="w-px h-8 bg-gray-200 mt-2"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">Contacto creado</p>
                  <span className="text-xs text-gray-500">{formatDate(contact.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600">
                  El contacto fue añadido al sistema desde {contact.source === 'contact_lead' ? 'formulario web' : 'Apollo'}
                </p>
              </div>
            </div>

            {contact.updated_at && contact.updated_at !== contact.created_at && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="w-px h-8 bg-gray-200 mt-2"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">Información actualizada</p>
                    <span className="text-xs text-gray-500">{formatDate(contact.updated_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Los datos del contacto fueron actualizados
                  </p>
                </div>
              </div>
            )}

            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay más actividades registradas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};