

## Problema: Leads que no aparecen en Gestión de Leads

Tras investigar el flujo completo, he encontrado **dos problemas** en el hook principal `useContacts.ts` (contacts-v2):

### Problema 1: Deduplicación agresiva oculta sell_leads
En `useContacts.ts` líneas 145-150, los `sell_leads` y `general_contact_leads` se **filtran** si su email ya existe en `contact_leads`:
```typescript
...(sellLeads || [])
  .filter((l: any) => !contactLeadEmails.has(l.email?.toLowerCase()))
  .map(...)
```
Esto significa que si un lead con service_type "vender" falla al insertar en `sell_leads` y cae en el fallback a `contact_leads` (líneas 291-307 de `useContactForm.ts`), o si el mismo email ya existe por otra vía en `contact_leads`, el registro de `sell_leads` **desaparece** del panel. O al revés: si la inserción en `sell_leads` funciona pero el email ya está en `contact_leads`, el sell_lead se oculta.

### Problema 2: `company_acquisition_inquiries` no se consulta
La tabla `company_acquisition_inquiries` está mapeada en `ORIGIN_TABLE_MAP` del layout pero **nunca se consulta** en el hook `useContacts.ts`. Cualquier lead de tipo "company_acquisition" no aparece.

### Plan de corrección

**Archivo**: `src/components/admin/contacts-v2/hooks/useContacts.ts`

**Paso 1 — Eliminar deduplicación por email en legacy tables**
Quitar el filtro `.filter((l: any) => !contactLeadEmails.has(l.email?.toLowerCase()))` de las líneas 145-150. Los sell_leads y general_contact_leads deben aparecer siempre, incluso si el email existe en otra tabla. La detección de duplicados ya existe como feature aparte (`is_possible_duplicate`).

**Paso 2 — Añadir fetch de `company_acquisition_inquiries`**
Incluir la consulta a `company_acquisition_inquiries` en el `Promise.all` y transformar los resultados con `transformContact(l, 'company_acquisition', ...)` en el array unificado.

**Paso 3 — Añadir suscripción realtime para las tablas faltantes**
Añadir listeners de `sell_leads`, `general_contact_leads` y `company_acquisition_inquiries` al canal de realtime para que los nuevos leads aparezcan automáticamente.

### Resultado
- Todos los leads de `sell_leads` (formulario "vender") aparecerán siempre
- Todos los leads de `general_contact_leads` aparecerán siempre
- Los leads de `company_acquisition_inquiries` aparecerán por primera vez
- No se perderá ningún lead por deduplicación entre tablas

### Restricción
No se modifican los componentes protegidos por `lead-management-code-protection`. Solo se corrige el hook de fetch para incluir datos faltantes.

