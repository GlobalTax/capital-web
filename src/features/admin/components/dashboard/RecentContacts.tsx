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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 md:p-6 pb-2 sm:pb-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base md:text-lg truncate">Últimos Contactos</CardTitle>
          <CardDescription className="text-xs md:text-sm">Valoraciones recientes</CardDescription>
        </div>
        <Link to="/admin/contacts" className="shrink-0 ml-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
            <span className="hidden sm:inline">Ver todos</span>
            <span className="sm:hidden">Ver</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </Badge>
        </Link>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {isLoading ? (
          <div className="space-y-2 sm:space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 sm:h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : contacts && contacts.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <p className="font-normal text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{contact.contact_name}</p>
                    {contact.email_opened && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0">
                        <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span className="hidden xs:inline">Leído</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{contact.email}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{contact.company_name}</p>
                </div>
                <div className="text-right shrink-0">
                  {contact.final_valuation ? (
                    <p className="text-xs sm:text-sm font-normal text-primary">
                      {formatCurrency(contact.final_valuation)}
                    </p>
                  ) : (
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Sin valorar</p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {format(new Date(contact.created_at), 'dd/MM/yy', { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
            No hay contactos recientes
          </p>
        )}
      </CardContent>
    </Card>
  );
};
