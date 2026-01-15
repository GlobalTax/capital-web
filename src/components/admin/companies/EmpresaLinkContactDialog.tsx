import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmpresaLinkContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  onSuccess: () => void;
}

interface SearchResult {
  id: string;
  full_name: string;
  email: string;
  origin: 'contact' | 'valuation';
  company: string | null;
  has_empresa: boolean;
}

export const EmpresaLinkContactDialog: React.FC<EmpresaLinkContactDialogProps> = ({
  open,
  onOpenChange,
  empresaId,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [linking, setLinking] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search contacts
  const { data: results, isLoading } = useQuery({
    queryKey: ['search-contacts-for-link', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];

      // Search contact_leads
      const { data: contactLeads, error: contactError } = await supabase
        .from('contact_leads')
        .select('id, full_name, email, company, empresa_id')
        .eq('is_deleted', false)
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
        .limit(10);

      if (contactError) throw contactError;

      // Search company_valuations
      const { data: valuationLeads, error: valuationError } = await supabase
        .from('company_valuations')
        .select('id, contact_name, email, company_name, empresa_id')
        .eq('is_deleted', false)
        .or(`contact_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (valuationError) throw valuationError;

      const combined: SearchResult[] = [
        ...(contactLeads || []).map(c => ({
          id: c.id,
          full_name: c.full_name,
          email: c.email,
          origin: 'contact' as const,
          company: c.company,
          has_empresa: !!c.empresa_id,
        })),
        ...(valuationLeads || []).map(v => ({
          id: v.id,
          full_name: v.contact_name,
          email: v.email,
          origin: 'valuation' as const,
          company: v.company_name,
          has_empresa: !!v.empresa_id,
        })),
      ];

      return combined;
    },
    enabled: open && searchQuery.length >= 2,
  });

  const handleLink = async (contact: SearchResult) => {
    const table = contact.origin === 'contact' ? 'contact_leads' : 'company_valuations';
    setLinking(contact.id);
    
    try {
      const { error } = await supabase
        .from(table as 'contact_leads' | 'company_valuations')
        .update({ empresa_id: empresaId })
        .eq('id', contact.id);

      if (error) throw error;
      
      toast({ title: '✅ Contacto vinculado' });
      queryClient.invalidateQueries({ queryKey: ['empresa-contacts', empresaId] });
      onSuccess();
    } catch (error) {
      console.error('Error linking contact:', error);
      toast({ title: 'Error', description: 'No se pudo vincular', variant: 'destructive' });
    } finally {
      setLinking(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Vincular Contacto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[300px]">
            {searchQuery.length < 2 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Escribe al menos 2 caracteres para buscar
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-2">
                {results.map((contact) => (
                  <div
                    key={`${contact.origin}_${contact.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{contact.full_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {contact.origin === 'contact' ? 'Contacto' : 'Valoración'}
                        </Badge>
                        {contact.has_empresa && (
                          <Badge className="text-xs bg-yellow-100 text-yellow-800">
                            Ya vinculado
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {contact.email}
                        {contact.company && ` • ${contact.company}`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLink(contact)}
                      disabled={linking === contact.id}
                    >
                      {linking === contact.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Vincular
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No se encontraron contactos
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
