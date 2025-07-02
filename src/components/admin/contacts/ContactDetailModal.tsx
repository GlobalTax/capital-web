import React, { useState, useEffect } from 'react';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar,
  Star,
  Globe,
  User,
  Activity,
  Tag,
  FileText
} from 'lucide-react';

interface ContactDetailModalProps {
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (contactId: string, status: string, source: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contactId,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  const [contact, setContact] = useState<UnifiedContact | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && contactId) {
      fetchContactDetails();
    }
  }, [isOpen, contactId]);

  const fetchContactDetails = async () => {
    try {
      setIsLoading(true);
      
      // Get contact details from the appropriate table
      const { data: contactData, error } = await supabase
        .from('contact_leads')
        .select('*')
        .eq('id', contactId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Try Apollo contacts if not found in contact_leads
        const { data: apolloData, error: apolloError } = await supabase
          .from('apollo_contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!apolloError && apolloData) {
          setContact({
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
          });
        }
      } else if (contactData) {
        setContact({
          id: contactData.id,
          name: contactData.full_name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          status: contactData.status as any,
          source: 'contact_lead',
          created_at: contactData.created_at,
          updated_at: contactData.updated_at,
          location: contactData.country
        });
      }

      // Fetch related activities (simplified for now)
      // In a real implementation, you'd join with lead_behavior_events, etc.
      setActivities([]);
      
    } catch (error) {
      console.error('Error fetching contact details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!contact) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <p>No se pudo cargar la información del contacto</p>
            <Button onClick={onClose} className="mt-4">Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Detalles del Contacto
            </DialogTitle>
            <div className="flex items-center gap-2">
              {contact.is_hot_lead || (contact.score || 0) >= 80 && (
                <Badge variant="default" className="bg-orange-500">
                  <Star className="h-3 w-3 mr-1" />
                  Lead Caliente
                </Badge>
              )}
              <Badge variant="outline">
                {contact.source === 'contact_lead' ? 'Formulario' : 
                 contact.source === 'apollo' ? 'Apollo' : 'Web Tracking'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-admin-text-primary">
                      {contact.name}
                    </h3>
                    {contact.title && (
                      <p className="text-admin-text-secondary">{contact.title}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-admin-text-secondary" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-admin-text-secondary" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-admin-text-secondary" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                    {contact.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-admin-text-secondary" />
                        <span>{contact.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {contact.score !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {contact.score}
                    </div>
                    <div className="text-sm text-admin-text-secondary">
                      Puntuación
                    </div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full mt-2">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(contact.score, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
              <TabsTrigger value="actions">Acciones</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-admin-text-secondary">Estado:</span>
                      <Badge variant={contact.status === 'customer' ? 'default' : 'secondary'}>
                        {contact.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-admin-text-secondary">Fuente:</span>
                      <span>{contact.source === 'contact_lead' ? 'Formulario Web' : 
                             contact.source === 'apollo' ? 'Apollo' : 'Web Tracking'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-admin-text-secondary">Creado:</span>
                      <span>{formatDate(contact.created_at)}</span>
                    </div>
                    {contact.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-admin-text-secondary">Actualizado:</span>
                        <span>{formatDate(contact.updated_at)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Información de Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contact.company && (
                      <div className="flex justify-between">
                        <span className="text-admin-text-secondary">Empresa:</span>
                        <span>{contact.company}</span>
                      </div>
                    )}
                    {contact.department && (
                      <div className="flex justify-between">
                        <span className="text-admin-text-secondary">Departamento:</span>
                        <span>{contact.department}</span>
                      </div>
                    )}
                    {contact.industry && (
                      <div className="flex justify-between">
                        <span className="text-admin-text-secondary">Industria:</span>
                        <span>{contact.industry}</span>
                      </div>
                    )}
                    {contact.linkedin_url && (
                      <div className="flex justify-between">
                        <span className="text-admin-text-secondary">LinkedIn:</span>
                        <a 
                          href={contact.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          Ver perfil
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Historial de Actividad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-admin-text-secondary">
                      No hay actividad registrada para este contacto
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4 pb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.type}</h4>
                            <span className="text-sm text-admin-text-secondary">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                          <p className="text-admin-text-secondary text-sm">
                            {activity.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-admin-text-secondary">
                    Funcionalidad de notas en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Acciones Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => onStatusUpdate(contact.id, 'contacted', contact.source)}
                    >
                      Marcar como Contactado
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => onStatusUpdate(contact.id, 'qualified', contact.source)}
                    >
                      Marcar como Calificado
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => onStatusUpdate(contact.id, 'opportunity', contact.source)}
                    >
                      Convertir en Oportunidad
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => onStatusUpdate(contact.id, 'customer', contact.source)}
                    >
                      Marcar como Cliente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};