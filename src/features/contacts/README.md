# Contacts Feature Module

Sistema completo de gestión de contactos y leads con filtrado, acciones masivas y tracking.

## 📁 Estructura

```
contacts/
├── components/         # Componentes UI
│   ├── ContactStatsCards.tsx
│   ├── ContactTabs.tsx
│   └── ContactsErrorBoundary.tsx
├── hooks/             # Hooks de gestión
│   ├── useContactActions.ts
│   └── useContactSelection.ts
├── types/             # Tipos TypeScript
│   └── index.ts
└── validation/        # Schemas Zod
    └── schemas.ts
```

## 🚀 Uso Rápido

### Acciones de Contacto

```typescript
import { useContactActions } from '@/features/contacts';

function ContactManager() {
  const {
    updateContact,
    deleteContact,
    bulkUpdateContacts,
    isLoading
  } = useContactActions();

  const handleStatusChange = async (contactId: string) => {
    await updateContact(contactId, {
      status: 'qualified',
      priority: 'high',
      last_contact_at: new Date().toISOString()
    });
  };

  return (
    <button onClick={() => handleStatusChange('123')} disabled={isLoading}>
      Marcar como Calificado
    </button>
  );
}
```

### Selección Múltiple

```typescript
import { useContactSelection } from '@/features/contacts';

function ContactList({ contacts }) {
  const {
    selectedIds,
    toggleContact,
    selectAll,
    clearSelection,
    isSelected
  } = useContactSelection();

  return (
    <div>
      <button onClick={selectAll}>Seleccionar Todos</button>
      <button onClick={clearSelection}>Limpiar Selección</button>
      
      {contacts.map(contact => (
        <div key={contact.id}>
          <input
            type="checkbox"
            checked={isSelected(contact.id)}
            onChange={() => toggleContact(contact.id)}
          />
          <span>{contact.name}</span>
        </div>
      ))}
    </div>
  );
}
```

### Filtrado de Contactos

```typescript
import type { ContactsFilters } from '@/features/contacts';

const [filters, setFilters] = useState<ContactsFilters>({
  search: '',
  origin: 'valuations',
  status: 'new',
  priority: 'high',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Aplicar filtros
const filteredContacts = contacts.filter(contact => {
  if (filters.search && !contact.name?.includes(filters.search)) return false;
  if (filters.origin && contact.origin !== filters.origin) return false;
  if (filters.status && contact.status !== filters.status) return false;
  return true;
});
```

## 📊 Tipos de Contacto

### Contact Type

```typescript
import type { Contact, ContactOrigin, ContactStatus } from '@/features/contacts';

const contact: Contact = {
  id: '123',
  origin: 'valuations',
  email: 'cliente@example.com',
  name: 'Juan Pérez',
  company_name: 'Empresa SL',
  phone: '+34600000000',
  status: 'qualified',
  priority: 'high',
  score: 85,
  created_at: '2024-01-01T00:00:00Z',
  
  // Campos de valoración
  industry: 'Tecnología',
  revenue: 500000,
  ebitda: 150000,
  
  // Metadata
  utm_source: 'google',
  utm_campaign: 'valoracion-2024'
};
```

### Contact Origins

```typescript
type ContactOrigin = 
  | 'valuations'                    // Desde calculadora
  | 'contact_leads'                 // Formulario contacto
  | 'collaborator_applications'     // Solicitud colaborador
  | 'newsletter_subscriptions';     // Suscripción newsletter
```

### Contact Status

```typescript
type ContactStatus = 
  | 'new'          // Nuevo contacto
  | 'contacted'    // Contactado
  | 'qualified'    // Calificado
  | 'converted'    // Convertido
  | 'lost';        // Perdido
```

### Contact Priority

```typescript
type ContactPriority = 'low' | 'medium' | 'high' | 'urgent';
```

## 🎯 Validación con Zod

```typescript
import { contactUpdateSchema, contactFiltersSchema } from '@/features/contacts';

// Validar actualización
const updateData = contactUpdateSchema.parse({
  status: 'qualified',
  priority: 'high',
  notes: 'Cliente interesado en valoración completa',
  tags: ['hot-lead', 'tech-sector']
});

// Validar filtros
const filters = contactFiltersSchema.parse({
  origin: 'valuations',
  status: 'new',
  dateFrom: '2024-01-01'
});
```

## 🔄 Acciones Masivas

```typescript
import { useContactActions } from '@/features/contacts';

function BulkActions({ selectedIds }) {
  const { bulkUpdateContacts, bulkDeleteContacts } = useContactActions();

  const markAsQualified = async () => {
    await bulkUpdateContacts(selectedIds, {
      status: 'qualified',
      priority: 'high'
    });
  };

  const archiveContacts = async () => {
    await bulkDeleteContacts(selectedIds);
  };

  return (
    <div>
      <button onClick={markAsQualified}>
        Marcar como Calificados
      </button>
      <button onClick={archiveContacts}>
        Archivar Seleccionados
      </button>
    </div>
  );
}
```

## 📈 Estadísticas

```typescript
import type { ContactStats } from '@/features/contacts';

const stats: ContactStats = {
  total: 250,
  new: 75,
  contacted: 80,
  qualified: 50,
  converted: 40,
  conversionRate: 16  // 40/250 = 16%
};
```

## 🏷️ Tags y Notas

```typescript
// Actualizar con tags
await updateContact(contactId, {
  tags: ['hot-lead', 'tech-sector', 'high-value'],
  notes: 'Contacto inicial muy positivo. Interesado en servicios premium.'
});
```

## 🔍 Búsqueda y Filtrado

```typescript
import type { ContactsFilters } from '@/features/contacts';

const advancedFilters: ContactsFilters = {
  search: 'empresa',              // Buscar en nombre/email
  origin: 'valuations',           // Solo valoraciones
  status: 'qualified',            // Solo calificados
  priority: 'high',               // Alta prioridad
  dateFrom: '2024-01-01',         // Desde fecha
  dateTo: '2024-12-31',           // Hasta fecha
  tags: ['tech-sector']           // Con tags específicos
};
```

## 📝 Tracking de Acciones

```typescript
import type { ContactAction } from '@/features/contacts';

const action: ContactAction = {
  id: '1',
  contact_id: '123',
  action_type: 'email',
  description: 'Enviado email con propuesta de valoración',
  created_at: '2024-01-15T10:30:00Z',
  created_by: 'admin-user-id'
};

// Tipos de acciones
type ActionType = 'email' | 'call' | 'meeting' | 'note';
```

## 🛡️ Mejores Prácticas

1. **Validar siempre** con schemas Zod
2. **Usar acciones masivas** para eficiencia
3. **Trackear todas las interacciones**
4. **Priorizar leads** según score
5. **Tags consistentes** para categorización
6. **Notas detalladas** en cada contacto
7. **Error boundaries** para robustez

## 🎨 Componentes UI

### ContactStatsCards

```typescript
import { ContactStatsCards } from '@/features/contacts';

<ContactStatsCards stats={stats} />
```

### ContactTabs

```typescript
import { ContactTabs } from '@/features/contacts';

<ContactTabs 
  activeTab="qualified"
  onTabChange={handleTabChange}
/>
```

### ContactsErrorBoundary

```typescript
import { ContactsErrorBoundary } from '@/features/contacts';

<ContactsErrorBoundary>
  <ContactList />
</ContactsErrorBoundary>
```

## 🐛 Debugging

```typescript
// Log de acciones
console.log('Selected contacts:', selectedIds);
console.log('Filters:', filters);
console.log('Loading:', isLoading);

// Validar datos manualmente
try {
  const valid = contactUpdateSchema.parse(data);
  console.log('Valid data:', valid);
} catch (error) {
  console.error('Validation errors:', error.errors);
}
```
