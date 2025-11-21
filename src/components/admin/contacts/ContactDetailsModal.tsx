import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { LeadAIReportViewer } from '@/components/admin/LeadAIReportViewer';
import { SectorDossierViewer } from '@/components/admin/SectorDossierViewer';
import {
  Mail,
  Phone,
  Building,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactDetailsModalProps {
  contactId: string;
  contact?: UnifiedContact;
  onClose: () => void;
  onUpdate: () => void;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  contact,
  onClose,
}) => {
  if (!contact) return null;

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={!!contact} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{contact.name}</DialogTitle>
              <DialogDescription>{contact.email}</DialogDescription>
            </div>
            <div className="flex gap-2">
              {contact.priority === 'hot' && (
                <Badge className="bg-red-500">
                  <Flame className="h-3 w-3 mr-1" />
                  Hot Lead
                </Badge>
              )}
              {contact.email_opened && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Email Abierto
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="calls">Llamadas</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
            <TabsTrigger value="files">Archivos</TabsTrigger>
            <TabsTrigger value="ai">🤖 IA</TabsTrigger>
            <TabsTrigger value="sector">📊 Sector</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{contact.email}</div>
                    </div>
                  </div>

                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Teléfono</div>
                        <div className="font-medium">{contact.phone}</div>
                      </div>
                    </div>
                  )}

                  {contact.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Empresa</div>
                        <div className="font-medium">{contact.company}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Creado</div>
                      <div className="font-medium">
                        {formatDistanceToNow(new Date(contact.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specific Details by Origin */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Detalles Específicos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {contact.origin === 'valuation' && (
                      <>
                        {contact.industry && (
                          <div>
                            <div className="text-sm text-muted-foreground">Industria</div>
                            <div className="font-medium">{contact.industry}</div>
                          </div>
                        )}
                        {contact.employee_range && (
                          <div>
                            <div className="text-sm text-muted-foreground">Empleados</div>
                            <div className="font-medium">{contact.employee_range}</div>
                          </div>
                        )}
                        {contact.final_valuation && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm text-muted-foreground">Valoración</div>
                              <div className="font-medium text-green-600">
                                {formatCurrency(contact.final_valuation)}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {contact.origin === 'collaborator' && (
                      <>
                        {contact.profession && (
                          <div>
                            <div className="text-sm text-muted-foreground">Profesión</div>
                            <div className="font-medium">{contact.profession}</div>
                          </div>
                        )}
                        {contact.experience && (
                          <div>
                            <div className="text-sm text-muted-foreground">Experiencia</div>
                            <div className="font-medium">{contact.experience}</div>
                          </div>
                        )}
                      </>
                    )}

                    {(contact.origin === 'acquisition' || contact.origin === 'company_acquisition') && (
                      <>
                        {contact.sectors_of_interest && (
                          <div>
                            <div className="text-sm text-muted-foreground">Sectores de Interés</div>
                            <div className="font-medium">{contact.sectors_of_interest}</div>
                          </div>
                        )}
                        {contact.investment_budget && (
                          <div>
                            <div className="text-sm text-muted-foreground">Presupuesto</div>
                            <div className="font-medium">{contact.investment_budget}</div>
                          </div>
                        )}
                        {contact.target_timeline && (
                          <div>
                            <div className="text-sm text-muted-foreground">Timeline</div>
                            <div className="font-medium">{contact.target_timeline}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Tracking Data */}
                {(contact.utm_source || contact.referrer) && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Datos de Tracking</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {contact.utm_source && (
                        <div>
                          <div className="text-sm text-muted-foreground">UTM Source</div>
                          <Badge variant="secondary">{contact.utm_source}</Badge>
                        </div>
                      )}
                      {contact.utm_medium && (
                        <div>
                          <div className="text-sm text-muted-foreground">UTM Medium</div>
                          <Badge variant="secondary">{contact.utm_medium}</Badge>
                        </div>
                      )}
                      {contact.utm_campaign && (
                        <div>
                          <div className="text-sm text-muted-foreground">UTM Campaign</div>
                          <Badge variant="secondary">{contact.utm_campaign}</Badge>
                        </div>
                      )}
                      {contact.referrer && (
                        <div>
                          <div className="text-sm text-muted-foreground">Referrer</div>
                          <div className="font-medium text-sm truncate">{contact.referrer}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lead Score Card */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {contact.priority === 'hot' ? '🔥 90' : contact.priority === 'warm' ? '⚡ 60' : '❄️ 30'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {contact.priority === 'hot' ? 'Hot Lead' : contact.priority === 'warm' ? 'Warm Lead' : 'Cold Lead'}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Emails</CardTitle>
              </CardHeader>
              <CardContent>
                {contact.email_sent ? (
                  <div className="space-y-4">
                    <div className="border-l-4 border-l-green-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Email de bienvenida enviado</div>
                          <div className="text-sm text-muted-foreground">
                            {contact.email_sent_at &&
                              formatDistanceToNow(new Date(contact.email_sent_at), {
                                addSuffix: true,
                                locale: es,
                              })}
                          </div>
                        </div>
                        {contact.email_opened && (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Abierto{' '}
                            {contact.email_opened_at &&
                              formatDistanceToNow(new Date(contact.email_opened_at), {
                                addSuffix: true,
                                locale: es,
                              })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No se han enviado emails a este contacto</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs - placeholder content */}
          <TabsContent value="calls">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Historial de llamadas (próximamente)</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Notas del contacto (próximamente)</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Archivos adjuntos (próximamente)</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <LeadAIReportViewer 
              leadId={contact.id} 
              leadType={contact.origin as 'valuation' | 'contact' | 'collaborator'}
              companyName={contact.company || contact.name}
            />
          </TabsContent>

          <TabsContent value="sector">
            <SectorDossierViewer 
              sector={contact.industry || 'General'}
              leadId={contact.id}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Timeline de actividad (próximamente)</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsModal;
