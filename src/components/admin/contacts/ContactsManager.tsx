import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Flame, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import { useUnifiedContacts, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ContactFilters from './ContactFilters';
import ContactsTable from './ContactsTable';
import BulkActionsToolbar from './BulkActionsToolbar';
import ContactDetailsModal from './ContactDetailsModal';

const ContactsManager = () => {
  const navigate = useNavigate();
  const { contacts, stats, isLoading, filters, applyFilters, updateContactStatus, bulkUpdateStatus, exportContacts, refetch } = useUnifiedContacts();
  const { toast } = useToast();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContactOrigin | 'all'>('all');

  const handleTabChange = (value: string) => {
    setActiveTab(value as ContactOrigin | 'all');
    applyFilters({
      ...filters,
      origin: value as ContactOrigin | 'all',
    });
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleViewDetails = (contactId: string, origin: ContactOrigin) => {
    navigate(`/admin/contacts/${origin}_${contactId}`);
  };

  const handleSoftDelete = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    const confirmed = window.confirm(
      `¿Archivar "${contact.name}"?\n\nSe puede restaurar después desde la sección de archivados.`
    );
    if (!confirmed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
        deletion_reason: 'Archivado desde gestión de contactos'
      };

      let error = null;
      
      if (contact.origin === 'contact') {
        const result = await supabase.from('contact_leads').update(updates).eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'valuation') {
        const result = await supabase.from('company_valuations').update(updates).eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'collaborator') {
        const result = await supabase.from('collaborator_applications').update(updates).eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'acquisition') {
        const result = await supabase.from('acquisition_leads').update(updates).eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'company_acquisition') {
        const result = await supabase.from('company_acquisition_inquiries').update(updates).eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'general') {
        const result = await supabase.from('general_contact_leads').update(updates).eq('id', contactId);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Contacto archivado",
        description: "Se puede restaurar desde la sección 'Archivados'",
      });
      
      refetch();
    } catch (error) {
      console.error('Error archivando contacto:', error);
      toast({
        title: "Error",
        description: "No se pudo archivar el contacto",
        variant: "destructive",
      });
    }
  };

  const handleHardDelete = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    const confirmed1 = window.confirm(
      `⚠️ ELIMINAR DEFINITIVAMENTE "${contact.name}"?\n\nEsta acción NO se puede deshacer y eliminará el contacto permanentemente de la base de datos.`
    );
    if (!confirmed1) return;

    const confirmed2 = window.confirm(
      '⚠️ CONFIRMACIÓN FINAL\n\n¿Estás 100% seguro? Esta acción es IRREVERSIBLE.\n\nEscribe "ELIMINAR" para confirmar.'
    );
    if (!confirmed2) return;

    try {
      let error = null;
      
      if (contact.origin === 'contact') {
        const result = await supabase.from('contact_leads').delete().eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'valuation') {
        const result = await supabase.from('company_valuations').delete().eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'collaborator') {
        const result = await supabase.from('collaborator_applications').delete().eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'acquisition') {
        const result = await supabase.from('acquisition_leads').delete().eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'company_acquisition') {
        const result = await supabase.from('company_acquisition_inquiries').delete().eq('id', contactId);
        error = result.error;
      } else if (contact.origin === 'general') {
        const result = await supabase.from('general_contact_leads').delete().eq('id', contactId);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Contacto eliminado",
        description: "Eliminación permanente completada",
      });
      
      refetch();
    } catch (error) {
      console.error('Error eliminando contacto:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive",
      });
    }
  };

  const handleBulkSoftDelete = async () => {
    const count = selectedContacts.length;
    const confirmed = window.confirm(
      `¿Archivar ${count} contacto${count > 1 ? 's' : ''}?\n\nSe pueden restaurar después.`
    );
    if (!confirmed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
        deletion_reason: 'Archivado masivamente desde gestión de contactos'
      };

      const byOrigin: Record<string, string[]> = {};
      selectedContacts.forEach(id => {
        const contact = contacts.find(c => c.id === id);
        if (contact) {
          if (!byOrigin[contact.origin]) byOrigin[contact.origin] = [];
          byOrigin[contact.origin].push(id);
        }
      });

      const promises = Object.entries(byOrigin).map(([origin, ids]) => {
        const table = origin === 'contact' ? 'contact_leads' :
                      origin === 'valuation' ? 'company_valuations' :
                      origin === 'collaborator' ? 'collaborator_applications' :
                      origin === 'acquisition' ? 'acquisition_leads' :
                      origin === 'company_acquisition' ? 'company_acquisition_inquiries' :
                      'general_contact_leads';
        
        return supabase.from(table).update(updates).in('id', ids);
      });

      await Promise.all(promises);

      toast({
        title: `${count} contacto${count > 1 ? 's' : ''} archivado${count > 1 ? 's' : ''}`,
      });
      
      setSelectedContacts([]);
      refetch();
    } catch (error) {
      console.error('Error archivando contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron archivar los contactos",
        variant: "destructive",
      });
    }
  };

  const handleBulkHardDelete = async () => {
    const count = selectedContacts.length;
    
    const confirmed1 = window.confirm(
      `⚠️ ELIMINAR ${count} CONTACTO${count > 1 ? 'S' : ''} DEFINITIVAMENTE?\n\nEsta acción NO se puede deshacer.`
    );
    if (!confirmed1) return;

    const confirmed2 = window.confirm(
      '⚠️ CONFIRMACIÓN FINAL\n\n¿Eliminar permanentemente? IRREVERSIBLE.'
    );
    if (!confirmed2) return;

    try {
      const byOrigin: Record<string, string[]> = {};
      selectedContacts.forEach(id => {
        const contact = contacts.find(c => c.id === id);
        if (contact) {
          if (!byOrigin[contact.origin]) byOrigin[contact.origin] = [];
          byOrigin[contact.origin].push(id);
        }
      });

      const promises = Object.entries(byOrigin).map(([origin, ids]) => {
        const table = origin === 'contact' ? 'contact_leads' :
                      origin === 'valuation' ? 'company_valuations' :
                      origin === 'collaborator' ? 'collaborator_applications' :
                      origin === 'acquisition' ? 'acquisition_leads' :
                      origin === 'company_acquisition' ? 'company_acquisition_inquiries' :
                      'general_contact_leads';
        
        return supabase.from(table).delete().in('id', ids);
      });

      await Promise.all(promises);

      toast({
        title: `${count} contacto${count > 1 ? 's' : ''} eliminado${count > 1 ? 's' : ''} permanentemente`,
      });
      
      setSelectedContacts([]);
      refetch();
    } catch (error) {
      console.error('Error eliminando contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar los contactos",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestión de Contactos</h1>
          <p className="text-muted-foreground mt-2">
            Sistema unificado de gestión de leads y contactos
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contactos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valoraciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byOrigin.valuation || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valoración Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {formatCurrency(stats.totalValuation)}
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ContactFilters
        filters={filters}
        onFiltersChange={applyFilters}
        totalContacts={contacts.length}
      />

      {/* Bulk Actions Toolbar */}
      {selectedContacts.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedContacts.length}
          onBulkUpdateStatus={bulkUpdateStatus}
          onExport={exportContacts}
          onClearSelection={() => setSelectedContacts([])}
          selectedIds={selectedContacts}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">
            Todos ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="contact">
            Comerciales ({stats.byOrigin.contact || 0})
          </TabsTrigger>
          <TabsTrigger value="valuation">
            Valoraciones ({stats.byOrigin.valuation || 0})
          </TabsTrigger>
          <TabsTrigger value="collaborator">
            Colaboradores ({stats.byOrigin.collaborator || 0})
          </TabsTrigger>
          <TabsTrigger value="acquisition">
            Adquisiciones ({stats.byOrigin.acquisition || 0})
          </TabsTrigger>
          <TabsTrigger value="company_acquisition">
            Compra ({stats.byOrigin.company_acquisition || 0})
          </TabsTrigger>
          <TabsTrigger value="general">
            Generales ({stats.byOrigin.general || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <ContactsTable
            contacts={contacts}
            selectedContacts={selectedContacts}
            onSelectContact={handleSelectContact}
            onSelectAll={handleSelectAll}
            onViewDetails={handleViewDetails}
            onSoftDelete={handleSoftDelete}
            onHardDelete={handleHardDelete}
            onBulkSoftDelete={handleBulkSoftDelete}
            onBulkHardDelete={handleBulkHardDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsModal
          contactId={selectedContact}
          contact={contacts.find(c => c.id === selectedContact)}
          onClose={() => setSelectedContact(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
};

export default ContactsManager;
