import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentCollaborations = () => {
  const { data: collaborations, isLoading } = useQuery({
    queryKey: ['recent-collaborations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborator_applications')
        .select('id, full_name, profession, company, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      approved: { variant: "default", label: "Aprobado" },
      rejected: { variant: "destructive", label: "Rechazado" }
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Últimas Colaboraciones</CardTitle>
          <CardDescription>Aplicaciones recientes</CardDescription>
        </div>
        <Link to="/admin/collaborators">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Ver todos <ExternalLink className="ml-1 h-3 w-3" />
          </Badge>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : collaborations && collaborations.length > 0 ? (
          <div className="space-y-3">
            {collaborations.map((collab) => {
              const statusInfo = getStatusBadge(collab.status);
              return (
                <div 
                  key={collab.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-normal text-sm truncate">{collab.full_name}</p>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{collab.profession}</p>
                    {collab.company && (
                      <p className="text-xs text-muted-foreground truncate">{collab.company}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(collab.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay colaboraciones recientes
          </p>
        )}
      </CardContent>
    </Card>
  );
};
