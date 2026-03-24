

## Arreglar el botón “Vincular” de empresa en leads

### Causa real
He revisado el flujo y el botón sí dispara la acción, pero la vinculación falla en Supabase.

En consola aparece este error:

```text
operator does not exist: text = uuid
```

La causa está en la función SQL que se ejecuta al actualizar `contact_leads.empresa_id`:

- `useEmpresas.ts` hace correctamente:
  - `update contact_leads set empresa_id = <uuid> where id = <uuid>`
- pero el trigger `sync_contact_lead_to_contacto()` compara:
  - `contactos.external_capittal_id` (text)
  - con `NEW.id` (uuid)
- esa comparación rompe la transacción y por eso parece que el botón “no reacciona”

### Plan

### 1. Corregir la función SQL que rompe la vinculación
**Archivo:** nueva migración en `supabase/migrations/`

Crear una migración que reemplace `sync_contact_lead_to_contacto()` para que todas las comparaciones sean consistentes:

- cambiar comparaciones tipo:
  - `external_capittal_id = NEW.id`
- por:
  - `external_capittal_id = NEW.id::text`

Y revisar también asignaciones tipo:
- `external_capittal_id = COALESCE(..., NEW.id)`
- para usar `NEW.id::text`

Esto arregla el error `text = uuid` y permite que la actualización de `empresa_id` termine correctamente.

### 2. Mantener la apertura automática a GoDeal tras vincular
**Archivo:** `src/components/admin/companies/CompanyLinkCard.tsx`

La redirección a GoDeal ya está planteada correctamente tras éxito:

```ts
window.open(`https://godeal.es/empresas/${selectedEmpresa.id}`, '_blank');
```

La dejaré atada al éxito real de la mutación, de modo que:
- si la vinculación funciona, abre GoDeal
- si falla, no abre nada y muestra error claro

### 3. Mejorar feedback visual del diálogo
**Archivos:**
- `src/components/admin/companies/CompanySearchDialog.tsx`
- `src/components/admin/companies/CompanyLinkCard.tsx`

Añadiré una UX más robusta para que no parezca que el botón no responde:

- estado `isLinking` al pulsar “Vincular”
- deshabilitar temporalmente el botón mientras guarda
- mostrar toast/error visible si la vinculación falla
- evitar doble clic y dobles peticiones

### 4. Refrescar el lead sin necesidad de recargar
**Archivos:**
- `src/hooks/useEmpresas.ts`
- `src/pages/admin/LeadDetailPage.tsx` o el flujo actual de `refetch`

Después del fix SQL, la UI ya podrá refrescar correctamente el detalle del lead:
- se actualiza `empresa_id`
- se vuelve a cargar la tarjeta
- se muestra la empresa vinculada sin refrescar la página manualmente

### Validación
Probaré estos casos:

1. Lead sin empresa → buscar empresa → clicar “Vincular”
   - debe vincularse
   - debe abrir GoDeal en nueva pestaña

2. Volver al lead
   - la tarjeta debe mostrar la empresa vinculada al instante

3. Desvincular y volver a vincular
   - no debe lanzar error SQL

4. Lead de tipo `valuation`
   - verificar que el flujo siga funcionando igual

### Detalle técnico
El problema no está en el botón ni en el diálogo, sino en backend:

```text
click en “Vincular”
-> update contact_leads.empresa_id
-> trigger sync_contact_lead_to_contacto()
-> comparación text vs uuid
-> error SQL
-> la UI parece no reaccionar
```

La corrección clave es rehacer la función SQL con casts explícitos a `text` donde toque.

