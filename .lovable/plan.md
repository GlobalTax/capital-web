

# Plan: Añadir Columnas de Canal, Formulario y Estado en Contacts V2

## Problema Identificado

La nueva implementación de ContactRow.tsx no muestra las columnas de:
1. **Canal de adquisición** (`acquisition_channel_name`)
2. **Formulario de origen** (`lead_form_name`)

Los datos SÍ se cargan correctamente en el hook (líneas 224-226, 263-265), pero la UI no los renderiza.

## Solución

Modificar `ContactRow.tsx` y `VirtualContactsTable.tsx` para incluir las columnas faltantes.

### Archivo 1: `src/components/admin/contacts-v2/ContactRow.tsx`

**Cambios en la grid de columnas (línea 76):**

| Antes | Después |
|-------|---------|
| `grid-cols-[2fr_2fr_1fr_1fr_1fr_80px]` | `grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_80px]` |

**Columnas nuevas a añadir:**

1. Añadir columna de **Canal** después de "Estado":
```tsx
{/* Channel */}
<div className="truncate text-muted-foreground text-[10px]">
  {contact.acquisition_channel_name || '-'}
</div>
```

2. Añadir columna de **Formulario** después de "Canal":
```tsx
{/* Form */}
<div className="truncate text-muted-foreground text-[10px]">
  {contact.lead_form_name || '-'}
</div>
```

### Archivo 2: `src/components/admin/contacts-v2/VirtualContactsTable.tsx`

**Cambios en el header (línea 109):**

| Antes | Después |
|-------|---------|
| `grid-cols-[2fr_2fr_1fr_1fr_1fr_80px]` | `grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_80px]` |

**Añadir encabezados nuevos:**
```tsx
<span>Nombre</span>
<span>Empresa</span>
<span>Estado</span>
<span>Canal</span>      {/* NUEVO */}
<span>Formulario</span> {/* NUEVO */}
<span>Origen</span>
<span className="text-right">Valoración</span>
```

## Sección Técnica

### Distribución de Columnas Actualizada

| Columna | Ancho | Campo de datos |
|---------|-------|----------------|
| Nombre | 2fr | `name`, `email` |
| Empresa | 1.5fr | `empresa_nombre`, `company` |
| Estado | 1fr | `lead_status_crm` |
| Canal | 1fr | `acquisition_channel_name` |
| Formulario | 1fr | `lead_form_name` |
| Origen | 1fr | `origin` (badge) |
| Valoración | 80px | `final_valuation` |

### Verificación de Datos

Los datos ya se cargan correctamente en `useContacts.ts`:

```typescript
// Líneas 224-226 (transformContact)
acquisition_channel_id: lead.acquisition_channel_id,
acquisition_channel_name: lead.acquisition_channel?.name,
lead_form: lead.lead_form,
lead_form_name: lead.lead_form_ref?.name,

// Líneas 263-265 (transformValuation)
acquisition_channel_name: lead.acquisition_channel?.name,
lead_form_name: lead.lead_form_ref?.name,
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/contacts-v2/ContactRow.tsx` | Añadir columnas de Canal y Formulario |
| `src/components/admin/contacts-v2/VirtualContactsTable.tsx` | Añadir encabezados de Canal y Formulario |

## Resultado Esperado

La tabla mostrará 7 columnas:
1. Nombre (con email)
2. Empresa
3. Estado
4. **Canal** (nuevo)
5. **Formulario** (nuevo)
6. Origen
7. Valoración

