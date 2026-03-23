

## Eliminar duplicados en Gestión de Leads

### Concepto
Añadir un botón "Eliminar duplicados" en el header de Leads que analice y agrupe registros duplicados por email, CIF o teléfono, permitiendo revisar y fusionar/eliminar los duplicados.

### Flujo UX
1. Botón en el header (junto a StatusesEditor/LeadFormsEditor)
2. Al pulsar, se abre un diálogo que:
   - Escanea los contactos cargados en memoria buscando coincidencias por email, CIF o teléfono
   - Muestra grupos de duplicados con sus datos clave (nombre, email, CIF, teléfono, origen, fecha)
   - Para cada grupo, el usuario selecciona cuál conservar (por defecto el más reciente/completo)
   - Botón "Eliminar duplicados" que soft-deletes los registros sobrantes

### Cambios

**1. Nuevo componente: `src/components/admin/contacts-v2/DuplicatesDialog.tsx`**
- Recibe la lista de `allContacts` del hook `useContacts`
- Agrupa client-side por `LOWER(email)`, `cif` y `phone` (normalizados)
- Muestra tabla de grupos con: campo coincidente, nº duplicados, detalle expandible
- Permite seleccionar cuál mantener en cada grupo
- Al confirmar, ejecuta soft-delete (update `is_deleted=true` o `status='archived'`) en los registros descartados, diferenciando por tabla origen (`company_valuations` vs `contact_leads`)

**2. Archivo: `src/components/admin/contacts-v2/ContactsHeader.tsx`**
- Importar `DuplicatesDialog`
- Añadir botón con icono `Copy` (lucide) junto a los editores existentes
- Pasar `allContacts` como prop (ya disponible en `ContactsLayout`)

**3. Archivo: `src/components/admin/contacts-v2/ContactsLayout.tsx`**
- Pasar `allContacts` al `ContactsHeader` para que el diálogo pueda escanear todos los registros

### Lógica de detección
- Normalizar: `email.toLowerCase().trim()`, `cif.toUpperCase().trim()`, `phone.replace(/\s/g, '')`
- Ignorar campos vacíos/null
- Un registro puede aparecer en múltiples grupos (mismo email Y mismo CIF)
- Prioridad para conservar: más campos rellenos > más reciente

### Lógica de eliminación
- Para `origin === 'valuation'`: update `company_valuations` set `is_deleted = true`
- Para `origin === 'contact'`: update `contact_leads` set `is_deleted = true`
- Tras eliminar, invalidar queries y refetch

