import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isPast, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { PauseCircle, Play, Edit, ExternalLink, Search, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useDealsPaused, usePausedReasons, useDealPausedMutations } from '@/hooks/useDealsPaused';

export default function DealsPausedPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [reminderFilter, setReminderFilter] = useState<'all' | 'overdue' | 'upcoming'>('all');

  const { data: items, isLoading } = useDealsPaused({
    search,
    reasonId: reasonFilter !== 'all' ? reasonFilter : undefined,
    reminderFilter,
  });
  const { data: reasons } = usePausedReasons();
  const { reactivateCompany } = useDealPausedMutations();

  const getReminderBadge = (reminderAt: string | null) => {
    if (!reminderAt) return null;
    const date = new Date(reminderAt);
    if (isPast(date)) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Vencido</Badge>;
    }
    if (isBefore(date, addDays(new Date(), 7))) {
      return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700"><Clock className="h-3 w-3" /> Próximo</Badge>;
    }
    return <Badge variant="secondary">{format(date, 'dd MMM', { locale: es })}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PauseCircle className="h-6 w-6" />
            Deals Paused
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prospectos pausados pendientes de reactivación ({items?.length || 0})
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa o notas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los motivos</SelectItem>
                {reasons?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={reminderFilter} onValueChange={(v) => setReminderFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Recordatorio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
                <SelectItem value="upcoming">Próximos 7 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Recordatorio</TableHead>
                <TableHead>Fecha pausa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : !items?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay deals pausados
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/admin/empresas/${item.company_id}`)}
                        className="font-medium text-primary hover:underline text-left"
                      >
                        {item.empresa?.nombre || 'Sin nombre'}
                      </button>
                      {item.empresa?.sector && (
                        <p className="text-xs text-muted-foreground">{item.empresa.sector}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.reason?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate">{item.notes || '-'}</p>
                    </TableCell>
                    <TableCell>
                      {item.reminder_at ? (
                        <div className="space-y-1">
                          {getReminderBadge(item.reminder_at)}
                          {item.reminder_text && (
                            <p className="text-xs text-muted-foreground">{item.reminder_text}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(item.created_at), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/admin/empresas/${item.company_id}`)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            reactivateCompany.mutate({
                              pausedItemId: item.id,
                              companyId: item.company_id,
                            })
                          }
                          disabled={reactivateCompany.isPending}
                        >
                          <Play className="h-3.5 w-3.5 mr-1" />
                          Reactivar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
