import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Download,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  Calendar,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InvestorLead {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  investor_type?: string;
  investment_range?: string;
  sectors_of_interest?: string;
  lead_score: number;
  status: string;
  document_format: string;
  created_at: string;
  email_opened: boolean;
}

const investorTypeLabels: Record<string, string> = {
  individual: 'Individual',
  family_office: 'Family Office',
  venture_capital: 'VC',
  private_equity: 'PE',
  corporate: 'Corporate',
  other: 'Otro',
};

export const InvestorLeadsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [investorTypeFilter, setInvestorTypeFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ['investor-leads', statusFilter, investorTypeFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('investor_leads')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (investorTypeFilter !== 'all') {
        query = query.eq('investor_type', investorTypeFilter);
      }
      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InvestorLead[];
    },
  });

  const exportToCSV = () => {
    if (!leads || leads.length === 0) {
      toast({ variant: 'destructive', title: 'No hay datos', description: 'No hay leads para exportar' });
      return;
    }
    const headers = ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Tipo Inversor', 'Rango Inversión', 'Sectores Interés', 'Puntuación', 'Estado', 'Formato', 'Email Abierto'];
    const rows = leads.map(lead => [
      new Date(lead.created_at).toLocaleDateString('es-ES'), lead.full_name, lead.email,
      lead.phone || '', lead.company || '', investorTypeLabels[lead.investor_type || ''] || '',
      lead.investment_range || '', lead.sectors_of_interest || '', lead.lead_score.toString(),
      lead.status, lead.document_format, lead.email_opened ? 'Sí' : 'No',
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `investor_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Exportación exitosa', description: `${leads.length} leads exportados a CSV` });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('investor_leads')
        .update({ status, status_updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-leads'] });
      toast({ title: 'Estado actualizado' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el estado' });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('investor_leads').update({ is_deleted: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-leads'] });
      toast({ title: 'Lead eliminado' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el lead' });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('investor_leads')
        .update({ is_deleted: true })
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['investor-leads'] });
      setSelectedIds(new Set());
      toast({ title: `${ids.length} leads eliminados` });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron eliminar los leads' });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && leads) {
      setSelectedIds(new Set(leads.map(l => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id); else next.delete(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`¿Eliminar ${selectedIds.size} lead(s) seleccionados?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-blue-600 font-semibold';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const allSelected = leads && leads.length > 0 && selectedIds.size === leads.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Investor Leads</h2>
          <p className="text-muted-foreground">
            Gestiona los leads de inversores que han descargado el ROD
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            Total Leads
          </div>
          <div className="text-2xl font-bold">{leads?.length || 0}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Mail className="h-4 w-4" />
            Emails Abiertos
          </div>
          <div className="text-2xl font-bold">
            {leads?.filter(l => l.email_opened).length || 0}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            Alta Puntuación
          </div>
          <div className="text-2xl font-bold">
            {leads?.filter(l => l.lead_score >= 70).length || 0}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            Nuevos (7d)
          </div>
          <div className="text-2xl font-bold">
            {leads?.filter(l => {
              const daysDiff = (Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24);
              return daysDiff <= 7;
            }).length || 0}
          </div>
        </div>
      </div>

      {/* Filters + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="new">Nuevo</SelectItem>
            <SelectItem value="contacted">Contactado</SelectItem>
            <SelectItem value="qualified">Cualificado</SelectItem>
            <SelectItem value="interested">Interesado</SelectItem>
            <SelectItem value="not_interested">No interesado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={investorTypeFilter} onValueChange={setInvestorTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Tipo inversor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="family_office">Family Office</SelectItem>
            <SelectItem value="venture_capital">VC</SelectItem>
            <SelectItem value="private_equity">PE</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-muted/50 border rounded-lg px-4 py-2">
          <span className="text-sm font-medium">
            {selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar seleccionados
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Puntuación</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Tipo Inversor</TableHead>
              <TableHead>Rango</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : leads && leads.length > 0 ? (
              leads.map((lead) => (
                <TableRow key={lead.id} className={selectedIds.has(lead.id) ? 'bg-muted/30' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={(checked) => handleSelectOne(lead.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className={`text-lg ${getScoreColor(lead.lead_score)}`}>
                      {lead.lead_score}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{lead.full_name}</div>
                    {lead.company && (
                      <div className="text-sm text-muted-foreground">{lead.company}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                        {lead.email_opened && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            Abierto
                          </Badge>
                        )}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.investor_type && (
                      <Badge variant="outline">
                        {investorTypeLabels[lead.investor_type]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.investment_range || '-'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ id: lead.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nuevo</SelectItem>
                        <SelectItem value="contacted">Contactado</SelectItem>
                        <SelectItem value="qualified">Cualificado</SelectItem>
                        <SelectItem value="interested">Interesado</SelectItem>
                        <SelectItem value="not_interested">No interesado</SelectItem>
                        <SelectItem value="converted">Convertido</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => window.open(`mailto:${lead.email}`, '_blank')}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      {lead.phone && (
                        <Button size="sm" variant="ghost" onClick={() => window.open(`tel:${lead.phone}`, '_blank')}>
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el lead de ${lead.full_name}?`)) {
                            deleteLeadMutation.mutate(lead.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No se encontraron leads
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
