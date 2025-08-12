
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Calculator, 
  UserCheck, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Filter,
  Search,
  Euro,
  Briefcase
} from 'lucide-react';
import { useUnifiedLeads } from '@/hooks/useUnifiedLeads';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency as formatCurrencyShared } from '@/shared/utils/format';

const UnifiedLeadsManager = () => {
  const { leads, stats, isLoading, refetch, updateLeadStatus } = useUnifiedLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const getStatusBadge = (status: string, origin: string) => {
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
    await updateLeadStatus(leadId, origin, newStatus);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesOrigin = originFilter === 'all' || lead.origin === originFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesOrigin && matchesStatus;
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualified">Calificado</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Información Específica</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={`${lead.origin}-${lead.id}`}>
                    <TableCell>{getOriginBadge(lead.origin)}</TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {lead.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-gray-400" />
                        {lead.company || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
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
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLeadsManager;
