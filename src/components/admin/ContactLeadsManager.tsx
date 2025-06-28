
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Mail, Phone, MapPin, Building, Users } from 'lucide-react';

interface ContactLead {
  id: string;
  full_name: string;
  company: string;
  phone?: string;
  email: string;
  country?: string;
  company_size?: string;
  referral?: string;
  status: string;
  created_at: string;
  hubspot_sent: boolean;
  email_sent: boolean;
}

const ContactLeadsManager = () => {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      
      toast({
        title: "Estado actualizado",
        description: "El estado del lead ha sido actualizado",
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      new: { label: 'Nuevo', variant: 'default' as const },
      contacted: { label: 'Contactado', variant: 'secondary' as const },
      qualified: { label: 'Calificado', variant: 'default' as const },
      converted: { label: 'Convertido', variant: 'default' as const },
      lost: { label: 'Perdido', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.new;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads de Contacto</h1>
          <p className="text-gray-600">Gestiona las solicitudes de consulta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nuevos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {leads.filter(l => l.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {leads.filter(l => l.status === 'qualified').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {leads.filter(l => l.status === 'converted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Consulta</CardTitle>
          <CardDescription>
            Lista de todas las solicitudes de consulta recibidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.full_name}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone || '-'}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadStatus(lead.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Nuevo</SelectItem>
                            <SelectItem value="contacted">Contactado</SelectItem>
                            <SelectItem value="qualified">Calificado</SelectItem>
                            <SelectItem value="converted">Convertido</SelectItem>
                            <SelectItem value="lost">Perdido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedLead && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Lead</CardTitle>
            <CardDescription>Información completa del prospecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Nombre:</span>
                <span>{selectedLead.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Empresa:</span>
                <span>{selectedLead.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{selectedLead.email}</span>
              </div>
              {selectedLead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Teléfono:</span>
                  <span>{selectedLead.phone}</span>
                </div>
              )}
              {selectedLead.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">País:</span>
                  <span>{selectedLead.country}</span>
                </div>
              )}
              {selectedLead.company_size && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Tamaño empresa:</span>
                  <span>{selectedLead.company_size}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedLead(null)}
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactLeadsManager;
