import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Send, 
  TrendingUp,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SecurityLead {
  id: string;
  cif: string | null;
  email: string;
  contact_name: string;
  company_name: string;
  website: string | null;
  phone: string | null;
  security_subtype: string;
  revenue_band: string;
  ebitda_band: string;
  status: string;
  created_at: string;
  updated_at: string;
  initial_valuation?: {
    ev_low: number;
    ev_base: number;
    ev_high: number;
    ebitda_multiple_base: number;
  };
  enrichment_count?: number;
  refined_valuation?: {
    ev_final: number;
    presentation_token: string | null;
    approved_at: string | null;
  };
}

const STATUS_LABELS = {
  new: 'Nuevo',
  needs_enrichment: 'Pendiente Enriquecimiento',
  in_review: 'En Revisión',
  sent_refined: 'Valoración Enviada',
  qualified: 'Cualificado'
};

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800',
  needs_enrichment: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-purple-100 text-purple-800',
  sent_refined: 'bg-green-100 text-green-800',
  qualified: 'bg-emerald-100 text-emerald-800'
};

const SUBTYPE_LABELS = {
  integrador_mantenimiento: 'Integrador / Mantenimiento',
  cra_monitorizacion: 'CRA / Monitorización',
  distribucion: 'Distribución',
  mixto: 'Mixto'
};

export default function SecurityLeadsPanel() {
  const [leads, setLeads] = useState<SecurityLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<SecurityLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<SecurityLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subtypeFilter, setSubtypeFilter] = useState<string>('all');

  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, subtypeFilter]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // Fetch leads with related valuation data
      const { data: leadsData, error } = await supabase
        .from('lead_security')
        .select(`
          *,
          lead_valuation_initial (
            ev_low,
            ev_base,
            ev_high,
            ebitda_multiple_base
          ),
          lead_valuation_refined (
            ev_final,
            presentation_token,
            approved_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get enrichment counts
      const leadsWithCounts = await Promise.all(
        leadsData?.map(async (lead) => {
          const { count } = await supabase
            .from('lead_enrichment_snapshots')
            .select('*', { count: 'exact', head: true })
            .eq('lead_security_id', lead.id);

          return {
            ...lead,
            initial_valuation: lead.lead_valuation_initial?.[0] || null,
            refined_valuation: lead.lead_valuation_refined?.[0] || null,
            enrichment_count: count || 0
          };
        }) || []
      );

      setLeads(leadsWithCounts);
    } catch (error) {
      console.error('Error fetching security leads:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los leads de seguridad",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (subtypeFilter !== 'all') {
      filtered = filtered.filter(lead => lead.security_subtype === subtypeFilter);
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('lead_security')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );

      toast({
        title: "Estado Actualizado",
        description: `Lead marcado como: ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS]}`
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del lead",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k€`;
    }
    return `${amount.toFixed(0)}€`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheck className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Cargando leads de seguridad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Leads Sector Seguridad</h1>
            <p className="text-muted-foreground">
              Gestión de leads del calculadora especializada en seguridad
            </p>
          </div>
        </div>
        <Button onClick={fetchLeads}>
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa, contacto o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subtypeFilter} onValueChange={setSubtypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por subtipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los subtipos</SelectItem>
                {Object.entries(SUBTYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No se encontraron leads</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Subtipo</TableHead>
                  <TableHead>Valoración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.company_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {lead.website && (
                            <>
                              <Globe className="h-3 w-3" />
                              <span>{lead.website}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.contact_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {SUBTYPE_LABELS[lead.security_subtype as keyof typeof SUBTYPE_LABELS]}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        Rev: {lead.revenue_band} | EBITDA: {lead.ebitda_band}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.initial_valuation ? (
                        <div>
                          <div className="font-medium">
                            {formatCurrency(lead.initial_valuation.ev_base)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lead.initial_valuation.ebitda_multiple_base}x EBITDA
                          </div>
                          {lead.refined_valuation && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Refinada: {formatCurrency(lead.refined_valuation.ev_final)}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin valorar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS]}
                      >
                        {STATUS_LABELS[lead.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                      {lead.enrichment_count > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {lead.enrichment_count} enriquecimientos
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(lead.created_at)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {lead.status === 'new' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateLeadStatus(lead.id, 'needs_enrichment')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {lead.status === 'in_review' && lead.refined_valuation && (
                          <Button 
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, 'sent_refined')}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Modal would go here */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedLead.company_name}
              </CardTitle>
              <CardDescription>
                Detalle del lead de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="valuation">Valoración</TabsTrigger>
                  <TabsTrigger value="enrichment">Enriquecimiento</TabsTrigger>
                  <TabsTrigger value="actions">Acciones</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Información de Contacto</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Nombre:</strong> {selectedLead.contact_name}</div>
                        <div><strong>Email:</strong> {selectedLead.email}</div>
                        {selectedLead.phone && <div><strong>Teléfono:</strong> {selectedLead.phone}</div>}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Información de la Empresa</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>CIF:</strong> {selectedLead.cif || 'No proporcionado'}</div>
                        <div><strong>Web:</strong> {selectedLead.website || 'No proporcionada'}</div>
                        <div><strong>Subtipo:</strong> {SUBTYPE_LABELS[selectedLead.security_subtype as keyof typeof SUBTYPE_LABELS]}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="valuation" className="space-y-4">
                  {selectedLead.initial_valuation && (
                    <div>
                      <h3 className="font-semibold mb-2">Valoración Inicial</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded">
                          <div className="text-lg font-bold">{formatCurrency(selectedLead.initial_valuation.ev_low)}</div>
                          <div className="text-sm text-muted-foreground">Conservador</div>
                        </div>
                        <div className="text-center p-4 border rounded border-primary">
                          <div className="text-lg font-bold text-primary">{formatCurrency(selectedLead.initial_valuation.ev_base)}</div>
                          <div className="text-sm text-muted-foreground">Base</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-lg font-bold">{formatCurrency(selectedLead.initial_valuation.ev_high)}</div>
                          <div className="text-sm text-muted-foreground">Optimista</div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="enrichment" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Estado de Enriquecimiento</h3>
                    <p className="text-muted-foreground">
                      {selectedLead.enrichment_count} enriquecimientos realizados
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateLeadStatus(selectedLead.id, 'needs_enrichment')}
                      disabled={selectedLead.status !== 'new'}
                    >
                      Marcar para Enriquecimiento
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateLeadStatus(selectedLead.id, 'in_review')}
                      disabled={selectedLead.status === 'new'}
                    >
                      Marcar en Revisión
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}