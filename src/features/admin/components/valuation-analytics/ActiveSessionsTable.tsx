import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw } from 'lucide-react';
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
  const getStatusBadge = (status: ActiveSession['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Activa</Badge>;
      case 'abandoned':
        return <Badge variant="secondary">Abandonada</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Completada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sesiones Activas</CardTitle>
            <CardDescription>Últimas 50 sesiones con actividad reciente</CardDescription>
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
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No hay sesiones activas en este momento
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
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
      </CardContent>
    </Card>
  );
};
