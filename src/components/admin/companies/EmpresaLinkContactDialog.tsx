/**
 * Dialog to link existing contactos or create new ones for an empresa.
 * Dual-tab: "Seleccionar existente" / "Crear nuevo"
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus, Link2, Plus, Loader2 } from 'lucide-react';
import { useEmpresaContactos, ContactoInput } from '@/hooks/useEmpresaContactos';

interface EmpresaLinkContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  onSuccess: () => void;
}

export const EmpresaLinkContactDialog: React.FC<EmpresaLinkContactDialogProps> = ({
  open,
  onOpenChange,
  empresaId,
  onSuccess,
}) => {
  const [tab, setTab] = useState<string>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [linking, setLinking] = useState<string | null>(null);

  // New contact form state
  const [form, setForm] = useState<ContactoInput>({
    nombre: '',
    email: '',
    telefono: '',
    cargo: '',
  });

  const { searchContactos, linkContacto, createAndLink } = useEmpresaContactos(empresaId);

  // Search existing contactos
  const { data: results, isLoading } = useQuery({
    queryKey: ['search-contactos-for-link', empresaId, searchQuery],
    queryFn: () => searchContactos(searchQuery),
    enabled: open && searchQuery.length >= 2 && tab === 'search',
  });

  const handleLink = async (contactoId: string) => {
    setLinking(contactoId);
    try {
      await linkContacto.mutateAsync(contactoId);
      onSuccess();
    } finally {
      setLinking(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) return;
    await createAndLink.mutateAsync(form);
    setForm({ nombre: '', email: '', telefono: '', cargo: '' });
    onSuccess();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSearchQuery('');
      setForm({ nombre: '', email: '', telefono: '', cargo: '' });
      setTab('search');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Añadir Contacto
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="search" className="flex-1">
              <Link2 className="h-4 w-4 mr-1" />
              Seleccionar existente
            </TabsTrigger>
            <TabsTrigger value="create" className="flex-1">
              <Plus className="h-4 w-4 mr-1" />
              Crear nuevo
            </TabsTrigger>
          </TabsList>

          {/* Tab: Search existing */}
          <TabsContent value="search" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
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
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : results && results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {c.nombre} {c.apellidos || ''}
                          </span>
                          {c.cargo && (
                            <Badge variant="outline" className="text-xs">{c.cargo}</Badge>
                          )}
                          {c.empresa_principal_id && (
                            <Badge className="text-xs" variant="secondary">
                              Vinculado a otra
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {c.email}
                          {c.telefono && ` • ${c.telefono}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLink(c.id)}
                        disabled={linking === c.id}
                      >
                        {linking === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-1" />
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
          </TabsContent>

          {/* Tab: Create new */}
          <TabsContent value="create" className="mt-4">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => setForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Nombre"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={form.cargo || ''}
                    onChange={(e) => setForm(p => ({ ...p, cargo: e.target.value }))}
                    placeholder="CEO, Director..."
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@empresa.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={form.telefono || ''}
                  onChange={(e) => setForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="+34 600 000 000"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createAndLink.isPending || !form.nombre.trim() || !form.email.trim()}
              >
                {createAndLink.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Crear y vincular
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
