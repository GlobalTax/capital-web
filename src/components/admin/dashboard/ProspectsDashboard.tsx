
import React, { useState } from 'react';
import { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Phone, Mail, ExternalLink, Star, TrendingUp, Users, Target, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProspectsDashboard = () => {
  const {
    hotLeads,
    allLeads,
    unreadAlerts,
    isLoadingHotLeads,
    markAlertAsRead,
    updateLeadInfo,
    getLeadStats
  } = useAdvancedLeadScoring();

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const stats = getLeadStats();

  const filteredLeads = allLeads?.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.lead_status === filterStatus;
    const matchesSearch = !searchTerm || 
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  }) || [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const handleCall = (lead: any) => {
    toast({
      title: "🔥 Acción registrada",
      description: `Iniciando llamada a ${lead.company_name || lead.company_domain}...`,
    });
    
    updateLeadInfo.mutate({
      visitorId: lead.visitor_id,
      updates: { lead_status: 'contacted', notes: `Llamada iniciada ${new Date().toLocaleString()}` }
    });
  };

  const handleEmail = (lead: any) => {
    const subject = `Oportunidad de M&A - ${lead.company_name || lead.company_domain}`;
    const body = `Hola ${lead.contact_name || 'equipo'},\n\nNos hemos fijado en su interés en nuestros servicios de M&A...\n\nSaludos,\nEquipo Capittal`;
    
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    
    updateLeadInfo.mutate({
      visitorId: lead.visitor_id,
      updates: { lead_status: 'contacted' }
    });
  };

  const handleExportToCRM = (lead: any) => {
    toast({
      title: "🔄 Exportando a CRM",
      description: `${lead.company_name || lead.company_domain} será sincronizado con HubSpot...`,
    });
    
    updateLeadInfo.mutate({
      visitorId: lead.visitor_id,
      updates: { crm_synced: true, crm_id: `hs_${Date.now()}` }
    });
  };

  const LeadCard = ({ lead, isHot = false }: { lead: any; isHot?: boolean }) => (
    <Card className={`mb-4 ${isHot ? 'border-red-200 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">
                {lead.company_name || lead.company_domain || 'Lead Anónimo'}
              </h3>
              <Badge className={`px-2 py-1 text-xs font-medium ${getScoreColor(lead.total_score)}`}>
                {lead.total_score} pts
              </Badge>
              {lead.is_hot_lead && (
                <Badge className="bg-red-500 text-white">
                  🔥 HOT
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">Contacto:</span> {lead.contact_name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {lead.email || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Industria:</span> {lead.industry || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Tamaño:</span> {lead.company_size || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Visitas:</span> {lead.visit_count}
              </div>
              <div>
                <span className="font-medium">Última actividad:</span> {' '}
                {new Date(lead.last_activity).toLocaleDateString()}
              </div>
            </div>

            <Badge 
              variant="outline" 
              className={`mr-2 ${lead.lead_status === 'active' ? 'border-green-500 text-green-700' : ''}`}
            >
              {lead.lead_status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {lead.phone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCall(lead)}
                className="flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                Llamar
              </Button>
            )}
            
            {lead.email && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEmail(lead)}
                className="flex items-center gap-1"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportToCRM(lead)}
              disabled={lead.crm_synced}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              {lead.crm_synced ? 'Sincronizado' : 'A CRM'}
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedLead(lead)}
                >
                  Detalles
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Detalles del Prospecto: {selectedLead?.company_name || selectedLead?.company_domain}
                  </DialogTitle>
                </DialogHeader>
                
                {selectedLead && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Estado del Lead</Label>
                        <Select 
                          defaultValue={selectedLead.lead_status}
                          onValueChange={(value) => {
                            updateLeadInfo.mutate({
                              visitorId: selectedLead.visitor_id,
                              updates: { lead_status: value }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="contacted">Contactado</SelectItem>
                            <SelectItem value="converted">Convertido</SelectItem>
                            <SelectItem value="cold">Frío</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Puntuación Total</Label>
                        <div className={`p-2 rounded ${getScoreColor(selectedLead.total_score)}`}>
                          {selectedLead.total_score} puntos
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Notas</Label>
                      <Textarea
                        placeholder="Añadir notas sobre este prospecto..."
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
                        <div className="text-sm text-gray-500">Días desde 1ª visita</div>
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
  );

  if (isLoadingHotLeads) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando dashboard de prospectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold">{stats.totalLeads}</p>
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
                  <p className="text-2xl font-bold text-red-600">{stats.hotLeadsCount}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{stats.averageScore}</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                  <p className="text-2xl font-bold text-green-600">{stats.conversionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas no leídas */}
      {unreadAlerts && unreadAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Alertas Activas ({unreadAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unreadAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(alert.priority)}`}></div>
                    <span className="font-medium">{alert.message}</span>
                    <Badge variant="outline" className="text-xs">
                      {alert.alert_type}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAlertAsRead.mutate(alert.id)}
                  >
                    Marcar leída
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="hot" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hot">🔥 Leads Calientes</TabsTrigger>
          <TabsTrigger value="all">📊 Todos los Leads</TabsTrigger>
          <TabsTrigger value="pipeline">📈 Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="hot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">🔥 Prospectos Calientes (Score 80+)</CardTitle>
              <p className="text-sm text-gray-600">
                Estos leads requieren atención inmediata
              </p>
            </CardHeader>
            <CardContent>
              {hotLeads && hotLeads.length > 0 ? (
                <div className="space-y-4">
                  {hotLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} isHot={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay leads calientes en este momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>📊 Todos los Leads</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="contacted">Contactados</SelectItem>
                      <SelectItem value="converted">Convertidos</SelectItem>
                      <SelectItem value="cold">Fríos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron leads con los filtros aplicados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['active', 'contacted', 'converted', 'cold'].map((status) => {
              const statusLeads = allLeads?.filter(lead => lead.lead_status === status) || [];
              return (
                <Card key={status}>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({statusLeads.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {statusLeads.slice(0, 5).map((lead) => (
                        <div
                          key={lead.id}
                          className="p-2 bg-gray-50 rounded text-sm"
                        >
                          <div className="font-medium">
                            {lead.company_name || lead.company_domain}
                          </div>
                          <div className="text-xs text-gray-500">
                            Score: {lead.total_score}
                          </div>
                        </div>
                      ))}
                      {statusLeads.length > 5 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{statusLeads.length - 5} más
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProspectsDashboard;
