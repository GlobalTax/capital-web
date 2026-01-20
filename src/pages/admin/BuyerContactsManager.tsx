// ============= BUYER CONTACTS MANAGER =============
// Página principal del directorio de Contactos Compra

import React, { useState, useMemo } from 'react';
import { useBuyerContacts } from '@/hooks/useBuyerContacts';
import { BuyerContact, BuyerContactStatus } from '@/types/buyer-contacts';
import { BuyerContactsTable } from '@/components/admin/buyer-contacts/BuyerContactsTable';
import { BuyerContactDetailSheet } from '@/components/admin/buyer-contacts/BuyerContactDetailSheet';
import { ExcelImporter } from '@/components/admin/buyer-contacts/ExcelImporter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, RefreshCw, Users, UserCheck, UserX, ShoppingCart, Loader2 } from 'lucide-react';

const BuyerContactsManager: React.FC = () => {
  const {
    contacts,
    isLoading,
    refetch,
    updateContact,
    deleteContact,
    updateStatus,
    stats,
    isUpdating,
  } = useBuyerContacts();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<BuyerContactStatus | 'all'>('all');
  const [selectedContact, setSelectedContact] = useState<BuyerContact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  // Filtrar contactos
  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Filtrar por estado
    if (activeTab !== 'all') {
      result = result.filter(c => c.status === activeTab);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.full_name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    }

    return result;
  }, [contacts, activeTab, searchTerm]);

  const handleViewContact = (contact: BuyerContact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleSaveContact = (id: string, updates: Partial<BuyerContact>) => {
    updateContact({ id, updates });
  };

  const handleDeleteClick = (id: string) => {
    setContactToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      deleteContact(contactToDelete);
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const handleUpdateStatus = (id: string, status: BuyerContactStatus) => {
    updateStatus(id, status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Contactos - Campaña Compras
          </h1>
          <p className="text-muted-foreground">
            Directorio independiente para contactos de la campaña de compras
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <ExcelImporter onImportComplete={() => refetch()} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nuevos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-blue-600">{stats.nuevo}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contactados</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-yellow-600">{stats.contactado}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.calificado}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Descartados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.descartado}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BuyerContactStatus | 'all')}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="nuevo">Nuevos</TabsTrigger>
                <TabsTrigger value="contactado">Contactados</TabsTrigger>
                <TabsTrigger value="calificado">Calificados</TabsTrigger>
                <TabsTrigger value="descartado">Descartados</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BuyerContactsTable
            contacts={filteredContacts}
            onViewContact={handleViewContact}
            onDeleteContact={handleDeleteClick}
            onUpdateStatus={handleUpdateStatus}
          />
          
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredContacts.length} de {contacts.length} contactos
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <BuyerContactDetailSheet
        contact={selectedContact}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onSave={handleSaveContact}
        isSaving={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El contacto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BuyerContactsManager;
