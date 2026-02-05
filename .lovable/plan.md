

# Plan: Corregir Columna Estado en Tabla de Leads

## Diagnóstico Completado

### Causa Raíz

| Ubicación | Campo Usado | Valor Mostrado | Correcto? |
|-----------|-------------|----------------|-----------|
| **Perfil del lead** | `lead_status_crm` → lookup en `contact_statuses.label` | "Unqualified Lead" | ✅ Correcto |
| **Tabla de leads** | `lead_status_crm` renderizado directamente | "calificado" | ❌ Incorrecto |

**El problema está en `ContactRow.tsx` línea 121:**
```tsx
// INCORRECTO - muestra el status_key, no el label
{contact.lead_status_crm.replace(/_/g, ' ')}
```

### Mapeo Real en Base de Datos (`contact_statuses`)

| status_key | label (nombre real) |
|------------|---------------------|
| `nuevo` | Nuevo |
| `contactando` | Target Lead |
| `calificado` | **Unqualified Lead** |
| `propuesta_enviada` | Primer Contacto |
| `negociacion` | Llamado - NR |
| `en_espera` | Contacto Efectivo |
| `fase0_activo` | Reunión Programada |
| `archivado` | PSH Enviada |
| `ganado` | Ganado |
| `perdido` | Perdido - NR |

El perfil usa `LeadStatusBadge` → `useContactStatuses.getStatusByKey()` para resolver el label correcto.
La tabla NO hace esta resolución.

---

## Solución

### Opción A: Usar LeadStatusBadge en ContactRow (Recomendada)

Reutilizar el mismo componente que usa el perfil para garantizar consistencia total.

**Cambio en `src/components/admin/contacts-v2/ContactRow.tsx`:**

```tsx
// ANTES (líneas 116-126):
<div>
  {contact.lead_status_crm ? (
    <Badge 
      variant="outline" 
      className={cn('text-[10px] px-1.5 py-0 h-5 border', getStatusColor(contact.lead_status_crm))}
    >
      {contact.lead_status_crm.replace(/_/g, ' ')}
    </Badge>
  ) : (
    <span className="text-muted-foreground/60">-</span>
  )}
</div>

// DESPUÉS:
import { LeadStatusBadge } from '../leads/LeadStatusBadge';

<div>
  {contact.lead_status_crm ? (
    <LeadStatusBadge status={contact.lead_status_crm} showIcon={false} />
  ) : (
    <span className="text-muted-foreground/60">-</span>
  )}
</div>
```

**Ventajas:**
- Una sola fuente de verdad para renderizar estados
- Consistencia automática entre tabla y perfil
- Labels dinámicos desde `contact_statuses`
- Colores consistentes

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/contacts-v2/ContactRow.tsx` | Usar `LeadStatusBadge` en lugar de Badge manual |

---

## Limpieza Adicional (Opcional)

Eliminar el mapa `STATUS_COLORS` hardcodeado (líneas 24-36) de `ContactRow.tsx` ya que no se usará más - `LeadStatusBadge` ya gestiona los colores dinámicamente desde la base de datos.

---

## Verificación Post-Implementación

| Test | Verificación |
|------|--------------|
| Caso A | Lead con `lead_status_crm = "calificado"` muestra "Unqualified Lead" en tabla |
| Caso B | Lead con `lead_status_crm = "contactando"` muestra "Target Lead" en tabla |
| Caso C | Cambiar estado en perfil → tabla refleja cambio sin refresh |
| Caso D | Filtro por estado sigue funcionando (usa `status_key` internamente) |

---

## Resultado Esperado

```
┌──────────────────────────────────────────────────────────────────┐
│ Nombre        │ Empresa          │ Estado          │ Canal      │
├───────────────┼──────────────────┼─────────────────┼────────────┤
│ Edu Alonso    │ Energías Alonso  │ Unqualified Lead│ Meta Ads   │
│ Juan García   │ Tech SL          │ Target Lead     │ Google Ads │
│ María López   │ Industrias ML    │ Primer Contacto │ SEO        │
└──────────────────────────────────────────────────────────────────┘
```

La tabla mostrará **el mismo label** que aparece en el perfil del lead.

