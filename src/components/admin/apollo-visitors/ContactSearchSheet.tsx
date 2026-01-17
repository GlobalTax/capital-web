import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Loader2, 
  Download,
  CheckCircle2,
  XCircle,
  Linkedin,
} from 'lucide-react';
import { useApolloVisitorImport, ApolloPerson } from '@/hooks/useApolloVisitorImport';

interface ContactSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: { id: string; name: string; apolloOrgId: string } | null;
}

const getEmailStatusBadge = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'verified':
      return <Badge variant="default" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Verificado</Badge>;
    case 'guessed':
      return <Badge variant="secondary" className="text-xs">Estimado</Badge>;
    case 'unavailable':
      return <Badge variant="outline" className="text-xs gap-1"><XCircle className="h-3 w-3" /> No disponible</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status || '-'}</Badge>;
  }
};

export function ContactSearchSheet({
  open,
  onOpenChange,
  empresa,
}: ContactSearchSheetProps) {
  const [contacts, setContacts] = useState<ApolloPerson[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [total, setTotal] = useState(0);

  const { searchContacts, importContacts } = useApolloVisitorImport();

  useEffect(() => {
    if (open && empresa?.apolloOrgId) {
      loadContacts();
    }
  }, [open, empresa?.apolloOrgId]);

  const loadContacts = async () => {
    if (!empresa?.apolloOrgId) return;
    
    setIsLoading(true);
    try {
      const result = await searchContacts(empresa.apolloOrgId);
      setContacts(result.contacts);
      setTotal(result.total);
      setSelectedContacts(new Set());
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!empresa || selectedContacts.size === 0) return;
    
    setIsImporting(true);
    try {
      const contactsToImport = contacts.filter(c => selectedContacts.has(c.id));
      await importContacts(contactsToImport, empresa.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing contacts:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContacts(newSelected);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contactos de {empresa?.name}
          </SheetTitle>
          <SheetDescription>
            Busca y selecciona contactos para importar a contact_leads
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : contacts.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {total} contactos encontrados • {selectedContacts.size} seleccionados
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedContacts.size === contacts.length ? 'Deseleccionar' : 'Seleccionar'} todos
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleImport} 
                    disabled={selectedContacts.size === 0 || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Importar ({selectedContacts.size})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-250px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContacts.has(contact.id)}
                            onCheckedChange={() => toggleSelect(contact.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              {contact.linkedin_url && (
                                <a
                                  href={contact.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                                >
                                  <Linkedin className="h-3 w-3" />
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            {contact.title || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {contact.email}
                              </div>
                              {getEmailStatusBadge(contact.email_status)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.phone_numbers?.[0] ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {contact.phone_numbers[0].sanitized_number}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron contactos</p>
              <p className="text-sm">Prueba con otra empresa</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
