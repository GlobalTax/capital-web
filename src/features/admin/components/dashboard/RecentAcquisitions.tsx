import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentAcquisitions = () => {
  const { data: acquisitions, isLoading } = useQuery({
    queryKey: ['recent-acquisitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_leads')
        .select('id, full_name, company, sectors_of_interest, investment_range, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      new: { variant: "default", label: "Nuevo" },
      contacted: { variant: "secondary", label: "Contactado" },
      qualified: { variant: "default", label: "Calificado" },
      closed: { variant: "outline", label: "Cerrado" }
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Últimas Adquisiciones</CardTitle>
          <CardDescription>Solicitudes de compra</CardDescription>
        </div>
        <Link to="/admin/acquisition-leads">
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
        ) : acquisitions && acquisitions.length > 0 ? (
          <div className="space-y-3">
            {acquisitions.map((acquisition) => {
              const statusInfo = getStatusBadge(acquisition.status);
              return (
                <div 
                  key={acquisition.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-normal text-sm truncate">{acquisition.full_name}</p>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{acquisition.company}</p>
                    {acquisition.sectors_of_interest && (
                      <p className="text-xs text-muted-foreground truncate">
                        {acquisition.sectors_of_interest}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    {acquisition.investment_range && (
                      <p className="text-xs font-normal">{acquisition.investment_range}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(acquisition.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay adquisiciones recientes
          </p>
        )}
      </CardContent>
    </Card>
  );
};
