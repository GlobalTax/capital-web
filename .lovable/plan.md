

## Plan: Copiar empresas seleccionadas de campaña a lista de contactos (bulk)

### Problema
Actualmente en campañas outbound, al seleccionar múltiples empresas solo se puede eliminar en bulk. Para mover/copiar a un sublistado hay que hacerlo una a una.

### Solución
Añadir un botón "Copiar a lista" en la barra de selección bulk del `CompaniesStep`, que abra un diálogo para elegir la lista destino e inserte todas las empresas seleccionadas en `outbound_list_companies` mapeando los campos.

### Cambios en `CompaniesStep.tsx`

1. **Nuevo botón en la barra de selección** (línea ~1010): "Copiar a lista" con icono `List`
2. **Nuevo diálogo `CopyToListDialog`** (componente inline o separado):
   - Carga listas desde `outbound_lists` (mismo patrón que `ImportFromListDialog`)
   - Select para elegir lista destino
   - Opción de crear nueva lista
   - Botón confirmar
3. **Lógica de copia bulk**:
   - Mapear campos de `valuation_campaign_companies` → `outbound_list_companies`:
     - `client_company` → `empresa`
     - `client_name` → `contacto`
     - `client_email` → `email`
     - `client_phone` → `telefono`
     - `client_cif` → `cif`
     - `client_website` → `web`
     - `client_provincia` → `provincia`
     - `revenue` → `facturacion`
     - `ebitda` → `ebitda`
   - Verificar duplicados por CIF antes de insertar
   - Insert en batches de 50 para evitar límites
   - Toast con resumen: X copiadas, Y duplicadas omitidas

### También disponible en `ProcessSendStep.tsx`
Añadir el mismo botón "Copiar a lista" en el `FloatingActionBar` que aparece al seleccionar empresas en el paso de envío.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/campanas-valoracion/shared/CopyToListDialog.tsx` | Crear — diálogo reutilizable |
| `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx` | Botón + integración del diálogo |
| `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` | Botón en FloatingActionBar + integración |

