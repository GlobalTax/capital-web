import React, { useState } from 'react';
import { useUnifiedContacts } from '@/hooks/useUnifiedContacts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Download, 
  Upload, 
  Filter,
  Search
} from 'lucide-react';
import { ContactsTable } from './contacts/ContactsTable';
import { ContactFiltersPanel } from './contacts/ContactFiltersPanel';

export const ContactsManager = () => {
  const { 
    contacts, 
    allContacts, 
    isLoading, 
    filters, 
    applyFilters, 
    updateContactStatus,
    bulkUpdateStatus,
    exportContacts
  } = useUnifiedContacts();

  
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
            Contactos
          </h1>
          <p className="text-admin-text-secondary">
            {allContacts.length} contactos en total
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

      {/* Contacts Table */}
      <ContactsTable 
        contacts={contacts}
        onStatusUpdate={updateContactStatus}
        onBulkUpdate={bulkUpdateStatus}
      />
    </div>
  );
};

export default ContactsManager;