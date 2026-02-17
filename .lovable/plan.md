
# Herramienta de Gestion de NDAs

## Contexto actual

Ya existen las piezas fundamentales pero estan desconectadas:

- **Tabla `fase0_documents`**: almacena NDAs generados con estados (draft, sent, viewed, signed, expired, cancelled), tracking de envio, firma y visualizacion
- **`Fase0DocumentModal`**: permite generar NDAs rellenando variables sobre plantillas
- **`Fase0TemplatesPage`** (`/admin/documentos-fase0`): solo muestra plantillas, con TODOs en editar/preview
- **`nda_tracking_events`**: tabla de eventos de tracking (creada pero sin UI)
- **Compromiso de Confidencialidad**: PDF auto-adjunto con cada email de valoracion (recien implementado)

Lo que falta es un **panel centralizado de gestion de NDAs** donde el equipo pueda ver, filtrar, enviar y hacer seguimiento de todos los acuerdos de confidencialidad.

## Que se construira

### 1. Pagina principal: Gestion de NDAs (`/admin/ndas`)

Un dashboard con dos tabs principales:

**Tab "Documentos"** - Listado de todos los NDAs generados

| Empresa/Cliente | Tipo | Estado | Enviado | Visto | Firmado | Acciones |
|---|---|---|---|---|---|---|
| Empresa A | NDA Advisor | Firmado | 10/02 | 10/02 | 12/02 | [...] |
| Empresa B | NDA Advisor | Enviado | 08/02 | 09/02 | - | [...] |
| Empresa C | NDA Advisor | Borrador | - | - | - | [...] |

Columnas:
- Cliente/Empresa (extraido de `filled_data`)
- Tipo de documento (NDA, Mandato Venta, Mandato Compra)
- Estado (badge con color segun `FASE0_STATUS_COLORS`)
- Referencia (numero auto-generado)
- Fecha de envio / visualizacion / firma
- Acciones: Ver, Descargar PDF, Reenviar, Marcar como firmado

Filtros:
- Por tipo de documento (multiselect)
- Por estado (multiselect)
- Buscador por nombre de empresa/cliente
- Rango de fechas

**Tab "Plantillas"** - El contenido actual de `Fase0TemplatesPage`, integrado aqui

### 2. Detalle de NDA (Sheet lateral)

Al hacer click en un NDA del listado, se abre un panel lateral con:
- Datos completos del documento (variables rellenadas)
- Timeline de eventos (creado, enviado, visto, firmado) usando `nda_tracking_events`
- Acciones: descargar PDF, reenviar por email, marcar firmado, cancelar
- Link a la empresa/contacto asociado

### 3. Crear nuevo NDA desde el listado

Boton "Nuevo NDA" que abre el `Fase0DocumentModal` existente, pero con un selector previo de empresa/contacto para vincular.

### 4. Indicadores de estado visual

- Borrador: gris
- Enviado: azul
- Visto: amarillo (el cliente abrio el documento)
- Firmado: verde
- Expirado: rojo
- Cancelado: gris tachado

## Detalles tecnicos

### Archivos nuevos

| Archivo | Descripcion |
|---|---|
| `src/pages/admin/NDAManagementPage.tsx` | Pagina principal con tabs Documentos + Plantillas |
| `src/features/fase0-documents/components/NDADocumentsTable.tsx` | Tabla de NDAs con filtros y acciones |
| `src/features/fase0-documents/components/NDADetailSheet.tsx` | Panel lateral de detalle con timeline |
| `src/features/fase0-documents/hooks/useNDATracking.ts` | Hook para leer `nda_tracking_events` |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/features/admin/components/AdminRouter.tsx` | Anadir ruta `/admin/ndas` |
| `src/features/admin/config/sidebar-config.ts` | Cambiar el item "Documentos Fase 0" por "Gestion NDAs" apuntando a `/admin/ndas` |
| `src/features/admin/components/LazyAdminComponents.tsx` | Anadir lazy import de `NDAManagementPage` |

### Queries principales

La tabla `fase0_documents` ya tiene toda la estructura necesaria. Las queries usaran el hook `useFase0Documents` existente con filtros adicionales:

```text
-- Listado principal (ya existe el hook)
SELECT * FROM fase0_documents
WHERE document_type = 'nda' (o todos)
ORDER BY created_at DESC

-- Timeline de eventos
SELECT * FROM nda_tracking_events
WHERE recipient_id = [document_id o lead_id]
ORDER BY created_at ASC
```

### Integracion con flujo existente

- La pagina actual `/admin/documentos-fase0` se redirigira a `/admin/ndas`
- El `Fase0DocumentModal` se reutiliza tal cual para crear/editar NDAs
- El `Fase0DocumentsList` se reutiliza dentro del detalle de empresa
- No se modifica la tabla `fase0_documents` ni se crean nuevas tablas

### Sin cambios en base de datos

Todo lo necesario ya existe en las tablas `fase0_documents`, `fase0_document_templates` y `nda_tracking_events`. No se requieren migraciones.

## Alcance

- 4 archivos nuevos (pagina + 2 componentes + 1 hook)
- 3 archivos modificados (router, sidebar, lazy imports)
- 0 migraciones de BD
- Se reutiliza toda la infraestructura existente de Fase 0
