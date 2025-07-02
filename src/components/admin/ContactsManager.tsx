import React, { useState } from 'react';
import { useUnifiedContacts, ContactFilters } from '@/hooks/useUnifiedContacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Download, 
  Upload, 
  Filter,
  Search,
  Star,
  TrendingUp,
  Mail,
  Phone
} from 'lucide-react';
import { ContactsTable } from './contacts/ContactsTable';
import { ContactDetailModal } from './contacts/ContactDetailModal';
import { ContactFiltersPanel } from './contacts/ContactFiltersPanel';
import { ContactStats } from './contacts/ContactStats';

export const ContactsManager = () => {
  const { 
    contacts, 
    allContacts, 
    isLoading, 
    filters, 
    applyFilters, 
    updateContactStatus,
    bulkUpdateStatus,
    exportContacts,
    refetch 
  } = useUnifiedContacts();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters({ ...filters, search: value });
  };

  const clearFilters = () => {
    applyFilters({});
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text-primary">
            Gestión de Contactos
          </h1>
          <p className="text-admin-text-secondary">
            Vista unificada de todos tus contactos y leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportContacts('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Total Contactos
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {allContacts.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Leads Calientes
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {allContacts.filter(c => c.is_hot_lead || (c.score || 0) >= 80).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Oportunidades
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {allContacts.filter(c => c.status === 'opportunity').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Conversión
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {allContacts.length > 0 ? 
                    ((allContacts.filter(c => c.status === 'customer').length / allContacts.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email, empresa o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-white' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {Object.keys(filters).length > 1 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(filters).length - 1}
                </Badge>
              )}
            </Button>
            {Object.keys(filters).length > 1 && (
              <Button variant="ghost" onClick={clearFilters}>
                Limpiar
              </Button>
            )}
          </div>
          
          {showFilters && (
            <div className="mt-4 border-t pt-4">
              <ContactFiltersPanel 
                filters={filters}
                onFiltersChange={applyFilters}
                contacts={allContacts}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="contacts">
            Contactos
            <Badge variant="secondary" className="ml-2">
              {contacts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ContactStats contacts={allContacts} />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsTable 
            contacts={contacts}
            onContactSelect={setSelectedContact}
            onStatusUpdate={updateContactStatus}
            onBulkUpdate={bulkUpdateStatus}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <ContactStats contacts={allContacts} />
        </TabsContent>
      </Tabs>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contactId={selectedContact}
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          onStatusUpdate={updateContactStatus}
        />
      )}
    </div>
  );
};

export default ContactsManager;