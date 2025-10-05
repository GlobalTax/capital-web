import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Calculator, 
  UserCheck, 
  Mail, 
  MailOpen,
  Phone, 
  Building, 
  Calendar,
  Filter,
  Search,
  Euro,
  Briefcase,
  CheckCircle2,
  ListTodo,
  UserCircle
} from 'lucide-react';
import { useUnifiedLeads } from '@/hooks/useUnifiedLeads';
import { useLeadTasks } from '@/hooks/useLeadTasks';
import { LeadTasksManager } from '@/features/admin/components/leads/LeadTasksManager';
import { LeadStatusBadge } from '@/components/admin/leads/LeadStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency as formatCurrencyShared } from '@/shared/utils/format';

const UnifiedLeadsManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leads, stats, isLoading, refetch } = useUnifiedLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('my-leads'); // Default: Mis Leads
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [selectedTaskLead, setSelectedTaskLead] = useState<{ id: string; type: 'valuation' | 'contact' | 'collaborator' } | null>(null);

  const handleOpenTasks = (leadId: string, leadType: 'valuation' | 'contact' | 'collaborator') => {
    setSelectedTaskLead({ id: leadId, type: leadType });
    setTasksModalOpen(true);
  };

  const handleRowClick = (lead: any) => {
    navigate(`/admin/contacts/${lead.origin}_${lead.id}`);
  };

  const getOriginBadge = (origin: string) => {
    switch (origin) {
      case 'contact':
        return <Badge variant="default" className="bg-blue-500"><Users className="w-3 h-3 mr-1" />Contacto</Badge>;
      case 'valuation':
        return <Badge variant="default" className="bg-green-500"><Calculator className="w-3 h-3 mr-1" />Valoración</Badge>;
      case 'collaborator':
        return <Badge variant="default" className="bg-purple-500"><UserCheck className="w-3 h-3 mr-1" />Colaborador</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getStatusBadge = (status: string, origin: string, crmStatus?: string) => {
    // Si existe lead_status_crm, usar ese en lugar del status antiguo
    if (crmStatus) {
      return <LeadStatusBadge status={crmStatus} />;
    }

    // Fallback al sistema antiguo
    if (origin === 'valuation') {
      return <Badge variant="outline" className="bg-gray-100">Valoración</Badge>;
    }

    switch (status) {
      case 'new':
        return <Badge variant="destructive">Nuevo</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'contacted':
        return <Badge variant="default">Contactado</Badge>;
      case 'qualified':
        return <Badge variant="default" className="bg-green-600">Calificado</Badge>;
      case 'closed':
        return <Badge variant="outline">Cerrado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = async (leadId: string, origin: string, newStatus: string) => {
    // Esta función ya no se usa porque ahora el estado se cambia desde la página de detalle
    console.log('Status change deprecated - use detail page');
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesOrigin = originFilter === 'all' || lead.origin === originFilter;
    
    // Filtro de asignación
    const matchesAssigned = 
      assignedFilter === 'all' || 
      (assignedFilter === 'my-leads' && lead.assigned_to === user?.id) ||
      (assignedFilter === 'unassigned' && !lead.assigned_to);

    return matchesSearch && matchesOrigin && matchesAssigned;
  });

  const formatCurrency = (amount: number | undefined) => {
    if (amount == null) return '-';
    return formatCurrencyShared(amount);
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Cargando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Todos los Leads</h1>
          <p className="text-gray-600 mt-1">Gestión unificada de contactos, valoraciones y colaboradores</p>
        </div>
        <Button onClick={refetch} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contactos</p>
                <p className="text-3xl font-bold text-blue-600">{stats.contact}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valoraciones</p>
                <p className="text-3xl font-bold text-green-600">{stats.valuation}</p>
              </div>
              <Calculator className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Colaboradores</p>
                <p className="text-3xl font-bold text-purple-600">{stats.collaborator}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por asignación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="my-leads">Mis Leads</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los orígenes</SelectItem>
                <SelectItem value="contact">Contactos</SelectItem>
                <SelectItem value="valuation">Valoraciones</SelectItem>
                <SelectItem value="collaborator">Colaboradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-visible">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[110px]" />
                <col className="w-[200px]" />
                <col className="w-[260px]" />
                <col className="w-[180px]" />
                <col className="w-[200px]" />
                <col className="w-[100px]" />
                <col className="w-[150px]" />
                <col className="w-[120px]" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Origen</TableHead>
                  <TableHead className="whitespace-nowrap">Nombre</TableHead>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="whitespace-nowrap">Empresa</TableHead>
                  <TableHead className="whitespace-nowrap">Asignado a</TableHead>
                  <TableHead className="whitespace-nowrap">Tareas</TableHead>
                  <TableHead className="whitespace-nowrap">Estado CRM</TableHead>
                  <TableHead className="whitespace-nowrap">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow 
                    key={`${lead.origin}-${lead.id}`} 
                    onClick={() => handleRowClick(lead)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>{getOriginBadge(lead.origin)}</TableCell>
                    <TableCell className="font-medium truncate">{lead.name}</TableCell>
                    <TableCell className="truncate">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {((lead as any).email_opened || (lead as any).email_opened_at) ? (
                              <Badge variant="secondary" className="px-1.5 py-0">Abierto</Badge>
                            ) : (
                              <Badge variant="outline" className="px-1.5 py-0">No abierto</Badge>
                            )}
                            {(lead as any).email_sent_at && (
                              <span>Enviado: {format(new Date((lead as any).email_sent_at), 'dd/MM HH:mm', { locale: es })}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="truncate">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{lead.company || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="truncate">
                      {lead.origin === 'valuation' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Euro className="h-3 w-3" />
                            {formatCurrency(lead.final_valuation)}
                          </div>
                          {lead.industry && (
                            <Badge variant="outline" className="text-xs">{lead.industry}</Badge>
                          )}
                        </div>
                      )}
                      {lead.origin === 'collaborator' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Briefcase className="h-3 w-3" />
                            {lead.profession}
                          </div>
                          {lead.experience && (
                            <div className="text-xs text-gray-500 truncate max-w-32">
                              {lead.experience.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      )}
                      {lead.origin === 'contact' && (
                        <div className="space-y-1">
                          {lead.company_size && (
                            <Badge variant="outline" className="text-xs">{lead.company_size}</Badge>
                          )}
                          {lead.referral && (
                            <div className="text-xs text-gray-500">Ref: {lead.referral}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <TasksCell 
                        leadId={lead.id} 
                        leadType={lead.origin === 'collaborator' ? 'contact' : lead.origin as 'valuation' | 'contact'}
                        onOpenTasks={handleOpenTasks}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {lead.origin === 'valuation' ? (
                        getStatusBadge(lead.status, lead.origin)
                      ) : (
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead.id, lead.origin, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Nuevo</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="contacted">Contactado</SelectItem>
                            <SelectItem value="qualified">Calificado</SelectItem>
                            <SelectItem value="closed">Cerrado</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex gap-2">
                        {lead.phone && (
                          <Button size="sm" variant="outline" onClick={() => window.open(`tel:${lead.phone}`)}>
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${lead.email}`)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredLeads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron leads con los filtros aplicados</p>
              </div>
            )}
            {selectedLead && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Detalles del lead</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Nombre</div>
                      <div className="text-muted-foreground">{selectedLead.name || selectedLead.full_name || '-'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">{selectedLead.email || '-'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Empresa</div>
                      <div className="text-muted-foreground">{selectedLead.company || '-'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Teléfono</div>
                      <div className="text-muted-foreground">{selectedLead.phone || '-'}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="font-medium">Registro completo</div>
                      <pre className="mt-1 p-3 rounded-md bg-muted/40 text-xs whitespace-pre-wrap break-words">{JSON.stringify(selectedLead, null, 2)}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Modal */}
      {selectedTaskLead && (
        <LeadTasksManager
          leadId={selectedTaskLead.id}
          leadType={selectedTaskLead.type}
          open={tasksModalOpen}
          onOpenChange={setTasksModalOpen}
        />
      )}
    </div>
  );
};

// Component to display tasks progress for each lead
const TasksCell: React.FC<{
  leadId: string;
  leadType: 'valuation' | 'contact';
  onOpenTasks: (leadId: string, leadType: 'valuation' | 'contact') => void;
}> = ({ leadId, leadType, onOpenTasks }) => {
  const { completedCount, totalCount, isLoading } = useLeadTasks(leadId, leadType);

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Cargando...</div>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onOpenTasks(leadId, leadType);
      }}
      className="flex items-center gap-1.5 h-8"
    >
      <ListTodo className="h-4 w-4" />
      <span className="font-medium">{completedCount}/{totalCount}</span>
      {completedCount === totalCount && totalCount > 0 && (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      )}
    </Button>
  );
};

export default UnifiedLeadsManager;
