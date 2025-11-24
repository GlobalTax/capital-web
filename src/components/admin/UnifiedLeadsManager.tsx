import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  UserCircle,
  Download,
  RefreshCw,
  X
} from 'lucide-react';
import { useUnifiedLeads } from '@/hooks/useUnifiedLeads';
import { useLeadTasks } from '@/hooks/useLeadTasks';
import { LeadTasksManager } from '@/features/admin/components/leads/LeadTasksManager';
import DateRangeQuickSelector from './contacts/DateRangeQuickSelector';
import { LeadStatusBadge } from '@/components/admin/leads/LeadStatusBadge';
import { LeadAIAnalytics } from '@/components/admin/LeadAIAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency as formatCurrencyShared } from '@/shared/utils/format';
import * as XLSX from 'xlsx';

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
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [dateRangeLabel, setDateRangeLabel] = useState<string>('');

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

    // Filtro de fecha
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const leadDate = new Date(lead.created_at);
      if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        matchesDate = leadDate >= from && leadDate <= to;
      } else if (dateFrom) {
        matchesDate = leadDate >= new Date(dateFrom);
      } else if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        matchesDate = leadDate <= to;
      }
    }

    return matchesSearch && matchesOrigin && matchesAssigned && matchesDate;
  });

  const formatCurrency = (amount: number | undefined) => {
    if (amount == null) return '-';
    return formatCurrencyShared(amount);
  };

  const exportToExcel = () => {
    const excelData = filteredLeads.map(lead => ({
      'Origen': lead.origin === 'contact' ? 'Contacto' : lead.origin === 'valuation' ? 'Valoración' : 'Colaborador',
      'Nombre': lead.name,
      'Email': lead.email,
      'Teléfono': lead.phone || '-',
      'Empresa': lead.company || '-',
      'Sector': lead.industry || '-',
      'Estado CRM': lead.lead_status_crm || lead.status,
      'Fecha Contacto': format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: es }),
      'Asignado a': lead.assigned_admin?.full_name || 'Sin asignar',
      'Valoración': lead.final_valuation ? formatCurrency(lead.final_valuation) : '-',
      'Profesión': lead.profession || '-',
      'Tamaño Empresa': lead.company_size || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    
    const fileName = `capittal-leads-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Todos los Leads</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Gestión unificada de contactos, valoraciones y colaboradores</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="default" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads">Gestión de Leads</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analíticas IA</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6 mt-6">

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
          <div className="space-y-4">
            {/* Primera fila: Búsqueda y Asignación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Segunda fila: Origen y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <DateRangeQuickSelector
                  onRangeSelect={(from, to, label) => {
                    setDateFrom(from);
                    setDateTo(to);
                    setDateRangeLabel(label);
                  }}
                  selectedLabel={dateRangeLabel}
                />
              </div>
            </div>

            {/* Mostrar rango seleccionado */}
            {(dateFrom || dateTo) && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-900 font-medium">
                    {dateRangeLabel || 'Rango personalizado'}: 
                  </span>
                  <span className="text-blue-700">
                    {dateFrom && format(new Date(dateFrom), 'dd/MM/yyyy', { locale: es })}
                    {dateFrom && dateTo && ' - '}
                    {dateTo && format(new Date(dateTo), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setDateRangeLabel('');
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[110px]">Origen</TableHead>
                  <TableHead className="min-w-[180px]">Nombre</TableHead>
                  <TableHead className="min-w-[220px]">Email</TableHead>
                  <TableHead className="min-w-[150px]">Empresa</TableHead>
                  <TableHead className="min-w-[180px]">Asignado a</TableHead>
                  <TableHead className="min-w-[100px]">Tareas</TableHead>
                  <TableHead className="min-w-[140px]">Estado CRM</TableHead>
                  <TableHead className="min-w-[160px]">Fecha</TableHead>
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
                        {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: es })}
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
            
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-3">
            {filteredLeads.map((lead) => (
              <Card 
                key={`${lead.origin}-${lead.id}`} 
                onClick={() => handleRowClick(lead)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{lead.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                    </div>
                    {getOriginBadge(lead.origin)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Empresa:</span>
                      <div className="font-medium truncate">{lead.company || '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Estado:</span>
                      <div className="mt-1">{getStatusBadge(lead.status, lead.origin, lead.lead_status_crm)}</div>
                    </div>
                  </div>

                  {lead.origin === 'valuation' && lead.final_valuation && (
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <Euro className="h-4 w-4" />
                      {formatCurrency(lead.final_valuation)}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    {lead.assigned_admin && (
                      <div className="flex items-center gap-1 truncate">
                        <UserCircle className="h-3 w-3" />
                        <span className="truncate">{lead.assigned_admin.full_name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

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
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <LeadAIAnalytics />
        </TabsContent>
      </Tabs>
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
