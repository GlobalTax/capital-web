import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActiveSession {
  id: string;
  uniqueToken: string;
  companyName: string;
  contactName: string;
  email: string;
  currentStep: number;
  completionPercentage: number;
  lastActivityAt: string;
  timeSpentSeconds: number;
  status: 'active' | 'abandoned' | 'completed';
  createdAt: string;
}

interface ActiveSessionsTableProps {
  sessions: ActiveSession[];
  onRefresh?: () => void;
}

export const ActiveSessionsTable: React.FC<ActiveSessionsTableProps> = ({ sessions, onRefresh }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'abandoned' | 'completed'>('all');

  // Calculate counters by status
  const statusCounts = useMemo(() => {
    return {
      all: sessions.length,
      active: sessions.filter(s => s.status === 'active').length,
      abandoned: sessions.filter(s => s.status === 'abandoned').length,
      completed: sessions.filter(s => s.status === 'completed').length,
    };
  }, [sessions]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions;
    
    // Apply filter
    if (activeFilter !== 'all') {
      filtered = sessions.filter(s => s.status === activeFilter);
    }
    
    // Sort by priority: active > abandoned > completed
    const priorityMap = { active: 1, abandoned: 2, completed: 3 };
    return [...filtered].sort((a, b) => priorityMap[a.status] - priorityMap[b.status]);
  }, [sessions, activeFilter]);

  const getStatusBadge = (status: ActiveSession['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Activa
          </Badge>
        );
      case 'abandoned':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Abandonada
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-500">
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
            <CardDescription>Monitoreo en tiempo real de sesiones</CardDescription>
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
        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as typeof activeFilter)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">
              Todas ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active">
              Activas ({statusCounts.active})
            </TabsTrigger>
            <TabsTrigger value="abandoned">
              Abandonadas ({statusCounts.abandoned})
            </TabsTrigger>
            <TabsTrigger value="completed">
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
                        No hay sesiones {activeFilter !== 'all' ? `${activeFilter === 'active' ? 'activas' : activeFilter === 'abandoned' ? 'abandonadas' : 'completadas'}` : ''} en este momento
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
