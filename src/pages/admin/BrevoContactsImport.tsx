import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Download, 
  RefreshCw, 
  Search, 
  Users, 
  Database, 
  CheckCircle2, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Building2,
  Phone
} from 'lucide-react';

interface BrevoContact {
  brevo_id: number;
  email: string;
  first_name: string;
  last_name: string;
  sms: string;
  company: string;
  email_blacklisted: boolean;
  sms_blacklisted: boolean;
  brevo_created_at: string;
  brevo_modified_at: string;
  list_ids: number[];
  list_names: string[];
  attributes: Record<string, unknown>;
}

interface BrevoList {
  id: number;
  name: string;
  totalSubscribers: number;
  uniqueSubscribers: number;
}

interface Stats {
  brevoTotal: number;
  importedCount: number;
  syncedToCrm: number;
  pendingImport: number;
}

const ITEMS_PER_PAGE = 50;

export default function BrevoContactsImport() {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('all');
  const [isImporting, setIsImporting] = useState(false);

  // Fetch Brevo lists
  const { data: listsData } = useQuery({
    queryKey: ['brevo-lists'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('brevo-list-contacts', {
        body: null,
        method: 'GET',
      });
      
      // Use fetch since invoke doesn't support query params well
      const response = await fetch(
        `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/brevo-list-contacts?action=lists`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I',
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch lists');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['brevo-stats'],
    queryFn: async () => {
      const response = await fetch(
        `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/brevo-list-contacts?action=stats`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I',
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch contacts with pagination
  const { data: contactsData, isLoading: isLoadingContacts, refetch: refetchContacts } = useQuery({
    queryKey: ['brevo-contacts', offset, selectedListId],
    queryFn: async () => {
      let url = `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/brevo-list-contacts?action=list&limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      
      if (selectedListId && selectedListId !== 'all') {
        url += `&listId=${selectedListId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Search contact by email
  const searchMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(
        `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/brevo-list-contacts?action=search&email=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I',
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to search');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.found) {
        toast.success(`Contacto encontrado: ${data.contact.email}`);
      } else {
        toast.info('Contacto no encontrado en Brevo');
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Import contacts mutation
  const importMutation = useMutation({
    mutationFn: async (contacts: BrevoContact[]) => {
      const batchId = crypto.randomUUID();
      
      const response = await fetch(
        `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/brevo-list-contacts?action=import`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contacts, batchId }),
        }
      );
      
      if (!response.ok) throw new Error('Failed to import');
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`${data.imported} contactos importados correctamente`);
      setSelectedContacts(new Set());
      refetchStats();
    },
    onError: (error) => {
      toast.error(`Error al importar: ${error.message}`);
    },
  });

  // Import all contacts (paginated)
  const importAllContacts = async () => {
    setIsImporting(true);
    let currentOffset = 0;
    let totalImported = 0;
    const batchSize = 100;

    try {
      while (true) {
        // Fetch batch
        let url = `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/brevo-list-contacts?action=list&limit=${batchSize}&offset=${currentOffset}`;
        if (selectedListId && selectedListId !== 'all') {
          url += `&listId=${selectedListId}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();

        if (data.contacts.length === 0) break;

        // Import batch
        const importResponse = await fetch(
          `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/brevo-list-contacts?action=import`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contacts: data.contacts, batchId: crypto.randomUUID() }),
          }
        );

        if (!importResponse.ok) throw new Error('Failed to import batch');
        const importResult = await importResponse.json();
        totalImported += importResult.imported;

        toast.info(`Progreso: ${totalImported} contactos importados...`);

        if (!data.hasMore) break;
        currentOffset += batchSize;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success(`✅ Importación completada: ${totalImported} contactos`);
      refetchStats();
    } catch (error) {
      toast.error(`Error durante la importación: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && contactsData?.contacts) {
      setSelectedContacts(new Set(contactsData.contacts.map((c: BrevoContact) => c.brevo_id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (brevoId: number, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(brevoId);
    } else {
      newSelected.delete(brevoId);
    }
    setSelectedContacts(newSelected);
  };

  const handleImportSelected = () => {
    if (selectedContacts.size === 0) {
      toast.warning('Selecciona al menos un contacto');
      return;
    }

    const contactsToImport = contactsData?.contacts?.filter(
      (c: BrevoContact) => selectedContacts.has(c.brevo_id)
    );

    if (contactsToImport) {
      importMutation.mutate(contactsToImport);
    }
  };

  const handleSearch = () => {
    if (!searchEmail.trim()) {
      toast.warning('Introduce un email para buscar');
      return;
    }
    searchMutation.mutate(searchEmail.trim());
  };

  const stats: Stats = statsData?.stats || { brevoTotal: 0, importedCount: 0, syncedToCrm: 0, pendingImport: 0 };
  const contacts: BrevoContact[] = contactsData?.contacts || [];
  const totalContacts = contactsData?.count || 0;
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;
  const totalPages = Math.ceil(totalContacts / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Importar Contactos de Brevo</h1>
          <p className="text-muted-foreground">
            Visualiza y sincroniza contactos desde tu cuenta de Brevo
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => { refetchContacts(); refetchStats(); }}
          disabled={isLoadingContacts}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingContacts ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total en Brevo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.brevoTotal.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Importados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.importedCount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Sincronizados CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.syncedToCrm.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingImport.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Email Search */}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Buscar contacto por email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                variant="secondary" 
                onClick={handleSearch}
                disabled={searchMutation.isPending}
              >
                {searchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* List Filter */}
            <Select value={selectedListId} onValueChange={(value) => { setSelectedListId(value); setOffset(0); }}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrar por lista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las listas</SelectItem>
                {listsData?.lists?.map((list: BrevoList) => (
                  <SelectItem key={list.id} value={list.id.toString()}>
                    {list.name} ({list.totalSubscribers})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Import Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleImportSelected}
                disabled={selectedContacts.size === 0 || importMutation.isPending}
              >
                {importMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Importar seleccionados ({selectedContacts.size})
              </Button>

              <Button
                onClick={importAllContacts}
                disabled={isImporting}
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Importar todos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={contacts.length > 0 && selectedContacts.size === contacts.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Listas</TableHead>
                <TableHead>Fecha Brevo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingContacts ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-muted-foreground mt-2">Cargando contactos...</p>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay contactos para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact: BrevoContact) => (
                  <TableRow key={contact.brevo_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.has(contact.brevo_id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.brevo_id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{contact.email}</span>
                        {contact.email_blacklisted && (
                          <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.first_name || contact.last_name ? (
                        `${contact.first_name} ${contact.last_name}`.trim()
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.company ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {contact.company}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.sms ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {contact.sms}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.list_names?.slice(0, 2).map((name, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                        {contact.list_names?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.list_names.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(contact.brevo_created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {totalContacts > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {offset + 1} - {Math.min(offset + ITEMS_PER_PAGE, totalContacts)} de {totalContacts.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - ITEMS_PER_PAGE))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + ITEMS_PER_PAGE)}
                disabled={!contactsData?.hasMore}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
