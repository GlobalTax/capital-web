

## Fix: Leads fantasma en columna "Nuevo" del Pipeline

### Problema
El pipeline trae TODOS los `company_valuations` (con `is_deleted = false`) sin filtrar por `lead_status_crm`. Los que tienen `lead_status_crm = NULL` se fuerzan a la columna "Nuevo" por el fallback `|| 'nuevo'` en la línea 334. Esto crea 56 leads "fantasma" que en Gestión de Leads no aparecen como "nuevo".

Para `contact_leads` ya existe el filtro `.not('lead_status_crm', 'is', null)` (línea 64), pero para `company_valuations` no hay filtro equivalente.

### Opciones

**Opción A (recomendada): Excluir del pipeline los leads sin estado CRM**
- Añadir `.not('lead_status_crm', 'is', null)` a la query de `company_valuations` (línea 39-52)
- Los leads sin clasificar solo se verán en Gestión de Leads, no en el Pipeline
- Consistente con cómo ya funciona `contact_leads`

**Opción B: Mantenerlos pero en una columna separada "Sin clasificar"**
- No forzar a "nuevo", crear una columna especial para leads sin estado
- Más complejo, requiere cambios en la UI

### Cambio (Opción A)

**`src/features/leads-pipeline/hooks/useLeadsPipeline.ts`**

1. Añadir filtro a la query de `company_valuations`:
```typescript
.not('lead_status_crm', 'is', null)
```

2. Eliminar el fallback `|| 'nuevo'` en la agrupación (línea 334), ya que todos los leads tendrán un estado real:
```typescript
const status = lead.lead_status_crm!; // Ya filtrado, siempre tiene valor
```

### Resultado
El pipeline solo mostrará leads que realmente fueron clasificados con un estado CRM. Los 56 leads sin estado dejarán de aparecer como "nuevos" fantasma.

### Archivo afectado
- `src/features/leads-pipeline/hooks/useLeadsPipeline.ts`

