import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/shared/utils/format';

export const RecentContacts = () => {
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['recent-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_valuations')
        .select('id, contact_name, email, company_name, final_valuation, created_at, email_opened')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Últimos Contactos</CardTitle>
          <CardDescription>Valoraciones recientes</CardDescription>
        </div>
        <Link to="/admin/contacts">
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
        ) : contacts && contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-normal text-sm truncate">{contact.contact_name}</p>
                    {contact.email_opened && (
                      <Badge variant="secondary" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Leído
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                  <p className="text-xs text-muted-foreground">{contact.company_name}</p>
                </div>
                <div className="text-right ml-4">
                  {contact.final_valuation ? (
                    <p className="text-sm font-normal text-primary">
                      {formatCurrency(contact.final_valuation)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin valorar</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(contact.created_at), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay contactos recientes
          </p>
        )}
      </CardContent>
    </Card>
  );
};
