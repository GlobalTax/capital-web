import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { useContactNavigation } from '@/hooks/useContactNavigation';
import { AdminBreadcrumbs } from '@/components/admin/shared/AdminBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ArrowRight,
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar,
  Edit,
  MoreHorizontal,
  MessageSquare,
  FileText,
  Settings,
  Activity,
  User,
  Briefcase,
  Globe,
  Linkedin,
  ChevronLeft,
  ChevronRight
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Breadcrumbs */}
      <AdminBreadcrumbs 
        items={[
          { label: 'Contactos', path: '/admin/contacts' }
        ]}
        currentTitle={contact?.name}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/contacts')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Contactos
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">
              {contact.name}
            </h1>
            <p className="text-admin-text-secondary">{contact.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(contact.status)}
          
          {/* Navegación entre contactos */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToPrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-admin-text-secondary px-2">
              {currentIndex + 1} de {totalContacts}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToNext}
              disabled={!hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Información Básica */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-admin-text-secondary">Nombre completo</label>
                <p className="text-admin-text-primary font-medium">{contact.name}</p>
              </div>
              
              {contact.email && (
                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-admin-text-secondary" />
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}

              {contact.phone && (
                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">Teléfono</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-admin-text-secondary" />
                    <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}

              {contact.company && (
                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">Empresa</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-admin-text-secondary" />
                    <span>{contact.company}</span>
                  </div>
                </div>
              )}

              {contact.title && (
                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">Cargo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4 text-admin-text-secondary" />
                    <span>{contact.title}</span>
                  </div>
                </div>
              )}

              {contact.location && (
                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">Ubicación</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-admin-text-secondary" />
                    <span>{contact.location}</span>
                  </div>
                </div>
              )}

              {contact.linkedin_url && (
                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">LinkedIn</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Linkedin className="h-4 w-4 text-admin-text-secondary" />
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Ver perfil
                    </a>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <label className="text-sm font-medium text-admin-text-secondary">Fecha de creación</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-admin-text-secondary" />
                  <span className="text-sm">{formatDate(contact.created_at)}</span>
                </div>
              </div>

              {contact.score !== undefined && (
                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">Puntuación</label>
                  <div className="mt-1">
                    <Badge variant={contact.score > 70 ? 'default' : 'secondary'}>
                      {contact.score} puntos
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Reunión
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Timeline de Actividad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Timeline items */}
                    <div className="relative border-l border-border pl-6 pb-6">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 top-1"></div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Contacto creado</h4>
                        <span className="text-sm text-admin-text-secondary">
                          {formatDate(contact.created_at)}
                        </span>
                      </div>
                      <p className="text-admin-text-secondary text-sm">
                        El contacto fue añadido al sistema desde {contact.source === 'contact_lead' ? 'formulario web' : 'Apollo'}
                      </p>
                    </div>

                    {contact.updated_at && contact.updated_at !== contact.created_at && (
                      <div className="relative border-l border-border pl-6 pb-6">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 top-1"></div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Información actualizada</h4>
                          <span className="text-sm text-admin-text-secondary">
                            {formatDate(contact.updated_at)}
                          </span>
                        </div>
                        <p className="text-admin-text-secondary text-sm">
                          Los datos del contacto fueron actualizados
                        </p>
                      </div>
                    )}

                    <div className="text-center py-8 text-admin-text-secondary">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay más actividades registradas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Historial de Comunicaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-admin-text-secondary">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay comunicaciones registradas</p>
                    <Button variant="outline" className="mt-4">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar primer email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentos y Propuestas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-admin-text-secondary">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay documentos asociados</p>
                    <Button variant="outline" className="mt-4">
                      <FileText className="h-4 w-4 mr-2" />
                      Crear propuesta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notas del Contacto
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                    >
                      {isEditingNotes ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingNotes ? (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Añadir notas sobre este contacto..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={8}
                      />
                      <div className="flex gap-2">
                        <Button size="sm">
                          Guardar Notas
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditingNotes(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-32">
                      {notes ? (
                        <div className="whitespace-pre-wrap">{notes}</div>
                      ) : (
                        <div className="text-center py-8 text-admin-text-secondary">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No hay notas para este contacto</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setIsEditingNotes(true)}
                          >
                            Añadir primera nota
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};