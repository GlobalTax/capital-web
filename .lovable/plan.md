

## Unificar perfil: Pipeline usa el mismo perfil que Gestión de Leads

### Problema
El pipeline navega a dos páginas distintas según el origen:
- `contact` → `/admin/contacts/contact_${id}` → **LeadDetailPage** (completo: asignación, estado CRM, notas, Brevo, canal, edición inline)
- `valuation` → `/admin/valuations/${id}` → **ValuationDetailPage** (básico: solo lectura, sin CRM)

### Solución
Cambiar la navegación del pipeline para que siempre use **LeadDetailPage** (`/admin/contacts/:id`), que ya soporta ambos orígenes (contact y valuation) con el formato `origin_uuid`.

### Cambio

**Archivo: `src/features/leads-pipeline/components/LeadsPipelineView.tsx`** (líneas 204-211)

Cambiar `handleViewDetails` para que construya la URL con prefijo de origen, igual que hace la tabla de contactos:

```typescript
const handleViewDetails = useCallback((leadId: string) => {
  const lead = leads.find(l => l.id === leadId);
  const prefix = lead?.origin === 'contact' ? 'contact' : 'valuation';
  navigate(`/admin/contacts/${prefix}_${leadId}`);
}, [navigate, leads]);
```

Un cambio de 2 líneas en un solo archivo. El `LeadDetailPage` ya maneja ambos orígenes con toda la funcionalidad CRM (estado, asignación, notas, Brevo, canal, archivado, edición financiera inline).

