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
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Tag,
  List,
  Zap,
  CheckSquare,
  StickyNote,
  Paperclip,
  Mail,
  MessageSquare,
  Phone,
  Building,
  MapPin,
  User,
  Calendar,
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
            
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              + Crear trato
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Column - Contact Info */}
        <div className="w-1/2 bg-white border-r border-gray-200 p-6">
          {/* Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="personal">Información personal</TabsTrigger>
              <TabsTrigger value="deals">Todos los tratos</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              {/* Contact Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nombre</label>
                    <Input 
                      value={contact.name?.split(' ')[0] || ''} 
                      placeholder="Nombre" 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Apellidos</label>
                    <Input 
                      value={contact.name?.split(' ').slice(1).join(' ') || ''} 
                      placeholder="Apellidos" 
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <Input value={contact.email} placeholder="Email" className="mt-1" />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Teléfono</label>
                  <Input value={contact.phone || ''} placeholder="Teléfono" className="mt-1" />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Empresa</label>
                  <Input value={contact.company || ''} placeholder="Empresa" className="mt-1" />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Cargo</label>
                  <Input value={contact.title || ''} placeholder="Cargo" className="mt-1" />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Ubicación</label>
                  <Input value={contact.location || ''} placeholder="Ciudad, País" className="mt-1" />
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Etiquetas
                  </label>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-500">Sin etiquetas</div>
              </div>

              {/* Lists Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Listas
                  </label>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-500">Sin listas</div>
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
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-500">Sin tareas</div>
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
                    <div className="text-center py-8 text-gray-500">
                      <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay notas</p>
                    </div>
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
            </TabsContent>

            <TabsContent value="deals" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay tratos asociados</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  Crear primer trato
                </Button>
              </div>
            </TabsContent>
          </Tabs>
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