

## Problema Identificado

La query de Prospectos en `useProspects.ts` tiene un filtro que **excluye contactos sin empresa vinculada**:

```text
.not('empresa_id', 'is', null)  // Lineas 155 y 184
```

### Datos actuales en la base de datos:

| Tabla | Con estado prospecto | Con empresa vinculada | Visibles en Prospectos |
|-------|---------------------|-----------------------|------------------------|
| contact_leads | 28 | 5 | 5 |
| company_valuations | 5 | 5 | 5 |
| **Total** | **33** | **10** | **10** |

**23 contactos con estado "Reunion Programada" no aparecen porque no tienen empresa vinculada.**

---

## Solucion Propuesta

Eliminar el filtro `.not('empresa_id', 'is', null)` en ambas queries (contact_leads y company_valuations) dentro de `useProspects.ts`, y adaptar el mapeo para manejar contactos sin empresa.

### Cambios en `src/hooks/useProspects.ts`

1. **Eliminar linea 155**: `.not('empresa_id', 'is', null)` de la query de `company_valuations`
2. **Eliminar linea 184**: `.not('empresa_id', 'is', null)` de la query de `contact_leads`
3. **Adaptar el mapeo** (lineas 192-271): Actualmente agrupa por `empresa_id`. Los contactos sin empresa se agruparan por su propio `id` como key unica, usando el nombre de la empresa del campo `company`/`company_name` del lead como fallback.

### Detalle tecnico del mapeo adaptado

```text
Logica actual:
  empresaMap.set(empresaId, ...)  // Solo funciona si empresaId existe

Logica nueva:
  const groupKey = empresa ? empresa.id : `lead-${lead.id}`;
  // Si no hay empresa vinculada, usar datos del propio lead
  empresa_nombre = empresa?.nombre || lead.company_name || lead.company || 'Sin empresa';
```

### Sin cambios en

- `useContacts.ts` — el usuario confirmo que funciona bien, no se toca
- `ProspectsPage.tsx` — la tabla ya recibe los datos correctamente
- `ProspectsTable.tsx` — solo renderiza lo que recibe
- Realtime subscriptions — ya estan correctamente configuradas para ambas tablas

### Resultado esperado

- Los 33 contactos con estado "Reunion Programada" o "PSH Enviada" apareceran en `/admin/prospectos`
- Actualizacion en tiempo real via las suscripciones Realtime existentes
- La vista de Contactos no se modifica en absoluto

