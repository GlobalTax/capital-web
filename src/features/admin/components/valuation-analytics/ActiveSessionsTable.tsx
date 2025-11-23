import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, ThermometerSun, Snowflake, CheckCircle, Eye, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ActiveSession } from '@/hooks/useSessionMonitoring';

interface ActiveSessionsTableProps {
  sessions: ActiveSession[];
  onRefresh?: () => void;
}

export const ActiveSessionsTable: React.FC<ActiveSessionsTableProps> = ({ sessions, onRefresh }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'warm' | 'cold' | 'completed'>('all');

  // Calculate status counts with useMemo for performance
  const statusCounts = useMemo(() => {
    return {
      all: sessions.length,
      active: sessions.filter(s => s.status === 'active').length,
      warm: sessions.filter(s => s.status === 'warm').length,
      cold: sessions.filter(s => s.status === 'cold').length,
      completed: sessions.filter(s => s.status === 'completed').length,
    };
  }, [sessions]);

  // Filter and sort sessions with useMemo for performance
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions;
    if (activeFilter !== 'all') {
      filtered = sessions.filter(s => s.status === activeFilter);
    }

    // Sort by status priority (cold > warm > active > completed)
    const priorityMap = { 
      cold: 1,      // Prioridad alta (necesitan recuperación urgente)
      warm: 2,      // Prioridad media
      active: 3,    // Prioridad baja (aún están activas)
      completed: 4  // Prioridad mínima
    };
    return [...filtered].sort((a, b) => {
      const priorityDiff = priorityMap[a.status] - priorityMap[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      // If same priority, sort by last activity (most recent first)
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });
  }, [sessions, activeFilter]);

  // Helper function to get status badge
  const getStatusBadge = (status: ActiveSession['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Flame className="h-3 w-3" />
            Caliente
          </Badge>
        );
      case 'warm':
        return (
          <Badge variant="warning" className="flex items-center gap-1 bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800">
            <ThermometerSun className="h-3 w-3" />
            Tibia
          </Badge>
        );
      case 'cold':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Snowflake className="h-3 w-3" />
            Fría
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400">
            <CheckCircle className="h-3 w-3" />
            Completada
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sesiones de Valoración</CardTitle>
            <CardDescription>Monitoreo en tiempo real de sesiones con clasificación por temperatura</CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all">Todas ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="active">
              <Flame className="h-4 w-4 mr-1" />
              Calientes ({statusCounts.active})
            </TabsTrigger>
            <TabsTrigger value="warm">
              <ThermometerSun className="h-4 w-4 mr-1" />
              Tibias ({statusCounts.warm})
            </TabsTrigger>
            <TabsTrigger value="cold">
              <Snowflake className="h-4 w-4 mr-1" />
              Frías ({statusCounts.cold})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completadas ({statusCounts.completed})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Paso</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Act.</TableHead>
                    <TableHead>Tiempo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No hay sesiones {activeFilter !== 'all' ? `${
                          activeFilter === 'active' ? 'calientes' : 
                          activeFilter === 'warm' ? 'tibias' : 
                          activeFilter === 'cold' ? 'frías' : 
                          'completadas'
                        }` : ''} en este momento
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.companyName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{session.contactName}</div>
                            <div className="text-muted-foreground text-xs">{session.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{session.currentStep}/3</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${session.completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{session.completionPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(session.lastActivityAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {Math.floor(session.timeSpentSeconds / 60)}m
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
