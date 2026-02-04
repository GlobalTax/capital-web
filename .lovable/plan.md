
# Plan: Eliminar Origen y Añadir Colores a Canal y Estado

## Cambios a Realizar

### 1. Eliminar columna "Origen"

Quitar la columna Origen de la tabla y ajustar el grid de 8 a 6 columnas.

### 2. Añadir colores al Estado (lead_status_crm)

| Estado | Color | Significado |
|--------|-------|-------------|
| `nuevo` | Azul | Lead recién llegado |
| `contactando` | Amarillo/Ámbar | En proceso de contacto |
| `calificado` | Verde | Lead cualificado |
| `propuesta_enviada` | Púrpura | Propuesta comercial enviada |
| `negociacion` | Índigo | En negociación activa |
| `mandato_propuesto` | Cyan | Mandato propuesto |
| `en_espera` | Gris | Pausado temporalmente |
| `archivado` | Slate | Archivado |
| `lead_perdido_curiosidad` | Rojo | Descartado |
| `compras` | Rosa | Compras |
| `fase0_activo` | Esmeralda | Fase 0 activo |

### 3. Añadir colores al Canal (acquisition_channel_name)

| Canal | Color |
|-------|-------|
| `Google Ads` | Rojo (branding Google) |
| `Meta Ads` / `Meta ads - Formulario instantáneo` | Azul (branding Meta) |
| `LinkedIn Ads` | Azul LinkedIn |
| `SEO Orgánico` | Verde |
| `Email Marketing` | Ámbar |
| `Referido` | Púrpura |
| `Directo` | Slate |
| `Evento/Feria` | Cyan |
| `Marketplace` | Rosa |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/contacts-v2/ContactRow.tsx` | Eliminar columna Origen, añadir mapas de colores para Estado y Canal, cambiar grid a 6 columnas |
| `src/components/admin/contacts-v2/VirtualContactsTable.tsx` | Eliminar header Origen, cambiar grid a 6 columnas |

## Detalle Técnico

### Nueva estructura de grid

```
grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px]
```

| Columna | Ancho |
|---------|-------|
| Nombre | 2fr |
| Empresa | 1.5fr |
| Estado | 1fr (con badge de color) |
| Canal | 1fr (con badge de color) |
| Fecha | 1fr |
| Valoración | 80px |

### Mapas de colores a añadir en ContactRow.tsx

```tsx
const STATUS_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  contactando: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  calificado: 'bg-green-500/10 text-green-700 border-green-500/20',
  propuesta_enviada: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  negociacion: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  mandato_propuesto: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  en_espera: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  archivado: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
  lead_perdido_curiosidad: 'bg-red-500/10 text-red-700 border-red-500/20',
  compras: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  fase0_activo: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
};

const CHANNEL_COLORS: Record<string, string> = {
  'Google Ads': 'bg-red-500/10 text-red-700 border-red-500/20',
  'Meta Ads': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  'Meta ads - Formulario instantáneo': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  'LinkedIn Ads': 'bg-sky-500/10 text-sky-700 border-sky-500/20',
  'SEO Orgánico': 'bg-green-500/10 text-green-700 border-green-500/20',
  'Email Marketing': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  'Referido': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  'Directo': 'bg-slate-500/10 text-slate-700 border-slate-500/20',
  'Evento/Feria': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  'Marketplace': 'bg-pink-500/10 text-pink-700 border-pink-500/20',
};
```

## Resultado Visual Esperado

La tabla mostrará:
1. **Nombre** - Nombre + email + favorito
2. **Empresa** - Nombre de empresa
3. **Estado** - Badge con color según estado CRM (verde para calificado, azul para nuevo, etc.)
4. **Canal** - Badge con color según canal (rojo para Google Ads, azul para Meta, etc.)
5. **Fecha** - Fecha de recepción
6. **Valoración** - Valor formateado

Se elimina la columna "Formulario" también para mantener la tabla compacta con 6 columnas.
