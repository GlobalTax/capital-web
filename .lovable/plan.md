

## Plan: Nueva pestaña "Alertas Comprador" en Oportunidades

### Contexto
- **Leads Inversores** muestra quién se descargó la ROD (tabla `buyer_contacts`)
- Falta una vista para ver quién se apuntó a recibir alertas de oportunidades (tabla `buyer_preferences`)
- `buyer_preferences` tiene: `full_name`, `email`, `phone`, `company`, `preferred_sectors`, `preferred_locations`, `min_valuation`, `max_valuation`, `alert_frequency`, `is_active`, `created_at`
- Actualmente hay 0 registros (aún no se han apuntado usuarios)

### Cambios

**1. Crear componente `AlertSubscribersManager.tsx`** (~nuevo archivo)
- Tabla con columnas: Nombre, Email, Teléfono, Empresa, Sectores, Ubicaciones, Rango valoración, Frecuencia, Activo, Fecha
- Query a `buyer_preferences` ordenado por `created_at` desc
- Búsqueda por nombre/email/empresa
- Selección masiva con checkboxes + eliminación bulk
- Botón para añadir suscriptores a Listados ROD (reutilizando `AddToRODDialog`)
- Badge de estado activo/inactivo
- Estado vacío informativo cuando no haya registros

**2. Añadir pestaña en `OportunidadesPage.tsx`**
- Nueva pestaña "Alertas Comprador" con icono `Bell` entre "Leads Inversores" y el final
- Lazy load del componente con Suspense

### Resultado
El admin tendrá dos listados separados:
- **Leads Inversores** = quién descargó la ROD
- **Alertas Comprador** = quién se apuntó para recibir avisos de nuevas oportunidades

