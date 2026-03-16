

## Plan: Filtro por fecha de envío en vistas de envío

### Qué se hace
Añadir un filtro de rango de fechas (fecha de envío) en las dos vistas de envío: **ProcessSendStep** (Paso 7 - Valoración) y **DocumentSendStep** (Paso Documento).

### Implementación

**1. Nuevo componente reutilizable: `DateRangeFilter`**
- Archivo: `src/components/admin/campanas-valoracion/shared/DateRangeFilter.tsx`
- Botón tipo popover (mismo estilo que `FinancialFilter`) con dos calendarios: "Desde" y "Hasta"
- Muestra el rango activo en el botón (ej: "12/03 - 15/03") o el label por defecto ("Fecha envío")
- Botón limpiar integrado (X en el chip o botón Limpiar dentro del popover)

**2. ProcessSendStep.tsx**
- Nuevo estado `filterSentDate: { from: Date | null; to: Date | null }`
- En el `filteredCompanies` useMemo: cruzar `company.id` con los emails del hook para obtener `sent_at`, y filtrar por rango
- Añadir el componente `DateRangeFilter` junto a los `FinancialFilter` existentes (línea ~1212)
- Necesita acceso a los emails — ya tiene `useCampaignEmails` importado

**3. DocumentSendStep.tsx**
- Mismo estado `filterSentDate`
- En el `filteredCompanies` useMemo: usar `emailMap` (ya existe) para obtener `sent_at` y filtrar
- Añadir `DateRangeFilter` junto al buscador existente (línea ~311)

### UI del filtro

```text
[📅 Fecha envío ▼]  →  click  →  Popover:
┌─────────────────────────────┐
│  Fecha de envío             │
│  Desde: [📅 Seleccionar]    │
│  Hasta: [📅 Seleccionar]    │
│  [Limpiar]    [Aplicar]     │
└─────────────────────────────┘
```

Cuando hay filtro activo: `[📅 12/03 - 15/03  ✕]`

### Archivos
- **Crear**: `src/components/admin/campanas-valoracion/shared/DateRangeFilter.tsx`
- **Editar**: `ProcessSendStep.tsx` (añadir estado + filtro en useMemo + UI)
- **Editar**: `DocumentSendStep.tsx` (añadir estado + filtro en useMemo + UI)

