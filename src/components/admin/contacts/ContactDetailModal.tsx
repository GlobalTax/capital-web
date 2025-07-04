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
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  User,
  Activity,
  FileText,
  Edit
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
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && contactId) {
      fetchContactDetails();
    }
  }, [isOpen, contactId]);

  const fetchContactDetails = async () => {
    try {
      setIsLoading(true);
      
      // Get contact details from Apollo (contact_leads module removed)
      let contactFound = false;
      
      // Try Apollo contacts first
      const { data: apolloData, error: apolloError } = await supabase
        .from('apollo_contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (!apolloError && apolloData) {
        contactFound = true;
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
      
      // Try lead_scores if not found in Apollo
      if (!contactFound) {
        const { data: leadScoreData, error: leadScoreError } = await supabase
          .from('lead_scores')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!leadScoreError && leadScoreData) {
          setContact({
            id: leadScoreData.id,
            name: leadScoreData.contact_name || 'Visitante Anónimo',
            email: leadScoreData.email || '',
            phone: '',
            company: leadScoreData.company_name || leadScoreData.company_domain,
            status: leadScoreData.lead_status === 'hot' ? 'qualified' : 'new',
            source: 'lead_score',
            score: leadScoreData.total_score || 0,
            created_at: leadScoreData.updated_at || new Date().toISOString(),
            updated_at: leadScoreData.updated_at,
            location: leadScoreData.location,
            is_hot_lead: leadScoreData.is_hot_lead,
            company_domain: leadScoreData.company_domain
          });
        }
      }
      
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
      year: 'numeric'
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {contact.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(contact.status)}
              <Button variant="outline" size="sm">
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo - Información Personal */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">Nombre completo</label>
                  <p className="text-admin-text-primary">{contact.name}</p>
                </div>
                
                {contact.email && (
                  <div>
                    <label className="text-sm font-medium text-admin-text-secondary">Email</label>
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-admin-text-secondary" />
                      <span>{contact.company}</span>
                    </div>
                  </div>
                )}

                {contact.title && (
                  <div>
                    <label className="text-sm font-medium text-admin-text-secondary">Cargo</label>
                    <p className="text-admin-text-primary">{contact.title}</p>
                  </div>
                )}

                {contact.location && (
                  <div>
                    <label className="text-sm font-medium text-admin-text-secondary">Ubicación</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-admin-text-secondary" />
                      <span>{contact.location}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-admin-text-secondary">Fecha de creación</label>
                  <p className="text-admin-text-primary">{formatDate(contact.created_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cambiar Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onStatusUpdate(contact.id, 'contacted', contact.source)}
                  >
                    Marcar como Contactado
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onStatusUpdate(contact.id, 'qualified', contact.source)}
                  >
                    Marcar como Calificado
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onStatusUpdate(contact.id, 'opportunity', contact.source)}
                  >
                    Convertir en Oportunidad
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onStatusUpdate(contact.id, 'customer', contact.source)}
                  >
                    Marcar como Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho - Actividades y Notas */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity">Actividades Recientes</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Historial de Actividad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-primary pl-4 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Contacto creado</h4>
                          <span className="text-sm text-admin-text-secondary">
                            {formatDate(contact.created_at)}
                          </span>
                        </div>
                        <p className="text-admin-text-secondary text-sm">
                          El contacto fue añadido al sistema desde {contact.source === 'apollo' ? 'Apollo' : 'Web Tracking'}
                        </p>
                      </div>
                      
                      {contact.status !== 'new' && (
                        <div className="border-l-2 border-blue-500 pl-4 pb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Estado actualizado</h4>
                            <span className="text-sm text-admin-text-secondary">
                              {contact.updated_at ? formatDate(contact.updated_at) : 'Fecha no disponible'}
                            </span>
                          </div>
                          <p className="text-admin-text-secondary text-sm">
                            Estado cambiado a: {contact.status}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Placeholder para más actividades */}
                    <div className="text-center py-4 text-admin-text-secondary text-sm">
                      No hay más actividades registradas
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notas del Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Añadir notas sobre este contacto..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={8}
                      />
                      <Button>
                        Guardar Notas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};