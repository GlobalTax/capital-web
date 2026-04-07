import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Link2, Unlink, Users, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface RODListConfig {
  id: string;
  language: string;
  outbound_list_id: string;
  label: string;
  created_at: string;
}

interface OutboundList {
  id: string;
  name: string;
  sector: string | null;
  contact_count: number | null;
}

const LANGUAGE_CONFIG = [
  { code: 'es', label: 'Castellano', flag: '🇪🇸' },
  { code: 'en', label: 'Inglés', flag: '🇬🇧' },
];

export const RODListsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedListId, setSelectedListId] = useState<Record<string, string>>({});

  // Fetch existing config
  const { data: configs, isLoading: configLoading } = useQuery({
    queryKey: ['rod-list-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_list_config' as any)
        .select('*');
      if (error) throw error;
      return (data || []) as RODListConfig[];
    },
  });

  // Fetch all outbound lists for the selector
  const { data: allLists, isLoading: listsLoading } = useQuery({
    queryKey: ['outbound-lists-for-rod'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outbound_lists' as any)
        .select('id, name, sector, contact_count')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data || []) as OutboundList[];
    },
  });

  const linkMutation = useMutation({
    mutationFn: async ({ language, listId }: { language: string; listId: string }) => {
      const list = allLists?.find(l => l.id === listId);
      // Upsert: delete existing for this language, then insert
      await supabase.from('rod_list_config' as any).delete().eq('language', language);
      const { error } = await supabase.from('rod_list_config' as any).insert({
        language,
        outbound_list_id: listId,
        label: list?.name || '',
      });
      if (error) throw error;
    },
    onSuccess: (_, { language }) => {
      queryClient.invalidateQueries({ queryKey: ['rod-list-config'] });
      const lang = LANGUAGE_CONFIG.find(l => l.code === language);
      toast.success(`Lista ROD ${lang?.label} vinculada correctamente`);
    },
    onError: () => toast.error('Error al vincular la lista'),
  });

  const unlinkMutation = useMutation({
    mutationFn: async (language: string) => {
      const { error } = await supabase.from('rod_list_config' as any).delete().eq('language', language);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rod-list-config'] });
      toast.success('Lista desvinculada');
    },
    onError: () => toast.error('Error al desvincular'),
  });

  const getConfigForLang = (lang: string) => configs?.find(c => c.language === lang);
  const getListDetails = (listId: string) => allLists?.find(l => l.id === listId);

  if (configLoading || listsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Vincula una lista de empresas existente a cada idioma de la ROD. Las personas de estas listas formarán parte de la distribución de la Relación de Oportunidades.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LANGUAGE_CONFIG.map(lang => {
          const config = getConfigForLang(lang.code);
          const linkedList = config ? getListDetails(config.outbound_list_id) : null;

          return (
            <Card key={lang.code}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  ROD — {lang.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {config && linkedList ? (
                  // Linked state
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{linkedList.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {linkedList.contact_count ?? 0} registros
                            {linkedList.sector && ` · ${linkedList.sector}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        <Users className="h-3 w-3 mr-1" />
                        {linkedList.contact_count ?? 0}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1"
                        onClick={() => navigate(`/admin/listas-contacto/${config.outbound_list_id}`)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Abrir lista
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-destructive hover:text-destructive"
                        onClick={() => unlinkMutation.mutate(lang.code)}
                        disabled={unlinkMutation.isPending}
                      >
                        <Unlink className="h-3 w-3 mr-1" />
                        Desvincular
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Unlinked state
                  <div className="space-y-3">
                    <Select
                      value={selectedListId[lang.code] || ''}
                      onValueChange={v => setSelectedListId(prev => ({ ...prev, [lang.code]: v }))}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Seleccionar lista de empresas..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allLists?.map(list => (
                          <SelectItem key={list.id} value={list.id}>
                            <div className="flex items-center gap-2">
                              <span>{list.name}</span>
                              <span className="text-muted-foreground text-xs">
                                ({list.contact_count ?? 0})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      disabled={!selectedListId[lang.code] || linkMutation.isPending}
                      onClick={() => linkMutation.mutate({ language: lang.code, listId: selectedListId[lang.code] })}
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      Vincular lista
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
