// ============= SF MATCHING INBOX =============
// Inbox de matches entre Search Funds y operaciones CRM

import React, { useState } from 'react';
import { Search, Target, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useSFMatches, useUpdateSFMatchStatus, useRecalculateAllMatches } from '@/hooks/useSFMatches';
import { Skeleton } from '@/components/ui/skeleton';
import { SFMatchStatus } from '@/types/searchFunds';
import { Link } from 'react-router-dom';

const statusConfig: Record<SFMatchStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  reviewed: { label: 'Revisado', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  contacted: { label: 'Contactado', color: 'bg-purple-100 text-purple-800', icon: Target },
  not_fit: { label: 'No encaja', color: 'bg-red-100 text-red-800', icon: XCircle },
  won: { label: 'Ganado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export const SFMatchingInbox: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<SFMatchStatus | 'all'>('new');
  const [minScore, setMinScore] = useState<string>('50');

  const { data: matches, isLoading, refetch } = useSFMatches({
    status: statusFilter !== 'all' ? statusFilter as SFMatchStatus : undefined,
    min_score: minScore !== 'all' ? parseInt(minScore) : undefined,
  });

  const updateStatusMutation = useUpdateSFMatchStatus();
  const recalculateMutation = useRecalculateAllMatches();

  const handleStatusChange = async (matchId: string, newStatus: SFMatchStatus) => {
    await updateStatusMutation.mutateAsync({ id: matchId, status: newStatus });
  };

  const handleRecalculateAll = async () => {
    if (confirm('¿Recalcular todos los matches? Esto puede tardar unos minutos.')) {
      await recalculateMutation.mutateAsync();
      refetch();
    }
  };

  // Stats
  const stats = React.useMemo(() => {
    if (!matches) return { total: 0, new: 0, avgScore: 0 };
    const newCount = matches.filter(m => m.status === 'new').length;
    const avgScore = matches.length > 0 
      ? Math.round(matches.reduce((acc, m) => acc + (m.match_score || 0), 0) / matches.length)
      : 0;
    return { total: matches.length, new: newCount, avgScore };
  }, [matches]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matching Inbox</h1>
          <p className="text-muted-foreground">
            Revisa los matches entre Search Funds y operaciones del CRM
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRecalculateAll}
          disabled={recalculateMutation.isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
          {recalculateMutation.isPending ? 'Calculando...' : 'Recalcular'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SFMatchStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="new">Nuevos</SelectItem>
                <SelectItem value="reviewed">Revisados</SelectItem>
                <SelectItem value="contacted">Contactados</SelectItem>
                <SelectItem value="won">Ganados</SelectItem>
                <SelectItem value="not_fit">No encaja</SelectItem>
              </SelectContent>
            </Select>
            <Select value={minScore} onValueChange={setMinScore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Score mínimo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier score</SelectItem>
                <SelectItem value="80">≥ 80%</SelectItem>
                <SelectItem value="60">≥ 60%</SelectItem>
                <SelectItem value="50">≥ 50%</SelectItem>
                <SelectItem value="30">≥ 30%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Search Fund</TableHead>
                  <TableHead>Entidad CRM</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Razones</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron matches con estos filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  matches?.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        <Link 
                          to={`/admin/sf-directory/${match.fund_id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {match.fund_id.slice(0, 8)}...
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {match.crm_entity_type}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {match.crm_entity_id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(match.match_score || 0)}`}>
                            {match.match_score || 0}%
                          </span>
                          <Progress value={match.match_score || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {match.match_reasons?.geography !== undefined && match.match_reasons.geography > 0 && (
                            <Badge variant="secondary" className="text-xs">Geo ✓</Badge>
                          )}
                          {match.match_reasons?.sector !== undefined && match.match_reasons.sector > 0 && (
                            <Badge variant="secondary" className="text-xs">Sector ✓</Badge>
                          )}
                          {match.match_reasons?.size !== undefined && match.match_reasons.size > 0 && (
                            <Badge variant="secondary" className="text-xs">Size ✓</Badge>
                          )}
                          {match.match_reasons?.evidence !== undefined && match.match_reasons.evidence > 0 && (
                            <Badge variant="secondary" className="text-xs">Evidence ✓</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[match.status].color}>
                          {statusConfig[match.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(match.id, 'reviewed')}>
                              <Clock className="mr-2 h-4 w-4" />
                              Marcar revisado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(match.id, 'contacted')}>
                              <Target className="mr-2 h-4 w-4" />
                              Marcar contactado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(match.id, 'won')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar ganado
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(match.id, 'not_fit')}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              No encaja
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SFMatchingInbox;
