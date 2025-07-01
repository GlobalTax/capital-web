
import React, { useState } from 'react';
import { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, Mail, ExternalLink, Star, Users, Target, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LeadNurturingDashboard = () => {
  const {
    hotLeads,
    allLeads,
    unreadAlerts,
    isLoadingHotLeads,
    updateLeadInfo,
    getLeadStats
  } = useAdvancedLeadScoring();

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const stats = getLeadStats();
  const activeLeads = allLeads?.filter(lead => 
    lead.lead_status === 'active' || lead.lead_status === 'contacted'
  ) || [];

  const filteredLeads = activeLeads.filter(lead => 
    !searchTerm || 
    lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company_domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCall = (lead: any) => {
    toast({
      title: "📞 Llamada iniciada",
      description: `Contactando con ${lead.company_name || lead.company_domain}...`,
    });
    
    updateLeadInfo.mutate({
      visitorId: lead.visitor_id,
      updates: { 
        lead_status: 'contacted', 
        notes: `Llamada ${new Date().toLocaleString()}` 
      }
    });
  };

  const handleEmail = (lead: any) => {
    const subject = `Oportunidad de M&A - ${lead.company_name || lead.company_domain}`;
    const body = `Hola ${lead.contact_name || 'equipo'},\n\nHemos visto su interés en nuestros servicios de M&A.\n\n¿Le interesaría una consulta gratuita?\n\nSaludos,\nEquipo Capittal`;
    
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    
    updateLeadInfo.mutate({
      visitorId: lead.visitor_id,
      updates: { lead_status: 'contacted' }
    });
  };

  const handleExportToCRM = (lead: any) => {
    // Preparar datos para el CRM externo
    const crmData = {
      name: lead.company_name || lead.company_domain,
      contact: lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      score: lead.total_score,
      industry: lead.industry,
      size: lead.company_size,
      notes: lead.notes,
      source: 'Lead Nurturing Tool'
    };

    // Abrir tu CRM externo con los datos del lead
    const crmUrl = `https://c1cd2940-10b7-4c6d-900a-07b0f572e7b9.lovableproject.com/add-client?${new URLSearchParams(crmData).toString()}`;
    window.open(crmUrl, '_blank');

    // Marcar como transferido
    updateLeadInfo.mutate({
      visitorId: lead.visitor_id,
      updates: { 
        lead_status: 'transferred_to_crm',
        crm_synced: true,
        notes: `${lead.notes || ''}\n\nTransferido al CRM: ${new Date().toLocaleString()}`
      }
    });

    toast({
      title: "🚀 Exportado al CRM",
      description: `${lead.company_name || lead.company_domain} ha sido transferido al CRM principal.`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (isLoadingHotLeads) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🎯 Lead Nurturing
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona y convierte tus leads en clientes
          </p>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Activos</p>
                <p className="text-2xl font-bold">{activeLeads.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Calientes</p>
                <p className="text-2xl font-bold text-red-600">{stats?.hotLeadsCount || 0}</p>
              </div>
              <Star className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.averageScore || 0}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Listos para CRM</p>
                <p className="text-2xl font-bold text-green-600">
                  {hotLeads?.filter(lead => lead.total_score >= 80).length || 0}
                </p>
              </div>
              <ArrowRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de leads calientes */}
      {hotLeads && hotLeads.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              🔥 Leads Calientes - ¡Acción Inmediata!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotLeads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium">{lead.company_name || lead.company_domain}</p>
                    <p className="text-sm text-gray-600">Score: {lead.total_score} puntos</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleCall(lead)}>
                      <Phone className="w-4 h-4 mr-1" />
                      Llamar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportToCRM(lead)}>
                      <ArrowRight className="w-4 h-4 mr-1" />
                      Al CRM
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buscador */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todos los Leads</CardTitle>
            <Input
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <Card key={lead.id} className={`${lead.total_score >= 80 ? 'border-red-200 bg-red-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {lead.company_name || lead.company_domain || 'Lead Anónimo'}
                          </h3>
                          <Badge className={`px-2 py-1 text-xs font-medium border ${getScoreColor(lead.total_score)}`}>
                            {lead.total_score} pts
                          </Badge>
                          {lead.total_score >= 80 && (
                            <Badge className="bg-red-500 text-white">🔥 CALIENTE</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div><span className="font-medium">Contacto:</span> {lead.contact_name || 'N/A'}</div>
                          <div><span className="font-medium">Email:</span> {lead.email || 'N/A'}</div>
                          <div><span className="font-medium">Industria:</span> {lead.industry || 'N/A'}</div>
                          <div><span className="font-medium">Visitas:</span> {lead.visit_count}</div>
                        </div>

                        <Badge variant="outline" className="mr-2">
                          {lead.lead_status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {lead.phone && (
                          <Button size="sm" variant="outline" onClick={() => handleCall(lead)}>
                            <Phone className="w-4 h-4 mr-1" />
                            Llamar
                          </Button>
                        )}
                        
                        {lead.email && (
                          <Button size="sm" variant="outline" onClick={() => handleEmail(lead)}>
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleExportToCRM(lead)}
                          disabled={lead.crm_synced}
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          {lead.crm_synced ? 'En CRM' : 'Al CRM'}
                        </Button>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                              Ver más
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Lead: {selectedLead?.company_name || selectedLead?.company_domain}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedLead && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">Puntuación Total</p>
                                    <div className={`p-2 rounded border ${getScoreColor(selectedLead.total_score)}`}>
                                      {selectedLead.total_score} puntos
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium">Estado</p>
                                    <Badge>{selectedLead.lead_status.toUpperCase()}</Badge>
                                  </div>
                                </div>

                                <div>
                                  <p className="font-medium mb-2">Notas de Seguimiento</p>
                                  <Textarea
                                    placeholder="Añadir notas sobre este lead..."
                                    defaultValue={selectedLead.notes || ''}
                                    onBlur={(e) => {
                                      if (e.target.value !== selectedLead.notes) {
                                        updateLeadInfo.mutate({
                                          visitorId: selectedLead.visitor_id,
                                          updates: { notes: e.target.value }
                                        });
                                      }
                                    }}
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{selectedLead.visit_count}</div>
                                    <div className="text-sm text-gray-500">Visitas</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{selectedLead.total_score}</div>
                                    <div className="text-sm text-gray-500">Score</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                      {Math.ceil((Date.now() - new Date(selectedLead.first_visit).getTime()) / (1000 * 60 * 60 * 24))}
                                    </div>
                                    <div className="text-sm text-gray-500">Días</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron leads activos</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadNurturingDashboard;
