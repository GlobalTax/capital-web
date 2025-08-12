
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Filter, RefreshCw, Globe, Building, Mail, Phone, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useExternalLeads } from '@/hooks/useExternalLeads';

const TYPE_LABELS: Record<string, string> = {
  contact: 'Contacto',
  collaborator: 'Colaborador',
  lead_magnet_download: 'Lead Magnet',
  company_valuation: 'Valoración',
  valuation_pdf: 'PDF Valoración',
};

const getTypeBadge = (type?: string) => {
  const label = TYPE_LABELS[type || ''] || (type ? type : 'Desconocido');
  const variant =
    type === 'contact' ? 'secondary' :
    type === 'collaborator' ? 'outline' :
    type === 'company_valuation' ? 'default' :
    type === 'lead_magnet_download' ? 'secondary' :
    'secondary';
  return <Badge variant={variant as any}>{label}</Badge>;
};

const ExternalLeadsDashboard: React.FC = () => {
  const { leads, isLoading, stats, refetch } = useExternalLeads();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return leads.filter((l) => {
      const matchesSearch = !term || [
        l.full_name,
        l.email,
        l.company,
        l.lead_type,
        l.source,
        l.utm_source,
        l.utm_campaign,
      ].some((v) => (v || '').toString().toLowerCase().includes(term));
      const matchesType = typeFilter === 'all' || (l.lead_type || '') === typeFilter;
      const matchesStatus = statusFilter === 'all' || (l.status || '') === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leads, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Leads Externos</h1>
        <p className="text-muted-foreground">Leads enviados a la base de datos secundaria (CRM)</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        {['company_valuation','contact','collaborator','lead_magnet_download'].map((t) => (
          <Card key={t} className="hidden md:block">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{TYPE_LABELS[t] || t}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType[t] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, email, empresa, fuente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="company_valuation">Valoración</SelectItem>
                  <SelectItem value="contact">Contacto</SelectItem>
                  <SelectItem value="collaborator">Colaboradores</SelectItem>
                  <SelectItem value="lead_magnet_download">Lead Magnet</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="qualified">Cualificado</SelectItem>
                  <SelectItem value="won">Ganado</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={refetch} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Cargando leads...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No hay leads con los filtros aplicados</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={(l.id as string) || `${l.email}-${l.created_at}`}>
                      <TableCell>{getTypeBadge(l.lead_type)}</TableCell>
                      <TableCell className="font-medium">{l.full_name || '-'}</TableCell>
                      <TableCell>
                        {l.email ? (
                          <a href={`mailto:${l.email}`} className="hover:underline inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {l.email}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="inline-flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {l.company || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-2">
                            <Globe className="h-4 w-4" /> {l.source || 'web'}
                          </span>
                          {(l.utm_source || l.utm_campaign) && (
                            <span className="text-xs">{l.utm_source || ''} {l.utm_campaign ? `· ${l.utm_campaign}` : ''}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{l.status || 'new'}</Badge>
                      </TableCell>
                      <TableCell className="inline-flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {l.created_at ? format(new Date(l.created_at), 'dd LLL yyyy, HH:mm', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {l.lead_type === 'company_valuation' && (
                          <div className="space-y-1">
                            <div>Val. final: {l.final_valuation ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(l.final_valuation)) : '-'}</div>
                            {l.industry && <div>Sector: {l.industry}</div>}
                          </div>
                        )}
                        {l.lead_type === 'collaborator' && (
                          <div className="space-y-1">
                            <div>Profesión: {l.profession || '-'}</div>
                            {l.experience && <div>Experiencia: {l.experience}</div>}
                          </div>
                        )}
                        {l.lead_type === 'lead_magnet_download' && (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                              <Flag className="h-3 w-3" /> UTM: {l.utm_source || '-'}
                            </div>
                            {l.referrer && <div className="text-xs">Referrer: {l.referrer}</div>}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalLeadsDashboard;
